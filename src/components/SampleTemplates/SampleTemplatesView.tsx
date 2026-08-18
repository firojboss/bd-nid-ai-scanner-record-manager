import React from "react";
import { SAMPLE_NID_LIST, SampleNID } from "../../utils/sampleData.js";
import { CreditCard, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface SampleTemplatesViewProps {
  onSelectSample: (sample: SampleNID) => void;
  lang: "bn" | "en";
}

export const SampleTemplatesView: React.FC<SampleTemplatesViewProps> = ({
  onSelectSample,
  lang,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/30 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Ready-to-Scan Sample Cards
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {lang === "bn"
            ? "পরীক্ষামূলক ডেমো এনআইডি কার্ড সমূহ"
            : "Sample Demo Bangladesh NID Cards"}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
          {lang === "bn"
            ? "যদি আপনার কাছে এখন কোনো এনআইডি কার্ডের ছবি না থাকে, নিচের যেকোনো ডেমো কার্ড বেছে নিয়ে এক ক্লিকে এআই স্ক্যান ও ড্যাশবোর্ড সেভিং টেস্ট করতে পারেন।"
            : "If you don't have a physical NID card ready, pick any of these sample Bangladesh Smart or Laminated cards to test the Gemini OCR scanner and database verification in one click."}
        </p>
      </div>

      {/* Grid of sample cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_NID_LIST.map((sample) => (
          <div
            key={sample.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden p-5 space-y-4 shadow-xl flex flex-col justify-between group transition-all"
          >
            <div className="space-y-3">
              {/* Card Image Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[16/10] border border-slate-800 p-2 flex items-center justify-center">
                {sample.frontImage && sample.frontImage.trim() !== "" ? (
                  <img
                    src={sample.frontImage}
                    alt={sample.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-600">No preview</div>
                )}
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/90 text-slate-300 border border-slate-700">
                  {sample.cardType === "smart_card" ? "Smart Card (10 Digits)" : "Old NID (17 Digits)"}
                </span>
              </div>

              {/* Title & Info */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {lang === "bn" ? sample.titleBn : sample.title}
                </h3>
                <p className="text-xs text-slate-400">{sample.subtitle}</p>
              </div>

              {/* Specs */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">নাম:</span>
                  <span className="font-semibold text-white">{sample.data.nameBangla}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NID NO:</span>
                  <span className="font-mono text-rose-400 font-bold">{sample.data.nidNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DOB:</span>
                  <span className="font-mono text-amber-300">{sample.data.dateOfBirth}</span>
                </div>
              </div>
            </div>

            {/* Select & Scan Button */}
            <button
              onClick={() => onSelectSample(sample)}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{lang === "bn" ? "এই কার্ডটি এআই স্ক্যানারে লোড করুন" : "Load into AI Scanner"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
