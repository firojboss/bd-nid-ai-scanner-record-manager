import React, { useState, useEffect } from "react";
import { NIDRecord, CardType, RecordStatus, DataSheetAccount } from "../../types.js";
import { formatBanglaDate, getAccuracyColor } from "../../utils/nidHelpers.js";
import { RecordDetailModal } from "./RecordDetailModal.js";
import { EditRecordModal } from "./EditRecordModal.js";
import { NidSitesUsageModal } from "./NidSitesUsageModal.js";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  FileSpreadsheet,
  FileCode,
  User,
  MapPin,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Layers,
} from "lucide-react";

interface RecordsDashboardProps {
  onScanNew: () => void;
  lang: "bn" | "en";
}

export const RecordsDashboard: React.FC<RecordsDashboardProps> = ({
  onScanNew,
  lang,
}) => {
  const [records, setRecords] = useState<NIDRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [cardTypeFilter, setCardTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selected records for bulk action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [detailRecord, setDetailRecord] = useState<NIDRecord | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<"visual" | "scanned" | "table">("visual");
  const [editRecord, setEditRecord] = useState<NIDRecord | null>(null);

  // DataSheet Accounts for usage tracking
  const [dataSheetAccounts, setDataSheetAccounts] = useState<DataSheetAccount[]>([]);
  const [selectedUsageNid, setSelectedUsageNid] = useState<{
    record: NIDRecord;
    accounts: DataSheetAccount[];
  } | null>(null);

  const fetchDataSheetAccounts = async () => {
    try {
      const res = await fetch("/api/datasheet");
      const data = await res.json();
      if (data.success && data.accounts) {
        setDataSheetAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Fetch DataSheet error for usage tracker:", err);
    }
  };

  // Helper to find all accounts associated with a specific NID
  const getNidAccounts = (record: NIDRecord): DataSheetAccount[] => {
    return dataSheetAccounts.filter((a) => {
      if (a.nidId && a.nidId === record.id) return true;
      if (a.nidNumber && record.nidNumber) {
        const cleanAcc = a.nidNumber.replace(/\s+/g, "").trim();
        const cleanRec = record.nidNumber.replace(/\s+/g, "").trim();
        return cleanAcc === cleanRec && cleanAcc.length > 0;
      }
      return false;
    });
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cardTypeFilter !== "all") params.append("cardType", cardTypeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (bloodGroupFilter !== "all") params.append("bloodGroup", bloodGroupFilter);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/records?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchDataSheetAccounts();
  }, [search, cardTypeFilter, statusFilter, bloodGroupFilter, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const msg =
      lang === "bn"
        ? `আপনি কি নিশ্চিত যে নির্বাচিত ${selectedIds.length} টি রেকর্ড মুছে ফেলতে চান?`
        : `Are you sure you want to delete ${selectedIds.length} selected records?`;
    if (!confirm(msg)) return;

    try {
      const res = await fetch("/api/records/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleUpdateRecord = (updated: NIDRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (detailRecord?.id === updated.id) {
      setDetailRecord(updated);
    }
  };

  const openRecordModal = (record: NIDRecord, tab: "visual" | "scanned" | "table" = "visual") => {
    setDetailRecord(record);
    setDetailInitialTab(tab);
  };

  // Stats calculation
  const totalCount = records.length;
  const smartCount = records.filter((r) => r.cardType === "smart_card").length;
  const oldCount = records.filter((r) => r.cardType === "old_laminated").length;
  const avgAccuracy =
    records.length > 0
      ? (records.reduce((acc, r) => acc + (r.accuracyScore || 0), 0) / records.length).toFixed(1)
      : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{lang === "bn" ? "এনআইডি ডাটাবেস ম্যানেজমেন্ট" : "NID Database Management"}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalCount} {lang === "bn" ? "রেকর্ড" : "Records"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "bn"
              ? "স্ক্যানকৃত সকল স্মার্ট ও নন-স্মার্ট জাতীয় পরিচয়পত্রের তথ্য অনুসন্ধান, ফিল্টার, মূল স্ক্যান ফাইল ও ডাটা ম্যানেজ করুন।"
              : "Search, filter, edit, view original scanned document copies, and manage records."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export CSV / Excel */}
          <a
            href="/api/export/csv"
            download="nid_records.csv"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">CSV Export</span>
          </a>

          {/* Export JSON */}
          <a
            href="/api/export/json"
            download="nid_records.json"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Download JSON"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">JSON Export</span>
          </a>

          {/* Scan New Button */}
          <button
            onClick={onScanNew}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "bn" ? "নতুন স্ক্যান করুন" : "New Scan"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              {lang === "bn" ? "মোট সংরক্ষিত" : "Total Stored"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{totalCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              {lang === "bn" ? "স্মার্ট কার্ড (১০ সংখ্যা)" : "Smart NID Cards"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{smartCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              {lang === "bn" ? "পুরাতন লেমিনেটেড" : "Old Laminated"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{oldCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              {lang === "bn" ? "গড় এআই নির্ভুলতা" : "Avg AI Accuracy"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {avgAccuracy}%
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                lang === "bn"
                  ? "নাম, এনআইডি নম্বর, পিতা/মাতার নাম, ঠিকানা দিয়ে খুঁজুন..."
                  : "Search by Name, NID Number, Parents, District..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Card Type Filter */}
            <select
              value={cardTypeFilter}
              onChange={(e) => setCardTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{lang === "bn" ? "সব কার্ড টাইপ" : "All Card Types"}</option>
              <option value="smart_card">স্মার্ট কার্ড (Smart NID)</option>
              <option value="old_laminated">পুরাতন লেমিনেটেড (Old)</option>
              <option value="server_copy">সার্ভার কপি (Server Copy)</option>
            </select>

            {/* Blood Group Filter */}
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{lang === "bn" ? "সব রক্তের গ্রুপ" : "All Blood Groups"}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchRecords}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bulk Action Banner */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
            <span className="text-emerald-300 font-semibold">
              {selectedIds.length} {lang === "bn" ? "টি রেকর্ড নির্বাচিত হয়েছে" : "records selected"}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "নির্বাচিতগুলো মুছুন" : "Delete Selected"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Records Display */}
      {loading && records.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <p className="text-xs">{lang === "bn" ? "তথ্য লোড হচ্ছে..." : "Loading records..."}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <CreditCard className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {lang === "bn" ? "কোন এনআইডি রেকর্ড পাওয়া যায়নি" : "No NID records found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {search || cardTypeFilter !== "all"
                ? lang === "bn"
                  ? "আপনার অনুসন্ধানের সাথে মিল রেখে কোন তথ্য পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।"
                  : "No records match your filter criteria. Try clearing search filters."
                : lang === "bn"
                ? "এখনো কোন এনআইডি স্ক্যান করা হয়নি। প্রথম এনআইডি স্ক্যান করতে শুরু করুন।"
                : "No NID cards have been scanned yet. Get started by scanning your first ID."}
            </p>
          </div>
          <button
            onClick={onScanNew}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
          >
            {lang === "bn" ? "+ প্রথম এনআইডি স্ক্যান করুন" : "+ Scan First NID"}
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === records.length && records.length > 0}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                    />
                  </th>
                  <th className="p-3.5">{lang === "bn" ? "স্ক্যান কপি / এনআইডি" : "Scan / NID No"}</th>
                  <th className="p-3.5">{lang === "bn" ? "নাম (বাংলা ও English)" : "Name (BN / EN)"}</th>
                  <th className="p-3.5">{lang === "bn" ? "পিতা ও মাতা" : "Parents' Names"}</th>
                  <th className="p-3.5">{lang === "bn" ? "জন্ম তারিখ ও স্থান" : "DOB & District"}</th>
                  <th className="p-3.5">{lang === "bn" ? "কার্ড টাইপ" : "Card Type"}</th>
                  <th className="p-3.5 text-center">{lang === "bn" ? "নির্ভুলতা" : "Accuracy"}</th>
                  <th className="p-3.5 text-right">{lang === "bn" ? "অ্যাকশন (View / Edit)" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {records.map((r) => {
                  const accuracy = getAccuracyColor(r.accuracyScore || 98);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => openRecordModal(r, "visual")}
                    >
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => handleToggleSelect(r.id)}
                          className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                        />
                      </td>

                      {/* Scanned Document Thumbnail & NID Number */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          {r.frontImage && r.frontImage.trim() !== "" ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                openRecordModal(r, "scanned");
                              }}
                              className="w-10 h-7 rounded-md overflow-hidden bg-slate-950 border border-slate-700 hover:border-cyan-400 flex-shrink-0 transition-all cursor-pointer shadow-sm relative group/thumb"
                              title={lang === "bn" ? "মূল স্ক্যান দেখতে ক্লিক করুন" : "Click to view original scanned file"}
                            >
                              <img
                                src={r.frontImage}
                                alt="Scan preview"
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3 h-3 text-cyan-300" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-7 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 flex-shrink-0">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-mono font-bold text-rose-300 text-xs">
                            {r.nidNumber}
                          </span>
                        </div>
                      </td>

                      {/* Name BN / EN */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{r.nameBangla}</div>
                        <div className="text-[11px] text-slate-400 font-mono uppercase">
                          {r.nameEnglish}
                        </div>
                      </td>

                      {/* Father & Mother */}
                      <td className="p-3.5 text-slate-300">
                        <div>পিতা: {r.fatherName || "—"}</div>
                        <div className="text-[11px] text-slate-400">মাতা: {r.motherName || "—"}</div>
                      </td>

                      {/* DOB & District */}
                      <td className="p-3.5">
                        <div className="font-mono text-amber-300">{r.dateOfBirth}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-400" />
                          <span>{r.placeOfBirth || "—"}</span>
                          {r.bloodGroup && (
                            <span className="ml-1 text-red-400 font-bold font-mono">
                              ({r.bloodGroup})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Card Type */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            r.cardType === "smart_card"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {r.cardType === "smart_card" ? "Smart Card" : "Old NID"}
                        </span>
                      </td>

                      {/* Accuracy Score */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${accuracy.bg} ${accuracy.text} border ${accuracy.border}`}
                        >
                          {r.accuracyScore || 98}%
                        </span>
                      </td>

                      {/* Actions with prominent Eye icon, Usage Counter badge, Edit and Delete */}
                      <td
                        className="p-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Used Count Badge (Clickable - opens modal showing used sites) */}
                          {(() => {
                            const nidAccs = getNidAccounts(r);
                            const isUsed = nidAccs.length > 0;
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedUsageNid({ record: r, accounts: nidAccs })}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                                  isUsed
                                    ? "bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white border-blue-500/40 shadow-sm shadow-blue-950/40"
                                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-800"
                                }`}
                                title={
                                  lang === "bn"
                                    ? `${nidAccs.length}টি সাইটে ব্যবহৃত (ক্লিক করে কোন কোন সাইটে ব্যবহৃত তা দেখুন)`
                                    : `Used in ${nidAccs.length} site(s) - click to view details`
                                }
                              >
                                <Layers className={`w-3 h-3 ${isUsed ? "text-blue-400" : "text-slate-500"}`} />
                                <span>{nidAccs.length} Used</span>
                              </button>
                            );
                          })()}

                          {/* Eye Icon (View Scanned File & Data) */}
                          <button
                            onClick={() => openRecordModal(r, "scanned")}
                            className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105 shadow-sm"
                            title={lang === "bn" ? "মূল স্ক্যান ফাইল ও তথ্য দেখুন (Eye View)" : "View Scanned Document & Details"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditRecord(r)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title={lang === "bn" ? "সম্পাদনা করুন" : "Edit Record"}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(lang === "bn" ? "মুছে ফেলতে চান?" : "Delete record?")) {
                                handleDelete(r.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                            title={lang === "bn" ? "মুছে ফেলুন" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => {
            const accuracy = getAccuracyColor(r.accuracyScore || 98);
            return (
              <div
                key={r.id}
                onClick={() => openRecordModal(r, "visual")}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3.5 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group flex flex-col justify-between"
              >
                {/* Scanned Image Banner in Grid */}
                {r.frontImage && r.frontImage.trim() !== "" && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openRecordModal(r, "scanned");
                    }}
                    className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 transition-colors"
                  >
                    <img
                      src={r.frontImage}
                      alt="Scanned card banner"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {lang === "bn" ? "মূল স্ক্যান কপি দেখুন" : "View Scan Copy"}
                      </span>
                      <span className="font-mono text-slate-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded">
                        {r.accuracyScore || 98}% OCR
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        r.cardType === "smart_card"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {r.cardType === "smart_card" ? "Smart NID (10 Digits)" : "Old Laminated NID"}
                    </span>
                    <h3 className="font-bold text-white text-base pt-1">{r.nameBangla}</h3>
                    <p className="text-xs text-slate-400 font-mono uppercase">{r.nameEnglish}</p>
                  </div>

                  {!r.frontImage && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${accuracy.bg} ${accuracy.text} border ${accuracy.border}`}
                    >
                      {r.accuracyScore || 98}%
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">NID NO:</span>
                    <span className="font-mono font-bold text-rose-300">{r.nidNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DOB:</span>
                    <span className="font-mono text-amber-300">{r.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">District:</span>
                    <span className="text-slate-200">{r.placeOfBirth || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {/* Used count badge in grid */}
                  {(() => {
                    const nidAccs = getNidAccounts(r);
                    const isUsed = nidAccs.length > 0;
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUsageNid({ record: r, accounts: nidAccs });
                        }}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                          isUsed
                            ? "bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white border-blue-500/40 shadow-sm"
                            : "bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-800"
                        }`}
                        title={
                          lang === "bn"
                            ? `${nidAccs.length}টি সাইটে ব্যবহৃত (ক্লিক করে দেখুন)`
                            : `Used in ${nidAccs.length} site(s) - click to view`
                        }
                      >
                        <Layers className={`w-3 h-3 ${isUsed ? "text-blue-400" : "text-slate-500"}`} />
                        <span>{nidAccs.length} Used</span>
                      </button>
                    );
                  })()}

                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openRecordModal(r, "scanned")}
                      className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30"
                      title="View Scanned File"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditRecord(r)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("মুছে ফেলতে চান?")) handleDelete(r.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NidSitesUsageModal
        isOpen={!!selectedUsageNid}
        onClose={() => setSelectedUsageNid(null)}
        record={selectedUsageNid?.record || null}
        accounts={selectedUsageNid?.accounts || []}
        lang={lang}
      />

      <RecordDetailModal
        record={detailRecord}
        initialTab={detailInitialTab}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => setEditRecord(rec)}
        onDelete={handleDelete}
        onUpdateRecord={handleUpdateRecord}
        lang={lang}
      />

      <EditRecordModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleUpdateRecord}
        lang={lang}
      />
    </div>
  );
};
