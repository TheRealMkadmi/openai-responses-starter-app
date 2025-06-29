"use client";

import React from "react";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

export default function PanelConfig({
  title,
  tooltip,
  enabled,
  setEnabled,
  disabled,
  children,
}: {
  title: string;
  tooltip: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-gray-900 font-medium text-sm">{title}</h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Switch
          id={title}
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>
      {enabled && children && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
