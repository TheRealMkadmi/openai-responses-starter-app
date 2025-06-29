export type ModelType = "normal" | "reasoning" | "research";

export interface ModelInfo {
  value: string;
  label: string;
  description: string;
  type: ModelType;
}

export const models: ModelInfo[] = [
  // Reasoning models
  { value: "o3", label: "o3", description: "Standard performance model", type: "reasoning" },
  { value: "o3-pro", label: "o3-pro", description: "Enhanced professional model", type: "reasoning" },
  { value: "o4-mini", label: "o4-mini", description: "Compact flagship model", type: "reasoning" },
  
  // Research models
  { value: "o4-mini-deep-research", label: "o4-mini-deep-research", description: "Deep research model", type: "research" },
  { value: "o3-deep-research", label: "o3-deep-research", description: "Deep research model", type: "research" },
  
  // Normal models (no reasoning support)
  { value: "codex-mini-latest", label: "codex-mini-latest", description: "Coding assistant model", type: "normal" },
  { value: "gpt-4.1", label: "GPT-4.1", description: "Next-gen flagship model", type: "normal" },
  { value: "gpt-4.1-mini", label: "GPT-4.1-mini", description: "Compact GPT-4.1 model", type: "normal" },
  { value: "gpt-4.5-preview", label: "GPT-4.5-preview", description: "Preview of upcoming GPT-4.5", type: "normal" },
  { value: "gpt-4o", label: "GPT-4o", description: "Multimodal flagship model", type: "normal" },
];

// Helper functions to categorize models
export const getModelInfo = (modelValue: string): ModelInfo | undefined => {
  return models.find(m => m.value === modelValue);
};

export const supportsReasoning = (modelValue: string): boolean => {
  const model = getModelInfo(modelValue);
  // Only reasoning-type models support adjustable reasoning effort
  return model?.type === "reasoning";
};

export const isResearchModel = (modelValue: string): boolean => {
  const model = getModelInfo(modelValue);
  return model?.type === "research";
};

export const isNormalModel = (modelValue: string): boolean => {
  const model = getModelInfo(modelValue);
  return model?.type === "normal";
};

// Get models by type
export const getModelsByType = (type: ModelType): ModelInfo[] => {
  return models.filter(m => m.type === type);
};
