import { MessageItem } from "@/lib/assistant";
import React from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Brain, User } from "lucide-react";
import WebSearchResults from "./web-search-results";

interface MessageProps {
  message: MessageItem;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isThinking = (message as any).isSummary;
  
  return (
    <>
      <div className={`message-avatar ${message.role} ${isThinking ? 'thinking' : ''}`}>
        {message.role === "user" ? (
          <User className="w-4 h-4 text-white" />
        ) : isThinking ? (
          <Brain className="w-4 h-4 text-white" />
        ) : (
          <div className="w-4 h-4 rounded-sm bg-white flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
      
      <div className="message-text">
        {isThinking && (
          <div className="thinking-indicator">
            <div className="thinking-dots">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
            </div>
            <span>Thinking...</span>
          </div>
        )}
        
        <ReactMarkdown
          components={{
            h1: ({children}) => <h1 className="text-xl font-semibold mb-3 mt-6 first:mt-0">{children}</h1>,
            h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-5 first:mt-0">{children}</h2>,
            h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
            p: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
            li: ({children}) => <li className="leading-relaxed">{children}</li>,
            code: ({children, className}) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4 border border-border">
                    <code className="text-sm font-mono text-foreground">{children}</code>
                  </pre>
                );
              }
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border border-border">
                  {children}
                </code>
              );
            },
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground">
                {children}
              </blockquote>
            ),
          }}
        >
          {message.content[0].text as string}
        </ReactMarkdown>
        
        {/* Show web search results/citations */}
        {message.content[0].annotations && (
          <WebSearchResults annotations={message.content[0].annotations} />
        )}
        
        {message.content[0].annotations &&
          message.content[0].annotations
            .filter(
              (a) =>
                a.type === "container_file_citation" &&
                a.filename &&
                /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(a.filename)
            )
            .map((a, i) => (
              <div key={i} className="mt-4">
                <Image
                  src={`/api/container_files/content?file_id=${a.fileId}${a.containerId ? `&container_id=${a.containerId}` : ""}${a.filename ? `&filename=${encodeURIComponent(a.filename)}` : ""}`}
                  alt={a.filename || ""}
                  width={400}
                  height={300}
                  className="max-w-full rounded-lg border border-border"
                />
              </div>
            ))}
      </div>
    </>
  );
};

export default Message;
