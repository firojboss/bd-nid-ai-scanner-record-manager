import { SiteDefinition } from "../types.js";

export const PRESET_SITES: SiteDefinition[] = [
  {
    id: "1xbet",
    name: "1xBet",
    logo: "https://www.google.com/s2/favicons?domain=1xbet.com&sz=64",
    color: "#1877F2",
    badgeBg: "bg-blue-950 text-blue-400 border-blue-500/40",
    category: "betting",
  },
  {
    id: "linebet",
    name: "Linebet",
    logo: "https://www.google.com/s2/favicons?domain=linebet.com&sz=64",
    color: "#00A859",
    badgeBg: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    category: "betting",
  },
  {
    id: "melbet",
    name: "Melbet",
    logo: "https://www.google.com/s2/favicons?domain=melbet.com&sz=64",
    color: "#F3A100",
    badgeBg: "bg-amber-950 text-amber-400 border-amber-500/40",
    category: "betting",
  },
  {
    id: "paripesa",
    name: "PariPesa",
    logo: "https://www.google.com/s2/favicons?domain=paripesa.com&sz=64",
    color: "#005BAA",
    badgeBg: "bg-sky-950 text-sky-400 border-sky-500/40",
    category: "betting",
  },
  {
    id: "megapari",
    name: "MegaPari",
    logo: "https://www.google.com/s2/favicons?domain=megapari.com&sz=64",
    color: "#E60000",
    badgeBg: "bg-red-950 text-red-400 border-red-500/40",
    category: "betting",
  },
  {
    id: "betlabel",
    name: "BetLabel",
    logo: "https://www.google.com/s2/favicons?domain=betlabel.com&sz=64",
    color: "#6366F1",
    badgeBg: "bg-indigo-950 text-indigo-400 border-indigo-500/40",
    category: "betting",
  },
  {
    id: "22bet",
    name: "22Bet",
    logo: "https://www.google.com/s2/favicons?domain=22bet.com&sz=64",
    color: "#008B8B",
    badgeBg: "bg-teal-950 text-teal-400 border-teal-500/40",
    category: "betting",
  },
  {
    id: "betwinner",
    name: "Betwinner",
    logo: "https://www.google.com/s2/favicons?domain=betwinner.com&sz=64",
    color: "#2E7D32",
    badgeBg: "bg-green-950 text-green-400 border-green-500/40",
    category: "betting",
  },
  {
    id: "winwin",
    name: "WinWin",
    logo: "https://www.google.com/s2/favicons?domain=winwin.bet&sz=64",
    color: "#FF9800",
    badgeBg: "bg-orange-950 text-orange-400 border-orange-500/40",
    category: "betting",
  },
  {
    id: "888starz",
    name: "888Starz",
    logo: "https://www.google.com/s2/favicons?domain=888starz.bet&sz=64",
    color: "#E50914",
    badgeBg: "bg-rose-950 text-rose-400 border-rose-500/40",
    category: "betting",
  },
  {
    id: "xparibet",
    name: "Xparibet",
    logo: "https://www.google.com/s2/favicons?domain=xparibet.com&sz=64",
    color: "#7C3AED",
    badgeBg: "bg-purple-950 text-purple-400 border-purple-500/40",
    category: "betting",
  },
  {
    id: "planbet",
    name: "PlanBet",
    logo: "https://www.google.com/s2/favicons?domain=planbet.com&sz=64",
    color: "#0284C7",
    badgeBg: "bg-cyan-950 text-cyan-400 border-cyan-500/40",
    category: "betting",
  },
  {
    id: "wowbet",
    name: "WowBet",
    logo: "https://www.google.com/s2/favicons?domain=wowbet.com&sz=64",
    color: "#EC4899",
    badgeBg: "bg-pink-950 text-pink-400 border-pink-500/40",
    category: "betting",
  },
  {
    id: "lilbet",
    name: "LiLbet",
    logo: "https://www.google.com/s2/favicons?domain=lilbet.com&sz=64",
    color: "#8B5CF6",
    badgeBg: "bg-violet-950 text-violet-400 border-violet-500/40",
    category: "betting",
  },
  {
    id: "coldbet",
    name: "Coldbet",
    logo: "https://www.google.com/s2/favicons?domain=coldbet.com&sz=64",
    color: "#38BDF8",
    badgeBg: "bg-blue-950 text-blue-300 border-blue-400/40",
    category: "betting",
  },
  {
    id: "dbbet",
    name: "DBBET",
    logo: "https://www.google.com/s2/favicons?domain=dbbet.com&sz=64",
    color: "#F59E0B",
    badgeBg: "bg-amber-950 text-yellow-300 border-yellow-500/40",
    category: "betting",
  },
];

export function getSiteById(siteId: string): SiteDefinition {
  const found = PRESET_SITES.find((s) => s.id === siteId);
  if (found) return found;
  return {
    id: siteId || "other",
    name: siteId ? siteId.charAt(0).toUpperCase() + siteId.slice(1) : "Other Site",
    logo: "",
    color: "#94a3b8",
    badgeBg: "bg-slate-800 text-slate-300 border-slate-700",
    category: "other",
  };
}

export function generateRandomSecretKey(length: number = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDisableKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}==`;
}

export function generatePassword(length: number = 8): string {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const special = "@#$%";
  
  let pwd = "";
  pwd += letters.charAt(Math.floor(Math.random() * letters.length));
  pwd += upper.charAt(Math.floor(Math.random() * upper.length));
  pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pwd += special.charAt(Math.floor(Math.random() * special.length));
  
  const all = letters + upper + numbers + special;
  for (let i = pwd.length; i < length; i++) {
    pwd += all.charAt(Math.floor(Math.random() * all.length));
  }
  return pwd.split("").sort(() => 0.5 - Math.random()).join("");
}

export function formatCurrentTimestamp(d: Date = new Date()): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const month = map.month || "01";
    const day = map.day || "01";
    const year = map.year || "2026";
    const hour = map.hour || "12";
    const minute = map.minute || "00";
    const second = map.second || "00";
    const dayPeriod = (map.dayPeriod || "pm").toLowerCase();

    return `${month}/${day}/${year} - ${hour}:${minute}:${second} ${dayPeriod}`;
  } catch {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
  }
}
