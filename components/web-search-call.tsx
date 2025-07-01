"use client";

import React from "react";
import { Globe, Search, CheckCircle } from "lucide-react";

interface WebSearchResult {
  url: string;
  title: string;
  snippet?: string;
}

interface ToolCallItem {
  type: "tool_call";
  tool_type: "web_search_call";
  status: "in_progress" | "completed" | "failed" | "searching";
  id: string;
  name?: string | null;
  call_id?: string;
  arguments?: string;
  parsedArguments?: any;
  output?: string | null;
  // Additional fields for tracking search queries
  searchQueries?: string[];
  currentQuery?: string;
}

interface WebSearchCallProps {
  webSearchCall: ToolCallItem;
}

const WebSearchCall: React.FC<WebSearchCallProps> = ({ webSearchCall }) => {
  console.log("WebSearchCall received data:", webSearchCall);
  
  const { status, arguments: args, output, parsedArguments, searchQueries, currentQuery } = webSearchCall;
  
  // Parse the arguments to get search query - try both args and parsedArguments
  let query = currentQuery || "";
  
  try {
    if (parsedArguments && parsedArguments.query) {
      query = parsedArguments.query;
    } else if (args) {
      const parsed = JSON.parse(args);
      query = parsed.query || parsed.search_query || "";
    }
  } catch {
    // If parsing fails, ignore
  }

  // Extract search results and URLs from output
  let searchResults: WebSearchResult[] = [];
  let searchUrls: string[] = [];
  let searchContent = "";
  
  if (output) {
    try {
      const parsedOutput = JSON.parse(output);
      
      // Handle different possible output formats
      if (parsedOutput.results && Array.isArray(parsedOutput.results)) {
        searchResults = parsedOutput.results;
      } else if (parsedOutput.urls && Array.isArray(parsedOutput.urls)) {
        searchUrls = parsedOutput.urls;
        searchResults = parsedOutput.urls.map((url: string, index: number) => ({
          url,
          title: `Search Result ${index + 1}`,
        }));
      } else if (parsedOutput.sources && Array.isArray(parsedOutput.sources)) {
        searchResults = parsedOutput.sources.map((source: any) => ({
          url: source.url || source.link,
          title: source.title || source.name || 'Search Result',
          snippet: source.snippet || source.description,
        }));
      }
      
      searchContent = parsedOutput.content || parsedOutput.text || output;
    } catch {
      // If parsing fails, treat output as plain text
      searchContent = output;
      
      // Try to extract URLs from plain text
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const foundUrls = output.match(urlRegex) || [];
      if (foundUrls.length > 0) {
        searchUrls = foundUrls;
        searchResults = foundUrls.map((url: string, index: number) => ({
          url,
          title: `Search Result ${index + 1}`,
        }));
      }
    }
  }

  // Show basic web search indicator even if no specific status is set
  if (!status || status === "in_progress" || status === "searching") {
    return (
      <div className="web-search-container">
        <div className="web-search-header">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              {status === "searching" ? "Searching the web..." : "Starting web search..."}
            </span>
          </div>
        </div>
        
        {/* Show real-time search queries */}
        <div className="web-search-queries">
          {/* Show all previous queries if available */}
          {searchQueries && searchQueries.length > 0 && (
            <div className="space-y-1 mb-2">
              {searchQueries.map((searchQuery, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Search className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">
                    &quot;{searchQuery}&quot;
                  </span>
                  <span className="text-green-500 flex-shrink-0">✓</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Show current query being processed */}
          {query && (
            <div className="flex items-center gap-2 text-xs">
              <Search className="w-3 h-3 text-blue-500 animate-pulse flex-shrink-0" />
              <span className="text-blue-600 dark:text-blue-400 truncate max-w-xs">
                &quot;{query}&quot;
              </span>
              {status === "searching" && (
                <div className="flex space-x-1 flex-shrink-0">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          )}
          
          {!query && args && (
            <div className="text-xs text-gray-500">
              Preparing search query...
            </div>
          )}
        </div>
        
        {/* Show URLs being searched if available */}
        {(searchUrls.length > 0 || searchResults.length > 0) && status === "searching" && (
          <div className="web-search-urls">
            <div className="text-xs text-gray-500 mb-2">Accessing sources...</div>
            <div className="space-y-1">
              {(searchResults.length > 0 ? searchResults : searchUrls.map(url => ({ url, title: url }))).slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span className="truncate text-blue-600 max-w-xs">{typeof item === 'string' ? item : new URL(item.url).hostname}</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="web-search-container">
        <div className="web-search-header">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Web search completed</span>
          </div>
          
          {/* Show completed search queries */}
          {searchQueries && searchQueries.length > 0 && (
            <div className="space-y-1 mt-2">
              {searchQueries.map((searchQuery, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Search className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    &quot;{searchQuery}&quot;
                  </span>
                  <span className="text-green-500 flex-shrink-0">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="web-search-container">
        <div className="web-search-header">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Web search failed</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any other status
  return (
    <div className="web-search-container">
      <div className="web-search-header">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Web search tool</span>
          {status && (
            <span className="text-xs text-gray-500">({status})</span>
          )}
        </div>
        {query && (
          <div className="text-xs text-gray-600 mt-1">
            Query: &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSearchCall;
