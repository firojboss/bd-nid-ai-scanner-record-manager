import React, { useState, useEffect, useMemo } from "react";
import { DataSheetAccount, AccountStatus } from "../../types.js";
import {
  PRESET_SITES,
  generatePassword,
  generateRandomSecretKey,
  generateDisableKey,
} from "../../utils/siteDefinitions.js";
import {
  X,
  Sparkles,
  CheckSquare,
  Square,
  Building2,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { openNidDocumentInNewTab } from "../../utils/openNidTab.js";

interface BatchNidAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreate: (sites: any[], template: any) => Promise<void>;
  nidRecords: Array<{ id: string; nameEnglish: string; nameBangla: string; nidNumber: string; placeOfBirth?: string; [key: string]: any }>;
  existingAccounts?: DataSheetAccount[];
  lang: "bn" | "en";
}

export const BatchNidAccountModal: React.FC<BatchNidAccountModalProps> = ({
  isOpen,
  onClose,
  onBatchCreate,
  nidRecords,
  existingAccounts = [],
  lang,
}) => {
  // Helper: Calculate used sites & count for an NID
  const getNidUsage = (recId: string, nidNum: string) => {
    const matched = existingAccounts.filter((acc) => {
      if (acc.nidRecordId && recId && acc.nidRecordId === recId) return true;
      if (acc.nidNumber && nidNum && acc.nidNumber.trim() === nidNum.trim()) return true;
      return false;
    });

    const usedSiteIds = new Set<string>();
    const usedSiteNames = new Set<string>();
    const usedSitesList: Array<{
      siteId: string;
      siteName: string;
      siteLogo?: string;
      accountId?: string;
    }> = [];

    matched.forEach((acc) => {
      if (acc.siteId) usedSiteIds.add(acc.siteId.toLowerCase());
      if (acc.siteName) usedSiteNames.add(acc.siteName.toLowerCase());
      usedSitesList.push({
        siteId: acc.siteId,
        siteName: acc.siteName,
        siteLogo: acc.siteLogo,
        accountId: acc.accountId,
      });
    });

    return {
      count: matched.length,
      usedSiteIds,
      usedSiteNames,
      usedSitesList,
    };
  };

  // Sort NID records: Empty/least used (count = 0) FIRST
  const sortedNidRecords = useMemo(() => {
    return [...nidRecords].sort((a, b) => {
      const usageA = getNidUsage(a.id, a.nidNumber).count;
      const usageB = getNidUsage(b.id, b.nidNumber).count;
      return usageA - usageB;
    });
  }, [nidRecords, existingAccounts]);

  const [selectedNidId, setSelectedNidId] = useState<string>(sortedNidRecords[0]?.id || "");
  const [name, setName] = useState<string>(
    sortedNidRecords[0] ? (sortedNidRecords[0].nameEnglish || sortedNidRecords[0].nameBangla) : "Rana (According NID Data)"
  );
  const [email, setEmail] = useState<string>("user.nid.signup@gmail.com");
  const [password, setPassword] = useState<string>(generatePassword(8));
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [status, setStatus] = useState<AccountStatus>("New Account");
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Selected NID record & usage
  const selectedNidRec = useMemo(() => {
    return nidRecords.find((r) => r.id === selectedNidId);
  }, [nidRecords, selectedNidId]);

  const selectedNidUsage = useMemo(() => {
    if (!selectedNidRec) {
      return {
        count: 0,
        usedSiteIds: new Set<string>(),
        usedSiteNames: new Set<string>(),
        usedSitesList: [],
      };
    }
    return getNidUsage(selectedNidRec.id, selectedNidRec.nidNumber);
  }, [selectedNidRec, existingAccounts]);

  // When modal opens or selected NID changes, pre-select ONLY UNUSED sites
  useEffect(() => {
    if (isOpen) {
      if (sortedNidRecords.length > 0) {
        const currentRec =
          sortedNidRecords.find((r) => r.id === selectedNidId) || sortedNidRecords[0];
        setSelectedNidId(currentRec.id);
        setName(currentRec.nameEnglish || currentRec.nameBangla);

        const usage = getNidUsage(currentRec.id, currentRec.nidNumber);
        // Preselect all unused sites
        const unusedSites = PRESET_SITES.filter(
          (s) =>
            !usage.usedSiteIds?.has(s.id.toLowerCase()) &&
            !usage.usedSiteNames?.has(s.name.toLowerCase())
        ).map((s) => s.id);
        setSelectedSiteIds(unusedSites);
      }
    }
  }, [isOpen, sortedNidRecords]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNidChange = (nidId: string) => {
    setSelectedNidId(nidId);
    const found = nidRecords.find((r) => r.id === nidId);
    if (found) {
      setName(found.nameEnglish || found.nameBangla);
      const usage = getNidUsage(found.id, found.nidNumber);
      const unusedSites = PRESET_SITES.filter(
        (s) =>
          !usage.usedSiteIds?.has(s.id.toLowerCase()) &&
          !usage.usedSiteNames?.has(s.name.toLowerCase())
      ).map((s) => s.id);
      setSelectedSiteIds(unusedSites);
    }
  };

  const handleToggleSite = (siteId: string) => {
    const isUsed =
      selectedNidUsage.usedSiteIds?.has(siteId.toLowerCase()) ||
      selectedNidUsage.usedSiteNames?.has(siteId.toLowerCase());
    if (isUsed) return; // cannot toggle locked site

    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    const availableUnusedSites = PRESET_SITES.filter(
      (s) =>
        !selectedNidUsage.usedSiteIds?.has(s.id.toLowerCase()) &&
        !selectedNidUsage.usedSiteNames?.has(s.name.toLowerCase())
    ).map((s) => s.id);

    if (selectedSiteIds.length === availableUnusedSites.length) {
      setSelectedSiteIds([]);
    } else {
      setSelectedSiteIds(availableUnusedSites);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSiteIds.length === 0) return;
    setLoading(true);

    // Only allow unused sites
    const selectedSites = PRESET_SITES.filter(
      (s) =>
        selectedSiteIds.includes(s.id) &&
        !selectedNidUsage.usedSiteIds?.has(s.id.toLowerCase()) &&
        !selectedNidUsage.usedSiteNames?.has(s.name.toLowerCase())
    );

    const selectedNid = nidRecords.find((r) => r.id === selectedNidId);

    const template = {
      name,
      email,
      password: password || generatePassword(8),
      phoneNumber,
      balance: balance || "0",
      status,
      twoFa: generateRandomSecretKey(16),
      twoFaDisableKey: generateDisableKey(),
      nidNumber: selectedNid?.nidNumber || "",
      nidRecordId: selectedNid?.id || "",
    };

    try {
      await onBatchCreate(selectedSites, template);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableUnusedSitesCount = PRESET_SITES.filter(
    (s) =>
      !selectedNidUsage.usedSiteIds?.has(s.id.toLowerCase()) &&
      !selectedNidUsage.usedSiteNames?.has(s.name.toLowerCase())
  ).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col cursor-default"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{lang === "bn" ? "১টি NID দিয়ে ১৫টি সাইটে মাল্টি-অ্যাকাউন্ট জেনারেট" : "1-NID Multi-Site Batch Signup Generator"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  {selectedSiteIds.length} / {availableUnusedSitesCount} Sites Selected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "bn"
                  ? "১টি এনআইডি দিয়ে অপ্রস্তুত বা অব্যবহৃত সাইটগুলোতে স্বয়ংক্রিয় একাউন্ট রো তৈরি করুন (১ বার ব্যবহারের নিয়ম)"
                  : "Auto-generate DataSheet rows for available unused target sites using 1 NID profile"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title={lang === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleBatchSubmit} className="p-5 space-y-4 flex-1">
          {/* Step 1: Select NID Profile */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === "bn" ? "ধাপ ১: স্ক্যানকৃত NID প্রোফাইল সিলেক্ট করুন (ফাঁকা NID আগে)" : "Step 1: Select Scanned NID Profile (Fresh First)"}</span>
              </label>
              {selectedNidRec && (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNidDocumentInNewTab(selectedNidRec as any);
                    }}
                    title={lang === "bn" ? "নতুন ট্যাবে এই NID কার্ডটি ওপেন করুন (Open in new tab)" : "Open NID card in a new tab"}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 active:scale-95 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 hover:border-emerald-400 font-mono text-[10px] font-bold transition-all shadow-xs hover:shadow-emerald-500/20 cursor-pointer"
                  >
                    <CreditCard className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>NID: {selectedNidRec.nidNumber}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${
                      selectedNidUsage.count === 0
                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-400"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    ({selectedNidUsage.count} {lang === "bn" ? "ব্যবহৃত" : "Used"})
                  </span>
                </div>
              )}
            </div>

            {sortedNidRecords.length > 0 ? (
              <select
                value={selectedNidId}
                onChange={(e) => handleNidChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {sortedNidRecords.map((r) => {
                  const usage = getNidUsage(r.id, r.nidNumber);
                  const isFresh = usage.count === 0;
                  return (
                    <option key={r.id} value={r.id}>
                      {isFresh ? "⭐ [ফাঁকা/0] " : `[${usage.count} Used] `}
                      {r.nameBangla} | {r.nameEnglish} (NID: {r.nidNumber}) ({usage.count})
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-xs text-slate-500">কোনো NID ডাটা পাওয়া যায়নি</p>
            )}

            {/* Used sites banner */}
            {selectedNidRec && (
              <div className="pt-1">
                {selectedNidUsage.count > 0 ? (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                      {lang === "bn"
                        ? `ইতিমধ্যে ব্যবহৃত সাইটসমূহ (${selectedNidUsage.count}টি — এগুলো লক করা হয়েছে):`
                        : `Already used sites (${selectedNidUsage.count} — locked below):`}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNidUsage.usedSitesList.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-red-200 text-[11px] font-semibold"
                        >
                          <Lock className="w-2.5 h-2.5 text-red-400" />
                          <span>{item.siteName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      {lang === "bn"
                        ? "✨ এই NID সম্পূর্ণ নতুন (0) — ১৬টি সাইটই উন্মুক্ত রয়েছে!"
                        : "✨ This NID is completely fresh (0) — all 16 sites available!"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    Name (According NID Data) *
                  </label>
                  {selectedNidId && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✓ NID: {nidRecords.find((r) => r.id === selectedNidId)?.nidNumber}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MD. ZAKIR HOSSAIN"
                  className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
                {/* 1-Click Name Pills */}
                {selectedNidId && (() => {
                  const rec = nidRecords.find((r) => r.id === selectedNidId);
                  if (!rec) return null;
                  const en = rec.nameEnglish || "";
                  const bn = rec.nameBangla || "";
                  return (
                    <div className="flex flex-wrap items-center gap-1 pt-1.5">
                      {en && (
                        <button
                          type="button"
                          onClick={() => setName(en)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        >
                          {en}
                        </button>
                      )}
                      {bn && (
                        <button
                          type="button"
                          onClick={() => setName(bn)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        >
                          {bn}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Email for Signup:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phone (Optional):</label>
                <input
                  type="text"
                  placeholder="Leave empty or enter phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Initial Balance:</label>
                <input
                  type="text"
                  placeholder="e.g. 10,000 or leave empty"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AccountStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="New Account">New Account</option>
                  <option value="Running">Running</option>
                  <option value="Redeem">Redeem</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Select Target Sites with Logos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{lang === "bn" ? "ধাপ ২: যে সাইটগুলোতে একাউন্ট তৈরি করবেন (১ বার ব্যবহারের নিয়ম)" : "Step 2: Choose Target Sites (1-Time Rule)"}</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                {selectedSiteIds.length === availableUnusedSitesCount && availableUnusedSitesCount > 0
                  ? lang === "bn" ? "সব আনচেক করুন" : "Deselect All"
                  : lang === "bn" ? `সব অব্যবহৃত সিলেক্ট করুন (${availableUnusedSitesCount}টি)` : `Select All Unused (${availableUnusedSitesCount})`}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-950/80">
              {PRESET_SITES.map((site) => {
                const isChecked = selectedSiteIds.includes(site.id);
                const isUsed =
                  Boolean(selectedNidUsage.usedSiteIds?.has(site.id.toLowerCase())) ||
                  Boolean(selectedNidUsage.usedSiteNames?.has(site.name.toLowerCase()));

                return (
                  <div
                    key={site.id}
                    onClick={() => handleToggleSite(site.id)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all ${
                      isUsed
                        ? "bg-slate-950/90 border-dashed border-red-900/50 text-slate-500 opacity-40 cursor-not-allowed"
                        : isChecked
                        ? "bg-blue-950/40 border-blue-500/60 text-white shadow-sm ring-1 ring-blue-500/50 cursor-pointer"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer"
                    }`}
                  >
                    <div className="text-blue-400">
                      {isUsed ? (
                        <Lock className="w-4 h-4 text-red-400" />
                      ) : isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0 text-xs font-bold">
                      {isUsed ? (
                        <Lock className="w-3 h-3 text-red-400" />
                      ) : site.logo && site.logo.trim() !== "" ? (
                        <img
                          src={site.logo}
                          alt={site.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        site.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${isUsed ? "line-through text-slate-500" : "text-white"}`}>
                        {site.name}
                      </p>
                      {isUsed && (
                        <span className="text-[9px] text-red-400 font-mono">
                          ইতিমধ্যে ব্যবহৃত
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span>{lang === "bn" ? "তৈরি হবে:" : "Generating:"} </span>
              <span className="font-bold text-white font-mono">
                {selectedSiteIds.length} {lang === "bn" ? "টি নতুন অ্যাকাউন্ট রো" : "new account rows"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={loading || selectedSiteIds.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>
                  {loading
                    ? lang === "bn" ? "তৈরি হচ্ছে..." : "Generating..."
                    : lang === "bn" ? `${selectedSiteIds.length}টি অ্যাকাউন্ট তৈরি করুন` : `Generate ${selectedSiteIds.length} Accounts`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

