"use client";

import React, { useState } from "react";
import { ExternalLink, Globe, ChevronDown, ChevronRight } from "lucide-react";

interface WebSearchResultsProps {
  annotations: Array<{
    type: string;
    url?: string;
    title?: string;
    text?: string;
    start_index?: number;
    end_index?: number;
  }>;
}

const WebSearchResults: React.FC<WebSearchResultsProps> = ({ annotations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter for URL citations from web search
  const webSearchResults = annotations.filter(
    (annotation) => 
      annotation.type === "url_citation" || 
      annotation.type === "web_search_citation" ||
      annotation.url
  );

  if (webSearchResults.length === 0) {
    return null;
  }

  return (
    <div className="web-search-results-container">
      <div className="web-search-results-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mb-2 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-blue-500" />
          )}
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sources ({webSearchResults.length})
          </span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="web-search-results-list">
          {webSearchResults.map((result, index) => (
            <div key={index} className="web-search-result-item">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <Globe className="w-3 h-3 text-blue-500 mt-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                  >
                    <span className="truncate max-w-xs">
                      {result.title || new URL(result.url || '').hostname}
                    </span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  {result.text && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 break-words">
                      {result.text}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                    {result.url && new URL(result.url).hostname}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebSearchResults;
