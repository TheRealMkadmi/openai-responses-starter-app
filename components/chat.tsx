"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import McpToolsList from "./mcp-tools-list";
import McpApproval from "./mcp-approval";
import WelcomeScreen from "./welcome-screen";
import WebSearchCall from "./web-search-call";
import { Item, McpApprovalRequestItem } from "@/lib/assistant";
import LoadingMessage from "./loading-message";
import useConversationStore from "@/stores/useConversationStore";
import { ArrowUp } from "lucide-react";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
}

const Chat: React.FC<ChatProps> = ({
  items,
  onSendMessage,
  onApprovalResponse,
}) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputMessageText, setinputMessageText] = useState<string>("");
  const [isComposing, setIsComposing] = useState(false);
  const { isAssistantLoading } = useConversationStore();

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = scrollHeight + 'px';
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        if (inputMessageText.trim()) {
          onSendMessage(inputMessageText);
          setinputMessageText("");
          setTimeout(adjustTextareaHeight, 0);
        }
      }
    },
    [onSendMessage, inputMessageText, isComposing]
  );

  const handleSend = () => {
    if (inputMessageText.trim()) {
      onSendMessage(inputMessageText);
      setinputMessageText("");
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessageText]);

  // Filter out the initial assistant message to determine if we should show welcome screen
  const hasUserMessages = items.some(item => 
    item.type === "message" && 
    item.role === "user"
  );

  if (!hasUserMessages) {
    return (
      <div className="flex flex-col h-full">
        <WelcomeScreen onSamplePrompt={onSendMessage} />
        
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              placeholder="Message ChatGPT..."
              className="chat-input"
              value={inputMessageText}
              onChange={(e) => setinputMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              rows={1}
            />
            <button
              disabled={!inputMessageText.trim() || isAssistantLoading}
              className="send-button"
              onClick={handleSend}
              type="button"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === "tool_call" ? (
                <div className="message-container">
                  <div className="message-content">
                    <div className="w-full">
                      {item.tool_type === "web_search_call" ? (
                        <WebSearchCall webSearchCall={item as any} />
                      ) : (
                        <ToolCall toolCall={item} />
                      )}
                    </div>
                  </div>
                </div>
              ) : item.type === "message" ? (
                <div className={`message-container ${item.role} ${(item as any).isSummary ? 'thinking' : ''}`}>
                  <div className="message-content">
                    <Message message={item} />
                  </div>
                  {item.content &&
                    item.content[0].annotations &&
                    item.content[0].annotations.length > 0 && (
                      <div className="message-content">
                        <div className="message-avatar"></div>
                        <div className="message-text">
                          <Annotations
                            annotations={item.content[0].annotations}
                          />
                        </div>
                      </div>
                    )}
                </div>
              ) : item.type === "mcp_list_tools" ? (
                <div className="message-container">
                  <div className="message-content">
                    <div className="w-full">
                      <McpToolsList item={item} />
                    </div>
                  </div>
                </div>
              ) : item.type === "mcp_approval_request" ? (
                <div className="message-container">
                  <div className="message-content">
                    <div className="w-full">
                      <McpApproval
                        item={item as McpApprovalRequestItem}
                        onRespond={onApprovalResponse}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          ))}
          
          {isAssistantLoading && (
            <div className="message-container assistant">
              <div className="message-content">
                <div className="message-avatar assistant">
                  <div className="w-4 h-4 rounded-sm bg-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="message-text">
                  <LoadingMessage />
                </div>
              </div>
            </div>
          )}
          
          <div ref={itemsEndRef} />
        </div>
      </div>
      
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            placeholder="Message ChatGPT..."
            className="chat-input"
            value={inputMessageText}
            onChange={(e) => setinputMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            rows={1}
          />
          <button
            disabled={!inputMessageText.trim() || isAssistantLoading}
            className="send-button"
            onClick={handleSend}
            type="button"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
