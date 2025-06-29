"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Search, 
  Code, 
  FileText, 
  Sparkles,
  Zap
} from "lucide-react";

interface WelcomeScreenProps {
  onSamplePrompt: (prompt: string) => void;
}

const samplePrompts = [
  {
    title: "Creative Writing",
    prompt: "Help me write a short story about a robot discovering emotions",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Code Review", 
    prompt: "Review this React component and suggest improvements",
    icon: Code,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Research Help",
    prompt: "Explain the latest developments in AI and machine learning",
    icon: Search,
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Document Summary",
    prompt: "Summarize the key points from a technical document",
    icon: FileText,
    color: "from-orange-500 to-red-500"
  }
];

export default function WelcomeScreen({ onSamplePrompt }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-900" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            I&apos;m here to help you with anything you need. Ask me questions, get creative help, 
            analyze code, or just have a conversation.
          </p>
        </div>

        {/* Sample Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {samplePrompts.map((sample, index) => {
            const IconComponent = sample.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start group hover:border-blue-300 transition-all"
                onClick={() => onSamplePrompt(sample.prompt)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sample.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {sample.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {sample.prompt}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> You can use markdown formatting in your messages</p>
          <p>🔧 <strong>Tools:</strong> Enable file search, web search, and more in the sidebar</p>
          <p>⚡ <strong>Models:</strong> Switch between different AI models using the dropdown above</p>
        </div>
      </div>
    </div>
  );
}
