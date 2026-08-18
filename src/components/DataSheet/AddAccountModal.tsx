import React, { useState, useEffect, useMemo } from "react";
import { DataSheetAccount, AccountStatus } from "../../types.js";
import {
  PRESET_SITES,
  generatePassword,
  generateRandomSecretKey,
  generateDisableKey,
  formatCurrentTimestamp,
} from "../../utils/siteDefinitions.js";
import {
  X,
  Plus,
  Sparkles,
  Key,
  Shield,
  CreditCard,
  Building2,
  RefreshCw,
  Copy,
  Check,
  User,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Save,
  Zap,
  ExternalLink,
} from "lucide-react";
import { openNidDocumentInNewTab } from "../../utils/openNidTab.js";

const DRAFT_STORAGE_KEY = "datasheet_account_modal_draft_v1";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Partial<DataSheetAccount>) => Promise<void>;
  nidRecords?: Array<{ id: string; nameEnglish: string; nameBangla: string; nidNumber: string; placeOfBirth?: string; [key: string]: any }>;
  existingAccounts?: DataSheetAccount[];
  lang: "bn" | "en";
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  nidRecords = [],
  existingAccounts = [],
  lang,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>("1xbet");
  const [customSiteName, setCustomSiteName] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [twoFa, setTwoFa] = useState<string>("");
  const [twoFaDisableKey, setTwoFaDisableKey] = useState<string>("");
  const [selectedNidId, setSelectedNidId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [status, setStatus] = useState<AccountStatus>("New Account");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);

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
      createdTimestamp?: string;
    }> = [];

    matched.forEach((acc) => {
      if (acc.siteId) usedSiteIds.add(acc.siteId.toLowerCase());
      if (acc.siteName) usedSiteNames.add(acc.siteName.toLowerCase());
      usedSitesList.push({
        siteId: acc.siteId,
        siteName: acc.siteName,
        siteLogo: acc.siteLogo,
        accountId: acc.accountId,
        createdTimestamp: acc.createdTimestamp,
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

  // Selected NID record & its usage
  const selectedNidRec = useMemo(() => {
    return nidRecords.find((r) => r.id === selectedNidId);
  }, [nidRecords, selectedNidId]);

  const selectedNidUsage = useMemo(() => {
    if (!selectedNidRec) {
      return { count: 0, usedSiteIds: new Set<string>(), usedSiteNames: new Set<string>(), usedSitesList: [] };
    }
    return getNidUsage(selectedNidRec.id, selectedNidRec.nidNumber);
  }, [selectedNidRec, existingAccounts]);

  // Initialize selected NID or restore draft from localStorage on open
  useEffect(() => {
    if (isOpen) {
      setValidationError(null);

      // Check if draft exists in localStorage
      try {
        const savedDraftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraftStr) {
          const draft = JSON.parse(savedDraftStr);
          const hasDraftContent = Boolean(
            draft.accountId ||
            draft.password ||
            draft.phoneNumber ||
            draft.email ||
            draft.twoFa ||
            draft.twoFaDisableKey ||
            draft.notes ||
            draft.balance
          );

          if (hasDraftContent) {
            setSelectedSiteId(draft.selectedSiteId || "1xbet");
            setCustomSiteName(draft.customSiteName || "");
            setAccountId(draft.accountId || "");
            setPassword(draft.password || "");
            setPhoneNumber(draft.phoneNumber || "");
            setEmail(draft.email || "");
            setTwoFa(draft.twoFa || "");
            setTwoFaDisableKey(draft.twoFaDisableKey || "");
            setSelectedNidId(draft.selectedNidId || (sortedNidRecords[0]?.id || ""));
            setName(draft.name || (sortedNidRecords[0]?.nameEnglish || sortedNidRecords[0]?.nameBangla || ""));
            setBalance(draft.balance || "");
            setStatus(draft.status || "New Account");
            setNotes(draft.notes || "");
            setIsDraftRestored(true);
            setLastAutoSaved(new Date().toLocaleTimeString());
            return;
          }
        }
      } catch (err) {
        console.error("Error restoring modal draft:", err);
      }

      // If no draft exists, initialize clean blank fields
      setIsDraftRestored(false);
      setAccountId("");
      setPassword("");
      setPhoneNumber("");
      setEmail("");
      setTwoFa("");
      setTwoFaDisableKey("");
      setBalance("");
      setNotes("");
      if (sortedNidRecords.length > 0) {
        // Pick first available sorted NID (empty ones come first)
        const currentRec =
          sortedNidRecords.find((r) => r.id === selectedNidId) || sortedNidRecords[0];
        setSelectedNidId(currentRec.id);
        const preferredName = currentRec.nameEnglish || currentRec.nameBangla;
        setName(preferredName);

        // Auto-select first UNUSED site for this NID
        const usage = getNidUsage(currentRec.id, currentRec.nidNumber);
        const firstAvailableSite = PRESET_SITES.find(
          (s) =>
            !usage.usedSiteIds?.has(s.id.toLowerCase()) &&
            !usage.usedSiteNames?.has(s.name.toLowerCase())
        );
        if (firstAvailableSite) {
          setSelectedSiteId(firstAvailableSite.id);
        } else {
          setSelectedSiteId("1xbet");
        }
      } else {
        setName("");
        setSelectedSiteId("1xbet");
      }
    }
  }, [isOpen, sortedNidRecords]);

  // Real-time Auto-Save to localStorage (Protected against power failure/refresh)
  useEffect(() => {
    if (!isOpen) return;
    const hasData = Boolean(
      accountId ||
      password ||
      phoneNumber ||
      email ||
      twoFa ||
      twoFaDisableKey ||
      name ||
      balance ||
      notes ||
      customSiteName
    );

    if (hasData) {
      const draftObj = {
        selectedSiteId,
        customSiteName,
        accountId,
        password,
        phoneNumber,
        email,
        twoFa,
        twoFaDisableKey,
        selectedNidId,
        name,
        balance,
        status,
        notes,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftObj));
        setLastAutoSaved(new Date().toLocaleTimeString());
      } catch (e) {
        console.error("Auto-save draft failed:", e);
      }
    }
  }, [
    isOpen,
    selectedSiteId,
    customSiteName,
    accountId,
    password,
    phoneNumber,
    email,
    twoFa,
    twoFaDisableKey,
    selectedNidId,
    name,
    balance,
    status,
    notes,
  ]);

  // Clear/Discard Draft handler
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setIsDraftRestored(false);
    setAccountId("");
    setPassword("");
    setPhoneNumber("");
    setEmail("");
    setTwoFa("");
    setTwoFaDisableKey("");
    setBalance("");
    setNotes("");
    setCustomSiteName("");
    setLastAutoSaved(null);
    if (sortedNidRecords.length > 0) {
      const currentRec = sortedNidRecords[0];
      setSelectedNidId(currentRec.id);
      setName(currentRec.nameEnglish || currentRec.nameBangla);
    } else {
      setName("");
    }
  };

  // When selected NID changes, update name and auto-switch away from used sites
  const handleSelectNid = (nidId: string) => {
    setSelectedNidId(nidId);
    setValidationError(null);
    const rec = nidRecords.find((r) => r.id === nidId);
    if (rec) {
      const preferredName = rec.nameEnglish || rec.nameBangla;
      setName(preferredName);

      // Auto-switch site if current site is already used for this NID
      const usage = getNidUsage(rec.id, rec.nidNumber);
      if (
        usage.usedSiteIds?.has(selectedSiteId.toLowerCase()) ||
        usage.usedSiteNames?.has(selectedSiteId.toLowerCase())
      ) {
        const firstAvailable = PRESET_SITES.find(
          (s) =>
            !usage.usedSiteIds?.has(s.id.toLowerCase()) &&
            !usage.usedSiteNames?.has(s.name.toLowerCase())
        );
        if (firstAvailable) {
          setSelectedSiteId(firstAvailable.id);
        } else {
          setSelectedSiteId("1xbet");
        }
      }
    } else {
      setName("");
    }
  };

  const handleGenerateKeys = () => {
    setPassword(generatePassword(8));
    setTwoFa(generateRandomSecretKey(16));
    setTwoFaDisableKey(generateDisableKey());
    setAccountId(`${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const siteObj = PRESET_SITES.find((s) => s.id === selectedSiteId);
    const siteName =
      selectedSiteId === "custom"
        ? customSiteName.trim() || "Custom Site"
        : siteObj?.name || "Site";

    // Strict 1-Time Validation: Check if this site was already used for this NID
    if (selectedNidRec) {
      const isSiteUsed =
        Boolean(selectedNidUsage.usedSiteIds?.has(selectedSiteId.toLowerCase())) ||
        Boolean(selectedNidUsage.usedSiteNames?.has(siteName.toLowerCase()));

      if (isSiteUsed) {
        setValidationError(
          lang === "bn"
            ? `❌ "${siteName}" সাইটে ইতিমধ্যে এই NID (${selectedNidRec.nameBangla || selectedNidRec.nameEnglish}) ব্যবহার করা হয়েছে! প্রতিটি সাইটে মাত্র ১ বার ব্যবহার করা যাবে।`
            : `❌ This NID is already used on "${siteName}"! Only 1 account per site is allowed for each NID.`
        );
        return;
      }
    }

    setLoading(true);

    const newAcc: Partial<DataSheetAccount> = {
      siteId: selectedSiteId,
      siteName,
      siteLogo: siteObj?.logo || "",
      accountId,
      password,
      phoneNumber,
      email,
      twoFa,
      twoFaDisableKey,
      name,
      nidNumber: selectedNidRec?.nidNumber || "",
      nidRecordId: selectedNidId || "",
      createdTimestamp: formatCurrentTimestamp(),
      editedTimestamp: "",
      balance: balance || "0",
      status,
      notes,
    };

    try {
      await onAddAccount(newAcc);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setIsDraftRestored(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col cursor-default"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {lang === "bn" ? "নতুন অ্যাকাউন্ট ডাটা যোগ করুন" : "Add New Account to DataSheet"}
                </h2>
                {lastAutoSaved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{lang === "bn" ? "অটো-ড্রাফট সেভ" : "Auto-Saved"}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {lang === "bn"
                  ? "এনআইডি তথ্য দিয়ে সাইট সিলেক্ট করে অ্যাকাউন্ট ডাটা সংরক্ষণ করুন (বিদ্যুৎ চলে গেলেও ডাটা নষ্ট হবে না)"
                  : "Save multi-site signup data linked to NID profile (Protected with real-time auto-save)"}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Draft Restored Banner */}
          {isDraftRestored && (
            <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between shadow-md animate-in fade-in duration-200">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="font-medium">
                  {lang === "bn"
                    ? "⚡ পূর্বের খসড়া ডাটা রিকভার করা হয়েছে (Auto-draft restored)"
                    : "⚡ Auto-saved draft restored safely"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-950/80 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/50 text-[11px] font-semibold transition-all flex items-center gap-1"
                title={lang === "bn" ? "খসড়া ডাটা মুছে নতুন শুরু করুন" : "Clear draft and start blank"}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === "bn" ? "খসড়া মুছুন / রিসেট" : "Clear Draft"}</span>
              </button>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2.5 shadow-lg animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{validationError}</div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Auto-Fill from NID database (Red Draw 1) */}
          {sortedNidRecords.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {lang === "bn"
                      ? "স্ক্যানকৃত এনআইডি প্রোফাইল নির্বাচন করুন (ফাঁকা NID আগে আসবে)"
                      : "Select Scanned NID Profile (Fresh/Empty First)"}
                  </span>
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
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 active:scale-95 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 hover:border-emerald-400 font-mono text-[10px] font-bold transition-all shadow-xs hover:shadow-emerald-500/20 cursor-pointer"
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
                      ({selectedNidUsage.count} {lang === "bn" ? "সাইট ব্যবহৃত" : "Used"})
                    </span>
                  </div>
                )}
              </div>

              <select
                id="select-nid-profile"
                value={selectedNidId}
                onChange={(e) => handleSelectNid(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
              >
                <option value="">{lang === "bn" ? "-- এনআইডি সিলেক্ট করুন --" : "-- Select NID --"}</option>
                {sortedNidRecords.map((r) => {
                  const usage = getNidUsage(r.id, r.nidNumber);
                  const isFresh = usage.count === 0;
                  return (
                    <option key={r.id} value={r.id}>
                      {isFresh ? "⭐ [ফাঁকা/0] " : `[${usage.count} Used] `}
                      {r.nameBangla} ({r.nameEnglish}) - NID: {r.nidNumber} ({usage.count})
                    </option>
                  );
                })}
              </select>

              {/* Show Which Sites this NID Info Has Been Used On */}
              {selectedNidRec && (
                <div className="pt-1">
                  {selectedNidUsage.count > 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          {lang === "bn"
                            ? `এই NID ইতিমধ্যে ${selectedNidUsage.count}টি সাইটে ব্যবহার হয়েছে (১ বার ব্যবহারের নিয়ম):`
                            : `This NID has already been used on ${selectedNidUsage.count} site(s) (One-Time Rule):`}
                        </span>
                        <span className="text-[10px] text-red-400 font-medium">
                          {lang === "bn" ? "নিচে এগুলো লক করা" : "Locked below"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {selectedNidUsage.usedSitesList.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-semibold"
                          >
                            <Lock className="w-3 h-3 text-red-400" />
                            <span>{item.siteName}</span>
                            {item.accountId && (
                              <span className="font-mono text-[10px] text-red-400/80">
                                ({item.accountId})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        {lang === "bn"
                          ? "🔒 যে সাইটে একবার অ্যাকাউন্ট তৈরি হয়েছে সেখানে আর তৈরি করা যাবে না। নিচে অন্য যেকোনো উন্মুক্ত সাইট সিলেক্ট করুন।"
                          : "🔒 Sites where an account was already created cannot be reused for this NID. Please select an available open site below."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        {lang === "bn"
                          ? "✨ এই NID সম্পূর্ণ নতুন/ফাঁকা (0) — এখনো কোনো সাইটে ব্যবহার করা হয়নি। সকল সাইট উন্মুক্ত!"
                          : "✨ This NID is completely fresh (0 Used) — not used on any site yet. All sites are available!"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Site Selection with Logo Preview & 1-Time Usage Guard */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === "bn" ? "সাইট নির্বাচন করুন (১ NID = প্রতিটি সাইটে ১ বার)" : "Select Site (1 NID = 1 Account per Site)"} *</span>
              </label>
              {selectedNidUsage.count > 0 && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  {PRESET_SITES.length - selectedNidUsage.usedSitesList.length} / {PRESET_SITES.length}{" "}
                  {lang === "bn" ? "টি সাইট উপলব্ধ" : "Sites available"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-800 rounded-xl bg-slate-950/60">
              {PRESET_SITES.map((s) => {
                const isSelected = selectedSiteId === s.id;
                const isUsed =
                  Boolean(selectedNidUsage.usedSiteIds?.has(s.id.toLowerCase())) ||
                  Boolean(selectedNidUsage.usedSiteNames?.has(s.name.toLowerCase()));

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isUsed}
                    onClick={() => {
                      if (!isUsed) {
                        setSelectedSiteId(s.id);
                        setValidationError(null);
                      }
                    }}
                    title={
                      isUsed
                        ? lang === "bn"
                          ? `এই NID দিয়ে ইতিমধ্যে "${s.name}" এ অ্যাকাউন্ট রয়েছে (লক করা)`
                          : `Already used on ${s.name} for this NID (Locked)`
                        : s.name
                    }
                    className={`relative flex items-center space-x-2 p-2 rounded-lg border text-left text-xs transition-all ${
                      isUsed
                        ? "bg-slate-950/90 border-dashed border-red-900/60 text-slate-500 opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500 shadow-md"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold border border-slate-700">
                      {isUsed ? (
                        <Lock className="w-3 h-3 text-red-400" />
                      ) : s.logo && s.logo.trim() !== "" ? (
                        <img
                          src={s.logo}
                          alt={s.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <span className={`truncate flex-1 ${isUsed ? "line-through text-slate-500" : ""}`}>
                      {s.name}
                    </span>
                    {isUsed && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/60 font-mono flex items-center gap-0.5">
                        <Lock className="w-2 h-2" />
                        <span>লক</span>
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSelectedSiteId("custom");
                  setValidationError(null);
                }}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left text-xs transition-all ${
                  selectedSiteId === "custom"
                    ? "bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span>Custom Site</span>
              </button>
            </div>

            {selectedSiteId === "custom" && (
              <input
                type="text"
                placeholder="Enter custom site name (e.g., Betfair, BK8)"
                value={customSiteName}
                onChange={(e) => setCustomSiteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mt-1"
                required
              />
            )}
          </div>

          {/* Quick Regenerate Keys Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateKeys}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>{lang === "bn" ? "আইডি ও ২এফএ কী রিলোড" : "Regenerate Keys & ID"}</span>
            </button>
          </div>

          {/* Row 1: Account ID & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Account ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 6672967620"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountId, "accountId")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {copiedField === "accountId" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. GjQ7Qu$a"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(password, "password")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {copiedField === "password" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Phone Number & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Phone Number{" "}
                <span className="text-[10px] text-slate-500">
                  ({lang === "bn" ? "খালি থাকলে পিঙ্কিশ দেখাবে" : "Pink if empty"})
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. 01712345678 or leave empty"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="e.g. mst135354663@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Row 3: 2Fa & 2Fa Disable Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                2Fa (Secret Key)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. M6PKJCT3XFUVQR4T"
                  value={twoFa}
                  onChange={(e) => setTwoFa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(twoFa, "twoFa")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {copiedField === "twoFa" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                2Fa Disable Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ZqwYYOTWuwBYDKiXBVOi=="
                  value={twoFaDisableKey}
                  onChange={(e) => setTwoFaDisableKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(twoFaDisableKey, "twoFaDisableKey")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {copiedField === "twoFaDisableKey" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Name (According NID Data) - Red Draw 2 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === "bn" ? "নাম (According NID Data - Red Draw 2) *" : "Name (According NID Data) *"}</span>
              </label>
              {selectedNidId && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {lang === "bn" ? "সিলেক্টেড NID থেকে অটো-সেট" : "Auto-synced from NID"}
                </span>
              )}
            </div>
            <input
              id="input-name-nid"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MD. ZAKIR HOSSAIN"
              className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            />

            {/* Quick 1-Click Name Formatting Pills */}
            {selectedNidId && (() => {
              const rec = nidRecords.find((r) => r.id === selectedNidId);
              if (!rec) return null;
              const enName = rec.nameEnglish || "";
              const bnName = rec.nameBangla || "";
              // extract nickname
              const words = enName.replace(/^MD\.?\s*/i, "").replace(/^MST\.?\s*/i, "").trim().split(" ");
              const nickName = words[0] || enName;

              return (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">{lang === "bn" ? "1-ক্লিক ফরম্যাট:" : "Quick Format:"}</span>
                  {enName && (
                    <button
                      type="button"
                      onClick={() => setName(enName)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                        name === enName
                          ? "bg-blue-600/30 text-blue-300 border-blue-500 font-bold"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {enName}
                    </button>
                  )}
                  {bnName && (
                    <button
                      type="button"
                      onClick={() => setName(bnName)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                        name === bnName
                          ? "bg-blue-600/30 text-blue-300 border-blue-500 font-bold"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {bnName}
                    </button>
                  )}
                  {nickName && nickName !== enName && (
                    <button
                      type="button"
                      onClick={() => setName(nickName)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                        name === nickName
                          ? "bg-blue-600/30 text-blue-300 border-blue-500 font-bold"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {nickName}
                    </button>
                  )}
                  {enName && (
                    <button
                      type="button"
                      onClick={() => setName(`${enName} (According NID Data)`)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                        name === `${enName} (According NID Data)`
                          ? "bg-blue-600/30 text-blue-300 border-blue-500 font-bold"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {enName} (According NID Data)
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Row 5: Balance & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Balance (BDT / USD)
              </label>
              <input
                type="text"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="e.g. 10,000 or leave empty"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="New Account">New Account</option>
                <option value="Running">Running</option>
                <option value="Redeem">Redeem</option>
                <option value="Reject">Reject</option>
              </select>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all flex items-center space-x-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{lang === "bn" ? "অ্যাকাউন্ট সেভ করুন" : "Save to DataSheet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
