"use client";
import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import AppHeader from "@/components/app-header";
import useUIStore from "@/stores/useUIStore";
import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Main() {
  const { isRightSidebarOpen, setRightSidebarOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <AppHeader />
      
      <div className="flex-1 flex min-h-0 relative">
        {/* Main Chat Area - Full width */}
        <div className="flex-1 flex flex-col min-h-0">
          <Assistant />
        </div>

        <div className={`
          fixed right-0 top-0 bottom-0 z-50 md:relative
          transition-all duration-300 ease-out bg-background border-l border-border
          ${isRightSidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full md:translate-x-0'}
          ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
          overflow-hidden
        `}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-medium text-foreground">Tools & Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightSidebarOpen(false)}
                  className="h-8 w-8 hover:bg-muted md:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              <ToolsPanel />
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isRightSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
