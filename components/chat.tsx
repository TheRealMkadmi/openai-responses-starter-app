"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import McpToolsList from "./mcp-tools-list";
import McpApproval from "./mcp-approval";
import WelcomeScreen from "./welcome-screen";
import { Item, McpApprovalRequestItem } from "@/lib/assistant";
import LoadingMessage from "./loading-message";
import useConversationStore from "@/stores/useConversationStore";

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
  const [inputMessageText, setinputMessageText] = useState<string>("");
  // This state is used to provide better user experience for non-English IMEs such as Japanese
  const [isComposing, setIsComposing] = useState(false);
  const { isAssistantLoading } = useConversationStore();

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        onSendMessage(inputMessageText);
        setinputMessageText("");
      }
    },
    [onSendMessage, inputMessageText, isComposing]
  );

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  // Filter out the initial assistant message to determine if we should show welcome screen
  const hasUserMessages = items.some(item => 
    item.type === "message" && 
    item.role === "user"
  );

  if (!hasUserMessages) {
    return (
      <div className="flex flex-col h-full">
        <WelcomeScreen onSamplePrompt={onSendMessage} />
        
        {/* Input Area */}
        <div className="border-t bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="relative">
              <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <div className="flex-1">
                  <textarea
                    id="prompt-textarea"
                    tabIndex={0}
                    dir="auto"
                    rows={1}
                    placeholder="Ask me anything..."
                    className="block w-full resize-none border-0 bg-transparent px-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    value={inputMessageText}
                    onChange={(e) => setinputMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    style={{
                      height: 'auto',
                      minHeight: '56px',
                      maxHeight: '200px',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                    }}
                  />
                </div>
                <div className="p-3">
                  <button
                    disabled={!inputMessageText.trim() || isAssistantLoading}
                    data-testid="send-button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={() => {
                      onSendMessage(inputMessageText);
                      setinputMessageText("");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="text-white"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M3.4 12L2.1 7.3c-.3-.8.5-1.6 1.3-1.3L20.6 11c.8.3.8 1.4 0 1.7L3.4 17.7c-.8.3-1.6-.5-1.3-1.3L3.4 12zm1.6 0L4.4 9.5 16.2 12 4.4 14.5 5 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="min-h-full flex flex-col justify-end">
            <div className="space-y-6 py-8">
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.type === "tool_call" ? (
                    <ToolCall toolCall={item} />
                  ) : item.type === "message" ? (
                    <div className="flex flex-col gap-2">
                      <Message message={item} />
                      {item.content &&
                        item.content[0].annotations &&
                        item.content[0].annotations.length > 0 && (
                          <Annotations
                            annotations={item.content[0].annotations}
                          />
                        )}
                    </div>
                  ) : item.type === "mcp_list_tools" ? (
                    <McpToolsList item={item} />
                  ) : item.type === "mcp_approval_request" ? (
                    <McpApproval
                      item={item as McpApprovalRequestItem}
                      onRespond={onApprovalResponse}
                    />
                  ) : null}
                </React.Fragment>
              ))}
              {isAssistantLoading && <LoadingMessage />}
              <div ref={itemsEndRef} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="relative">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <div className="flex-1">
                <textarea
                  id="prompt-textarea"
                  tabIndex={0}
                  dir="auto"
                  rows={1}
                  placeholder="Ask me anything..."
                  className="block w-full resize-none border-0 bg-transparent px-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                  value={inputMessageText}
                  onChange={(e) => setinputMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  style={{
                    height: 'auto',
                    minHeight: '56px',
                    maxHeight: '200px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                  }}
                />
              </div>
              <div className="p-3">
                <button
                  disabled={!inputMessageText.trim() || isAssistantLoading}
                  data-testid="send-button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={() => {
                    onSendMessage(inputMessageText);
                    setinputMessageText("");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-white"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M3.4 12L2.1 7.3c-.3-.8.5-1.6 1.3-1.3L20.6 11c.8.3.8 1.4 0 1.7L3.4 17.7c-.8.3-1.6-.5-1.3-1.3L3.4 12zm1.6 0L4.4 9.5 16.2 12 4.4 14.5 5 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
