import React, { useState } from "react";
import { NIDRecord, DataSheetAccount } from "../../types.js";
import { PRESET_SITES, getSiteById } from "../../utils/siteDefinitions.js";
import {
  X,
  Layers,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Key,
  Lock,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface NidSitesUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: NIDRecord | null;
  accounts: DataSheetAccount[];
  lang: "bn" | "en";
}

export const NidSitesUsageModal: React.FC<NidSitesUsageModalProps> = ({
  isOpen,
  onClose,
  record,
  accounts,
  lang,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Find all used site IDs
  const usedSiteIdMap = new Map<string, DataSheetAccount>();
  accounts.forEach((acc) => {
    const key = (acc.siteId || acc.siteName || "").toLowerCase();
    if (key) usedSiteIdMap.set(key, acc);
  });

  const usedCount = accounts.length;
  const totalPresetSites = PRESET_SITES.length; // 16
  const unusedCount = Math.max(0, totalPresetSites - accounts.length);

  // Total balance sum for this NID across all used sites
  const totalBalance = accounts.reduce((sum, a) => {
    const num = parseFloat((a.balance || "0").replace(/,/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // Status badge styling helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "New Account":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-black">
            New Account
          </span>
        );
      case "Running":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Running
          </span>
        );
      case "Redeem":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Redeem
          </span>
        );
      case "Reject":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Reject
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] cursor-default animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {lang === "bn" ? "এনআইডি সাইট ব্যবহার ট্র্যাকার" : "NID Sites Usage Tracker"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
                  {usedCount} / {totalPresetSites} Used
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-slate-200 font-semibold">{record.nameBangla || record.nameEnglish}</span>
                {" • "}
                <span className="font-mono text-emerald-300">🆔 {record.nidNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Summary KPI Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <p className="text-slate-400 text-[11px]">
              {lang === "bn" ? "ব্যবহৃত সাইট" : "Used Sites"}
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-blue-400">
                {usedCount}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">of {totalPresetSites}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <p className="text-slate-400 text-[11px]">
              {lang === "bn" ? "বাকি / উন্মুক্ত সাইট" : "Available Sites"}
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {unusedCount}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono">Fresh</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <p className="text-slate-400 text-[11px]">
              {lang === "bn" ? "মোট ব্যালেন্স" : "Total Balance"}
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 truncate">
                ৳ {totalBalance.toLocaleString()}
              </span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. USED SITES SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>
                  {lang === "bn" ? "যে যে সাইটে ব্যবহৃত হয়েছে" : "Currently Used Accounts"}
                </span>
                <span className="text-slate-400 font-normal">({accounts.length})</span>
              </h3>
            </div>

            {accounts.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                <p className="text-slate-300 font-semibold">
                  {lang === "bn"
                    ? "✨ এই NID টি এখনো কোনো সাইটে ব্যবহৃত হয়নি!"
                    : "✨ This NID is not used in any site yet."}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {lang === "bn"
                    ? "DataSheet ট্যাবে গিয়ে এই NID দিয়ে ১৬টি সাইটের যেকোনোটিতে অ্যাকাউন্ট খুলতে পারবেন।"
                    : "All 16 sites are available for registration."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {accounts.map((acc, idx) => {
                  const siteDef = getSiteById(acc.siteId || "");
                  return (
                    <div
                      key={acc.id || idx}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 shadow-sm"
                    >
                      {/* Site Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {siteDef.logo && siteDef.logo.trim() !== "" ? (
                            <img
                              src={siteDef.logo}
                              alt={siteDef.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover bg-slate-800"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300">
                              {siteDef.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-white text-sm">
                            {siteDef.name}
                          </span>
                        </div>
                        {getStatusBadge(acc.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Account ID:</span>
                          <div className="flex items-center space-x-1 font-mono text-cyan-300 font-bold">
                            <span className="truncate">{acc.accountId || "—"}</span>
                            {acc.accountId && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(acc.accountId, `acc_${acc.id}`)}
                                className="text-slate-500 hover:text-white"
                                title="Copy Account ID"
                              >
                                {copiedKey === `acc_${acc.id}` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">Balance:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {acc.balance ? `৳ ${acc.balance}` : "৳ 0"}
                          </span>
                        </div>

                        {acc.phoneNumber && (
                          <div className="col-span-2 flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 text-[10px]">Phone:</span>
                            <span className="font-mono">{acc.phoneNumber}</span>
                          </div>
                        )}

                        {acc.email && (
                          <div className="col-span-2 flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 text-[10px]">Email:</span>
                            <span className="font-mono truncate max-w-[180px]">{acc.email}</span>
                          </div>
                        )}

                        {acc.twoFa && (
                          <div className="col-span-2 flex items-center justify-between text-slate-300 bg-slate-900/60 p-1 rounded font-mono text-[10px]">
                            <span className="text-slate-500">2FA:</span>
                            <span className="text-emerald-300 truncate max-w-[170px]">{acc.twoFa}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.twoFa, `2fa_${acc.id}`)}
                              className="text-slate-500 hover:text-white"
                            >
                              {copiedKey === `2fa_${acc.id}` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        )}

                        {acc.createdAt && (
                          <div className="col-span-2 text-[10px] text-slate-500 font-mono text-right pt-0.5">
                            Created: {acc.createdAt}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. UNUSED / AVAILABLE SITES SECTION */}
          {unusedCount > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === "bn"
                    ? "যে সাইটগুলোতে এখনও অ্যাকাউন্ট খোলা হয়নি (Available)"
                    : "Available / Fresh Sites for this NID"}
                </span>
                <span className="text-emerald-400 font-mono font-bold">({unusedCount})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SITES.filter(
                  (site) => !usedSiteIdMap.has(site.id.toLowerCase()) && !usedSiteIdMap.has(site.name.toLowerCase())
                ).map((site) => (
                  <div
                    key={site.id}
                    className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center space-x-2 text-[11px]"
                  >
                    {site.logo && site.logo.trim() !== "" ? (
                      <img
                        src={site.logo}
                        alt={site.name}
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded-full object-cover bg-slate-800 opacity-80"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {site.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-slate-300 font-medium truncate">{site.name}</span>
                    <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Open
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {lang === "bn"
              ? "ডাটাশিটের সাথে রিয়েল-টাইমে সিঙ্ক করা হয়েছে"
              : "Synchronized with DataSheet accounts"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all active:scale-95"
          >
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
