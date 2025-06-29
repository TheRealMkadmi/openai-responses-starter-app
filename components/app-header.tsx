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
  Sidebar,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import useUIStore from "@/stores/useUIStore";
import useConversationStore from "@/stores/useConversationStore";

const models = [
  { value: "o3", label: "o3", description: "Standard performance model" },
  { value: "o3-pro", label: "o3-pro", description: "Enhanced professional model" },
  { value: "o4-mini", label: "o4-mini", description: "Compact flagship model" },
  { value: "o4-mini-deep-research", label: "o4-mini-deep-research", description: "Deep research model" },
  { value: "o3-deep-research", label: "o3-deep-research", description: "Deep research model" },
  { value: "codex-mini-latest", label: "codex-mini-latest", description: "Coding assistant model" },
  { value: "gpt-4.1", label: "GPT-4.1", description: "Next-gen flagship model" },
  { value: "gpt-4.1-mini", label: "GPT-4.1-mini", description: "Compact GPT-4.1 model" },
  { value: "gpt-4.5-preview", label: "GPT-4.5-preview", description: "Preview of upcoming GPT-4.5" },
  { value: "gpt-4o", label: "GPT-4o", description: "Multimodal flagship model" },
];

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

  const selectedModel = models.find(m => m.value === modelConfig.selectedModel);

  const handleModelSelect = (modelValue: string) => {
    setModelConfig({ selectedModel: modelValue });
    setIsModelSelectorOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Assistant</h1>
        </div>
        
        {/* Model Selector */}
        <Popover open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              <span className="truncate">{selectedModel?.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-80 overflow-y-auto" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-900 sticky top-0 bg-white py-2 border-b">Select Model</h4>
              <div className="space-y-2">
                {models.map((model) => (
                  <Button
                    key={model.value}
                    variant={modelConfig.selectedModel === model.value ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleModelSelect(model.value)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{model.label}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
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
        <Button variant="ghost" size="icon" onClick={clearChat} title="New Chat">
          <RefreshCw className="w-4 h-4" />
        </Button>
        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* API Key */}
              <div className="space-y-2">
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
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
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

              {/* Reasoning Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reasoning Effort</label>
                <div className="grid grid-cols-3 gap-2">
                  {reasoningLevels.map((level) => (
                    <Button
                      key={level.value}
                      variant={modelConfig.reasoning === level.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setModelConfig({ reasoning: level.value as any })}
                      className="h-auto p-2"
                    >
                      <div className="text-center">
                        <div className="font-medium text-xs">{level.label}</div>
                        <div className="text-xs opacity-70">{level.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
        >
          <Sidebar className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
