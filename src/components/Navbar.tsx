import React from "react";
import { ViewMode } from "../types.js";
import {
  Scan,
  Database,
  BarChart3,
  Code2,
  Layers,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  recordCount: number;
  hasApiKey: boolean;
  lang: "bn" | "en";
  onToggleLang: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  recordCount,
  lang,
  onToggleLang,
  theme = "dark",
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14">
          {/* Left: Icon-only Logo */}
          <div
            id="nav-logo"
            onClick={() => onViewChange("scanner")}
            title="BD NID AI Scanner - Home"
            className="flex items-center cursor-pointer group flex-shrink-0"
          >
            <img
              src="https://res.cloudinary.com/dxyt6zr4m/image/upload/v1787228329/icon_qyd6kw.png"
              alt="BD NID AI Scanner"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-all"
            />
          </div>

          {/* Center / Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90 shadow-inner">
            {/* DataSheet Tab */}
            <button
              id="nav-tab-datasheet"
              onClick={() => onViewChange("datasheet")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentView === "datasheet"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-900/50"
                  : "text-blue-300 hover:text-white hover:bg-blue-950/40"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>DataSheet</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal">
                Excel
              </span>
            </button>

            {/* AI Scanner Tab */}
            <button
              id="nav-tab-scanner"
              onClick={() => onViewChange("scanner")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "scanner"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "স্ক্যানার" : "AI Scanner"}</span>
            </button>

            {/* NotePad (Expense Tracker) - Positioned Right Side of AI Scanner */}
            <button
              id="nav-tab-notepad"
              onClick={() => onViewChange("notepad")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "notepad"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-900/50"
                  : "text-rose-300 hover:text-white hover:bg-rose-950/40"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === "bn" ? "নোটপ্যাড (হিসাব)" : "NotePad"}</span>
            </button>

            {/* Database Dashboard Tab */}
            <button
              id="nav-tab-dashboard"
              onClick={() => onViewChange("dashboard")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "dashboard"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ডাটাবেস ড্যাশবোর্ড" : "Database"}</span>
              {recordCount > 0 && (
                <span className="ml-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                  {recordCount}
                </span>
              )}
            </button>


            {/* Analytics Tab */}
            <button
              id="nav-tab-analytics"
              onClick={() => onViewChange("analytics")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "analytics"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "অ্যানালিটিক্স" : "Analytics"}</span>
            </button>

            {/* Database & Supabase / API Tab */}
            <button
              id="nav-tab-php-api"
              onClick={() => onViewChange("php-api")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "php-api"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "bn" ? "Supabase / API" : "Supabase & API"}</span>
            </button>

            {/* Sample Templates Tab */}
            <button
              id="nav-tab-templates"
              onClick={() => onViewChange("templates")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "templates"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "bn" ? "নমুনা কার্ড" : "Sample Cards"}</span>
            </button>
          </nav>


          {/* Right Actions: AI Status, Lang Switcher & Dark/White Toggle */}
          <div className="flex items-center space-x-2">
            {/* Gemini AI Status Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="font-medium">Gemini 3.7</span>
            </div>

            {/* Language Toggle */}
            <button
              id="btn-lang-toggle"
              type="button"
              onClick={onToggleLang}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Toggle Language / ভাষা পরিবর্তন"
            >
              {lang === "bn" ? "English" : "বাংলা"}
            </button>

            {/* Dark / Light Mode Toggle Switch */}
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center shadow-sm active:scale-95"
              title={
                theme === "dark"
                  ? lang === "bn"
                    ? "লাইট মোড চালু করুন"
                    : "Switch to Light Mode"
                  : lang === "bn"
                  ? "ডার্ক মোড চালু করুন"
                  : "Switch to Dark Mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scrollbar */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-1.5 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => onViewChange("datasheet")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              currentView === "datasheet"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-blue-300 bg-blue-950/30"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>DataSheet</span>
          </button>

          <button
            onClick={() => onViewChange("scanner")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "scanner"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "স্ক্যানার" : "Scanner"}</span>
          </button>

          <button
            onClick={() => onViewChange("notepad")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "notepad"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-300 bg-rose-950/30"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "নোটপ্যাড (হিসাব)" : "NotePad"}</span>
          </button>


          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "dashboard"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? `ডাটাবেস (${recordCount})` : `Records (${recordCount})`}</span>
          </button>

          <button
            onClick={() => onViewChange("analytics")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "analytics"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "অ্যানালিটিক্স" : "Analytics"}</span>
          </button>

          <button
            onClick={() => onViewChange("php-api")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "php-api"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PHP API</span>
          </button>

          <button
            onClick={() => onViewChange("templates")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === "templates"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "নমুনা" : "Samples"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
