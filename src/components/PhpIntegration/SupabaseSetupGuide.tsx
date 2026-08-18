import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  RefreshCw,
  Table,
  Lock,
  Radio,
  FileCode,
} from "lucide-react";
import { SUPABASE_SQL_SETUP } from "../../utils/supabaseSql.js";

interface SupabaseSetupGuideProps {
  lang: "bn" | "en";
}

export const SupabaseSetupGuide: React.FC<SupabaseSetupGuideProps> = ({ lang }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [testUrl, setTestUrl] = useState<string>("");
  const [testKey, setTestKey] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    connected?: boolean;
    message?: string;
    error?: string;
    hint?: string;
  } | null>(null);

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/supabase/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl.trim(), key: testKey.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        connected: false,
        error: err?.message || "Connection test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            Supabase Cloud PostgreSQL
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">
            Recommended
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === "bn"
            ? "Supabase ডাটাবেজ ইন্টিগ্রেশন ও কানেকশন গাইড"
            : "Supabase Database Integration & Setup Guide"}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {lang === "bn"
            ? "Supabase হলো PostgreSQL এর একটি শক্তিশালী ক্লাউড প্লাটফর্ম। মাত্র ৩টি সহজ ধাপে আপনার BD NID স্ক্যানার ও মাল্টি-সাইট ডাটাশিট ক্লাউড ডাটাবেজের সাথে পারফেক্টভাবে কানেক্ট করুন।"
            : "Supabase provides an instant, production-ready managed PostgreSQL database with real-time sync. Follow these 3 simple steps to connect your BD NID Scanner & Multi-site DataSheet."}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
          >
            <span>{lang === "bn" ? "Supabase ড্যাশবোর্ডে যান" : "Open Supabase Dashboard"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3 Simple Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
            ১
          </div>
          <h3 className="font-bold text-sm text-white">
            {lang === "bn" ? "১. প্রজেক্ট তৈরি করুন" : "1. Create Free Project"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === "bn"
              ? "supabase.com এ ফ্রিতে সাইনআপ করে একটি New Project তৈরি করুন (Region দিন Singapore / Mumbai)।"
              : "Sign in at supabase.com and create a new project (select Singapore or Mumbai region for lowest latency)."}
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
            ২
          </div>
          <h3 className="font-bold text-sm text-white">
            {lang === "bn" ? "২. SQL Schema রান করুন" : "2. Run SQL Schema"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === "bn"
              ? "Supabase-এর বাম পাশের 'SQL Editor'-এ গিয়ে নিচের প্রস্তুতকৃত SQL কোডটি পেস্ট করে 'Run' বাটনে ক্লিক করুন।"
              : "Navigate to 'SQL Editor' in your Supabase dashboard, paste the SQL schema below, and click 'Run'."}
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
            ৩
          </div>
          <h3 className="font-bold text-sm text-white">
            {lang === "bn" ? "৩. API কী দিন" : "3. Add URL & Key"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === "bn"
              ? "Project Settings -> API থেকে Project URL এবং anon/service_role key কপি করে কানেকশন টেস্ট করুন।"
              : "Copy Project URL and API Keys from Project Settings -> API and test your connection below."}
          </p>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {lang === "bn"
                ? "Supabase SQL Schema (bd_nid_records & bd_datasheet_accounts)"
                : "Supabase SQL Schema (Tables + Indices + RLS Policies)"}
            </span>
          </div>

          <button
            onClick={copySql}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{lang === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "সম্পূর্ণ SQL কপি করুন" : "Copy SQL Script"}</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-6 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed max-h-[340px] scrollbar-thin">
          <code>{SUPABASE_SQL_SETUP}</code>
        </pre>
      </div>

      {/* Connection Test Tool */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-white">
            {lang === "bn" ? "লাইভ Supabase কানেকশন টেস্ট টুল" : "Live Supabase Connection Tester"}
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          {lang === "bn"
            ? "আপনার Supabase প্রজেক্টের URL এবং anon key দিয়ে কানেকশন পরীক্ষা করে দেখতে পারেন:"
            : "Enter your Supabase credentials to verify if the tables and policies are working correctly:"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Supabase Anon / Service Role Key
            </label>
            <input
              type="password"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !testUrl || !testKey}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === "bn" ? "কানেক্ট পরীক্ষা হচ্ছে..." : "Testing..."}</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>{lang === "bn" ? "কানেকশন টেস্ট করুন" : "Test Connection"}</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-3 ${
              testResult.connected
                ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-300"
                : "bg-red-950/60 border border-red-500/50 text-red-300"
            }`}
          >
            <div className="flex items-center space-x-2 font-bold">
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>
                {testResult.connected
                  ? lang === "bn"
                    ? "সফলভাবে কানেক্ট হয়েছে!"
                    : "Connection Successful!"
                  : lang === "bn"
                  ? "কানেকশনে সমস্যা হয়েছে"
                  : "Connection Failed"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {testResult.message || testResult.error}
            </p>
            {testResult.hint && (
              <p className="text-[11px] text-amber-300">💡 {testResult.hint}</p>
            )}

            {testResult.connected && (
              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between">
                <span className="text-[11px] text-emerald-200">
                  {lang === "bn"
                    ? "বিদ্যমান সকল এনআইডি রেকর্ড ও ডাটাশিট অ্যাকাউন্ট ক্লাউডে সিঙ্ক করতে চান?"
                    : "Want to push all local NID records and DataSheet rows to Supabase right now?"}
                </span>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/supabase/sync-all", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        alert(data.message);
                      } else {
                        alert("Sync error: " + data.error);
                      }
                    } catch (e: any) {
                      alert("Sync failed: " + e?.message);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  {lang === "bn" ? "১-ক্লিকে সব ডাটা সিঙ্ক করুন" : "1-Click Sync All Data"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
