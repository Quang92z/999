import React, { useCallback, useState } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import mammoth from "mammoth";
import { cn } from "../lib/utils";

interface UploaderProps {
  onUpload: (text: string, filename: string) => void;
}

export function Uploader({ onUpload }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".docx")) {
      setError("Please upload a .docx file");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      if (!text || text.trim() === "") {
        throw new Error("Could not extract text from document");
      }

      onUpload(text, file.name);
    } catch (err: any) {
      setError(err.message || "Failed to process document");
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          ) : (
            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
          )}
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">Word Document (.docx)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </label>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
