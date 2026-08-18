import React, { useState } from "react";
import { NIDRecord, CardType, RecordStatus } from "../../types.js";
import { BD_DISTRICTS, BLOOD_GROUPS } from "../../utils/nidHelpers.js";
import { X, Save, AlertCircle } from "lucide-react";

interface EditRecordModalProps {
  record: NIDRecord | null;
  onClose: () => void;
  onSave: (updatedRecord: NIDRecord) => void;
  lang: "bn" | "en";
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  onClose,
  onSave,
  lang,
}) => {
  if (!record) return null;

  const [nameBangla, setNameBangla] = useState(record.nameBangla || "");
  const [nameEnglish, setNameEnglish] = useState(record.nameEnglish || "");
  const [fatherName, setFatherName] = useState(record.fatherName || "");
  const [motherName, setMotherName] = useState(record.motherName || "");
  const [spouseName, setSpouseName] = useState(record.spouseName || "");
  const [dateOfBirth, setDateOfBirth] = useState(record.dateOfBirth || "");
  const [nidNumber, setNidNumber] = useState(record.nidNumber || "");
  const [placeOfBirth, setPlaceOfBirth] = useState(record.placeOfBirth || "");
  const [bloodGroup, setBloodGroup] = useState(record.bloodGroup || "");
  const [addressBangla, setAddressBangla] = useState(record.addressBangla || "");
  const [cardType, setCardType] = useState<CardType>(record.cardType || "smart_card");
  const [status, setStatus] = useState<RecordStatus>(record.status || "verified");
  const [notes, setNotes] = useState(record.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidNumber || !nameBangla) {
      setError(lang === "bn" ? "এনআইডি ও নাম বাধ্যতামূলক!" : "NID and Name are required!");
      return;
    }

    setIsSaving(true);
    setError(null);

    const updated: NIDRecord = {
      ...record,
      nameBangla,
      nameEnglish,
      fatherName,
      motherName,
      spouseName: spouseName || undefined,
      dateOfBirth,
      nidNumber,
      placeOfBirth,
      bloodGroup,
      addressBangla,
      cardType,
      status,
      notes,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/records/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.record) {
        onSave(data.record);
        onClose();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <h3 className="text-base font-bold text-white">
            {lang === "bn" ? "এনআইডি রেকর্ড সম্পাদনা" : "Edit NID Record"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">নাম (বাংলা) *</label>
              <input
                type="text"
                value={nameBangla}
                onChange={(e) => setNameBangla(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Name (English)</label>
              <input
                type="text"
                value={nameEnglish}
                onChange={(e) => setNameEnglish(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">পিতার নাম</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">মাতার নাম</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">এনআইডি নম্বর *</label>
              <input
                type="text"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-rose-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">জন্ম তারিখ</label>
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">জন্মস্থান (জেলা)</label>
              <input
                type="text"
                list="edit-districts"
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              />
              <datalist id="edit-districts">
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">রক্তের গ্রুপ</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="">নির্বাচন করুন</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">ঠিকানা</label>
              <textarea
                rows={2}
                value={addressBangla}
                onChange={(e) => setAddressBangla(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">কার্ডের ধরণ</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="smart_card">স্মার্ট এনআইডি কার্ড (১০ ডিজিট)</option>
                <option value="old_laminated">পুরাতন লেমিনেটেড (১৩/১৭ ডিজিট)</option>
                <option value="server_copy">অনলাইন সার্ভার কপি</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="verified">ভেরিফাইড (Verified)</option>
                <option value="pending_review">পর্যালোচনাধীন (Pending)</option>
                <option value="flagged">সন্দেহজনক (Flagged)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">অ্যাডমিন মন্তব্য / নোট</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "আপডেট সেভ করুন"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
