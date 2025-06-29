import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModelConfig = {
  selectedModel: string;
  reasoning: "low" | "medium" | "high";
  apiKey: string;
};

interface UIState {
  isRightSidebarOpen: boolean;
  modelConfig: ModelConfig;
  setRightSidebarOpen: (open: boolean) => void;
  setModelConfig: (config: Partial<ModelConfig>) => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isRightSidebarOpen: false,
      modelConfig: {
        selectedModel: "o1-mini",
        reasoning: "medium",
        apiKey: "",
      },
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
      setModelConfig: (config) =>
        set((state) => ({
          modelConfig: { ...state.modelConfig, ...config },
        })),
    }),
    {
      name: "ui-store",
    }
  )
);

export default useUIStore;
