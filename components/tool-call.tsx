import React from "react";

import { ToolCallItem } from "@/lib/assistant";
import { BookOpenText, Clock, Globe, Zap, Code2, Download, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ToolCallProps {
  toolCall: ToolCallItem;
}

function ApiCallCell({ toolCall }: ToolCallProps) {
  return (
    <div className="tool-call-container">
      <div className="tool-call-header">
        <div className="flex gap-2 items-center text-primary">
          {toolCall.status === "completed" ? (
            <Zap className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          <span>
            {toolCall.status === "completed"
              ? `Called ${toolCall.name}`
              : `Calling ${toolCall.name}...`}
          </span>
        </div>
      </div>

      <div className="bg-muted rounded-lg mt-3">
        <div className="p-3 border-b border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">Arguments:</div>
          <SyntaxHighlighter
            customStyle={{
              backgroundColor: 'transparent',
              padding: '0',
              margin: '0',
              fontSize: '12px',
            }}
            language="json"
            style={vscDarkPlus}
          >
            {JSON.stringify(toolCall.parsedArguments, null, 2)}
          </SyntaxHighlighter>
        </div>
        
        <div className="p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Result:</div>
          {toolCall.output ? (
            <SyntaxHighlighter
              customStyle={{
                backgroundColor: 'transparent',
                padding: '0',
                margin: '0',
                fontSize: '12px',
              }}
              language="json"
              style={vscDarkPlus}
            >
              {JSON.stringify(JSON.parse(toolCall.output), null, 2)}
            </SyntaxHighlighter>
          ) : (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              Waiting for result...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileSearchCell({ toolCall }: ToolCallProps) {
  return (
    <div className="tool-call-container">
      <div className="flex gap-2 items-center text-primary">
        {toolCall.status === "completed" ? (
          <BookOpenText className="w-4 h-4" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        <span className="tool-call-header">
          {toolCall.status === "completed"
            ? "Searched files"
            : "Searching files..."}
        </span>
      </div>
    </div>
  );
}

function WebSearchCell({ toolCall }: ToolCallProps) {
  return (
    <div className="tool-call-container">
      <div className="flex gap-2 items-center text-primary">
        {toolCall.status === "completed" ? (
          <Globe className="w-4 h-4" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        <span className="tool-call-header">
          {toolCall.status === "completed"
            ? "Searched the web"
            : "Searching the web..."}
        </span>
      </div>
    </div>
  );
}

function McpCallCell({ toolCall }: ToolCallProps) {
  return (
    <div className="tool-call-container">
      <div className="tool-call-header">
        <div className="flex gap-2 items-center text-primary">
          {toolCall.status === "completed" ? (
            <Zap className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          <span>
            {toolCall.status === "completed"
              ? `Called ${toolCall.name} via MCP`
              : `Calling ${toolCall.name} via MCP...`}
          </span>
        </div>
      </div>

      <div className="bg-muted rounded-lg mt-3">
        <div className="p-3 border-b border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">Arguments:</div>
          <SyntaxHighlighter
            customStyle={{
              backgroundColor: 'transparent',
              padding: '0',
              margin: '0',
              fontSize: '12px',
            }}
            language="json"
            style={vscDarkPlus}
          >
            {JSON.stringify(toolCall.parsedArguments, null, 2)}
          </SyntaxHighlighter>
        </div>
        
        <div className="p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Result:</div>
          {toolCall.output ? (
            <SyntaxHighlighter
              customStyle={{
                backgroundColor: 'transparent',
                padding: '0',
                margin: '0',
                fontSize: '12px',
              }}
              language="json"
              style={vscDarkPlus}
            >
              {(() => {
                try {
                  const parsed = JSON.parse(toolCall.output!);
                  return JSON.stringify(parsed, null, 2);
                } catch {
                  return toolCall.output!;
                }
              })()}
            </SyntaxHighlighter>
          ) : (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              Waiting for result...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeInterpreterCell({ toolCall }: ToolCallProps) {
  return (
    <div className="tool-call-container">
      <div className="tool-call-header">
        <div className="flex gap-2 items-center text-primary">
          {toolCall.status === "completed" ? (
            <Code2 className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          <span>
            {toolCall.status === "completed"
              ? "Code executed"
              : "Running code interpreter..."}
          </span>
        </div>
      </div>

      <div className="bg-muted rounded-lg mt-3 p-3">
        <div className="text-xs font-medium text-muted-foreground mb-2">Code:</div>
        <SyntaxHighlighter
          customStyle={{
            backgroundColor: 'transparent',
            padding: '0',
            margin: '0',
            fontSize: '12px',
          }}
          language="python"
          style={vscDarkPlus}
        >
          {toolCall.code || ""}
        </SyntaxHighlighter>
      </div>

      {toolCall.files && toolCall.files.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {toolCall.files.map((f) => (
            <a
              key={f.file_id}
              href={`/api/container_files/content?file_id=${f.file_id}${f.container_id ? `&container_id=${f.container_id}` : ""}${f.filename ? `&filename=${encodeURIComponent(f.filename)}` : ""}`}
              download
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {f.filename || f.file_id}
              <Download className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ToolCall({ toolCall }: ToolCallProps) {
  return (
    <>
      {(() => {
        switch (toolCall.tool_type) {
          case "function_call":
            return <ApiCallCell toolCall={toolCall} />;
          case "file_search_call":
            return <FileSearchCell toolCall={toolCall} />;
          case "web_search_call":
            return <WebSearchCell toolCall={toolCall} />;
          case "mcp_call":
            return <McpCallCell toolCall={toolCall} />;
          case "code_interpreter_call":
            return <CodeInterpreterCell toolCall={toolCall} />;
          default:
            return null;
        }
      })()}
    </>
  );
}
