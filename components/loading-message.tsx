import React from "react";

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="thinking-dots">
        <div className="thinking-dot"></div>
        <div className="thinking-dot"></div>
        <div className="thinking-dot"></div>
      </div>
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </div>
  );
};

export default LoadingMessage;
