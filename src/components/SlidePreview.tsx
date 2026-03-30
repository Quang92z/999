import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, List, MessageSquare, Loader2, Play, Maximize, Minimize, X } from "lucide-react";
import { Slide } from "../services/ai";
import { exportToPPTX } from "../services/pptx";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface SlidePreviewProps {
  slides: Slide[];
}

const themeColors = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", lightBg: "bg-blue-50", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-600", lightBg: "bg-emerald-50", border: "border-emerald-200" },
  violet: { bg: "bg-violet-600", text: "text-violet-600", lightBg: "bg-violet-50", border: "border-violet-200" },
  rose: { bg: "bg-rose-600", text: "text-rose-600", lightBg: "bg-rose-50", border: "border-rose-200" },
  amber: { bg: "bg-amber-600", text: "text-amber-600", lightBg: "bg-amber-50", border: "border-amber-200" },
  slate: { bg: "bg-slate-800", text: "text-slate-800", lightBg: "bg-slate-50", border: "border-slate-200" },
};

export function SlidePreview({ slides }: SlidePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "outline">("slides");
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, slides.length]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await presentationRef.current?.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 border rounded-xl border-dashed text-gray-400 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border">
          <FileText className="w-8 h-8 text-blue-200" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Slides Yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Upload a document to generate your presentation outline and slides.
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const renderSlideContent = (slide: Slide, isFullscreen: boolean) => {
    const layout = slide.layout || "content-split";
    const theme = slide.themeColor || "blue";
    const colors = themeColors[theme as keyof typeof themeColors] || themeColors.blue;

    const titleClass = cn(
      "font-bold text-gray-900 leading-tight",
      isFullscreen ? "text-5xl lg:text-6xl mb-4" : "text-3xl md:text-4xl mb-3"
    );
    
    const subtitleClass = cn(
      "font-medium text-gray-500 mb-8 max-w-3xl",
      isFullscreen ? "text-2xl lg:text-3xl" : "text-lg md:text-xl"
    );
    
    const listClass = cn(
      "space-y-4 text-gray-700",
      isFullscreen ? "text-2xl lg:text-3xl space-y-6" : "text-lg md:text-xl"
    );

    switch (layout) {
      case "title":
        return (
          <div className={cn("w-full h-full flex flex-col items-center justify-center relative text-center p-12", colors.bg)}>
            {slide.imageKeyword && (
              <>
                <img src={`https://picsum.photos/seed/${encodeURIComponent(slide.imageKeyword)}/1920/1080`} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Background" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            )}
            <div className="relative z-10 max-w-4xl">
              <h1 className={cn("font-extrabold text-white mb-6 leading-tight drop-shadow-lg", isFullscreen ? "text-7xl" : "text-5xl")}>
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className={cn("text-white/90 font-medium drop-shadow-md mb-8", isFullscreen ? "text-3xl" : "text-xl")}>
                  {slide.subtitle}
                </p>
              )}
              {slide.content.length > 0 && (
                <p className={cn("text-white/80 font-medium drop-shadow-md", isFullscreen ? "text-2xl" : "text-lg")}>
                  {slide.content[0]}
                </p>
              )}
            </div>
          </div>
        );
      
      case "section":
        return (
          <div className={cn("w-full h-full flex flex-col items-start justify-center p-16 relative overflow-hidden", colors.bg)}>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-black/10 rounded-full blur-2xl" />
            <div className="relative z-10 max-w-3xl">
              <div className="w-20 h-2 bg-white/50 mb-8 rounded-full" />
              <h2 className={cn("font-bold text-white leading-tight", isFullscreen ? "text-7xl" : "text-5xl")}>
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className={cn("text-white/90 mt-6 font-medium", isFullscreen ? "text-3xl" : "text-xl")}>
                  {slide.subtitle}
                </p>
              )}
            </div>
          </div>
        );

      case "content-full":
        return (
          <div className="w-full h-full flex flex-col p-12 md:p-16 bg-white relative">
            <div className={cn("absolute top-0 left-0 w-full h-3", colors.bg)} />
            <h2 className={titleClass}>{slide.title}</h2>
            {slide.subtitle && <p className={subtitleClass}>{slide.subtitle}</p>}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <ul className={listClass}>
                {slide.content.map((point, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className={cn("mt-2.5 w-2.5 h-2.5 rounded-full flex-shrink-0", colors.bg)} />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "grid":
        return (
          <div className="w-full h-full flex flex-col p-12 md:p-16 bg-gray-50 relative">
            <div className={cn("absolute top-0 left-0 w-full h-3", colors.bg)} />
            <h2 className={titleClass}>{slide.title}</h2>
            {slide.subtitle && <p className={subtitleClass}>{slide.subtitle}</p>}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 md:gap-8 h-full">
                {slide.content.map((point, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mb-4", colors.bg)}>
                      {i + 1}
                    </div>
                    <p className={cn("text-gray-700 leading-relaxed", isFullscreen ? "text-2xl" : "text-lg")}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className={cn("w-full h-full flex flex-col items-center justify-center p-16 text-center", colors.lightBg)}>
            <div className={cn("mb-8", colors.text)}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 21L16.41 14.592C16.666 13.926 16.8 13.228 16.8 12.5V3H24V12.5C24 16.366 22.434 20.055 19.657 22.832L14.017 21ZM0.0170002 21L2.41 14.592C2.666 13.926 2.8 13.228 2.8 12.5V3H10V12.5C10 16.366 8.434 20.055 5.657 22.832L0.0170002 21Z" />
              </svg>
            </div>
            <h2 className={cn("font-bold italic text-gray-900 leading-tight max-w-4xl", isFullscreen ? "text-5xl lg:text-6xl" : "text-3xl md:text-4xl")}>
              "{slide.title}"
            </h2>
            {slide.subtitle && (
              <p className={cn("mt-8 font-medium", colors.text, isFullscreen ? "text-3xl" : "text-xl")}>
                — {slide.subtitle}
              </p>
            )}
          </div>
        );

      case "chart":
        return (
          <div className="w-full h-full flex flex-col p-12 md:p-16 bg-white relative">
            <div className={cn("absolute top-0 left-0 w-full h-3", colors.bg)} />
            <h2 className={titleClass}>{slide.title}</h2>
            {slide.subtitle && <p className={subtitleClass}>{slide.subtitle}</p>}
            <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
              <div className="flex-1 h-full min-h-[300px]">
                {slide.chartData && slide.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {slide.chartType === "line" ? (
                      <LineChart data={slide.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} className={colors.text} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    ) : slide.chartType === "pie" ? (
                      <PieChart>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Pie data={slide.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isFullscreen ? 180 : 120} label>
                          {slide.chartData.map((entry, index) => {
                            const pieColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B', '#64748B'];
                            return <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />;
                          })}
                        </Pie>
                      </PieChart>
                    ) : slide.chartType === "area" ? (
                      <AreaChart data={slide.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="currentColor" fill="currentColor" className={colors.text} fillOpacity={0.3} />
                      </AreaChart>
                    ) : (
                      <BarChart data={slide.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F3F4F6' }} />
                        <Bar dataKey="value" fill="currentColor" className={colors.text} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400">No chart data available</p>
                  </div>
                )}
              </div>
              {slide.content && slide.content.length > 0 && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <ul className={listClass}>
                    {slide.content.map((point, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className={cn("mt-2.5 w-2.5 h-2.5 rounded-full flex-shrink-0", colors.bg)} />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case "content-split":
      default:
        return (
          <div className="w-full h-full flex bg-white relative">
            <div className="w-1/2 p-10 md:p-14 flex flex-col justify-center overflow-y-auto custom-scrollbar">
              <div className={cn("w-12 h-1.5 mb-6 rounded-full", colors.bg)} />
              <h2 className={titleClass}>{slide.title}</h2>
              {slide.subtitle && <p className={subtitleClass}>{slide.subtitle}</p>}
              <div className="flex-1 flex flex-col justify-center">
                <ul className={listClass}>
                  {slide.content.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={cn("mt-1.5 font-bold", colors.text)}>•</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-1/2 relative bg-gray-100 border-l border-gray-200">
              {slide.imageKeyword ? (
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(slide.imageKeyword)}/1920/1080`}
                  alt={slide.imageKeyword}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
                  <FileText className="w-24 h-24 opacity-20" />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPPTX(slides, "SlideGenius_Presentation.pptx");
    } catch (error) {
      console.error("Failed to export PPTX", error);
      alert("Failed to export presentation. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode("slides")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === "slides" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <FileText size={16} />
            Slides
          </button>
          <button
            onClick={() => setViewMode("outline")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === "outline" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List size={16} />
            Outline
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Play size={14} fill="currentColor" />
            Present
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} />}
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F9FA] flex flex-col items-center justify-start md:justify-center">
        {viewMode === "slides" ? (
          <div 
            ref={presentationRef}
            className={cn(
              "w-full max-w-5xl aspect-video bg-white shadow-sm border border-gray-200 flex overflow-hidden relative transition-all group",
              isFullscreen ? "max-w-none h-screen w-screen border-none rounded-none items-center justify-center bg-black" : "rounded-xl"
            )}
          >
            {/* Actual Slide Content Container to maintain 16:9 in fullscreen */}
            <div className={cn(
              "flex w-full h-full bg-white relative overflow-hidden",
              isFullscreen ? "aspect-video h-auto max-h-screen max-w-full m-auto" : ""
            )}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  {renderSlideContent(currentSlide, isFullscreen)}
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-6 text-sm font-medium text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-50">
                {currentIndex + 1} / {slides.length}
              </div>
            </div>

            {/* Fullscreen Controls overlay */}
            {isFullscreen && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="p-2 hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronLeft size={24} /></button>
                <span className="font-medium min-w-[3rem] text-center">{currentIndex + 1} / {slides.length}</span>
                <button onClick={() => setCurrentIndex(p => Math.min(slides.length - 1, p + 1))} disabled={currentIndex === slides.length - 1} className="p-2 hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronRight size={24} /></button>
                <div className="w-px h-6 bg-white/30 mx-2" />
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-full"><Minimize size={20} /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Presentation Outline</h3>
            <div className="space-y-8">
              {slides.map((slide, idx) => (
                <div key={idx} className="flex gap-5 group cursor-pointer" onClick={() => { setCurrentIndex(idx); setViewMode("slides"); }}>
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center font-semibold text-sm flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{slide.title}</h4>
                    {slide.subtitle && <p className="text-sm text-gray-500 mb-3 italic">{slide.subtitle}</p>}
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      {slide.content.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gray-300 mt-0.5">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === "slides" && (
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 overflow-x-auto max-w-[60%] px-2 py-1 scrollbar-hide items-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all flex-shrink-0",
                    currentIndex === idx ? "w-8 bg-blue-600" : "w-2 bg-gray-200 hover:bg-gray-300"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentIndex === slides.length - 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {currentSlide.speakerNotes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 text-sm text-gray-700">
              <MessageSquare size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
              <div>
                <span className="font-medium block mb-1 text-gray-900">Speaker Notes</span>
                <p className="leading-relaxed text-gray-600">{currentSlide.speakerNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
