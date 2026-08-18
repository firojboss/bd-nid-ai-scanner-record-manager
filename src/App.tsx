import React, { useState, useEffect } from "react";
import { ViewMode, NIDRecord } from "./types.js";
import { Navbar } from "./components/Navbar.js";
import { ScannerView } from "./components/Scanner/ScannerView.js";
import { RecordsDashboard } from "./components/Dashboard/RecordsDashboard.js";
import { AnalyticsView } from "./components/Analytics/AnalyticsView.js";
import { PhpIntegrationHub } from "./components/PhpIntegration/PhpIntegrationHub.js";
import { SampleTemplatesView } from "./components/SampleTemplates/SampleTemplatesView.js";
import { DataSheetView } from "./components/DataSheet/DataSheetView.js";
import { NotePadView } from "./components/NotePad/NotePadView.js";
import { LiveClientIntelligenceFooter } from "./components/Footer/LiveClientIntelligenceFooter.js";
import { SampleNID } from "./utils/sampleData.js";
import { ShieldCheck, Heart } from "lucide-react";

export default function App() {

  const [currentView, setCurrentView] = useState<ViewMode>("scanner");
  const [recordCount, setRecordCount] = useState<number>(3);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("bd_nid_theme");
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      return "dark";
    }
  });
  const [selectedSample, setSelectedSample] = useState<SampleNID | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("bd_nid_theme", theme);
    } catch {}
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Fetch initial record count & health
  const refreshRecordCount = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setRecordCount(data.stats.totalRecords);
      }
    } catch (err) {
      console.error("Health check error:", err);
    }
  };

  useEffect(() => {
    refreshRecordCount();
  }, []);

  const handleRecordSaved = (record: NIDRecord) => {
    setRecordCount((prev) => prev + 1);
  };

  const handleSelectSample = (sample: SampleNID) => {
    setSelectedSample(sample);
    setCurrentView("scanner");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== "scanner") setSelectedSample(null);
        }}
        recordCount={recordCount}
        hasApiKey={hasApiKey}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === "bn" ? "en" : "bn"))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === "notepad" && (
          <NotePadView lang={lang} />
        )}

        {currentView === "datasheet" && (
          <DataSheetView
            lang={lang}
            onNavigateToScanner={() => setCurrentView("scanner")}
          />
        )}


        {currentView === "scanner" && (
          <ScannerView
            onRecordSaved={handleRecordSaved}
            lang={lang}
            initialSampleToScan={selectedSample}
          />
        )}

        {currentView === "dashboard" && (
          <RecordsDashboard
            onScanNew={() => setCurrentView("scanner")}
            lang={lang}
          />
        )}

        {currentView === "analytics" && <AnalyticsView lang={lang} />}

        {currentView === "php-api" && <PhpIntegrationHub lang={lang} />}

        {currentView === "templates" && (
          <SampleTemplatesView onSelectSample={handleSelectSample} lang={lang} />
        )}
      </main>

      {/* Live Client Intelligence & BDT Time Footer */}
      <LiveClientIntelligenceFooter lang={lang} />
    </div>
  );
}
