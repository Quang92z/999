import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export function Chat({ messages, onSendMessage, isProcessing }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
              <Bot className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm">Upload a document to start.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
                  msg.role === "user" 
                    ? "bg-blue-600 text-white border-blue-700" 
                    : "bg-white text-blue-600 border-gray-200 shadow-sm"
                )}
              >
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm shadow-sm border",
                  msg.role === "user"
                    ? "bg-blue-600 text-white border-blue-700 rounded-tr-sm"
                    : "bg-white text-gray-800 border-gray-200 rounded-tl-sm"
                )}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:border prose-pre:border-gray-200 prose-a:text-blue-600">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex items-start gap-3 max-w-[90%]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-blue-600 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-800 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500 font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to refine slides..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1.5 px-1 text-gray-800 placeholder:text-gray-400"
            disabled={isProcessing || messages.length === 0}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing || messages.length === 0}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
