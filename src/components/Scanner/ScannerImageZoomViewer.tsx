import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Trash2,
  Move,
  Eye,
  SlidersHorizontal,
  Sun,
  Contrast,
  X,
  Download,
  Image as ImageIcon,
} from "lucide-react";

export interface ImageZoomItem {
  id: string;
  previewUrl: string;
  name: string;
  side: "front" | "back" | "auto";
  mimeType?: string;
}

interface ScannerImageZoomViewerProps {
  images: ImageZoomItem[];
  isScanning?: boolean;
  onRemoveImage: (id: string) => void;
  onAddAnotherSide?: () => void;
  lang: "bn" | "en";
}

export const ScannerImageZoomViewer: React.FC<ScannerImageZoomViewerProps> = ({
  images,
  isScanning,
  onRemoveImage,
  onAddAnotherSide,
  lang,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentImage = images[activeImageIndex] || images[0];

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [activeImageIndex, images.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsHighContrast(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Double click to toggle 1x and 2x zoom
  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setZoomLevel((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 4));
    } else {
      // Zoom out
      setZoomLevel((prev) => {
        const next = Math.max(Number((prev - 0.15).toFixed(2)), 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse dragging for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Download scanned image
  const handleDownload = () => {
    if (!currentImage?.previewUrl) return;
    const link = document.createElement("a");
    link.href = currentImage.previewUrl;
    link.download = `NID_${currentImage.side || "Card"}_${Date.now()}.png`;
    link.click();
  };

  // Keyboard shortcut to close fullscreen on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreenModal) {
        setIsFullscreenModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenModal]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 1. Header Toolbar with Tab Switcher & Quick Zoom Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950/70 p-2 rounded-xl border border-slate-800">
        {/* Front / Back Switcher (if multiple images uploaded) */}
        {images.length > 1 ? (
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeImageIndex === idx
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {idx === 0
                  ? lang === "bn"
                    ? "সামনের সাইড (Front)"
                    : "Front Side"
                  : lang === "bn"
                  ? "পেছনের সাইড (Back)"
                  : "Back Side"}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {lang === "bn" ? "কার্ড প্রিভিউ ও জুম" : "Card Preview & Zoom"}
          </span>
        )}

        {/* Compact Zoom Controls Toolbar */}
        <div className="flex items-center space-x-1 ml-auto">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
            title={lang === "bn" ? "জুম কমান (-)" : "Zoom Out (-)"}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Level Indicator / Reset */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono font-bold transition-colors min-w-[50px] text-center"
            title={lang === "bn" ? "জুম রিসেট (100%)" : "Reset Zoom (100%)"}
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
            title={lang === "bn" ? "জুম বাড়ান (+)" : "Zoom In (+)"}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Rotate 90° */}
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={lang === "bn" ? "ঘুরান (Rotate 90°)" : "Rotate (90°)"}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* High Contrast / Invert Toggle */}
          <button
            type="button"
            onClick={() => setIsHighContrast((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors ${
              isHighContrast
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            }`}
            title={lang === "bn" ? "উচ্চ বৈসাদৃশ্য / স্পষ্টতা মোড" : "High Contrast Mode"}
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Lightbox View */}
          <button
            type="button"
            onClick={() => setIsFullscreenModal(true)}
            className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105"
            title={lang === "bn" ? "বড় স্ক্রিনে জুম করুন (Fullscreen View)" : "Fullscreen Deep Zoom"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Remove active image */}
          <button
            type="button"
            onClick={() => currentImage && onRemoveImage(currentImage.id)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
            title={lang === "bn" ? "এই ছবি মুছে ফেলুন" : "Remove this image"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Interactive Zoomable Canvas Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className={`relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[290px] sm:min-h-[340px] max-h-[420px] flex items-center justify-center select-none shadow-inner ${
          zoomLevel > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in"
        }`}
      >
        {currentImage?.previewUrl && currentImage.previewUrl.trim() !== "" ? (
          currentImage.previewUrl.startsWith("data:application/pdf") || currentImage.mimeType === "application/pdf" ? (
            <div className="w-full h-full min-h-[320px] p-2 flex flex-col items-center justify-center">
              <iframe
                src={`${currentImage.previewUrl}#toolbar=0&navpanes=0`}
                title={currentImage.name || "PDF Preview"}
                className="w-full h-[320px] sm:h-[360px] rounded-xl border border-slate-800 bg-white"
              />
            </div>
          ) : (
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="relative flex items-center justify-center max-w-full max-h-full p-3 pointer-events-none"
            >
              <img
                src={currentImage.previewUrl}
                alt={currentImage.name || "NID Document"}
                style={{
                  filter: isHighContrast
                    ? "contrast(180%) brightness(110%) saturate(140%)"
                    : "none",
                }}
                className="max-h-[300px] sm:max-h-[340px] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-all"
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 space-y-2 p-6">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs text-slate-400">
              {lang === "bn" ? "কোন ছবি পাওয়া যায়নি" : "No image available"}
            </span>
          </div>
        )}

        {/* Laser Scanner animation during active OCR scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-scan-line relative"></div>
            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px]"></div>
          </div>
        )}

        {/* Floating Side Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/90 backdrop-blur-md text-emerald-300 border border-slate-700/80 shadow-md">
            {activeImageIndex === 0
              ? lang === "bn"
                ? "সামনের অংশ (Front)"
                : "Front Side"
              : lang === "bn"
              ? "পেছনের অংশ (Back)"
              : "Back Side"}
          </span>
          {zoomLevel > 1 && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-500/30 flex items-center gap-1 shadow-md">
              <Move className="w-2.5 h-2.5" />
              <span>{Math.round(zoomLevel * 100)}% (Drag to Pan)</span>
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreenModal(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 text-[11px] font-semibold flex items-center space-x-1 border border-cyan-500/30 shadow-lg backdrop-blur-md transition-all hover:scale-105"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{lang === "bn" ? "ফুলস্ক্রিন জুম" : "Full View"}</span>
          </button>
        </div>

        {/* Drag Helper Tip when zoomed */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
            {lang === "bn"
              ? "মাউস ড্র্যাগ করে যেকোনো অংশ দেখুন"
              : "Drag to pan around document"}
          </div>
        )}
      </div>

      {/* 3. Add Back/Front Side link if only 1 image uploaded */}
      {images.length === 1 && onAddAnotherSide && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-slate-400">
            {lang === "bn"
              ? "ঠিকানার জন্য পেছনের সাইড যোগ করতে চান?"
              : "Add back side for complete address?"}
          </span>
          <button
            type="button"
            onClick={onAddAnotherSide}
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
          >
            + {lang === "bn" ? "পেছনের সাইড আপলোড" : "Add Back Side"}
          </button>
        </div>
      )}

      {/* 4. Deep Inspection Fullscreen Lightbox Modal */}
      {isFullscreenModal && (
        <div
          onClick={() => setIsFullscreenModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ZoomIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === "bn" ? "এনআইডি হাই-রেজুলিউশন জুম ভিউয়ার" : "NID High-Resolution Zoom Inspector"}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === "bn"
                      ? "মাউস ড্র্যাগ করে কার্ডের যেকোনো লেখা বা বারকোড নিখুঁতভাবে পরীক্ষা করুন"
                      : "Drag to pan, scroll wheel to zoom into any text or details"}
                  </p>
                </div>
              </div>

              {/* Side switch tabs if multiple images */}
              {images.length > 1 && (
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeImageIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {idx === 0
                        ? lang === "bn"
                          ? "Front Side"
                          : "Front Side"
                        : lang === "bn"
                        ? "Back Side"
                        : "Back Side"}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsFullscreenModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center space-x-2">
                {/* Zoom Buttons & Slider */}
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-28 sm:w-44 accent-emerald-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold"
                >
                  Reset (100%)
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5"
                >
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>{lang === "bn" ? "ঘুরান" : "Rotate 90°"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHighContrast((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                    isHighContrast
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <Contrast className="w-4 h-4" />
                  <span>{lang === "bn" ? "হাই কন্ট্রাস্ট" : "High Contrast"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === "bn" ? "ডাউনলোড" : "Download"}</span>
                </button>
              </div>
            </div>

            {/* Modal Canvas Viewport */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              className={`flex-1 bg-slate-950 overflow-hidden flex items-center justify-center relative select-none ${
                zoomLevel > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-zoom-in"
              }`}
            >
              {currentImage?.previewUrl && (
                <div
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.15s ease-out",
                  }}
                  className="max-w-full max-h-full flex items-center justify-center p-6 pointer-events-none"
                >
                  <img
                    src={currentImage.previewUrl}
                    alt="NID Scanned Inspector"
                    style={{
                      filter: isHighContrast
                        ? "contrast(190%) brightness(110%) saturate(140%)"
                        : "none",
                    }}
                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
                  />
                </div>
              )}

              {/* Floating instructions */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 pointer-events-none flex items-center space-x-2">
                <Move className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {lang === "bn"
                    ? "মাউস ড্র্যাগ করে প্যান করুন • ডাবল ক্লিক করে জুম টগল করুন"
                    : "Drag to pan • Scroll to zoom • Double click to toggle 2x"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
