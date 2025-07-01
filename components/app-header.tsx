"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  ChevronDown,
  Key,
  Brain,
  PanelRightOpen,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import useUIStore from "@/stores/useUIStore";
import useConversationStore from "@/stores/useConversationStore";
import { models, getModelInfo, supportsReasoning } from "@/config/models";

const reasoningLevels = [
  { value: "low", label: "Low", description: "Quick responses" },
  { value: "medium", label: "Medium", description: "Balanced reasoning" },
  { value: "high", label: "High", description: "Deep thinking" },
];

export default function AppHeader() {
  const { modelConfig, setModelConfig, isRightSidebarOpen, setRightSidebarOpen } = useUIStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const clearChat = useConversationStore(state => state.clearChat);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  const selectedModel = getModelInfo(modelConfig.selectedModel);

  const handleModelSelect = (modelValue: string) => {
    setModelConfig({ selectedModel: modelValue });
    setIsModelSelectorOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 lg:px-6 bg-background border-b border-border">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-white flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">ChatGPT</h1>
          </div>
        </div>
        
        {/* Model Selector */}
        <Popover open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px] lg:min-w-[160px] justify-between gap-2 rounded-lg border-border hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <span className="truncate text-sm">{selectedModel?.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 max-h-80 overflow-y-auto rounded-lg border-border" align="start">
            <div className="space-y-3">
              <div className="sticky top-0 bg-background py-2 border-b border-border">
                <h4 className="font-medium text-sm text-foreground">Select Model</h4>
                <p className="text-xs text-muted-foreground">Choose your AI model</p>
              </div>
              <div className="space-y-1">
                {models.map((model) => (
                  <Button
                    key={model.value}
                    variant={modelConfig.selectedModel === model.value ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3 rounded-lg"
                    onClick={() => handleModelSelect(model.value)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{model.label}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        {/* New Chat */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat} 
          title="New Chat"
          className="rounded-lg hover:bg-muted/50"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-muted/50">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-lg border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* API Key */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  OpenAI API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={modelConfig.apiKey}
                    onChange={(e) => setModelConfig({ apiKey: e.target.value })}
                    className="pr-10 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 rounded-r-lg"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Reasoning Level - Only show for models that support reasoning */}
              {supportsReasoning(modelConfig.selectedModel) && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Reasoning Effort
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {reasoningLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={modelConfig.reasoning === level.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setModelConfig({ reasoning: level.value as any })}
                        className="h-auto p-3 rounded-lg"
                      >
                        <div className="text-center">
                          <div className="font-medium text-xs">{level.label}</div>
                          <div className="text-xs opacity-70">{level.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
          className="rounded-lg hover:bg-muted/50"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
