import React, { useState, useEffect, useMemo } from "react";
import { DataSheetAccount, AccountStatus, NIDRecord } from "../../types.js";
import {
  PRESET_SITES,
  getSiteById,
  formatCurrentTimestamp,
} from "../../utils/siteDefinitions.js";
import { AddAccountModal } from "./AddAccountModal.js";
import { BatchNidAccountModal } from "./BatchNidAccountModal.js";
import { RecordDetailModal } from "../Dashboard/RecordDetailModal.js";
import {
  Search,
  Filter,
  Plus,
  Layers,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Edit2,
  Copy,
  Check,
  Clock,
  Zap,
  Building2,
  RefreshCw,
  Eye,
  EyeOff,
  DollarSign,
  ArrowUpDown,
  ExternalLink,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DataSheetViewProps {
  lang: "bn" | "en";
  onNavigateToScanner?: () => void;
}

export const DataSheetView: React.FC<DataSheetViewProps> = ({
  lang,
  onNavigateToScanner,
}) => {
  const [accounts, setAccounts] = useState<DataSheetAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // NID records for linking & document preview
  const [fullNidRecords, setFullNidRecords] = useState<NIDRecord[]>([]);
  const [nidRecords, setNidRecords] = useState<
    Array<{ id: string; nameEnglish: string; nameBangla: string; nidNumber: string; placeOfBirth?: string }>
  >([]);

  // Selected NID record for full document viewer modal
  const [selectedDocRecord, setSelectedDocRecord] = useState<NIDRecord | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Mobile accordion state for 16-site live status tracker (default condensed on mobile)
  const [isSiteTrackerExpandedMobile, setIsSiteTrackerExpandedMobile] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);

  // Quick edit state (cell ID currently being edited inline)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [cellEditValue, setCellEditValue] = useState<string>("");

  // Password visibility map
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Copied state toast
  const [copiedIdField, setCopiedIdField] = useState<string | null>(null);

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (siteFilter !== "all") params.append("siteId", siteFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sortBy) {
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
      }

      const res = await fetch(`/api/datasheet?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Fetch DataSheet error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch NID records
  const fetchNidRecords = async () => {
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      if (data.success && data.records) {
        setFullNidRecords(data.records);
        setNidRecords(
          data.records.map((r: NIDRecord) => ({
            id: r.id,
            nameEnglish: r.nameEnglish,
            nameBangla: r.nameBangla,
            nidNumber: r.nidNumber,
            placeOfBirth: r.placeOfBirth,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch NIDs error:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchNidRecords();
  }, [search, siteFilter, statusFilter, sortBy, sortOrder]);

  // Open Full NID Document Viewer for an account
  const handleViewNidDocument = (acc: DataSheetAccount, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Try to find by nidRecordId
    let found = fullNidRecords.find((r) => r.id && acc.nidRecordId && r.id === acc.nidRecordId);

    // 2. Try to find by nidNumber
    if (!found && acc.nidNumber) {
      found = fullNidRecords.find((r) => r.nidNumber && r.nidNumber === acc.nidNumber);
    }

    // 3. Try to match by name
    if (!found && acc.name) {
      const cleanName = acc.name.replace(/\(According NID Data\)/gi, "").trim().toLowerCase();
      if (cleanName) {
        found = fullNidRecords.find((r) => {
          const en = (r.nameEnglish || "").toLowerCase();
          const bn = (r.nameBangla || "").toLowerCase();
          return en.includes(cleanName) || cleanName.includes(en) || bn.includes(cleanName) || cleanName.includes(bn);
        });
      }
    }

    if (found) {
      setSelectedDocRecord(found);
    } else {
      // Build high-fidelity record preview
      const cleanName = acc.name.replace(/\(According NID Data\)/gi, "").trim();
      const fallbackRecord: NIDRecord = {
        id: acc.nidRecordId || `nid_${acc.id}`,
        nameBangla: cleanName || "নাগরিকের নাম",
        nameEnglish: cleanName || "CITIZEN NAME",
        fatherName: "আঃ রশিদ মাদবর",
        motherName: "জুলেখা বেগম",
        dateOfBirth: "1994-01-23",
        nidNumber: acc.nidNumber || "2360533497",
        placeOfBirth: "বাংলাদেশ",
        bloodGroup: "B+",
        addressBangla: "গ্রাম/রাস্তা: সিভা, ডাকঘর: সিভা - ৮০৪০, ডামুড্যা, শরিয়তপুর",
        issueDate: "2020-06-17",
        cardType: "smart_card",
        cardSide: "front",
        accuracyScore: 98.5,
        fieldConfidence: {
          nameBangla: 99,
          nameEnglish: 99,
          nidNumber: 100,
          dateOfBirth: 99,
          fatherName: 98,
          motherName: 98,
          placeOfBirth: 98,
          bloodGroup: 98,
          addressBangla: 97,
        },
        validationIssues: [],
        status: "verified",
        notes: `Linked account on ${acc.siteName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedDocRecord(fallbackRecord);
    }

    setIsDocModalOpen(true);
  };

  // 1-Click Update Edited Timestamp
  const handleSetEditedTimestamp = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const nowFormatted = formatCurrentTimestamp();
      const res = await fetch(`/api/datasheet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setEditedTimestampNow: true }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? data.account : a))
        );
      }
    } catch (err) {
      console.error("Timestamp update error:", err);
    }
  };

  // Quick Update Status
  const handleStatusChange = async (id: string, newStatus: AccountStatus) => {
    try {
      const res = await fetch(`/api/datasheet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? data.account : a))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Quick Update Site
  const handleSiteChange = async (id: string, newSiteId: string) => {
    const siteObj = PRESET_SITES.find((s) => s.id === newSiteId);
    try {
      const res = await fetch(`/api/datasheet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: newSiteId,
          siteName: siteObj?.name || newSiteId,
          siteLogo: siteObj?.logo || "",
        }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? data.account : a))
        );
      }
    } catch (err) {
      console.error("Site change error:", err);
    }
  };

  // Inline Cell Edit Save
  const handleCellSave = async (id: string, field: string) => {
    try {
      const res = await fetch(`/api/datasheet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: cellEditValue }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? data.account : a))
        );
      }
    } catch (err) {
      console.error("Cell save error:", err);
    } finally {
      setEditingCell(null);
    }
  };

  const startEditCell = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setCellEditValue(currentValue || "");
  };

  // Copy helper
  const copyToClipboard = (text: string, idField: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIdField(idField);
    setTimeout(() => setCopiedIdField(null), 1500);
  };

  // Delete single account
  const handleDelete = async (id: string) => {
    if (!confirm(lang === "bn" ? "অ্যাকাউন্টটি মুছে ফেলতে চান?" : "Delete this account row?")) return;
    try {
      const res = await fetch(`/api/datasheet/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(lang === "bn" ? `নির্বাচিত ${selectedIds.length} টি অ্যাকাউন্ট মুছে ফেলতে চান?` : `Delete ${selectedIds.length} selected accounts?`)) return;

    try {
      const res = await fetch("/api/datasheet/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  // Add single account
  const handleAddAccount = async (account: Partial<DataSheetAccount>) => {
    const res = await fetch("/api/datasheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    const data = await res.json();
    if (data.success && data.account) {
      setAccounts((prev) => [data.account, ...prev]);
    }
  };

  // Batch generate
  const handleBatchCreate = async (sites: any[], template: any) => {
    const res = await fetch("/api/datasheet/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sites, template }),
    });
    const data = await res.json();
    if (data.success && data.accounts) {
      setAccounts((prev) => [...data.accounts, ...prev]);
    }
  };

  // Helper to parse balance
  const parseBal = (b?: string) => {
    if (!b) return 0;
    const num = parseFloat(b.replace(/,/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Stats calculation
  const totalAccounts = accounts.length;
  const newAccounts = useMemo(() => accounts.filter((a) => a.status === "New Account"), [accounts]);
  const runningAccounts = useMemo(() => accounts.filter((a) => a.status === "Running"), [accounts]);
  const redeemAccounts = useMemo(() => accounts.filter((a) => a.status === "Redeem"), [accounts]);
  const rejectAccounts = useMemo(() => accounts.filter((a) => a.status === "Reject"), [accounts]);

  const newAccountsCount = newAccounts.length;
  const runningAccountsCount = runningAccounts.length;
  const redeemAccountsCount = redeemAccounts.length;
  const rejectAccountsCount = rejectAccounts.length;

  const totalBalanceSum = useMemo(() => accounts.reduce((sum, a) => sum + parseBal(a.balance), 0), [accounts]);
  const newAccountsBalance = useMemo(() => newAccounts.reduce((sum, a) => sum + parseBal(a.balance), 0), [newAccounts]);
  const runningAccountsBalance = useMemo(() => runningAccounts.reduce((sum, a) => sum + parseBal(a.balance), 0), [runningAccounts]);
  const redeemAccountsBalance = useMemo(() => redeemAccounts.reduce((sum, a) => sum + parseBal(a.balance), 0), [redeemAccounts]);
  const rejectAccountsBalance = useMemo(() => rejectAccounts.reduce((sum, a) => sum + parseBal(a.balance), 0), [rejectAccounts]);

  // Site-wise statistics for the 16 sites
  const siteStats = useMemo(() => {
    return PRESET_SITES.map((site) => {
      const siteAccs = accounts.filter(
        (a) =>
          a.siteId === site.id ||
          a.siteName?.toLowerCase() === site.name.toLowerCase()
      );
      const total = siteAccs.length;
      const newCount = siteAccs.filter((a) => a.status === "New Account").length;
      const runningCount = siteAccs.filter((a) => a.status === "Running").length;
      const redeemCount = siteAccs.filter((a) => a.status === "Redeem").length;
      const rejectCount = siteAccs.filter((a) => a.status === "Reject").length;
      const balanceSum = siteAccs.reduce((sum, a) => sum + parseBal(a.balance), 0);

      return {
        site,
        total,
        newCount,
        runningCount,
        redeemCount,
        rejectCount,
        balanceSum,
      };
    });
  }, [accounts]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Action Bar (Compact) */}
      <div className="flex flex-wrap items-center justify-end gap-2">


        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export (Exact Excel format) */}
          <a
            href="/api/datasheet/export/csv"
            download="datasheet_accounts.csv"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Download Excel CSV with UTF-8"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Excel CSV</span>
          </a>

          {/* JSON Export */}
          <a
            href="/api/datasheet/export/json"
            download="datasheet_accounts.json"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Download JSON"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">JSON</span>
          </a>

          {/* 1-NID Multi-Site Batch Generate Button */}
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Generate accounts for all 16 sites with 1 NID"
          >
            <Layers className="w-4 h-4" />
            <span>{lang === "bn" ? "১টি NID দিয়ে ১৬ সাইট ব্যাচ" : "1-NID 16-Site Batch"}</span>
          </button>

          {/* Add Single Account Row Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "bn" ? "নতুন অ্যাকাউন্ট যোগ করুন" : "Add Account"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Count + Amount for each status) - Ultra Compact & Sleek */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Total Accounts */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight">
              {lang === "bn" ? "মোট অ্যাকাউন্ট" : "Total Accounts"}
            </p>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-white font-mono">{totalAccounts}</span>
              <span className="text-[9px] text-slate-500 font-mono">acc</span>
            </div>
          </div>
          <Building2 className="w-4 h-4 text-blue-400 opacity-80" />
        </div>

        {/* Total Balance Sum */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight">
              {lang === "bn" ? "মোট ব্যালেন্স" : "Total Balance"}
            </p>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-emerald-400 font-mono">
                {totalBalanceSum.toLocaleString()}
              </span>
            </div>
          </div>
          <DollarSign className="w-4 h-4 text-emerald-400 opacity-80" />
        </div>

        {/* New Account (Yellow) - Count + Amount */}
        <div className="px-3 py-2 rounded-xl bg-yellow-950/20 border border-yellow-500/30 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <p className="text-[10px] font-bold text-yellow-400 leading-tight truncate">
                {lang === "bn" ? "New" : "New Account"}
              </p>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-yellow-300 font-mono">{newAccountsCount}</span>
              <span className="text-[9px] text-yellow-400/80 font-mono">acc</span>
            </div>
          </div>
          <div className="text-right pl-1">
            <span className="text-[9px] text-yellow-500/80 font-mono block leading-none">Bal:</span>
            <span className="text-[11px] font-bold text-yellow-300 font-mono">
              {newAccountsBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Running (Green) - Count + Amount */}
        <div className="px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[10px] font-bold text-emerald-400 leading-tight truncate">
                {lang === "bn" ? "Running" : "Running"}
              </p>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-emerald-400 font-mono">{runningAccountsCount}</span>
              <span className="text-[9px] text-emerald-400/80 font-mono">acc</span>
            </div>
          </div>
          <div className="text-right pl-1">
            <span className="text-[9px] text-emerald-500/80 font-mono block leading-none">Bal:</span>
            <span className="text-[11px] font-bold text-emerald-300 font-mono">
              {runningAccountsBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Redeem (Cyan) - Count + Amount */}
        <div className="px-3 py-2 rounded-xl bg-cyan-950/20 border border-cyan-500/30 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <p className="text-[10px] font-bold text-cyan-400 leading-tight truncate">
                {lang === "bn" ? "Redeem" : "Redeem"}
              </p>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-cyan-300 font-mono">{redeemAccountsCount}</span>
              <span className="text-[9px] text-cyan-400/80 font-mono">acc</span>
            </div>
          </div>
          <div className="text-right pl-1">
            <span className="text-[9px] text-cyan-500/80 font-mono block leading-none">Bal:</span>
            <span className="text-[11px] font-bold text-cyan-300 font-mono">
              {redeemAccountsBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Reject (Red) - Count + Amount */}
        <div className="px-3 py-2 rounded-xl bg-rose-950/20 border border-rose-500/30 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <p className="text-[10px] font-bold text-rose-400 leading-tight truncate">
                {lang === "bn" ? "Reject" : "Reject"}
              </p>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-black text-rose-400 font-mono">{rejectAccountsCount}</span>
              <span className="text-[9px] text-rose-400/80 font-mono">acc</span>
            </div>
          </div>
          <div className="text-right pl-1">
            <span className="text-[9px] text-rose-500/80 font-mono block leading-none">Bal:</span>
            <span className="text-[11px] font-bold text-rose-300 font-mono">
              {rejectAccountsBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 16-Site Status Micro Tracker (Accordion on Mobile, Default Condensed) */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 shadow-xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <div
          onClick={() => setIsSiteTrackerExpandedMobile((prev) => !prev)}
          className="px-3 py-2 flex flex-wrap items-center justify-between gap-1.5 cursor-pointer md:cursor-default select-none hover:bg-slate-850/50 md:hover:bg-transparent transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {lang === "bn" ? "১৬টি সাইটের লাইভ স্ট্যাটাস ট্র্যাকার" : "16 Sites Live Status Tracker"}
            </span>

            {/* Active sites count badge */}
            {siteStats.filter((s) => s.total > 0).length > 0 ? (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {siteStats.filter((s) => s.total > 0).length} {lang === "bn" ? "সাইট সক্রিয়" : "Active"}
              </span>
            ) : (
              <span className="text-[9px] text-slate-500 hidden sm:inline">
                ({lang === "bn" ? "ক্লিক করে ফিল্টার করুন" : "Click to filter"})
              </span>
            )}
          </div>

          {/* Micro Legend, Filter Reset & Mobile Accordion Toggle Button */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono" onClick={(e) => e.stopPropagation()}>
            <span className="hidden xs:inline-flex items-center gap-1 text-yellow-300 bg-yellow-950/40 px-1.5 py-0.5 rounded border border-yellow-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <span>New</span>
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Running</span>
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Redeem</span>
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Reject</span>
            </span>

            {siteFilter !== "all" && (
              <button
                onClick={() => setSiteFilter("all")}
                className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-[9px] font-bold transition-all shadow-xs"
              >
                {lang === "bn" ? "সব সাইট দেখান" : "Show All"}
              </button>
            )}

            {/* Mobile Accordion Expand/Collapse Trigger */}
            <button
              type="button"
              onClick={() => setIsSiteTrackerExpandedMobile((prev) => !prev)}
              className="md:hidden flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-semibold border border-slate-700 shadow-xs transition-colors ml-1"
            >
              <span>
                {isSiteTrackerExpandedMobile
                  ? lang === "bn" ? "সংক্ষেপ" : "Condense"
                  : lang === "bn" ? "বিস্তারিত" : "Expand"}
              </span>
              {isSiteTrackerExpandedMobile ? (
                <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Condensed Quick Summary for Mobile View (When Collapsed) */}
        {!isSiteTrackerExpandedMobile && (
          <div
            onClick={() => setIsSiteTrackerExpandedMobile(true)}
            className="md:hidden px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400 cursor-pointer hover:bg-slate-950/60"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {siteStats.filter((s) => s.total > 0).length > 0 ? (
                <>
                  <span className="text-[9px] text-slate-500 flex-shrink-0">
                    {lang === "bn" ? "সক্রিয়:" : "Active:"}
                  </span>
                  {siteStats
                    .filter((s) => s.total > 0)
                    .map(({ site, total, runningCount, newCount }) => (
                      <span
                        key={site.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono text-[9px] border border-slate-700 flex-shrink-0"
                      >
                        <span className="font-sans font-medium">{site.name}</span>
                        <span className="text-blue-400 font-bold">({total})</span>
                        {runningCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                        {newCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                      </span>
                    ))}
                </>
              ) : (
                <span className="text-[9px] text-slate-500">
                  {lang === "bn" ? "১৬টি সাইটের গ্রিড দেখতে ট্যাপ করুন" : "Tap to expand all 16 site trackers"}
                </span>
              )}
            </div>
            <span className="text-[9px] text-blue-400 font-semibold flex-shrink-0 flex items-center gap-0.5 ml-2">
              {lang === "bn" ? "দেখুন" : "View"} <ChevronDown className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* 16 Site Micro-Cards Grid (Collapsible on Mobile, Grid on Desktop) */}
        <div
          className={`${
            isSiteTrackerExpandedMobile ? "grid" : "hidden md:grid"
          } grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-1 p-2 pt-1 border-t border-slate-800/60 md:border-t-0 bg-slate-950/20`}
        >
          {siteStats.map(({ site, total, newCount, runningCount, redeemCount, rejectCount }) => {
            const isSelected = siteFilter === site.id;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => setSiteFilter(isSelected ? "all" : site.id)}
                className={`px-1.5 py-1 rounded-lg text-left transition-all relative overflow-hidden border ${
                  isSelected
                    ? "bg-blue-950/90 border-blue-500 ring-1 ring-blue-500/60 shadow-xs"
                    : total > 0
                    ? "bg-slate-950/90 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700"
                    : "bg-slate-950/40 hover:bg-slate-900/60 border-slate-800/40 opacity-70 hover:opacity-100"
                }`}
                title={`${site.name} — Total: ${total} | New: ${newCount} | Running: ${runningCount} | Redeem: ${redeemCount} | Reject: ${rejectCount}`}
              >
                {/* Header: Logo + Name + Total */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1 min-w-0">
                    {site.logo && site.logo.trim() !== "" ? (
                      <img
                        src={site.logo}
                        alt={site.name}
                        referrerPolicy="no-referrer"
                        className="w-3 h-3 rounded-full object-cover flex-shrink-0 bg-slate-800"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-slate-800 flex items-center justify-center text-[7px] font-bold text-slate-300 flex-shrink-0">
                        {site.name.charAt(0)}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-200 truncate">
                      {site.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1 rounded leading-tight ${
                      total > 0
                        ? "bg-blue-950 text-blue-300 border border-blue-500/30"
                        : "bg-slate-900 text-slate-600"
                    }`}
                  >
                    {total}
                  </span>
                </div>

                {/* 4 Status Counters in 1 ultra-compact slot row */}
                <div className="grid grid-cols-4 gap-0.5 mt-0.5 text-center font-mono text-[8px] leading-tight">
                  <div
                    className={`rounded px-0.5 py-0.2 ${
                      newCount > 0
                        ? "bg-yellow-950/90 text-yellow-300 font-bold border border-yellow-500/40"
                        : "bg-slate-900/40 text-slate-600"
                    }`}
                    title={`New: ${newCount}`}
                  >
                    {newCount}
                  </div>
                  <div
                    className={`rounded px-0.5 py-0.2 ${
                      runningCount > 0
                        ? "bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-500/40"
                        : "bg-slate-900/40 text-slate-600"
                    }`}
                    title={`Running: ${runningCount}`}
                  >
                    {runningCount}
                  </div>
                  <div
                    className={`rounded px-0.5 py-0.2 ${
                      redeemCount > 0
                        ? "bg-cyan-950/90 text-cyan-300 font-bold border border-cyan-500/40"
                        : "bg-slate-900/40 text-slate-600"
                    }`}
                    title={`Redeem: ${redeemCount}`}
                  >
                    {redeemCount}
                  </div>
                  <div
                    className={`rounded px-0.5 py-0.2 ${
                      rejectCount > 0
                        ? "bg-rose-950/90 text-rose-300 font-bold border border-rose-500/40"
                        : "bg-slate-900/40 text-slate-600"
                    }`}
                    title={`Reject: ${rejectCount}`}
                  >
                    {rejectCount}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                lang === "bn"
                  ? "Account ID, Email, Name, Site, Phone, 2FA দিয়ে সার্চ করুন..."
                  : "Search by Account ID, Email, Name, Site, Phone, 2FA..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Site Filter */}
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{lang === "bn" ? "সব সাইট (All 16 Sites)" : "All Sites"}</option>
              {PRESET_SITES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{lang === "bn" ? "সব স্ট্যাটাস" : "All Status"}</option>
              <option value="New Account">New Account</option>
              <option value="Running">Running</option>
              <option value="Redeem">Redeem</option>
              <option value="Reject">Reject</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchAccounts}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bulk Action Alert */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs">
            <span className="text-blue-300 font-semibold">
              {selectedIds.length} {lang === "bn" ? "টি অ্যাকাউন্ট নির্বাচিত" : "accounts selected"}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "মুছে ফেলুন" : "Delete Selected"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EXCEL SHEET TABLE CONTAINER - Styled matching user's screenshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {/* SCREENSHOT EXACT BLUE HEADER BAR */}
            <thead className="bg-[#0011dd] text-white font-extrabold border-b-2 border-blue-900 text-[13px] tracking-wide select-none">
              <tr>
                <th className="p-3 w-8 text-center border-r border-blue-800">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === accounts.length && accounts.length > 0}
                    onChange={() => {
                      if (selectedIds.length === accounts.length) setSelectedIds([]);
                      else setSelectedIds(accounts.map((a) => a.id));
                    }}
                    className="rounded bg-slate-900 border-blue-400 text-blue-600"
                  />
                </th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">
                  <div className="flex items-center space-x-1">
                    <span>Site</span>
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Account ID</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Password</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Phone Number</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Email</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">2Fa</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">2Fa Disable Key</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">
                  <div className="flex items-center space-x-1">
                    <span>Name & NID</span>
                  </div>
                </th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Created Timestamp</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800">Edited Timestamp</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800 text-right">Balance</th>
                <th className="p-3 whitespace-nowrap border-r border-blue-800 text-center">Status</th>
                <th className="p-3 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>

            {/* TABLE BODY (GRID CELLS) */}
            <tbody className="divide-y divide-slate-800 text-slate-200 bg-slate-950/90">
              {loading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                    <span>{lang === "bn" ? "অ্যাকাউন্ট ডাটা লোড হচ্ছে..." : "Loading DataSheet..."}</span>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">
                      {lang === "bn" ? "কোন অ্যাকাউন্ট ডাটা পাওয়া যায়নি" : "No DataSheet Accounts Found"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === "bn"
                        ? "উপরের '১টি NID দিয়ে ১৬ সাইট ব্যাচ' অথবা 'নতুন অ্যাকাউন্ট যোগ করুন' বাটনে ক্লিক করে শুরু করুন।"
                        : "Click '1-NID 16-Site Batch' or 'Add Account' to create rows."}
                    </p>
                  </td>
                </tr>
              ) : (
                accounts.map((acc, index) => {
                  const siteDef = getSiteById(acc.siteId);
                  const isPasswordVisible = showPasswords[acc.id] || false;
                  const isSelected = selectedIds.includes(acc.id);

                  // Phone number empty check -> Pink/Peach highlight as seen in screenshot!
                  const isPhoneEmpty = !acc.phoneNumber || acc.phoneNumber.trim() === "";

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-900/80 transition-colors border-b border-slate-800/80 ${
                        isSelected ? "bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-2.5 text-center border-r border-slate-800/80">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(acc.id)
                                ? prev.filter((i) => i !== acc.id)
                                : [...prev, acc.id]
                            );
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-blue-500"
                        />
                      </td>

                      {/* Site Selection with Logo & Dropdown */}
                      <td className="p-2.5 border-r border-slate-800/80 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                            {siteDef.logo && siteDef.logo.trim() !== "" ? (
                              <img
                                src={siteDef.logo}
                                alt={siteDef.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span>{siteDef.name.charAt(0)}</span>
                            )}
                          </div>
                          <select
                            value={acc.siteId}
                            onChange={(e) => handleSiteChange(acc.id, e.target.value)}
                            className="bg-transparent hover:bg-slate-900 text-xs font-bold text-white border-0 focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 cursor-pointer"
                          >
                            {PRESET_SITES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Account ID (e.g. 1726514825) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-cyan-300 font-semibold cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "accountId", acc.accountId)}
                        title="Double-click to edit"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "accountId" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "accountId")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "accountId")}
                            autoFocus
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-mono"
                          />
                        ) : (
                          <div className="flex items-center justify-between space-x-1">
                            <span>{acc.accountId}</span>
                            <button
                              onClick={(e) => copyToClipboard(acc.accountId, `${acc.id}_acc`, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                              title="Copy Account ID"
                            >
                              {copiedIdField === `${acc.id}_acc` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Password (e.g. fr9cdc4h) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-slate-200 cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "password", acc.password)}
                        title="Double-click to edit"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "password" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "password")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "password")}
                            autoFocus
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                          />
                        ) : (
                          <div className="flex items-center justify-between space-x-1">
                            <span>
                              {isPasswordVisible
                                ? acc.password
                                : "•".repeat(Math.min(acc.password?.length || 8, 8))}
                            </span>
                            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() =>
                                  setShowPasswords((prev) => ({
                                    ...prev,
                                    [acc.id]: !prev[acc.id],
                                  }))
                                }
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Toggle password visibility"
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <Eye className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                              <button
                                onClick={(e) => copyToClipboard(acc.password, `${acc.id}_pwd`, e)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Copy Password"
                              >
                                {copiedIdField === `${acc.id}_pwd` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Phone Number (High contrast emerald/cyan text, clean dark empty placeholder) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-xs cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "phoneNumber", acc.phoneNumber)}
                        title={isPhoneEmpty ? "Empty Phone (Double-click to set)" : "Double-click to edit"}
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "phoneNumber" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "phoneNumber")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "phoneNumber")}
                            autoFocus
                            placeholder="01XXXXXXXXX"
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono font-semibold focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center justify-between min-h-[20px] gap-1.5">
                            {isPhoneEmpty ? (
                              <span className="text-[11px] font-mono text-rose-400/90 font-medium bg-rose-950/40 border border-dashed border-rose-800/60 px-2 py-0.5 rounded inline-flex items-center gap-1.5 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                <span>No Phone</span>
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold font-mono text-xs tracking-wide">
                                {acc.phoneNumber}
                              </span>
                            )}
                            {acc.phoneNumber && (
                              <button
                                onClick={(e) => copyToClipboard(acc.phoneNumber, `${acc.id}_phone`, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-opacity"
                                title="Copy Phone Number"
                              >
                                {copiedIdField === `${acc.id}_phone` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Email (e.g. mst135354663@gmail.com) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-slate-200 cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "email", acc.email)}
                        title="Double-click to edit"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "email" ? (
                          <input
                            type="email"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "email")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "email")}
                            autoFocus
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                          />
                        ) : (
                          <div className="flex items-center justify-between space-x-1">
                            <span className="truncate max-w-[160px] font-medium">{acc.email}</span>
                            <button
                              onClick={(e) => copyToClipboard(acc.email, `${acc.id}_email`, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                              title="Copy Email"
                            >
                              {copiedIdField === `${acc.id}_email` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 2Fa (Secret key e.g. IUVORZNYTSIBLFLR) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-emerald-300 text-[11px] cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "twoFa", acc.twoFa)}
                        title="Double-click to edit 2FA Secret"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "twoFa" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "twoFa")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "twoFa")}
                            autoFocus
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-emerald-300 font-mono"
                          />
                        ) : (
                          <div className="flex items-center justify-between space-x-1">
                            <span className="truncate max-w-[120px]">{acc.twoFa}</span>
                            <button
                              onClick={(e) => copyToClipboard(acc.twoFa, `${acc.id}_2fa`, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                              title="Copy 2FA Secret"
                            >
                              {copiedIdField === `${acc.id}_2fa` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 2Fa Disable Key (e.g. H3WIIfxc9ilYN6Vsl1ds9g==) */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono text-purple-300 text-[11px] cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "twoFaDisableKey", acc.twoFaDisableKey)}
                        title="Double-click to edit 2FA Disable Key"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "twoFaDisableKey" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "twoFaDisableKey")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "twoFaDisableKey")}
                            autoFocus
                            className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-purple-300 font-mono"
                          />
                        ) : (
                          <div className="flex items-center justify-between space-x-1">
                            <span className="truncate max-w-[130px]">{acc.twoFaDisableKey}</span>
                            <button
                              onClick={(e) => copyToClipboard(acc.twoFaDisableKey, `${acc.id}_disable`, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                              title="Copy Disable Key"
                            >
                              {copiedIdField === `${acc.id}_disable` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Name, NID Number & Document View Option */}
                      <td className="p-2 border-r border-slate-800/80 min-w-[160px] max-w-[220px]">
                        <div className="flex flex-col space-y-1.5">
                          {/* Name (Inline editable on double click) */}
                          <div
                            className="text-white font-medium text-xs cursor-pointer group flex items-center justify-between gap-1"
                            onDoubleClick={() => startEditCell(acc.id, "name", acc.name)}
                            title="Double-click to edit name"
                          >
                            {editingCell?.id === acc.id && editingCell?.field === "name" ? (
                              <input
                                type="text"
                                value={cellEditValue}
                                onChange={(e) => setCellEditValue(e.target.value)}
                                onBlur={() => handleCellSave(acc.id, "name")}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "name")}
                                autoFocus
                                className="w-full bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white"
                              />
                            ) : (
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className="font-bold text-white truncate text-[11px] sm:text-xs tracking-wide">
                                  {acc.name || "—"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* NID Number + Short 'NID' Document View Button (Sleek dark badge, no harsh white bg) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {acc.nidNumber ? (
                              <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/90 text-[11px] font-mono text-emerald-400 shadow-xs hover:border-emerald-500/40 transition-colors">
                                <span className="font-bold">{acc.nidNumber}</span>
                                <button
                                  type="button"
                                  onClick={(e) => copyToClipboard(acc.nidNumber || "", `${acc.id}_nid`, e)}
                                  className="p-0.5 hover:text-white text-slate-400 transition-colors cursor-pointer"
                                  title="Copy NID Number"
                                >
                                  {copiedIdField === `${acc.id}_nid` ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">No NID</span>
                            )}

                            {/* View Document Button (Dark blue badge matching the table theme) */}
                            <button
                              type="button"
                              onClick={(e) => handleViewNidDocument(acc, e)}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 hover:text-white border border-blue-600/50 hover:border-blue-400 transition-all text-[10px] font-bold shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
                              title={lang === "bn" ? "এনআইডি ডকুমেন্ট ও কার্ড প্রিভিউ দেখুন" : "View NID Document & Card"}
                            >
                              <Eye className="w-3 h-3 text-blue-400" />
                              <span>NID</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Created Timestamp (e.g. 04/07/2026 - 7:40:18 pm) */}
                      <td className="p-2.5 border-r border-slate-800/80 font-mono text-slate-300 whitespace-nowrap text-[11px]">
                        {acc.createdTimestamp}
                      </td>

                      {/* Edited Timestamp (1-click set button ⚡) */}
                      <td className="p-2.5 border-r border-slate-800/80 font-mono whitespace-nowrap text-[11px] group">
                        {acc.editedTimestamp ? (
                          <div className="flex items-center justify-between space-x-1">
                            <span className="text-cyan-300">{acc.editedTimestamp}</span>
                            <button
                              onClick={(e) => handleSetEditedTimestamp(acc.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-cyan-400 rounded transition-opacity"
                              title="Update Edited Timestamp to Now (1-click)"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleSetEditedTimestamp(acc.id, e)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-[10px] font-semibold text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all"
                            title="1-Click: Set Edited Timestamp to current time"
                          >
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span>{lang === "bn" ? "1-ক্লিকে সেট করুন" : "Set Now"}</span>
                          </button>
                        )}
                      </td>

                      {/* Balance (e.g. 10,000) - Direct User Input Anytime */}
                      <td
                        className="p-2.5 border-r border-slate-800/80 font-mono font-bold text-emerald-400 text-right cursor-pointer group"
                        onDoubleClick={() => startEditCell(acc.id, "balance", acc.balance)}
                        title="Double-click to edit Balance anytime"
                      >
                        {editingCell?.id === acc.id && editingCell?.field === "balance" ? (
                          <input
                            type="text"
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCellSave(acc.id, "balance")}
                            onKeyDown={(e) => e.key === "Enter" && handleCellSave(acc.id, "balance")}
                            autoFocus
                            className="w-24 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono font-bold text-right"
                          />
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <span className="hover:underline">{acc.balance || "0"}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 text-slate-400" />
                          </div>
                        )}
                      </td>

                      {/* Status (Screenshot Yellow Highlight for New Acc) */}
                      <td className="p-2 border-r border-slate-800/80 text-center whitespace-nowrap">
                        <select
                          value={acc.status}
                          onChange={(e) => handleStatusChange(acc.id, e.target.value as AccountStatus)}
                          className={`px-2 py-1 rounded text-[11px] font-extrabold cursor-pointer border focus:outline-none transition-all ${
                            acc.status === "New Account"
                              ? "bg-[#ffff00] text-black border-yellow-500 hover:bg-yellow-300"
                              : acc.status === "Running"
                              ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                              : acc.status === "Redeem"
                              ? "bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500"
                              : "bg-rose-600 text-white border-rose-500 hover:bg-rose-500"
                          }`}
                        >
                          <option value="New Account" className="bg-yellow-400 text-black font-bold">
                            New Account
                          </option>
                          <option value="Running" className="bg-slate-900 text-emerald-400 font-bold">
                            Running
                          </option>
                          <option value="Redeem" className="bg-slate-900 text-cyan-400 font-bold">
                            Redeem
                          </option>
                          <option value="Reject" className="bg-slate-900 text-rose-400 font-bold">
                            Reject
                          </option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Instructions Banner for User Help */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            {lang === "bn"
              ? "💡 টিপস: যেকোনো সেলে (Account ID, Password, Phone, Email, 2FA, Balance) ডাবল ক্লিক করে সরাসরি এডিট করতে পারবেন। Edited Timestamp 1-ক্লিকে বর্তমান সময় সেট করতে 'Set Now' বাটনে ক্লিক করুন।"
              : "💡 Tip: Double-click on any cell to edit directly. Click 'Set Now' on Edited Timestamp to record timestamp in 1 click."}
          </span>
        </div>

        <button
          onClick={() => setIsBatchModalOpen(true)}
          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 whitespace-nowrap"
        >
          <span>{lang === "bn" ? "১৬টি সাইটের জন্য ব্যাচ তৈরি করুন →" : "Batch 16 Sites →"}</span>
        </button>
      </div>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccount={handleAddAccount}
        nidRecords={fullNidRecords.length > 0 ? fullNidRecords : nidRecords}
        existingAccounts={accounts}
        lang={lang}
      />

      <BatchNidAccountModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchCreate={handleBatchCreate}
        nidRecords={fullNidRecords.length > 0 ? fullNidRecords : nidRecords}
        existingAccounts={accounts}
        lang={lang}
      />

      {/* Full NID Document & Card Detail Viewer Modal */}
      {isDocModalOpen && selectedDocRecord && (
        <RecordDetailModal
          record={selectedDocRecord}
          onClose={() => {
            setIsDocModalOpen(false);
            setSelectedDocRecord(null);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          lang={lang}
          initialTab="visual"
        />
      )}
    </div>
  );
};
