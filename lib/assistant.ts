import { DEVELOPER_PROMPT } from "@/config/constants";
import { parse } from "partial-json";
import { handleTool } from "@/lib/tools/tools-handling";
import useConversationStore from "@/stores/useConversationStore";
import useUIStore from "@/stores/useUIStore";
import { getTools } from "./tools/tools";
import { Annotation } from "@/components/annotations";
import { functionsMap } from "@/config/functions";
import { supportsReasoning } from "@/config/models";

const normalizeAnnotation = (annotation: any): Annotation => ({
  ...annotation,
  fileId: annotation.file_id ?? annotation.fileId,
  containerId: annotation.container_id ?? annotation.containerId,
});

export interface ContentItem {
  type: "input_text" | "output_text" | "refusal" | "output_audio";
  annotations?: Annotation[];
  text?: string;
}

// Message items for storing conversation history matching API shape
export interface MessageItem {
  type: "message";
  role: "user" | "assistant" | "system";
  id?: string;
  content: ContentItem[];
  /** Flag to mark a reasoning summary message */
  isSummary?: boolean;
}

// Custom items to display in chat
export interface ToolCallItem {
  type: "tool_call";
  tool_type:
    | "file_search_call"
    | "web_search_call"
    | "function_call"
    | "mcp_call"
    | "code_interpreter_call";
  status: "in_progress" | "completed" | "failed" | "searching";
  id: string;
  name?: string | null;
  call_id?: string;
  arguments?: string;
  parsedArguments?: any;
  output?: string | null;
  code?: string;
  files?: {
    file_id: string;
    mime_type: string;
    container_id?: string;
    filename?: string;
  }[];
  // Additional fields for web search tracking
  searchQueries?: string[];
  currentQuery?: string;
}

export interface McpListToolsItem {
  type: "mcp_list_tools";
  id: string;
  server_label: string;
  tools: { name: string; description?: string }[];
}

export interface McpApprovalRequestItem {
  type: "mcp_approval_request";
  id: string;
  server_label: string;
  name: string;
  arguments?: string;
}

export type Item =
  | MessageItem
  | ToolCallItem
  | McpListToolsItem
  | McpApprovalRequestItem;

export const handleTurn = async (
  messages: any[],
  tools: any[],
  onMessage: (data: any) => void
) => {
  try {
    // Prepare and filter conversation history into valid chat messages for API
    const apiMessages = messages
      .filter((item) => item.role && item.content !== undefined)
      .map((item) => {
        const role = item.role === "developer" ? "system" : item.role;
        let content: string;
        if (typeof item.content === "string") {
          content = item.content;
        } else if (Array.isArray(item.content)) {
          content = item.content.map((ci: any) => ci.text ?? "").join("\n");
        } else {
          content = "";
        }
        return { role, content };
      });
    // Get response from the API (defined in app/api/turn_response/route.ts)
    // Include model, apiKey, and temperature based on UI store settings
    const { modelConfig } = useUIStore.getState();
    
    // Build request payload conditionally based on model capabilities
    const requestPayload: any = {
      messages: apiMessages,
      tools,
      model: modelConfig.selectedModel,
      apiKey: modelConfig.apiKey,
    };
    
    // Only include reasoning effort for models that support it
    if (supportsReasoning(modelConfig.selectedModel)) {
      requestPayload.reasoning = {
        effort: modelConfig.reasoning,
      };
    }
    
    const response = await fetch("/api/turn_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    // Reader for streaming data
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      buffer += chunkValue;

      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (dataStr === "[DONE]") {
            done = true;
            break;
          }
          const data = JSON.parse(dataStr);
          onMessage(data);
        }
      }
    }

    // Handle any remaining data in buffer
    if (buffer && buffer.startsWith("data: ")) {
      const dataStr = buffer.slice(6);
      if (dataStr !== "[DONE]") {
        const data = JSON.parse(dataStr);
        onMessage(data);
      }
    }
  } catch (error) {
    console.error("Error handling turn:", error);
  }
};

export const processMessages = async () => {
  const {
    chatMessages,
    conversationItems,
    setChatMessages,
    setConversationItems,
    setAssistantLoading,
  } = useConversationStore.getState();

  const tools = getTools();
  const allConversationItems = [
    // Adding developer prompt as first item in the conversation
    {
      role: "developer",
      content: DEVELOPER_PROMPT,
    },
    ...conversationItems,
  ];

  let assistantMessageContent = "";
  let functionArguments = "";
  // For streaming MCP tool call arguments
  let mcpArguments = "";
  // For streaming reasoning summary text
  let summaryBuffer = "";

  await handleTurn(allConversationItems, tools, async ({ event, data }) => {
    switch (event) {
      // Handle streaming summary deltas
      case "response.reasoning_summary_text.delta": {
        const { delta, item_id } = data;
        summaryBuffer += (typeof delta === 'string' ? delta : '');
        
        // Find existing reasoning message or create new one
        const lastItem = chatMessages[chatMessages.length - 1];
        if (
          !lastItem ||
          lastItem.type !== "message" ||
          lastItem.id !== item_id ||
          !(lastItem as any).isSummary
        ) {
          // Create new reasoning summary message
          const newReasoningMessage = {
            type: "message",
            role: "assistant",
            id: item_id,
            isSummary: true,
            content: [{ type: "output_text", text: summaryBuffer }],
          } as MessageItem & { isSummary: boolean };
          
          chatMessages.push(newReasoningMessage);
        } else {
          // Update existing reasoning message
          lastItem.content[0].text = summaryBuffer;
        }
        setChatMessages([...chatMessages]);
        break;
      }
      
      // Marker for summary completion - ensure reasoning message is finalized
      case "response.reasoning_summary_text.finished": {
        const { item_id } = data;
        
        // Ensure the reasoning message is properly finalized
        const reasoningMessage = chatMessages.find(
          (msg) => msg.type === "message" && msg.id === item_id && (msg as any).isSummary
        ) as MessageItem | undefined;
        
        if (reasoningMessage && summaryBuffer) {
          reasoningMessage.content[0].text = summaryBuffer;
          setChatMessages([...chatMessages]);
          
          // Add to conversation items for API context
          conversationItems.push({
            role: "assistant",
            content: [{ type: "output_text", text: summaryBuffer }],
          });
          setConversationItems([...conversationItems]);
        }
        
        // Reset summary buffer for next reasoning session
        summaryBuffer = "";
        break;
      }
      case "response.output_text.delta":
      case "response.output_text.annotation.added": {
        const { delta, item_id, annotation } = data;

        let partial = "";
        if (typeof delta === "string") {
          partial = delta;
        }
        assistantMessageContent += partial;

        // If the last message isn't an assistant message with the same item_id, create a new one
        const lastItem = chatMessages[chatMessages.length - 1];
        if (
          !lastItem ||
          lastItem.type !== "message" ||
          lastItem.role !== "assistant" ||
          (lastItem.id && lastItem.id !== item_id) ||
          (lastItem as any).isSummary // Don't mix reasoning with regular responses
        ) {
          chatMessages.push({
            type: "message",
            role: "assistant",
            id: item_id,
            content: [
              {
                type: "output_text",
                text: assistantMessageContent,
              },
            ],
          } as MessageItem);
        } else {
          const contentItem = lastItem.content[0];
          if (contentItem && contentItem.type === "output_text") {
            contentItem.text = assistantMessageContent;
            if (annotation) {
              contentItem.annotations = [
                ...(contentItem.annotations ?? []),
                normalizeAnnotation(annotation),
              ];
            }
          }
        }

        setChatMessages([...chatMessages]);
        setAssistantLoading(false);
        break;
      }

      case "response.output_item.added": {
        const { item } = data || {};
        // New item coming in
        if (!item || !item.type) {
          break;
        }
        setAssistantLoading(false);
        // Handle differently depending on the item type
        switch (item.type) {
          case "message": {
            const text = item.content?.text || "";
            const annotations =
              item.content?.annotations?.map(normalizeAnnotation) || [];
            chatMessages.push({
              type: "message",
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text,
                  ...(annotations.length > 0 ? { annotations } : {}),
                },
              ],
            });
            conversationItems.push({
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text,
                  ...(annotations.length > 0 ? { annotations } : {}),
                },
              ],
            });
            setChatMessages([...chatMessages]);
            setConversationItems([...conversationItems]);
            break;
          }
          case "function_call": {
            functionArguments += item.arguments || "";
            chatMessages.push({
              type: "tool_call",
              tool_type: "function_call",
              status: "in_progress",
              id: item.id,
              name: item.name, // function name,e.g. "get_weather"
              arguments: item.arguments || "",
              parsedArguments: {},
              output: null,
            });
            setChatMessages([...chatMessages]);
            break;
          }
          case "web_search_call": {
            chatMessages.push({
              type: "tool_call",
              tool_type: "web_search_call",
              status: item.status || "in_progress",
              id: item.id,
              arguments: item.arguments || "",
              parsedArguments: item.arguments ? parse(item.arguments) : {},
            });
            setChatMessages([...chatMessages]);
            break;
          }
          case "file_search_call": {
            chatMessages.push({
              type: "tool_call",
              tool_type: "file_search_call",
              status: item.status || "in_progress",
              id: item.id,
            });
            setChatMessages([...chatMessages]);
            break;
          }
          case "mcp_call": {
            mcpArguments = item.arguments || "";
            chatMessages.push({
              type: "tool_call",
              tool_type: "mcp_call",
              status: "in_progress",
              id: item.id,
              name: item.name,
              arguments: item.arguments || "",
              parsedArguments: item.arguments ? parse(item.arguments) : {},
              output: null,
            });
            setChatMessages([...chatMessages]);
            break;
          }
          case "code_interpreter_call": {
            chatMessages.push({
              type: "tool_call",
              tool_type: "code_interpreter_call",
              status: item.status || "in_progress",
              id: item.id,
              code: "",
              files: [],
            });
            setChatMessages([...chatMessages]);
            break;
          }
        }
        break;
      }

      case "response.output_item.done": {
        // After output item is done, adding tool call ID
        const { item } = data || {};
        const toolCallMessage = chatMessages.find((m) => m.id === item.id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.call_id = item.call_id;
          setChatMessages([...chatMessages]);
        }
        conversationItems.push(item);
        setConversationItems([...conversationItems]);
        if (
          toolCallMessage &&
          toolCallMessage.type === "tool_call" &&
          toolCallMessage.tool_type === "function_call"
        ) {
          // Handle tool call (execute function)
          const toolResult = await handleTool(
            toolCallMessage.name as keyof typeof functionsMap,
            toolCallMessage.parsedArguments
          );

          // Record tool output
          toolCallMessage.output = JSON.stringify(toolResult);
          setChatMessages([...chatMessages]);
          conversationItems.push({
            type: "function_call_output",
            call_id: toolCallMessage.call_id,
            status: "completed",
            output: JSON.stringify(toolResult),
          });
          setConversationItems([...conversationItems]);

          // Create another turn after tool output has been added
          await processMessages();
        }
        if (
          toolCallMessage &&
          toolCallMessage.type === "tool_call" &&
          toolCallMessage.tool_type === "mcp_call"
        ) {
          toolCallMessage.output = item.output;
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.function_call_arguments.delta": {
        // Streaming arguments delta to show in the chat
        functionArguments += data.delta || "";
        let parsedFunctionArguments = {};

        const toolCallMessage = chatMessages.find((m) => m.id === data.item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.arguments = functionArguments;
          try {
            if (functionArguments.length > 0) {
              parsedFunctionArguments = parse(functionArguments);
            }
            toolCallMessage.parsedArguments = parsedFunctionArguments;
          } catch {
            // partial JSON can fail parse; ignore
          }
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.function_call_arguments.done": {
        // This has the full final arguments string
        const { item_id, arguments: finalArgs } = data;

        functionArguments = finalArgs;

        // Mark the tool_call as "completed" and parse the final JSON
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.arguments = finalArgs;
          toolCallMessage.parsedArguments = parse(finalArgs);
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }
      // Streaming MCP tool call arguments
      case "response.mcp_call_arguments.delta": {
        // Append delta to MCP arguments
        mcpArguments += data.delta || "";
        let parsedMcpArguments: any = {};
        const toolCallMessage = chatMessages.find((m) => m.id === data.item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.arguments = mcpArguments;
          try {
            if (mcpArguments.length > 0) {
              parsedMcpArguments = parse(mcpArguments);
            }
            toolCallMessage.parsedArguments = parsedMcpArguments;
          } catch {
            // partial JSON can fail parse; ignore
          }
          setChatMessages([...chatMessages]);
        }
        break;
      }
      case "response.mcp_call_arguments.done": {
        // Final MCP arguments string received
        const { item_id, arguments: finalArgs } = data;
        mcpArguments = finalArgs;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.arguments = finalArgs;
          toolCallMessage.parsedArguments = parse(finalArgs);
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.web_search_call.in_progress": {
        console.log("Web search in progress:", data);
        const { item_id } = data;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.status = "in_progress";
          
          // Extract and set the current search query from arguments
          if (toolCallMessage.parsedArguments && toolCallMessage.parsedArguments.query) {
            toolCallMessage.currentQuery = toolCallMessage.parsedArguments.query;
          }
          
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.web_search_call.searching": {
        console.log("Web search searching:", data);
        const { item_id, query } = data;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.status = "searching";
          
          // Update current query if provided in the event
          if (query) {
            toolCallMessage.currentQuery = query;
            // Add to search queries history if it's a new query
            if (!toolCallMessage.searchQueries) {
              toolCallMessage.searchQueries = [];
            }
            if (!toolCallMessage.searchQueries.includes(query)) {
              toolCallMessage.searchQueries.push(query);
            }
          }
          
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.web_search_call.completed": {
        console.log("Web search completed:", data);
        const { item_id, output } = data;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.output = output;
          toolCallMessage.status = "completed";
          
          // Mark current query as completed if it exists
          if (toolCallMessage.currentQuery && toolCallMessage.searchQueries) {
            if (!toolCallMessage.searchQueries.includes(toolCallMessage.currentQuery)) {
              toolCallMessage.searchQueries.push(toolCallMessage.currentQuery);
            }
            toolCallMessage.currentQuery = undefined; // Clear current query when completed
          }
          
          setChatMessages([...chatMessages]);
        }
        break;
      }

      // Handle potential web search query updates
      case "response.web_search_query.added":
      case "response.web_search_query.updated": {
        console.log("Web search query event:", event, data);
        const { item_id, query } = data;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.currentQuery = query;
          if (!toolCallMessage.searchQueries) {
            toolCallMessage.searchQueries = [];
          }
          if (!toolCallMessage.searchQueries.includes(query)) {
            toolCallMessage.searchQueries.push(query);
          }
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.file_search_call.completed": {
        const { item_id, output } = data;
        const toolCallMessage = chatMessages.find((m) => m.id === item_id);
        if (toolCallMessage && toolCallMessage.type === "tool_call") {
          toolCallMessage.output = output;
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.code_interpreter_call_code.delta": {
        const { delta, item_id } = data;
        const toolCallMessage = [...chatMessages]
          .reverse()
          .find(
            (m) =>
              m.type === "tool_call" &&
              m.tool_type === "code_interpreter_call" &&
              m.status !== "completed" &&
              m.id === item_id
          ) as ToolCallItem | undefined;
        // Accumulate deltas to show the code streaming
        if (toolCallMessage) {
          toolCallMessage.code = (toolCallMessage.code || "") + delta;
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.code_interpreter_call_code.done": {
        const { code, item_id } = data;
        const toolCallMessage = [...chatMessages]
          .reverse()
          .find(
            (m) =>
              m.type === "tool_call" &&
              m.tool_type === "code_interpreter_call" &&
              m.status !== "completed" &&
              m.id === item_id
          ) as ToolCallItem | undefined;

        // Mark the call as completed and set the code
        if (toolCallMessage) {
          toolCallMessage.code = code;
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.code_interpreter_call.completed": {
        const { item_id } = data;
        const toolCallMessage = chatMessages.find(
          (m) => m.type === "tool_call" && m.id === item_id
        ) as ToolCallItem | undefined;
        if (toolCallMessage) {
          toolCallMessage.status = "completed";
          setChatMessages([...chatMessages]);
        }
        break;
      }

      case "response.completed": {
        console.log("response completed", data);
        const { response } = data;

        // Handle MCP tools list
        const mcpListToolsMessage = response.output.find(
          (m: Item) => m.type === "mcp_list_tools"
        );

        if (mcpListToolsMessage) {
          chatMessages.push({
            type: "mcp_list_tools",
            id: mcpListToolsMessage.id,
            server_label: mcpListToolsMessage.server_label,
            tools: mcpListToolsMessage.tools || [],
          });
          setChatMessages([...chatMessages]);
        }

        // Handle MCP approval request
        const mcpApprovalRequestMessage = response.output.find(
          (m: Item) => m.type === "mcp_approval_request"
        );

        if (mcpApprovalRequestMessage) {
          chatMessages.push({
            type: "mcp_approval_request",
            id: mcpApprovalRequestMessage.id,
            server_label: mcpApprovalRequestMessage.server_label,
            name: mcpApprovalRequestMessage.name,
            arguments: mcpApprovalRequestMessage.arguments,
          });
          setChatMessages([...chatMessages]);
        }

        break;
      }

      // Handle other events as needed
    }
  });
};
