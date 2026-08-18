// Comprehensive Client, Network, ISP, IP & Device Intelligence Engine

export interface ClientIntelligence {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  flag: string;
  isp: string;
  org: string;
  asn: string;
  deviceModel: string;
  deviceType: "mobile" | "tablet" | "desktop" | "smarttv" | "unknown";
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  screenResolution: string;
  devicePixelRatio: number;
  isTouchScreen: boolean;
  cpuCores: number;
  deviceMemoryGb?: number;
  connectionType?: string;
  downlinkMbps?: number;
  rttMs?: number;
  pingLatencyMs?: number;
  userAgentRaw: string;
  timezone: string;
  loading: boolean;
  error?: string | null;
}

export function parseUserAgentDetailed(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): {
  deviceModel: string;
  deviceType: "mobile" | "tablet" | "desktop" | "smarttv" | "unknown";
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
} {
  let deviceType: "mobile" | "tablet" | "desktop" | "smarttv" | "unknown" = "desktop";
  let osName = "Unknown OS";
  let osVersion = "";
  let deviceModel = "Unknown Device";
  let browserName = "Unknown Browser";
  let browserVersion = "";

  // 1. Detect OS
  if (/Windows NT 10.0/i.test(ua)) {
    osName = "Windows";
    osVersion = "11 / 10";
    deviceModel = "Windows PC";
    deviceType = "desktop";
  } else if (/Windows NT 6.3/i.test(ua)) {
    osName = "Windows";
    osVersion = "8.1";
    deviceModel = "Windows PC";
    deviceType = "desktop";
  } else if (/Windows NT 6.1/i.test(ua)) {
    osName = "Windows";
    osVersion = "7";
    deviceModel = "Windows PC";
    deviceType = "desktop";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    osName = "macOS";
    const macVerMatch = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/i);
    if (macVerMatch) {
      const ver = macVerMatch[1].replace(/_/g, ".");
      osVersion = ver;
      if (ver.startsWith("14")) osName = "macOS Sonoma";
      else if (ver.startsWith("13")) osName = "macOS Ventura";
      else if (ver.startsWith("12")) osName = "macOS Monterey";
      else if (ver.startsWith("11")) osName = "macOS Big Sur";
    }
    deviceModel = "MacBook / iMac";
    deviceType = "desktop";
  } else if (/iPad/i.test(ua)) {
    osName = "iPadOS";
    const iosVer = ua.match(/OS (\d+[._]\d+)/i);
    osVersion = iosVer ? iosVer[1].replace(/_/g, ".") : "";
    deviceModel = "Apple iPad";
    deviceType = "tablet";
  } else if (/iPhone/i.test(ua)) {
    osName = "iOS";
    const iosVer = ua.match(/OS (\d+[._]\d+)/i);
    osVersion = iosVer ? iosVer[1].replace(/_/g, ".") : "";
    
    // Estimate iPhone Model by screen / ua
    if (typeof window !== "undefined") {
      const w = window.screen.width;
      const h = window.screen.height;
      const dpr = window.devicePixelRatio || 1;
      if ((w === 393 && h === 852) || (w === 430 && h === 932)) {
        deviceModel = "iPhone 15 / 14 Pro";
      } else if (w === 390 && h === 844) {
        deviceModel = "iPhone 14 / 13 / 12";
      } else if (w === 428 && h === 926) {
        deviceModel = "iPhone 14 Plus / 13 Pro Max";
      } else {
        deviceModel = "Apple iPhone";
      }
    } else {
      deviceModel = "Apple iPhone";
    }
    deviceType = "mobile";
  } else if (/Android/i.test(ua)) {
    osName = "Android";
    const andVer = ua.match(/Android\s+([0-9.]+)/i);
    osVersion = andVer ? andVer[1] : "";
    
    // Extract Android Phone Model
    const modelMatch = ua.match(/;\s*([A-Za-z0-9\s_-]+)\s+Build\//i);
    if (modelMatch && modelMatch[1]) {
      const rawModel = modelMatch[1].trim();
      if (/SM-S928/i.test(rawModel)) deviceModel = "Samsung Galaxy S24 Ultra";
      else if (/SM-S926/i.test(rawModel)) deviceModel = "Samsung Galaxy S24+";
      else if (/SM-S921/i.test(rawModel)) deviceModel = "Samsung Galaxy S24";
      else if (/SM-S918/i.test(rawModel)) deviceModel = "Samsung Galaxy S23 Ultra";
      else if (/SM-A546/i.test(rawModel)) deviceModel = "Samsung Galaxy A54";
      else if (/SM-A346/i.test(rawModel)) deviceModel = "Samsung Galaxy A34";
      else if (/SM-A/i.test(rawModel) || /SM-G/i.test(rawModel) || /SM-M/i.test(rawModel)) deviceModel = `Samsung ${rawModel}`;
      else if (/Pixel\s+(\d+[a-zA-Z\s]*)/i.test(rawModel)) deviceModel = `Google ${rawModel}`;
      else if (/Redmi/i.test(rawModel)) deviceModel = `Xiaomi ${rawModel}`;
      else if (/M2\d{3}|22\d{3}|23\d{3}/i.test(rawModel)) deviceModel = `Xiaomi/Redmi (${rawModel})`;
      else if (/CPH\d{4}/i.test(rawModel)) deviceModel = `Oppo (${rawModel})`;
      else if (/V2\d{3}/i.test(rawModel)) deviceModel = `Vivo (${rawModel})`;
      else if (/RMX\d{4}/i.test(rawModel)) deviceModel = `Realme (${rawModel})`;
      else deviceModel = rawModel;
    } else {
      deviceModel = "Android Phone";
    }

    if (/Tablet|Tab/i.test(ua)) {
      deviceType = "tablet";
    } else {
      deviceType = "mobile";
    }
  } else if (/CrOS/i.test(ua)) {
    osName = "Chrome OS";
    deviceModel = "Chromebook";
    deviceType = "desktop";
  } else if (/Linux/i.test(ua)) {
    osName = "Linux";
    if (/Ubuntu/i.test(ua)) osName = "Ubuntu Linux";
    deviceModel = "Linux PC";
    deviceType = "desktop";
  }

  // 2. Detect Browser
  if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    browserName = "Samsung Internet";
    const m = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/Edg\/([0-9.]+)/i.test(ua) || /Edge\/([0-9.]+)/i.test(ua)) {
    browserName = "Microsoft Edge";
    const m = ua.match(/Edg(?:e)?\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/OPR\/([0-9.]+)/i.test(ua) || /Opera/i.test(ua)) {
    browserName = "Opera";
    const m = ua.match(/OPR\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/Brave/i.test(ua) || ((navigator as any)?.brave && typeof (navigator as any).brave.isBrave === "function")) {
    browserName = "Brave Browser";
    const m = ua.match(/Chrome\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browserName = "Google Chrome";
    const m = ua.match(/Chrome\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browserName = "Mozilla Firefox";
    const m = ua.match(/Firefox\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    browserName = "Apple Safari";
    const m = ua.match(/Version\/([0-9.]+)/i);
    browserVersion = m ? m[1] : "";
  }

  return {
    deviceModel,
    deviceType,
    osName,
    osVersion,
    browserName,
    browserVersion,
  };
}

/**
 * Fetches real Client IP, Geolocation, and ISP details with multi-source fallback
 */
export async function detectFullClientIntelligence(): Promise<ClientIntelligence> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaParsed = parseUserAgentDetailed(ua);

  // Modern User-Agent Client Hints (Chromium high-entropy values)
  if (typeof navigator !== "undefined" && (navigator as any).userAgentData?.getHighEntropyValues) {
    try {
      const hints = await (navigator as any).userAgentData.getHighEntropyValues([
        "model",
        "platform",
        "platformVersion",
        "architecture",
      ]);
      if (hints.model && hints.model.trim() !== "") {
        uaParsed.deviceModel = hints.model;
      }
      if (hints.platform) {
        if (hints.platform === "Windows") {
          const major = parseInt(hints.platformVersion?.split(".")[0] || "0", 10);
          uaParsed.osName = major >= 13 ? "Windows 11" : "Windows 10";
          uaParsed.osVersion = hints.platformVersion || "";
          uaParsed.deviceModel = `Windows PC (${hints.architecture || "x64"})`;
        } else if (hints.platform === "macOS") {
          uaParsed.osName = "macOS";
          uaParsed.deviceModel = `Mac (${hints.architecture || "ARM64"})`;
        }
      }
    } catch {}
  }

  // Screen and Hardware specs
  const screenResolution = typeof window !== "undefined"
    ? `${window.screen.width} × ${window.screen.height}`
    : "1920 × 1080";
  const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const isTouchScreen = typeof window !== "undefined"
    ? "ontouchstart" in window || navigator.maxTouchPoints > 0
    : false;
  const cpuCores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const deviceMemoryGb = typeof navigator !== "undefined" ? (navigator as any).deviceMemory : undefined;

  // Network connection info
  let connectionType: string | undefined = undefined;
  let downlinkMbps: number | undefined = undefined;
  let rttMs: number | undefined = undefined;

  if (typeof navigator !== "undefined" && (navigator as any).connection) {
    const conn = (navigator as any).connection;
    connectionType = conn.effectiveType || conn.type;
    downlinkMbps = conn.downlink;
    rttMs = conn.rtt;
  }

  // Measure live server ping
  let pingLatencyMs: number | undefined = undefined;
  const pingStart = Date.now();
  try {
    const pingRes = await fetch("/api/health", { method: "GET", cache: "no-store" });
    if (pingRes.ok) {
      pingLatencyMs = Date.now() - pingStart;
    }
  } catch {}

  // Multi-tier IP, Location, and ISP detection
  let ip = "127.0.0.1";
  let city = "Dhaka";
  let region = "Dhaka Division";
  let country = "Bangladesh";
  let countryCode = "BD";
  let flag = "🇧🇩";
  let isp = "Internet Service Provider";
  let org = "Local ISP";
  let asn = "AS24389";
  let timezone = "Asia/Dhaka (BDT)";

  let fetchSuccess = false;

  // Attempt 1: ipwho.is (Detailed ISP, ASN, City, Region, Country)
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && data.ip) {
        ip = data.ip;
        city = data.city || city;
        region = data.region || region;
        country = data.country || country;
        countryCode = data.country_code || countryCode;
        flag = data.flag?.emoji || (countryCode === "BD" ? "🇧🇩" : "🌐");
        isp = data.connection?.isp || data.connection?.org || isp;
        org = data.connection?.org || org;
        asn = data.connection?.asn ? `AS${data.connection.asn}` : asn;
        timezone = data.timezone?.id ? `${data.timezone.id} (${data.timezone.abbr || "BDT"})` : timezone;
        fetchSuccess = true;
      }
    }
  } catch (err) {
    console.warn("ipwho.is failed, trying secondary resolver...", err);
  }

  // Attempt 2: ipapi.co (Fallback)
  if (!fetchSuccess) {
    try {
      const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          ip = data.ip;
          city = data.city || city;
          region = data.region || region;
          country = data.country_name || country;
          countryCode = data.country_code || countryCode;
          flag = countryCode === "BD" ? "🇧🇩" : "🌐";
          isp = data.org || data.asn || isp;
          org = data.org || org;
          asn = data.asn || asn;
          timezone = data.timezone || timezone;
          fetchSuccess = true;
        }
      }
    } catch (err) {
      console.warn("ipapi.co failed, trying backend resolver...", err);
    }
  }

  // Attempt 3: Backend /api/client-info
  if (!fetchSuccess) {
    try {
      const res = await fetch("/api/client-info", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.clientIp && data.clientIp !== "::1" && data.clientIp !== "127.0.0.1") {
          ip = data.clientIp;
        }
      }
    } catch {}
  }

  return {
    ip,
    city,
    region,
    country,
    countryCode,
    flag,
    isp,
    org,
    asn,
    deviceModel: uaParsed.deviceModel,
    deviceType: uaParsed.deviceType,
    osName: uaParsed.osName,
    osVersion: uaParsed.osVersion,
    browserName: uaParsed.browserName,
    browserVersion: uaParsed.browserVersion,
    screenResolution,
    devicePixelRatio,
    isTouchScreen,
    cpuCores,
    deviceMemoryGb,
    connectionType,
    downlinkMbps,
    rttMs,
    pingLatencyMs,
    userAgentRaw: ua,
    timezone,
    loading: false,
  };
}
