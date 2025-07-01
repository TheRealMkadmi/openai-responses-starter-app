"use client";

import React from "react";
import { 
  MessageSquare, 
  Search, 
  Code, 
  FileText, 
  Lightbulb,
  ChevronRight
} from "lucide-react";

interface WelcomeScreenProps {
  onSamplePrompt: (prompt: string) => void;
}

const samplePrompts = [
  {
    title: "Creative Writing",
    prompt: "Help me write a short story about a robot discovering emotions",
    icon: MessageSquare,
  },
  {
    title: "Code Review", 
    prompt: "Review this React component and suggest improvements",
    icon: Code,
  },
  {
    title: "Research Help",
    prompt: "Explain the latest developments in AI and machine learning",
    icon: Search,
  },
  {
    title: "Document Summary",
    prompt: "Summarize the key points from a technical document",
    icon: FileText,
  }
];

export default function WelcomeScreen({ onSamplePrompt }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            How can I help you today?
          </h1>
        </div>

        {/* Sample Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {samplePrompts.map((sample, index) => {
            const IconComponent = sample.icon;
            return (
              <button
                key={index}
                className="group p-4 text-left rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all duration-200 flex items-start gap-3"
                onClick={() => onSamplePrompt(sample.prompt)}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted-foreground/20 transition-colors">
                  <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                    {sample.title}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {sample.prompt}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>

        {/* Additional suggestions */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Or ask me anything else you&apos;d like help with</span>
          </div>
        </div>
      </div>
    </div>
  );
}
