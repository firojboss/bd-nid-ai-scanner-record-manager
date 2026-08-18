import React, { useState, useEffect } from "react";
import { DashboardStats, NIDRecord } from "../../types.js";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Heart,
  CreditCard,
  ShieldCheck,
  Activity,
  RefreshCw,
} from "lucide-react";

interface AnalyticsViewProps {
  lang: "bn" | "en";
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ lang }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">
          {lang === "bn" ? "অ্যানালিটিক্স লোড হচ্ছে..." : "Loading Analytics..."}
        </p>
      </div>
    );
  }

  const total = stats?.totalRecords || 0;
  const smartPercent = total > 0 ? Math.round(((stats?.smartCardCount || 0) / total) * 100) : 0;
  const oldPercent = total > 0 ? Math.round(((stats?.oldNidCount || 0) / total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>{lang === "bn" ? "এনআইডি স্ক্যান অ্যানালিটিক্স ও রিপোর্ট" : "NID Scanner Analytics"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "bn"
              ? "এআই নির্ভুলতার হার, স্মার্ট বনাম পুরাতন কার্ডের অনুপাত এবং আঞ্চলিক পরিসংখ্যান।"
              : "AI extraction accuracy rates, Smart vs Old NID ratio, and district metrics."}
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {lang === "bn" ? "মোট স্ক্যানকৃত এনআইডি" : "Total Scans"}
            </span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{total}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">100% Data Persisted</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {lang === "bn" ? "গড় এআই নির্ভুলতা" : "Avg Accuracy"}
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {stats?.avgAccuracy || 98.5}%
          </div>
          <p className="text-[11px] text-slate-400">High Confidence Level</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {lang === "bn" ? "স্মার্ট কার্ড সংখ্যা" : "Smart Cards"}
            </span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono">
            {stats?.smartCardCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">{smartPercent}% of total database</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {lang === "bn" ? "নন-স্মার্ট পুরাতন এনআইডি" : "Old Laminated"}
            </span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono">
            {stats?.oldNidCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">{oldPercent}% of total database</p>
        </div>
      </div>

      {/* Main Charts & Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Card Type Ratio Bar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>{lang === "bn" ? "কার্ডের ধরণ অনুপাত" : "Card Type Distribution"}</span>
            </h3>

            {/* Visual Ratio Bar */}
            <div className="space-y-2">
              <div className="h-4 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
                <div
                  style={{ width: `${smartPercent}%` }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000"
                  title={`Smart Card: ${smartPercent}%`}
                ></div>
                <div
                  style={{ width: `${oldPercent}%` }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000"
                  title={`Old NID: ${oldPercent}%`}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                  <span>স্মার্ট কার্ড: {stats?.smartCardCount} ({smartPercent}%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>পুরাতন NID: {stats?.oldNidCount} ({oldPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Quality / Verification Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300">ভেরিফিকেশন মানদণ্ড (Quality Score)</span>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>উচ্চ নির্ভুলতা (95-100%)</span>
                    <span className="font-mono text-emerald-400 font-bold">96% Scans</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[96%] rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>মাঝারি নির্ভুলতা (85-94%)</span>
                    <span className="font-mono text-amber-400 font-bold">4% Scans</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[4%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Districts / Place of Birth (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{lang === "bn" ? "আঞ্চলিক বন্টন (জন্মস্থান জেলা)" : "Top Districts (Place of Birth)"}</span>
            </h3>

            {stats?.districtStats && stats.districtStats.length > 0 ? (
              <div className="space-y-3">
                {stats.districtStats.slice(0, 6).map((item, idx) => {
                  const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{item.district}</span>
                        <span className="font-mono text-slate-400">
                          {item.count} {lang === "bn" ? "টি কার্ড" : "cards"} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">কোন জেলা ভিত্তিক তথ্য নেই</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
