import React, { useState } from "react";
import { Uploader } from "./components/Uploader";
import { Chat, Message } from "./components/Chat";
import { SlidePreview } from "./components/SlidePreview";
import { generatePresentation, Slide } from "./services/ai";
import { Presentation, Sparkles, FileText } from "lucide-react";

export default function App() {
  const [documentText, setDocumentText] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (text: string, name: string) => {
    setDocumentText(text);
    setFilename(name);
    setIsProcessing(true);

    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploaded document: ${name}. Please generate a presentation outline.`,
    };
    setMessages([initialMessage]);

    try {
      const response = await generatePresentation(text);
      setSlides(response.slides);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
        },
      ]);
    } catch (error) {
      console.error("Failed to generate initial presentation:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error while generating the presentation. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const response = await generatePresentation(documentText, message, slides);
      setSlides(response.slides);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
        },
      ]);
    } catch (error) {
      console.error("Failed to update presentation:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error while updating the presentation. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 flex-none z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Presentation className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                SlideGenius
              </h1>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            </div>
          </div>
          {filename && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200">
              <FileText size={14} className="text-gray-400" />
              <span className="font-medium truncate max-w-[250px]">{filename}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Panel: Chat & Upload */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col h-full min-h-0">
          {!documentText ? (
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a Word document to generate your presentation.
                </p>
              </div>
              <Uploader onUpload={handleUpload} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Chat messages={messages} onSendMessage={handleSendMessage} isProcessing={isProcessing} />
            </div>
          )}
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 h-full min-h-0 flex flex-col">
          {slides.length > 0 ? (
            <SlidePreview slides={slides} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm text-gray-400 p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 mb-4">
                <Presentation className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Canvas Ready</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Your presentation will appear here once the document is processed.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
