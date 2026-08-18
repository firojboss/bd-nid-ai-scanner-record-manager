import React, { useState, useRef } from "react";
import { NIDRecord } from "../../types.js";
import { formatBanglaDate, getAccuracyColor } from "../../utils/nidHelpers.js";
import {
  X,
  Printer,
  Edit,
  Trash2,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Calendar,
  MapPin,
  Heart,
  Home,
  User,
  ExternalLink,
  QrCode,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  FileText,
  Layers,
  Upload,
  SplitSquareVertical,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { openNidDocumentInNewTab } from "../../utils/openNidTab.js";

interface RecordDetailModalProps {
  record: NIDRecord | null;
  onClose: () => void;
  onEdit: (record: NIDRecord) => void;
  onDelete: (id: string) => void;
  onUpdateRecord?: (record: NIDRecord) => void;
  initialTab?: "visual" | "scanned" | "table";
  lang: "bn" | "en";
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onEdit,
  onDelete,
  onUpdateRecord,
  initialTab = "visual",
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "scanned" | "table">(initialTab);
  const [activeImageSide, setActiveImageSide] = useState<"front" | "back">("front");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState<boolean>(false);
  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!record) return null;

  const isSmart = record.cardType === "smart_card";
  const accuracyMeta = getAccuracyColor(record.accuracyScore || 98);

  const currentImage =
    activeImageSide === "back" && record.backImage
      ? record.backImage
      : record.frontImage || record.backImage;

  const hasScannedImage = Boolean(record.frontImage || record.backImage);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `${record.nidNumber || "nid"}_${activeImageSide}_scan.${currentImage.startsWith("data:image/svg") ? "svg" : "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload or attach image to this record
  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const updatedRecord: NIDRecord = {
          ...record,
          frontImage: activeImageSide === "front" ? base64Data : record.frontImage || base64Data,
          backImage: activeImageSide === "back" ? base64Data : record.backImage,
          originalFileName: file.name,
          originalFileSize: `${(file.size / 1024).toFixed(1)} KB`,
          updatedAt: new Date().toISOString(),
        };

        const res = await fetch(`/api/records/${record.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecord),
        });
        const data = await res.json();
        if (data.success && data.record) {
          if (onUpdateRecord) onUpdateRecord(data.record);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to attach image:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>{record.nameBangla}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-rose-300 border border-slate-700 font-bold">
                  {record.nidNumber}
                </span>
                {hasScannedImage && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {lang === "bn" ? "স্ক্যান ফাইল সংযুক্ত" : "Scanned File Attached"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono tracking-wide">{record.nameEnglish}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => openNidDocumentInNewTab(record)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-950 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 transition-colors"
              title={lang === "bn" ? "নতুন ব্রাউজার ট্যাবে NID ওপেন করুন" : "Open NID in a new tab"}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={lang === "bn" ? "প্রিন্ট করুন" : "Print NID"}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={lang === "bn" ? "JSON কপি করুন" : "Copy JSON"}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                onEdit(record);
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
              title={lang === "bn" ? "সম্পাদনা করুন" : "Edit Record"}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    lang === "bn"
                      ? "আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছে ফেলতে চান?"
                      : "Are you sure you want to delete this record?"
                  )
                ) {
                  onDelete(record.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
              title={lang === "bn" ? "মুছে ফেলুন" : "Delete Record"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex flex-wrap items-center justify-between px-6 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/80 flex-shrink-0 gap-2">
          <div className="flex space-x-1.5 sm:space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {/* Tab 1: Digital NID */}
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "visual"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "কার্ড ভিউ (Digital NID)" : "Digital Card View"}</span>
            </button>

            {/* Tab 2: Original Scanned File (Key User Request!) */}
            <button
              onClick={() => setActiveTab("scanned")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
                activeTab === "scanned"
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-cyan-950"
                  : "text-cyan-400 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "মূল স্ক্যান ফাইল (Scanned File)" : "Original Scanned File"}</span>
              {hasScannedImage && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            {/* Tab 3: Detailed Data Sheet */}
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "table"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ডিটেইলড টেবিল" : "Full Data Sheet"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold ${accuracyMeta.bg} ${accuracyMeta.text} border ${accuracyMeta.border}`}
            >
              OCR Accuracy: {record.accuracyScore || 98}%
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* ============================================================ */}
          {/* TAB 1: DIGITAL NID CARD REPLICA                              */}
          {/* ============================================================ */}
          {activeTab === "visual" && (
            <div className="space-y-6">
              {/* Quick Scanned Image Shortcut Banner */}
              {hasScannedImage && (record.frontImage || record.backImage) && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0 bg-slate-800">
                      <img
                        src={(record.frontImage || record.backImage)!}
                        alt="Scan thumb"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {lang === "bn"
                          ? "এই রেকর্ডের সাথে মূল স্ক্যানকৃত ছবি সংযুক্ত আছে"
                          : "Original scanned document image is saved with this record"}
                      </p>
                      <p className="text-[11px] text-cyan-300/80">
                        {record.originalFileName || "Scanned_NID_Document.jpg"} •{" "}
                        {record.originalFileSize || "High Resolution OCR"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("scanned")}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "মূল ফাইল দেখুন" : "View Scanned File"}</span>
                  </button>
                </div>
              )}

              {/* Front Side */}
              <div className="relative mx-auto max-w-lg rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-slate-100 p-5 space-y-4">
                {/* Government Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-emerald-500 flex items-center justify-center shadow-inner">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-amber-300">★</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Government of the People's Republic of Bangladesh
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {isSmart ? "Smart Card" : "National ID"}
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="flex gap-4 items-start">
                  {/* Photo & Signature Column */}
                  <div className="space-y-2 flex-shrink-0">
                    {isSmart && (
                      <div className="w-12 h-10 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 p-1 flex flex-col justify-between shadow-inner">
                        <div className="h-0.5 bg-amber-800 w-full"></div>
                        <div className="h-0.5 bg-amber-800 w-full"></div>
                      </div>
                    )}

                    {/* Photo Box with click-to-view scanned document */}
                    <div
                      onClick={() => setActiveTab("scanned")}
                      className="w-24 h-28 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-slate-500 overflow-hidden shadow-inner cursor-pointer hover:border-cyan-400 transition-colors group relative"
                      title={lang === "bn" ? "মূল স্ক্যান দেখতে ক্লিক করুন" : "Click to view original scan"}
                    >
                      {record.frontImage && record.frontImage.trim() !== "" ? (
                        <img
                          src={record.frontImage}
                          alt="Citizen NID"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <User className="w-10 h-10 text-slate-600" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-5 h-5 text-cyan-300" />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 font-mono">স্বাক্ষর / Signature</span>
                    </div>
                  </div>

                  {/* Citizen Text Info */}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">নাম: </span>
                      <span className="font-bold text-emerald-300 text-sm">{record.nameBangla}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Name: </span>
                      <span className="font-semibold text-slate-100 font-mono">{record.nameEnglish}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">পিতা: </span>
                      <span className="text-slate-200">{record.fatherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">মাতা: </span>
                      <span className="text-slate-200">{record.motherName}</span>
                    </div>
                    {record.spouseName && (
                      <div>
                        <span className="text-slate-400 text-[11px]">স্বামী/স্ত্রী: </span>
                        <span className="text-slate-200">{record.spouseName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 text-[11px]">জন্ম তারিখ: </span>
                      <span className="font-mono text-amber-300 font-bold">{record.dateOfBirth}</span>
                    </div>
                  </div>
                </div>

                {/* NID Number Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">NID NO:</span>
                  <span className="text-base font-extrabold font-mono text-rose-400 tracking-widest">
                    {record.nidNumber}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-cyan-400">BD</span>
                  </div>
                </div>
              </div>

              {/* Back Side Summary */}
              <div className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 text-xs">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === "bn" ? "ঠিকানা ও পেছনের তথ্যাবলী" : "Address & Back Details"}</span>
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <span className="text-slate-400">ঠিকানা: </span>
                    <span className="text-slate-200">{record.addressBangla || "উপলব্ধ নয়"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">রক্তের গ্রুপ: </span>
                    <span className="font-bold text-red-400 font-mono">{record.bloodGroup || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">জন্মস্থান: </span>
                    <span className="text-slate-200">{record.placeOfBirth || "N/A"}</span>
                  </div>
                  {record.issueDate && (
                    <div>
                      <span className="text-slate-400">প্রদানের তারিখ: </span>
                      <span className="font-mono text-slate-300">{record.issueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ORIGINAL SCANNED FILE / DOCUMENT (DIRECT USER QUERY) */}
          {/* ============================================================ */}
          {activeTab === "scanned" && (
            <div className="space-y-4">
              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                {/* Front / Back Switcher */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setActiveImageSide("front")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      activeImageSide === "front"
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "সামনের পাতা (Front)" : "Front Side"}</span>
                  </button>

                  <button
                    onClick={() => setActiveImageSide("back")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      activeImageSide === "back"
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      {lang === "bn" ? "পেছনের পাতা (Back)" : "Back Side"}
                      {record.backImage ? "" : " (খালি)"}
                    </span>
                  </button>
                </div>

                {/* View Tools: Zoom, Rotate, Download, Side-by-Side */}
                <div className="flex items-center space-x-1.5">
                  {/* Zoom Out */}
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={lang === "bn" ? "জুম কমান" : "Zoom Out"}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 w-12 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  {/* Zoom In */}
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={lang === "bn" ? "জুম বাড়ান" : "Zoom In"}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {/* Reset */}
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                    title={lang === "bn" ? "রিসেট করুন" : "Reset Zoom"}
                  >
                    100%
                  </button>

                  {/* Rotate */}
                  <button
                    onClick={handleRotate}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={lang === "bn" ? "ঘুরান (Rotate 90°)" : "Rotate 90°"}
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Side by side comparison toggle */}
                  <button
                    onClick={() => setIsSideBySide((prev) => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                      isSideBySide
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                    title="Side-by-side comparison"
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {lang === "bn" ? "তুলনামূলক ভিউ" : "Side-by-Side"}
                    </span>
                  </button>

                  {/* Download Original Image */}
                  <button
                    onClick={handleDownloadImage}
                    disabled={!currentImage}
                    className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 disabled:opacity-40"
                    title={lang === "bn" ? "স্ক্যান ফাইল ডাউনলোড করুন" : "Download File"}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Area (Single or Side-by-Side) */}
              <div
                className={`grid gap-4 ${
                  isSideBySide ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Left (or full): Scanned Document Viewport */}
                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center min-h-[380px] p-4">
                  {currentImage && currentImage.trim() !== "" ? (
                    <div className="relative max-w-full max-h-[500px] overflow-auto flex items-center justify-center w-full">
                      <img
                        src={currentImage}
                        alt="Scanned NID Document"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                          transition: "transform 0.15s ease-out",
                        }}
                        className="max-h-[460px] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800 select-none"
                      />
                    </div>
                  ) : (
                    /* If no image attached for this side, show upload option */
                    <div className="text-center space-y-4 p-8">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">
                          {lang === "bn"
                            ? `${activeImageSide === "front" ? "সামনের" : "পেছনের"} পাতার স্ক্যান ফাইল পাওয়া যায়নি`
                            : `No ${activeImageSide} image attached for this record`}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          {lang === "bn"
                            ? "আপনি চাইলে এই রেকর্ডের সাথে মূল স্ক্যানকৃত ছবি বা ডকুমেন্ট ফাইল এখনই সংযুক্ত করতে পারেন।"
                            : "You can upload and attach the original scanned image to this record anytime."}
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 mx-auto shadow-md transition-colors"
                      >
                        {isUploadingImage ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>
                          {lang === "bn" ? "স্ক্যান ফাইল আপলোড করুন" : "Upload Scanned File"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Hidden File Input for Image Attachment */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAttachImage}
                    className="hidden"
                  />

                  {/* Floating Metadata Tag */}
                  {currentImage && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        {activeImageSide === "front" ? "Front Side Scan" : "Back Side Scan"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-mono">
                          {record.originalFileName || "nid_scan.jpg"}
                        </span>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-cyan-400 hover:text-cyan-200 underline font-semibold ml-2"
                        >
                          {lang === "bn" ? "ছবি পরিবর্তন" : "Change Image"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side (when side-by-side mode enabled): Extracted NID comparison fields */}
                {isSideBySide && (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3 overflow-y-auto max-h-[500px] text-xs">
                    <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-xs border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{lang === "bn" ? "এআই এক্সট্রাক্টেড তথ্য যাচাই" : "Extracted Fields Verification"}</span>
                    </h5>
                    <div className="space-y-2 divide-y divide-slate-800/80">
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">নাম (বাংলা):</span>
                        <span className="font-bold text-white text-sm">{record.nameBangla}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">Name (English):</span>
                        <span className="font-mono text-slate-200 uppercase font-semibold">
                          {record.nameEnglish}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">NID NO:</span>
                        <span className="font-mono font-extrabold text-rose-300 text-sm">
                          {record.nidNumber}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">পিতার নাম:</span>
                        <span className="text-slate-200">{record.fatherName}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">মাতার নাম:</span>
                        <span className="text-slate-200">{record.motherName}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">জন্ম তারিখ:</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {record.dateOfBirth}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">জন্মস্থান:</span>
                        <span className="text-slate-200">{record.placeOfBirth}</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-400 font-medium">রক্তের গ্রুপ:</span>
                        <span className="font-mono font-bold text-red-400">
                          {record.bloodGroup || "N/A"}
                        </span>
                      </div>
                      <div className="pt-2 flex flex-col space-y-1">
                        <span className="text-slate-400 font-medium">ঠিকানা:</span>
                        <span className="text-slate-300 leading-relaxed">
                          {record.addressBangla}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: FULL DATA SHEET TABLE                                 */}
          {/* ============================================================ */}
          {activeTab === "table" && (
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">ফিল্ডের নাম (Field)</th>
                    <th className="p-3">মান (Extracted Value)</th>
                    <th className="p-3 text-right">এআই নির্ভুলতা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">নাম (বাংলা)</td>
                    <td className="p-3 font-bold text-emerald-300 text-sm">{record.nameBangla}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.nameBangla || 99}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Name (English)</td>
                    <td className="p-3 font-mono uppercase">{record.nameEnglish}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.nameEnglish || 100}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">পিতার নাম</td>
                    <td className="p-3">{record.fatherName}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.fatherName || 98}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">মাতার নাম</td>
                    <td className="p-3">{record.motherName}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.motherName || 98}%
                    </td>
                  </tr>
                  {record.spouseName && (
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">স্বামী/স্ত্রী</td>
                      <td className="p-3">{record.spouseName}</td>
                      <td className="p-3 text-right font-mono text-emerald-400">
                        {record.fieldConfidence?.spouseName || 98}%
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">জাতীয় পরিচয়পত্র নং</td>
                    <td className="p-3 font-mono font-bold text-rose-400 text-sm">
                      {record.nidNumber}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.nidNumber || 100}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">জন্ম তারিখ</td>
                    <td className="p-3 font-mono text-amber-300">
                      {record.dateOfBirth} ({formatBanglaDate(record.dateOfBirth)})
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.dateOfBirth || 100}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">জন্মস্থান (জেলা)</td>
                    <td className="p-3">{record.placeOfBirth}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.placeOfBirth || 98}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">রক্তের গ্রুপ</td>
                    <td className="p-3 font-mono font-bold text-red-400">
                      {record.bloodGroup || "N/A"}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.bloodGroup || 95}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">ঠিকানা</td>
                    <td className="p-3 text-slate-300">{record.addressBangla}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {record.fieldConfidence?.addressBangla || 95}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">কার্ডের ধরণ</td>
                    <td className="p-3 capitalize">{record.cardType.replace("_", " ")}</td>
                    <td className="p-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">মূল স্ক্যান ফাইল</td>
                    <td className="p-3">
                      {hasScannedImage ? (
                        <button
                          onClick={() => setActiveTab("scanned")}
                          className="text-cyan-400 hover:text-cyan-200 underline font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{record.originalFileName || "ফাইল ভিউ করুন (View Image)"}</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">সংযুক্ত নেই</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">সংরক্ষণ সময়</td>
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <span>ID: {record.id}</span>
            {record.originalFileSize && <span>• {record.originalFileSize}</span>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onEdit(record);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              {lang === "bn" ? "সম্পাদনা করুন" : "Edit Record"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-md"
            >
              {lang === "bn" ? "বন্ধ করুন" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
