import { MessageItem } from "@/lib/assistant";
import React from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

interface MessageProps {
  message: MessageItem;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="flex w-full">
      {message.role === "user" ? (
        <div className="flex justify-end w-full">
          <div className="max-w-[80%] rounded-2xl bg-blue-600 text-white px-4 py-3 shadow-sm">
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
              {message.content[0].text as string}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex w-full">
          <div className="flex items-start gap-3 w-full">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1 max-w-none">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <ReactMarkdown className="prose prose-sm max-w-none text-gray-900">
                  {message.content[0].text as string}
                </ReactMarkdown>
                {message.content[0].annotations &&
                  message.content[0].annotations
                    .filter(
                      (a) =>
                        a.type === "container_file_citation" &&
                        a.filename &&
                        /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(a.filename)
                    )
                    .map((a, i) => (
                      <Image
                        key={i}
                        src={`/api/container_files/content?file_id=${a.fileId}${a.containerId ? `&container_id=${a.containerId}` : ""}${a.filename ? `&filename=${encodeURIComponent(a.filename)}` : ""}`}
                        alt={a.filename || ""}
                        width={400}
                        height={300}
                        className="mt-3 max-w-full rounded-lg border"
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
