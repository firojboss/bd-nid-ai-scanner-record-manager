import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  TrendingDown,
  Calendar,
  Clock,
  CreditCard,
  Tag,
  Search,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Download,
  Filter,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Layers,
  X,
  RefreshCw,
  PieChart
} from "lucide-react";
import { NoteExpense } from "../../types";

interface NotePadViewProps {
  lang: "en" | "bn";
}

const EXPENSE_CATEGORIES = [
  { id: "nid_fee", labelBn: "NID সার্ভার ফি", labelEn: "NID Server Fee", icon: "💳" },
  { id: "sim_otp", labelBn: "সিম কার্ড ও ওটিপি", labelEn: "SIM Card & OTP", icon: "📱" },
  { id: "deposit", labelBn: "অ্যাকাউন্ট ডিপোজিট", labelEn: "Account Deposit", icon: "💰" },
  { id: "server", labelBn: "সার্ভার ও ভিপিএন", labelEn: "Server & VPN", icon: "🌐" },
  { id: "proxy", labelBn: "প্রক্সি ও আইপি বিল", labelEn: "Proxy & IP Bill", icon: "🔒" },
  { id: "transport", labelBn: "নাস্তা ও যাতায়াত", labelEn: "Food & Transport", icon: "☕" },
  { id: "office", labelBn: "অফিস ও স্টেশনারি", labelEn: "Office & Stationery", icon: "📁" },
  { id: "other", labelBn: "অন্যান্য খরচ", labelEn: "Other Expense", icon: "📌" },
];

const PAYMENT_METHODS = ["Cash", "bKash", "Nagad", "Rocket", "Upay", "Bank", "Crypto"];

export const NotePadView: React.FC<NotePadViewProps> = ({ lang }) => {
  const [expenses, setExpenses] = useState<NoteExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<NoteExpense | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0].labelBn,
    title: "",
    amount: "",
    details: "",
    paymentMethod: "Cash",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
      }
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      category: lang === "bn" ? "NID সার্ভার ফি" : "NID Server Fee",
      title: "",
      amount: "",
      details: "",
      paymentMethod: "bKash",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (exp: NoteExpense) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      title: exp.title,
      amount: String(exp.amount),
      details: exp.details || "",
      paymentMethod: exp.paymentMethod || "Cash",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError(lang === "bn" ? "খরচের বিবরণ বা শিরোনাম লিখুন" : "Please enter an expense title");
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError(lang === "bn" ? "সঠিক টাকার পরিমাণ দিন" : "Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingExpense) {
        // Update
        const res = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formData.category,
            title: formData.title.trim(),
            amount: numAmount,
            details: formData.details.trim(),
            paymentMethod: formData.paymentMethod,
          }),
        });
        const result = await res.json();
        if (result.success && result.expense) {
          setExpenses((prev) =>
            prev.map((e) => (e.id === editingExpense.id ? result.expense : e))
          );
          setIsModalOpen(false);
        } else {
          setFormError(result.error || "Failed to update expense");
        }
      } else {
        // Create new
        const now = new Date();
        const bdtDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(now);
        const bdtTimeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(now);

        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formData.category,
            title: formData.title.trim(),
            amount: numAmount,
            details: formData.details.trim(),
            paymentMethod: formData.paymentMethod,
            date: bdtDateStr,
            time: bdtTimeStr,
          }),
        });
        const result = await res.json();
        if (result.success && result.expense) {
          setExpenses((prev) => [result.expense, ...prev]);
          setIsModalOpen(false);
        } else {
          setFormError(result.error || "Failed to save expense");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchSearch =
        searchQuery === "" ||
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.details && exp.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exp.paymentMethod && exp.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" || exp.category === selectedCategory;

      const matchDate = dateFilter === "" || exp.date === dateFilter;

      return matchSearch && matchCategory && matchDate;
    });
  }, [expenses, searchQuery, selectedCategory, dateFilter]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const today = new Date().toISOString().split("T")[0];
    const todayAmount = expenses
      .filter((e) => e.date === today)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Group by category
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + (Number(e.amount) || 0);
    });

    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || [
      "N/A",
      0,
    ];

    return {
      totalAmount,
      todayAmount,
      totalCount: expenses.length,
      topCategoryName: topCategory[0],
      topCategoryAmount: topCategory[1],
    };
  }, [expenses]);

  // Format currency
  const formatMoney = (val: number) => {
    return "৳ " + Number(val).toLocaleString("en-US", { minimumFractionDigits: 0 });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ["ID", "Category", "Title", "Amount (BDT)", "Payment Method", "Date", "Time", "Details"];
    const rows = filteredExpenses.map((e) => [
      e.id,
      `"${e.category}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMethod || "Cash"}"`,
      e.date,
      e.time,
      `"${(e.details || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_note_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 sm:p-4 md:p-8 selection:bg-rose-500 selection:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Top Header Banner - White / Dark with Red Accents */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-rose-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200 dark:shadow-none shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>{lang === "bn" ? "খরচের হিসাব নোটপ্যাড" : "Daily Expense NotePad"}</span>
                  <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Live Record
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {lang === "bn"
                    ? "ছোট-বড় সকল খরচের হিসাব সুরক্ষিতভাবে সেভ রাখুন ও পর্যালোচনা করুন"
                    : "Track daily operational fees, server costs, SIM cards and team expenses in detail"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-y-2">
            <button
              onClick={handleExportCSV}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer border border-transparent dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
              <span>{lang === "bn" ? "CSV ডাউনলোড" : "Export CSV"}</span>
            </button>
            <button
              onClick={fetchExpenses}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer border border-transparent dark:border-slate-700"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              id="btn-add-expense"
              onClick={handleOpenAddModal}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none hover:shadow-rose-300 transition-all flex items-center space-x-1.5 sm:space-x-2 cursor-pointer active:scale-95 flex-1 sm:flex-initial justify-center"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === "bn" ? "নতুন খরচ যুক্ত করুন (+)" : "Add Expense (+)"}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards (White & Dark Theme with Clean Red Highlights) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Total Expense Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "bn" ? "মোট সর্বমোট খরচ" : "Total Lifetime Expense"}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formatMoney(stats.totalAmount)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 mt-1 flex items-center gap-1 flex-wrap">
                <span className="font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200/50 dark:border-rose-900/50">
                  {stats.totalCount} {lang === "bn" ? "টি হিসাব" : "entries"}
                </span>
                <span>{lang === "bn" ? "নথিভুক্ত হয়েছে" : "recorded"}</span>
              </p>
            </div>
          </div>

          {/* Today's Expense Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "bn" ? "আজকের খরচ (Today)" : "Today's Expenses"}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatMoney(stats.todayAmount)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                {lang === "bn" ? "আজকের মোট ট্রানজেকশন" : "Today's daily spend"}
              </p>
            </div>
          </div>

          {/* Top Category Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "bn" ? "সর্বোচ্চ খরচের খাত" : "Top Category"}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {stats.topCategoryName}
              </div>
              <p className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                {formatMoney(stats.topCategoryAmount)}
              </p>
            </div>
          </div>

          {/* Quick Average Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "bn" ? "গড় এন্ট্রি প্রতি খরচ" : "Average per Entry"}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                {formatMoney(stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                {lang === "bn" ? "প্রতি হিসাবে খরচের হার" : "Per voucher average"}
              </p>
            </div>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "bn" ? "খরচের বিবরণ, খাত বা মাধ্যম খুঁজুন..." : "Search expenses by description, tag..."}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-400 focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-200 dark:shadow-none"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {lang === "bn" ? "সকল খাত" : "All Categories"}
            </button>
            {EXPENSE_CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.labelBn)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.labelBn
                    ? "bg-rose-600 text-white shadow-sm shadow-rose-200 dark:shadow-none"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>{cat.icon}</span>{" "}
                <span>{lang === "bn" ? cat.labelBn : cat.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-400"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold whitespace-nowrap"
              >
                {lang === "bn" ? "তারিখ মুছুন" : "Clear"}
              </button>
            )}
          </div>

        </div>

        {/* Beautiful Expense Card Grid (White and Dark Red Theme) */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-rose-100 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {lang === "bn" ? "হিসাব লোড হচ্ছে..." : "Loading expense notes..."}
            </p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 sm:p-16 text-center border border-rose-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-500 flex items-center justify-center mx-auto">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {lang === "bn" ? "কোনো খরচের হিসাব পাওয়া যায়নি" : "No Expenses Found"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {lang === "bn"
                  ? "নতুন খরচের হিসাব রাখতে ওপরের '+ নতুন খরচ যুক্ত করুন' বাটনে ক্লিক করুন।"
                  : "Start logging your daily small and big costs. Click 'Add Expense' to create your first card."}
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none transition-all inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "bn" ? "প্রথম খরচ যুক্ত করুন" : "Add First Expense"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                id={`expense-card-${exp.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
              >
                {/* Card Header: Category & Amount */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-rose-500" />
                        {exp.category}
                      </span>
                      {exp.paymentMethod && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {exp.paymentMethod}
                        </span>
                      )}
                    </div>
                    {/* Amount in Red & Bold */}
                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
                        {formatMoney(exp.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Title / Description */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {exp.title}
                  </h3>

                  {/* Optional Details Note */}
                  {exp.details && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 leading-relaxed">
                      {exp.details}
                    </p>
                  )}
                </div>

                {/* Card Footer: Timestamp & Actions */}
                <div className="pt-3 mt-2 border-t border-rose-50 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{exp.date}</span>
                    </span>
                    {exp.time && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-rose-400" />
                        <span className="font-medium text-slate-500 dark:text-slate-400">{exp.time}</span>
                      </span>
                    )}
                  </div>

                  {/* Action icons */}
                  <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(exp)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(exp.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-red-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Delete Confirmation Overlay */}
                {deleteConfirmId === exp.id && (
                  <div className="absolute inset-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 z-10 animate-fade-in border border-red-200 dark:border-rose-900 shadow-lg">
                    <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === "bn" ? "এই হিসাবটি কি মুছে ফেলতে চান?" : "Delete this expense note?"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === "bn" ? "এটি ডাটাবেস থেকেও মুছে যাবে।" : "This will also be removed from database."}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all cursor-pointer"
                      >
                        {lang === "bn" ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        {lang === "bn" ? "বাতিল" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL FOR ADD / EDIT EXPENSE (Red & White Theme / Dark Mode Supported) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-rose-100 dark:border-slate-800 relative animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {editingExpense
                      ? lang === "bn"
                        ? "খরচের হিসাব সম্পাদনা"
                        : "Edit Expense Note"
                      : lang === "bn"
                      ? "নতুন খরচের হিসাব যুক্ত করুন"
                      : "Add New Expense Note"}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {lang === "bn"
                      ? "সাবমিট করলে স্বয়ংক্রিয়ভাবে টাইম ও তারিখ সহ সেভ হবে"
                      : "Will be saved with exact timestamp to database & Supabase"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error message */}
            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:space-y-4">
              
              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{lang === "bn" ? "খরচের ধরন / খাত *" : "Expense Category *"}</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{formData.category}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.labelBn })}
                      className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        formData.category === cat.labelBn
                          ? "bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate text-[11px] sm:text-xs">{lang === "bn" ? cat.labelBn : cat.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === "bn" ? "খরচের বিবরণ / কাজের নাম *" : "Expense Title / Reason *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={lang === "bn" ? "যেমন: ৩টি এনআইডি সার্ভার কপি ডাউনলোড" : "e.g. 3 Server copy download fee"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
                />
              </div>

              {/* Amount and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === "bn" ? "টাকার পরিমাণ (৳ BDT) *" : "Amount (৳ BDT) *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                      ৳
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-black placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === "bn" ? "পেমেন্ট মাধ্যম" : "Payment Method"}
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-slate-950 font-semibold"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm} className="dark:bg-slate-900 dark:text-white">
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{lang === "bn" ? "ছোট বিস্তারিত (ঐচ্ছিক)" : "Short Details (Optional)"}</span>
                  <span className="text-[10px] text-slate-400">Optional notes</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder={lang === "bn" ? "প্রয়োজনীয় বাড়তি নোট বা রেফারেন্স..." : "Extra details, client reference or invoice ID..."}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-rose-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none hover:shadow-rose-300 disabled:opacity-50 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === "bn" ? "সেভ হচ্ছে..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingExpense ? (lang === "bn" ? "আপডেট করুন" : "Update") : (lang === "bn" ? "সেভ করুন" : "Save Note")}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
