import { toolsList } from "../../config/tools-list";
import useToolsStore from "@/stores/useToolsStore";
import { WebSearchConfig } from "@/stores/useToolsStore";
import useUIStore from "@/stores/useUIStore";
import { isResearchModel } from "@/config/models";

interface WebSearchTool extends WebSearchConfig {
  type: "web_search" | "web_search_preview";
}
export const getTools = () => {
  const {
    webSearchEnabled,
    fileSearchEnabled,
    functionsEnabled,
    codeInterpreterEnabled,
    vectorStore,
    webSearchConfig,
    mcpEnabled,
    mcpConfig,
  } = useToolsStore.getState();

  // Get the current model to determine the correct web search tool type
  const { modelConfig } = useUIStore.getState();
  const currentModel = modelConfig.selectedModel;

  const tools = [];

  if (webSearchEnabled) {
    // Use web_search_preview for research models, web_search for others
    const webSearchType = isResearchModel(currentModel) ? "web_search_preview" : "web_search";
    
    const webSearchTool: WebSearchTool = {
      type: webSearchType,
    };
    // Only attach user_location for non-research web_search
    if (
      webSearchType === "web_search" &&
      webSearchConfig.user_location &&
      (webSearchConfig.user_location.country !== "" ||
        webSearchConfig.user_location.region !== "" ||
        webSearchConfig.user_location.city !== "")
    ) {
      webSearchTool.user_location = webSearchConfig.user_location;
    }

    tools.push(webSearchTool);
  }

  if (fileSearchEnabled) {
    const fileSearchTool = {
      type: "file_search",
      vector_store_ids: [vectorStore?.id],
    };
    tools.push(fileSearchTool);
  }

  if (codeInterpreterEnabled) {
    tools.push({ type: "code_interpreter", container: { type: "auto" } });
  }

  if (functionsEnabled) {
    tools.push(
      ...toolsList.map((tool) => {
        return {
          type: "function",
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: { ...tool.parameters },
            required: Object.keys(tool.parameters),
            additionalProperties: false,
          },
          strict: true,
        };
      })
    );
  }

  if (mcpEnabled && mcpConfig.server_url && mcpConfig.server_label) {
    const mcpTool: any = {
      type: "mcp",
      server_label: mcpConfig.server_label,
      server_url: mcpConfig.server_url,
    };
    if (mcpConfig.skip_approval) {
      mcpTool.require_approval = "never";
    }
    if (mcpConfig.allowed_tools.trim()) {
      mcpTool.allowed_tools = mcpConfig.allowed_tools
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }
    tools.push(mcpTool);
  }

  console.log("tools", tools);
  console.log("webSearchEnabled:", webSearchEnabled);
  console.log("currentModel:", currentModel);

  return tools;
};
