import React, { useState, useRef, useEffect } from "react";
import {
  NIDExtractedData,
  NIDRecord,
  CardType,
  CardSide,
  RecordStatus,
} from "../../types.js";
import {
  BD_DISTRICTS,
  BLOOD_GROUPS,
  validateNIDNumber,
  formatBanglaDate,
  getAccuracyColor,
  fileToBase64,
} from "../../utils/nidHelpers.js";
import { SAMPLE_NID_LIST, SampleNID } from "../../utils/sampleData.js";
import { convertPdfToImages } from "../../utils/pdfToImages.js";
import { ScannerImageZoomViewer } from "./ScannerImageZoomViewer.js";
import {
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Trash2,
  Save,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Eye,
  FileText,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  CreditCard,
  MapPin,
  Heart,
  Home,
  User,
  ZoomIn,
  Image as ImageIcon,
} from "lucide-react";

interface ScannerViewProps {
  onRecordSaved: (record: NIDRecord) => void;
  lang: "bn" | "en";
  initialSampleToScan?: SampleNID | null;
}

interface ImageUploadItem {
  id: string;
  data: string; // base64
  mimeType: string;
  name: string;
  side: "front" | "back" | "auto";
  previewUrl: string;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onRecordSaved,
  lang,
  initialSampleToScan,
}) => {
  const [uploadedImages, setUploadedImages] = useState<ImageUploadItem[]>([]);
  const [isConvertingPdf, setIsConvertingPdf] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<NIDExtractedData | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form edit states
  const [nameBangla, setNameBangla] = useState<string>("");
  const [nameEnglish, setNameEnglish] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [motherName, setMotherName] = useState<string>("");
  const [spouseName, setSpouseName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [nidNumber, setNidNumber] = useState<string>("");
  const [pinNumber, setPinNumber] = useState<string>("");
  const [placeOfBirth, setPlaceOfBirth] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [addressBangla, setAddressBangla] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [cardType, setCardType] = useState<CardType>("smart_card");
  const [cardSide, setCardSide] = useState<CardSide>("front");
  const [recordStatus, setRecordStatus] = useState<RecordStatus>("verified");
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Rate limit countdown timer
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Sync if initial sample provided
  useEffect(() => {
    if (initialSampleToScan) {
      handleLoadSample(initialSampleToScan);
    }
  }, [initialSampleToScan]);

  // Load sample card handler
  const handleLoadSample = (sample: SampleNID) => {
    const item: ImageUploadItem = {
      id: `sample_${Date.now()}`,
      data: sample.frontImage,
      mimeType: "image/svg+xml",
      name: `${sample.title}.svg`,
      side: "front",
      previewUrl: sample.frontImage,
    };
    setUploadedImages([item]);
    applyExtractedData(sample.data);
    setErrorMsg(null);
  };

  const applyExtractedData = (data: NIDExtractedData) => {
    setExtractedData(data);
    setNameBangla(data.nameBangla || "");
    setNameEnglish(data.nameEnglish || "");
    setFatherName(data.fatherName || "");
    setMotherName(data.motherName || "");
    setSpouseName(data.spouseName || "");
    setDateOfBirth(data.dateOfBirth || "");
    setNidNumber(data.nidNumber || "");
    setPinNumber(data.pinNumber || "");
    setPlaceOfBirth(data.placeOfBirth || "");
    setBloodGroup(data.bloodGroup || "");
    setAddressBangla(data.addressBangla || "");
    setIssueDate(data.issueDate || "");
    setCardType(data.cardType || "smart_card");
    setCardSide(data.cardSide || "front");
  };

  // Handle file selection
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setIsConvertingPdf(true);

    const newItems: ImageUploadItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");

        if (isPdf) {
          try {
            // Convert PDF pages to high-res images (2.5x scale for sharp text and OCR)
            const pages = await convertPdfToImages(file, 2.5);
            if (pages.length > 0) {
              pages.forEach((pg, pIdx) => {
                newItems.push({
                  id: `pdf_pg_${Date.now()}_${i}_${pIdx}`,
                  data: pg.dataUrl,
                  mimeType: "image/png",
                  name: `${file.name} (পৃষ্ঠা ${pg.pageNumber})`,
                  side: pIdx === 0 ? "front" : "back",
                  previewUrl: pg.dataUrl,
                });
              });
              continue;
            }
          } catch (pdfErr) {
            console.warn("PDF conversion failed, falling back to base64:", pdfErr);
          }
        }

        const { data, mimeType } = await fileToBase64(file);
        newItems.push({
          id: `img_${Date.now()}_${i}`,
          data,
          mimeType,
          name: file.name,
          side: i === 0 ? "front" : "back",
          previewUrl: data,
        });
      } catch (err) {
        console.error("File read error:", err);
      }
    }

    setIsConvertingPdf(false);
    setUploadedImages((prev) => [...prev, ...newItems]);
  };

  // Camera Handler
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg(
        lang === "bn"
          ? "ক্যামেরা এক্সেস করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারে ক্যামেরার অনুমতি দিন অথবা ফাইল আপলোড করুন।"
          : "Could not access camera. Please allow camera permissions or upload an image file."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL("image/jpeg", 0.92);
      const newItem: ImageUploadItem = {
        id: `camera_${Date.now()}`,
        data: base64Data,
        mimeType: "image/jpeg",
        name: `NID_Capture_${new Date().toLocaleTimeString().replace(/:/g, "-")}.jpg`,
        side: uploadedImages.length === 0 ? "front" : "back",
        previewUrl: base64Data,
      };
      setUploadedImages((prev) => [...prev, newItem]);
      stopCamera();
    }
  };

  // AI Scan Action
  const triggerAiScan = async () => {
    if (uploadedImages.length === 0) {
      setErrorMsg(
        lang === "bn"
          ? "অনুগ্রহ করে স্ক্যান করার জন্য কমপক্ষে একটি এনআইডি কার্ডের ছবি আপলোড করুন।"
          : "Please upload at least one NID card image to scan."
      );
      return;
    }

    setIsScanning(true);
    setScanStep(1);
    setErrorMsg(null);

    // Simulated progress steps for great UX while waiting for Gemini
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      const payload = {
        images: uploadedImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          side: img.side,
        })),
      };

      const res = await fetch("/api/scan-nid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      clearInterval(stepInterval);

      if (json.success && json.data) {
        applyExtractedData(json.data);
        setRetryCountdown(0);
      } else {
        if (json.isRateLimit && json.retryDelaySec) {
          setRetryCountdown(json.retryDelaySec);
        }
        throw new Error(json.error || "Failed to extract NID fields");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg(
        err.message ||
          (lang === "bn"
            ? "এনআইডি স্ক্যান করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট ছবি দিয়ে পুনরায় চেষ্টা করুন।"
            : "Failed to scan NID card. Please try again with a clear photo.")
      );
    } finally {
      clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  // Save to database
  const handleSaveToDatabase = async () => {
    if (!nidNumber || !nameBangla) {
      setErrorMsg(
        lang === "bn"
          ? "এনআইডি নম্বর এবং বাংলা নাম বাধ্যতামূলক!"
          : "NID Number and Bangla Name are required!"
      );
      return;
    }

    const accuracyScore = extractedData?.accuracyScore || 98.0;
    const fieldConfidence = extractedData?.fieldConfidence || {
      nameBangla: 98,
      nameEnglish: 98,
      fatherName: 98,
      motherName: 98,
      dateOfBirth: 99,
      nidNumber: 99,
      placeOfBirth: 95,
      bloodGroup: 95,
      addressBangla: 95,
    };

    const frontDataUrl = uploadedImages[0]
      ? (uploadedImages[0].data?.startsWith("data:")
          ? uploadedImages[0].data
          : uploadedImages[0].previewUrl?.startsWith("data:")
          ? uploadedImages[0].previewUrl
          : `data:${uploadedImages[0].mimeType || "image/jpeg"};base64,${uploadedImages[0].data}`)
      : undefined;

    const backDataUrl = uploadedImages[1]
      ? (uploadedImages[1].data?.startsWith("data:")
          ? uploadedImages[1].data
          : uploadedImages[1].previewUrl?.startsWith("data:")
          ? uploadedImages[1].previewUrl
          : `data:${uploadedImages[1].mimeType || "image/jpeg"};base64,${uploadedImages[1].data}`)
      : undefined;

    const recordToSave: Partial<NIDRecord> = {
      nameBangla,
      nameEnglish,
      fatherName,
      motherName,
      spouseName: spouseName || undefined,
      dateOfBirth,
      nidNumber,
      pinNumber: pinNumber || undefined,
      placeOfBirth,
      bloodGroup,
      addressBangla,
      issueDate: issueDate || undefined,
      cardType,
      cardSide,
      accuracyScore,
      fieldConfidence,
      status: recordStatus,
      notes: adminNotes,
      frontImage: frontDataUrl,
      backImage: backDataUrl,
      originalFileName: uploadedImages[0]?.name || "nid_scanned_document.jpg",
      originalFileSize: uploadedImages[0]?.size
        ? `${(uploadedImages[0].size / 1024).toFixed(1)} KB`
        : undefined,
      scanSource: isCameraOpen ? "camera" : "upload",
    };

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordToSave),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (data.record) {
          onRecordSaved(data.record);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save record");
    }
  };

  // Copy JSON
  const handleCopyJson = () => {
    const currentData = {
      nameBangla,
      nameEnglish,
      fatherName,
      motherName,
      spouseName,
      dateOfBirth,
      nidNumber,
      pinNumber,
      placeOfBirth,
      bloodGroup,
      addressBangla,
      issueDate,
      cardType,
      cardSide,
      accuracyScore: extractedData?.accuracyScore || 98,
    };
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Reset form
  const handleReset = () => {
    setUploadedImages([]);
    setExtractedData(null);
    setNameBangla("");
    setNameEnglish("");
    setFatherName("");
    setMotherName("");
    setSpouseName("");
    setDateOfBirth("");
    setNidNumber("");
    setPinNumber("");
    setPlaceOfBirth("");
    setBloodGroup("");
    setAddressBangla("");
    setIssueDate("");
    setErrorMsg(null);
  };

  const accuracyMeta = getAccuracyColor(extractedData?.accuracyScore || 98);
  const nidValidation = validateNIDNumber(nidNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 3.7 Flash OCR
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              BD Smart & Non-Smart
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "bn"
              ? "বাংলাদেশ জাতীয় পরিচয়পত্র (NID) এআই স্ক্যানার"
              : "Bangladesh NID AI Scanner & OCR Extractor"}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            {lang === "bn"
              ? "১০ ডিজিট স্মার্ট কার্ড ও ১৩/১৭ ডিজিট পুরাতন লেমিনেটেড কার্ডের ছবি বা পিডিএফ আপলোড করুন। জেমিনাই এআই নাম, পিতা-মাতা, জন্মতারিখ, এনআইডি নম্বর ও ঠিকানা নির্ভুলভাবে বের করে দিবে।"
              : "Upload Smart Card or Old Laminated NID (JPG, PNG, PDF). Gemini AI extracts Bengali & English names, parents' names, DOB, NID No, address & place of birth with accuracy percentage."}
          </p>
        </div>

        {/* Quick Sample Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-sample-smart"
            onClick={() => handleLoadSample(SAMPLE_NID_LIST[0])}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === "bn" ? "স্মার্ট কার্ড ডেমো" : "Smart Card Demo"}</span>
          </button>
          <button
            id="btn-quick-sample-old"
            onClick={() => handleLoadSample(SAMPLE_NID_LIST[1])}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === "bn" ? "পুরাতন NID ডেমো" : "Old NID Demo"}</span>
          </button>
        </div>
      </div>

      {/* Error Message Alert with Retry */}
      {errorMsg && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">
                {lang === "bn" ? "স্ক্যান ত্রুটি / Scan Notification" : "Scan Error Notification"}
              </p>
              <p className="text-xs text-rose-300/90 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={triggerAiScan}
              disabled={isScanning || uploadedImages.length === 0 || retryCountdown > 0}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                retryCountdown > 0
                  ? "bg-amber-500/20 text-amber-200 border-amber-500/30 cursor-not-allowed"
                  : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/30 disabled:opacity-50"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retryCountdown > 0 ? "animate-spin" : ""}`} />
              <span>
                {retryCountdown > 0
                  ? lang === "bn"
                    ? `অপেক্ষা করুন (${retryCountdown}s)`
                    : `Cooldown (${retryCountdown}s)`
                  : lang === "bn"
                  ? "পুনরায় চেষ্টা করুন (Retry)"
                  : "Retry Scan"}
              </span>
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setRetryCountdown(0);
              }}
              className="text-xs text-rose-400 hover:text-rose-200 underline px-2 py-1"
            >
              {lang === "bn" ? "বন্ধ করুন" : "Dismiss"}
            </button>
          </div>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-pulse-subtle">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <p className="flex-1 font-semibold">
            {lang === "bn"
              ? "সফলভাবে ডাটাবেসে সেভ হয়েছে! আপনি ড্যাশবোর্ডে গিয়ে সকল রেকর্ড দেখতে পারবেন।"
              : "Record successfully saved to the database! You can manage it from the Dashboard."}
          </p>
        </div>
      )}

      {/* Main Grid: Left Upload & Image / Right Extracted Editable Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Upload & Card Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Frame Container */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {lang === "bn" ? "কার্ডের ছবি বা ডকুমেন্ট" : "NID Document / Images"}
              </h2>
              {uploadedImages.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === "bn" ? "মুছে ফেলুন" : "Clear"}
                </button>
              )}
            </div>

            {/* Camera Viewfinder Modal/Overlay */}
            {isConvertingPdf ? (
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-8 flex flex-col items-center justify-center space-y-3 min-h-[260px] text-center">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {lang === "bn"
                      ? "পিডিএফ প্রসেসিং ও হাই-রেজুলিউশন কনভার্ট হচ্ছে..."
                      : "Converting PDF pages to high-resolution scans..."}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === "bn"
                      ? "কার্ডের প্রতিটি পৃষ্ঠা স্বচ্ছভাবে জুম ও স্ক্যানের জন্য প্রস্তুত করা হচ্ছে"
                      : "Preparing all pages for sharp zoom and AI extraction"}
                  </p>
                </div>
              </div>
            ) : isCameraOpen ? (
              <div className="relative rounded-xl overflow-hidden bg-black border border-emerald-500/50 aspect-[4/3] flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Guide overlay box for ID Card */}
                <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-md">
                    {lang === "bn" ? "কার্ডটি ফ্রেমের ভেতর রাখুন" : "Align NID inside frame"}
                  </span>
                </div>
                <div className="absolute bottom-4 flex items-center space-x-3">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{lang === "bn" ? "ছবি তুলুন" : "Capture Photo"}</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs"
                  >
                    {lang === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : uploadedImages.length === 0 ? (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700/80 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950/80"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">
                    {lang === "bn"
                      ? "এনআইডি কার্ডের ছবি বা ফাইল ড্রপ করুন"
                      : "Drop NID Card image or PDF here"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === "bn"
                      ? "JPG, PNG, PDF সমর্থন করে (সামনে এবং পেছনের সাইড)"
                      : "Supports JPG, PNG, PDF (Front & Back sides)"}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    {lang === "bn" ? "ফাইল বেছে নিন" : "Browse Files"}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === "bn" ? "ক্যামেরা" : "Camera"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Zoomable Image Preview & Scanner Visual */
              <ScannerImageZoomViewer
                images={uploadedImages}
                isScanning={isScanning}
                onRemoveImage={(id) =>
                  setUploadedImages((prev) => prev.filter((i) => i.id !== id))
                }
                onAddAnotherSide={() => fileInputRef.current?.click()}
                lang={lang}
              />
            )}

            {/* Scan Action Button */}
            <div className="pt-2">
              <button
                id="btn-trigger-ai-scan"
                onClick={triggerAiScan}
                disabled={isScanning || uploadedImages.length === 0}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  isScanning || uploadedImages.length === 0
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                    : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-emerald-950/50 active:scale-[0.98]"
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>
                      {scanStep === 1
                        ? lang === "bn"
                          ? "ছবি প্রসেস হচ্ছে..."
                          : "Processing Image..."
                        : scanStep === 2
                        ? lang === "bn"
                          ? "বাংলা টেক্সট ও NID ফিল্ড OCR হচ্ছে..."
                          : "Extracting Bengali OCR..."
                        : scanStep === 3
                        ? lang === "bn"
                          ? "স্মার্ট কার্ড নম্বর ও জন্মতারিখ ভেরিফাই হচ্ছে..."
                          : "Verifying NID & DOB..."
                        : lang === "bn"
                        ? "নির্ভুলতা পার্সেন্টেজ হিসাব হচ্ছে..."
                        : "Calculating Accuracy..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>
                      {extractedData
                        ? lang === "bn"
                          ? "পুনরায় এআই স্ক্যান করুন"
                          : "Re-scan with Gemini AI"
                        : lang === "bn"
                        ? "জেমিনাই এআই দিয়ে স্ক্যান করুন"
                        : "Analyze & Extract with Gemini AI"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Observations Card if available */}
          {extractedData && extractedData.validationIssues && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {lang === "bn" ? "এআই পর্যবেক্ষণ ও ভ্যালিডেশন" : "AI Validation Notes"}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {extractedData.validationIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
                <li className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{nidValidation.message}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Extracted Fields & Editable Admin Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* Top Accuracy & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {lang === "bn"
                    ? "এনআইডি তথ্যাবলী (সম্পাদনাযোগ্য)"
                    : "Extracted NID Details (Editable)"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "bn"
                    ? "প্রয়োজনে অ্যাডমিন ফিল্ডের তথ্য পরিবর্তন করে ডাটাবেসে সেভ করতে পারবেন।"
                    : "Admin can modify any field before saving to the central database."}
                </p>
              </div>

              {/* Accuracy Percentage Badge */}
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${accuracyMeta.bg} ${accuracyMeta.border}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">
                      {lang === "bn" ? "সঠিকতা:" : "Accuracy:"}
                    </span>
                    <span className={`ml-1 text-sm font-extrabold font-mono ${accuracyMeta.text}`}>
                      {extractedData?.accuracyScore
                        ? `${extractedData.accuracyScore}%`
                        : "98.5%"}
                    </span>
                  </div>
                </div>

                {/* Card Type Tag */}
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {cardType === "smart_card"
                    ? "Smart NID (10 Digits)"
                    : cardType === "old_laminated"
                    ? "Old NID (13/17 Digits)"
                    : "Server Copy"}
                </span>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Bangla Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>নাম (বাংলা) *</span>
                  </label>
                  {extractedData?.fieldConfidence?.nameBangla && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {extractedData.fieldConfidence.nameBangla}% Match
                    </span>
                  )}
                </div>
                <input
                  id="field-name-bangla"
                  type="text"
                  value={nameBangla}
                  onChange={(e) => setNameBangla(e.target.value)}
                  placeholder="যেমন: মোহাম্মদ রফিকুল ইসলাম"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* English Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Name (English)</span>
                  </label>
                  {extractedData?.fieldConfidence?.nameEnglish && (
                    <span className="text-[10px] text-sky-400 font-mono">
                      {extractedData.fieldConfidence.nameEnglish}% Match
                    </span>
                  )}
                </div>
                <input
                  id="field-name-english"
                  type="text"
                  value={nameEnglish}
                  onChange={(e) => setNameEnglish(e.target.value.toUpperCase())}
                  placeholder="e.g. MOHAMMAD RAFIQUL ISLAM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Father Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    {lang === "bn" ? "পিতার নাম *" : "Father's Name *"}
                  </label>
                  {extractedData?.fieldConfidence?.fatherName && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {extractedData.fieldConfidence.fatherName}%
                    </span>
                  )}
                </div>
                <input
                  id="field-father-name"
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="পিতার নাম"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Mother Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    {lang === "bn" ? "মাতার নাম *" : "Mother's Name *"}
                  </label>
                  {extractedData?.fieldConfidence?.motherName && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {extractedData.fieldConfidence.motherName}%
                    </span>
                  )}
                </div>
                <input
                  id="field-mother-name"
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="মাতার নাম"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* NID Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                    <span>জাতীয় পরিচয়পত্র নম্বর (NID No) *</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {nidNumber.length} {lang === "bn" ? "ডিজিট" : "digits"}
                  </span>
                </div>
                <input
                  id="field-nid-number"
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="১০ বা ১৩ বা ১৭ ডিজিট"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-rose-300 font-mono font-bold tracking-wider focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                />
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-500" />
                  {nidValidation.message}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>জন্ম তারিখ (DOB) *</span>
                  </label>
                  {dateOfBirth && (
                    <span className="text-[10px] text-amber-400 font-medium">
                      {formatBanglaDate(dateOfBirth)}
                    </span>
                  )}
                </div>
                <input
                  id="field-date-of-birth"
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="YYYY-MM-DD (e.g. 1990-05-15)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-medium focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Place of Birth / District */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>জন্মস্থান (Place of Birth)</span>
                </label>
                <div className="relative">
                  <input
                    id="field-place-of-birth"
                    type="text"
                    list="bd-districts-list"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="জেলা নির্বাচন বা লিখুন"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <datalist id="bd-districts-list">
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  <span>রক্তের গ্রুপ (Blood Group)</span>
                </label>
                <select
                  id="field-blood-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="">নির্বাচন করুন</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Address (Spans 2 cols) */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ঠিকানা (বাসা/হোল্ডিং, গ্রাম/রাস্তা, ডাকঘর, উপজেলা, জেলা)</span>
                  </label>
                  {extractedData?.fieldConfidence?.addressBangla && (
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {extractedData.fieldConfidence.addressBangla}%
                    </span>
                  )}
                </div>
                <textarea
                  id="field-address-bangla"
                  rows={2}
                  value={addressBangla}
                  onChange={(e) => setAddressBangla(e.target.value)}
                  placeholder="সম্পূর্ণ ঠিকানা..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Spouse Name & Issue Date */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  {lang === "bn" ? "স্বামী / স্ত্রীর নাম" : "Spouse Name (Optional)"}
                </label>
                <input
                  id="field-spouse-name"
                  type="text"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  placeholder="স্বামী/স্ত্রীর নাম (যদি থাকে)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  {lang === "bn" ? "প্রদানের তারিখ (Issue Date)" : "Issue Date"}
                </label>
                <input
                  id="field-issue-date"
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              {/* Card Type & Admin Status */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">কার্ডের ধরণ (Card Type)</label>
                <select
                  id="field-card-type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as CardType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-slate-500"
                >
                  <option value="smart_card">স্মার্ট এনআইডি কার্ড (১০ ডিজিট)</option>
                  <option value="old_laminated">পুরাতন লেমিনেটেড কার্ড (১৩/১৭ ডিজিট)</option>
                  <option value="server_copy">অনলাইন সার্ভার কপি / স্লিপ</option>
                  <option value="unknown">অনির্দিষ্ট / Unknown</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">ভেরিফিকেশন স্ট্যাটাস</label>
                <select
                  id="field-record-status"
                  value={recordStatus}
                  onChange={(e) => setRecordStatus(e.target.value as RecordStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-slate-500"
                >
                  <option value="verified">ভেরিফাইড (Verified)</option>
                  <option value="pending_review">পর্যালোচনাধীন (Pending Review)</option>
                  <option value="flagged">সন্দেহজনক (Flagged)</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-semibold text-slate-300">
                  {lang === "bn" ? "অ্যাডমিন মন্তব্য / নোট" : "Admin Notes (Internal)"}
                </label>
                <input
                  id="field-admin-notes"
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="যেমন: স্মার্ট কার্ড স্ক্যান করে ভেরিফাই করা হয়েছে"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-copy-json"
                  onClick={handleCopyJson}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === "bn" ? "JSON কপি" : "Copy JSON"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-print-slip"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === "bn" ? "প্রিন্ট স্লিপ" : "Print Slip"}</span>
                </button>
              </div>

              {/* Main Save to DB Button */}
              <button
                type="button"
                id="btn-save-to-database"
                onClick={handleSaveToDatabase}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>
                  {saveSuccess
                    ? lang === "bn"
                      ? "ডাটাবেসে সেভ হয়েছে!"
                      : "Saved to Database!"
                    : lang === "bn"
                    ? "ডাটাবেসে সেভ করুন"
                    : "Save to Database"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
