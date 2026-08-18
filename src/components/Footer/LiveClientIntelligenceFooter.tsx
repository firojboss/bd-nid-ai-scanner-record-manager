import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Globe,
  MapPin,
  Wifi,
  Smartphone,
  Laptop,
  Monitor,
  Copy,
  Check,
  RefreshCw,
  Info,
  X,
  Activity,
  Cpu,
  Eye,
  Zap,
} from "lucide-react";
import { detectFullClientIntelligence, ClientIntelligence } from "../../utils/deviceDetector.js";
import { getLiveBDTClock } from "../../utils/bdtTime.js";

interface FooterProps {
  lang: "bn" | "en";
}

export const LiveClientIntelligenceFooter: React.FC<FooterProps> = ({ lang }) => {
  // Live BDT Clock State (ticks every 1s)
  const [bdtClock, setBdtClock] = useState(() => getLiveBDTClock());

  // Client Intelligence State
  const [clientInfo, setClientInfo] = useState<ClientIntelligence>({
    ip: "Detecting...",
    city: "Dhaka",
    region: "Dhaka Division",
    country: "Bangladesh",
    countryCode: "BD",
    flag: "🇧🇩",
    isp: "Detecting ISP...",
    org: "Detecting Carrier...",
    asn: "AS24389",
    deviceModel: "Detecting Device...",
    deviceType: "desktop",
    osName: "Detecting OS...",
    osVersion: "",
    browserName: "Detecting Browser...",
    browserVersion: "",
    screenResolution: "1920 × 1080",
    devicePixelRatio: 1,
    isTouchScreen: false,
    cpuCores: 4,
    userAgentRaw: typeof navigator !== "undefined" ? navigator.userAgent : "",
    timezone: "Asia/Dhaka (BDT / UTC+6)",
    loading: true,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update BDT Clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setBdtClock(getLiveBDTClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch client intelligence
  const loadIntelligence = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await detectFullClientIntelligence();
      setClientInfo(data);
    } catch (err) {
      console.error("Failed to detect client intelligence:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadIntelligence();
  }, [loadIntelligence]);

  const handleCopy = (text: string, fieldId: string) => {
    if (!text || text === "Detecting...") return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
      case "tablet":
        return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <>
      <footer
        id="live-client-footer"
        className="w-full bg-slate-950/95 dark:bg-slate-950/95 border-t border-slate-800/90 text-slate-400 transition-colors shadow-2xl z-30"
      >
        {/* Main Live Telemetry Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 text-xs">
            
            {/* 1. Live BDT Time (UTC+6) */}
            <div className="flex items-center flex-wrap gap-2 justify-center lg:justify-start">
              <div
                id="footer-bdt-clock"
                className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono shadow-sm group hover:border-emerald-500/80 transition-all cursor-default"
                title="Bangladesh Standard Time (Asia/Dhaka, UTC+6)"
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-75"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
                </div>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold tracking-wider text-emerald-200 text-[13px]">
                  {bdtClock.timeString}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-sans font-semibold uppercase tracking-wider border border-emerald-700/50">
                  BDT UTC+6
                </span>
              </div>

              {/* Date string */}
              <span className="text-slate-400 text-[11px] hidden sm:inline-block font-medium">
                {lang === "bn" ? bdtClock.dateStringBn : bdtClock.dateStringEn}
              </span>
            </div>

            {/* 2. Client IP, Location & ISP Detection */}
            <div className="flex items-center flex-wrap gap-2 justify-center">
              {/* Real Client IP */}
              <button
                id="btn-copy-client-ip"
                type="button"
                onClick={() => handleCopy(clientInfo.ip, "ip")}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all group"
                title={lang === "bn" ? "IP অ্যাড্রেস কপি করুন" : "Click to copy Client IP"}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 text-[11px]">IP:</span>
                <span className="font-mono font-bold text-blue-300 text-xs tracking-wide">
                  {clientInfo.ip}
                </span>
                {copiedField === "ip" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              {/* Live Location */}
              <div
                id="footer-location"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300"
                title={`${clientInfo.city}, ${clientInfo.region}, ${clientInfo.country}`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="text-xs font-medium truncate max-w-[140px] sm:max-w-[180px]">
                  {clientInfo.city}, {clientInfo.country}
                </span>
                <span className="text-sm">{clientInfo.flag}</span>
              </div>

              {/* Live ISP Carrier */}
              <div
                id="footer-isp"
                className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300"
                title={`ISP: ${clientInfo.isp} (${clientInfo.asn})`}
              >
                <Wifi className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-slate-400 text-[11px]">ISP:</span>
                <span className="text-xs font-semibold text-amber-300 truncate max-w-[140px] sm:max-w-[170px]">
                  {clientInfo.isp}
                </span>
              </div>
            </div>

            {/* 3. Device Model & Inspector Button */}
            <div className="flex items-center space-x-2">
              {/* Device Model Badge */}
              <div
                id="footer-device"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200"
                title={`${clientInfo.deviceModel} • ${clientInfo.osName} • ${clientInfo.browserName}`}
              >
                {getDeviceIcon(clientInfo.deviceType)}
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[200px]">
                  {clientInfo.deviceModel}
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-[110px]">
                  {clientInfo.browserName}
                </span>
              </div>

              {/* Refresh / Inspector Trigger Button */}
              <button
                id="btn-open-telemetry-modal"
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium"
                title={lang === "bn" ? "সম্পূর্ণ ডিভাইস ও নেটওয়ার্ক তথ্য দেখুন" : "View Full Device & Network Specs"}
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">
                  {lang === "bn" ? "ডিভাইস বিবরণ" : "Specs"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar / Security & System Status */}
        <div className="border-t border-slate-900/80 bg-slate-950 py-2 px-3 sm:px-5 lg:px-6 text-[11px] text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-slate-400">
                BD NID AI Scanner & Record Engine
              </span>
              <span>•</span>
              <span className="text-slate-400">Gemini 3.7 Flash OCR</span>
              <span>•</span>
              <span className="text-emerald-400/90 font-mono">
                BDT Time (UTC+6) Active
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              {clientInfo.pingLatencyMs !== undefined && (
                <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[10px]">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Ping: {clientInfo.pingLatencyMs}ms</span>
                </span>
              )}
              <span>Screen: {clientInfo.screenResolution}</span>
              <span>•</span>
              <span>Bangladesh Smart & Laminated NID Support</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DETAILED DEVICE & NETWORK INSPECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === "bn" ? "রিয়েল-টাইম নেটওয়ার্ক ও ডিভাইস ডিটেক্টর" : "Live Device & Network Intelligence"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === "bn"
                      ? "আপনার বর্তমান আইপি, আইএসপি, অবস্থান ও ডিভাইসের সম্পূর্ণ প্রযুক্তিগত তথ্য"
                      : "Detailed inspection of your IP, ISP, location, and hardware client parameters"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={loadIntelligence}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                  title="Refresh Client Detection"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Section 1: Network & ISP Intelligence */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === "bn" ? "নেটওয়ার্ক ও আইএসপি তথ্য (Network & ISP)" : "Network & ISP Intelligence"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* IP Box */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Public Client IP</span>
                      <p className="text-sm font-mono font-bold text-blue-400">{clientInfo.ip}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(clientInfo.ip, "modal-ip")}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy IP"
                    >
                      {copiedField === "modal-ip" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* ISP Box */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">ISP / Carrier Name</span>
                    <p className="text-sm font-semibold text-amber-300 truncate">{clientInfo.isp}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{clientInfo.asn} • {clientInfo.org}</span>
                  </div>

                  {/* Location Box */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Geo Location</span>
                    <p className="text-sm font-semibold text-rose-300">
                      {clientInfo.city}, {clientInfo.region} {clientInfo.flag}
                    </p>
                    <span className="text-[10px] text-slate-400">{clientInfo.country} ({clientInfo.countryCode})</span>
                  </div>

                  {/* Timezone & Time Box */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">System Timezone</span>
                    <p className="text-sm font-mono font-bold text-emerald-400">{bdtClock.timeString}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{bdtClock.timezone} • {clientInfo.timezone}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Hardware & Device Model Intelligence */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === "bn" ? "ডিভাইস ও ব্রাউজার স্পেকস (Device & Hardware Specs)" : "Device & Hardware Specs"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Device Model</span>
                    <p className="text-xs font-bold text-white truncate">{clientInfo.deviceModel}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{clientInfo.deviceType}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Operating System</span>
                    <p className="text-xs font-bold text-white truncate">{clientInfo.osName}</p>
                    <span className="text-[10px] text-slate-400">{clientInfo.osVersion || "Latest"}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Browser Engine</span>
                    <p className="text-xs font-bold text-white truncate">{clientInfo.browserName}</p>
                    <span className="text-[10px] text-slate-400">v{clientInfo.browserVersion || "Latest"}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Screen Resolution</span>
                    <p className="text-xs font-mono font-bold text-cyan-300">{clientInfo.screenResolution}</p>
                    <span className="text-[10px] text-slate-400">DPR: {clientInfo.devicePixelRatio}x</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">CPU & RAM</span>
                    <p className="text-xs font-mono font-bold text-white">{clientInfo.cpuCores} CPU Cores</p>
                    <span className="text-[10px] text-slate-400">
                      {clientInfo.deviceMemoryGb ? `${clientInfo.deviceMemoryGb} GB RAM` : "Hardware Concurrency"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Touch & Input</span>
                    <p className="text-xs font-bold text-white">
                      {clientInfo.isTouchScreen ? "Touch Screen Yes" : "Mouse / Keyboard"}
                    </p>
                    <span className="text-[10px] text-slate-400">Interactive Display</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Raw User Agent */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>Raw User-Agent Header</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(clientInfo.userAgentRaw, "modal-ua")}
                    className="flex items-center space-x-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    {copiedField === "modal-ua" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UA</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-[11px] text-slate-300 break-all leading-relaxed select-all">
                  {clientInfo.userAgentRaw}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active BDT Session (UTC+6)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
