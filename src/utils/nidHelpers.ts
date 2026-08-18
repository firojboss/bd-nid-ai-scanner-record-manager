export const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর", "কক্সবাজার", "ব্রাহ্মণবাড়িয়া",
  "নোয়াখালী", "বগুড়া", "পাবনা", "দিনাজপুর", "যশোর", "কুষ্টিয়া", "পটুয়াখালী", "ভোলা",
  "কিশোরগঞ্জ", "মানিকগঞ্জ", "মুন্সীগঞ্জ", "নরসিংদী", "শরীয়তপুর", "মাদারীপুর", "গোপালগঞ্জ",
  "রাজবাড়ী", "জামালপুর", "নেত্রকোণা", "শেরপুর", "চাঁদপুর", "ফেনী", "লক্ষ্মীপুর",
  "খাগড়াছড়ি", "রাঙ্গামাটি", "বান্দরবান", "সিরাজগঞ্জ", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ",
  "জয়পুরহাট", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও",
  "বাগেরহাট", "চুয়াডাঙ্গা", "ঝিনাইদহ", "মাগুরা", "মেহেরপুর", "নড়াইল", "সাতক্ষীরা",
  "বরগুনা", "ঝালকাঠি", "পিরোজপুর", "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ"
];

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

export function validateNIDNumber(nid: string): { isValid: boolean; type: 'smart' | 'old_13' | 'old_17' | 'invalid'; message: string } {
  const clean = nid.replace(/\D/g, "");
  if (clean.length === 10) {
    return { isValid: true, type: 'smart', message: "বৈধ স্মার্ট কার্ড (১০ ডিজিট)" };
  } else if (clean.length === 13) {
    return { isValid: true, type: 'old_13', message: "বৈধ পুরাতন এনআইডি (১৩ ডিজিট)" };
  } else if (clean.length === 17) {
    return { isValid: true, type: 'old_17', message: "বৈধ পুরাতন এনআইডি (১৭ ডিজিট - জন্মসাল যুক্ত)" };
  } else if (clean.length === 0) {
    return { isValid: false, type: 'invalid', message: "এনআইডি নম্বর দেওয়া হয়নি" };
  } else {
    return { isValid: false, type: 'invalid', message: `অস্বাভাবিক ডিজিট সংখ্যা (${clean.length} ডিজিট)` };
  }
}

export function formatBanglaDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const monthsBangla = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
      ];
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${monthsBangla[monthIdx]} ${year}`;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getAccuracyColor(accuracy: number): { text: string; bg: string; border: string; label: string } {
  if (accuracy >= 95) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      label: "উচ্চ নির্ভুলতা (High Accuracy)",
    };
  } else if (accuracy >= 85) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      label: "মাঝারি নির্ভুলতা (Good Match)",
    };
  } else {
    return {
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      label: "পর্যালোচনা প্রয়োজন (Review Needed)",
    };
  }
}

export function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        data: result,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = (error) => reject(error);
  });
}
