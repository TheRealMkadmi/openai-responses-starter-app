"use client";
import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import AppHeader from "@/components/app-header";
import useUIStore from "@/stores/useUIStore";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Main() {
  const { isRightSidebarOpen, setRightSidebarOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      <AppHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Assistant />
        </div>

        {/* Right Sidebar */}
        <div className={`
          transition-all duration-300 ease-in-out bg-white border-l shadow-lg
          ${isRightSidebarOpen ? 'w-80' : 'w-0'}
          ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0'}
          overflow-hidden
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h2 className="font-medium text-gray-900">Tools & Settings</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ToolsPanel />
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {isRightSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
