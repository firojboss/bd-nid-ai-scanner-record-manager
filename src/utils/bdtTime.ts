// Bangladesh Standard Time (BDT, UTC+6 / Asia/Dhaka) Utilities

/**
 * Returns formatted BDT (Asia/Dhaka, UTC+6) date & time string:
 * Format: MM/DD/YYYY - hh:mm:ss am/pm
 */
export function formatBDTDate(date: Date = new Date()): string {
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
  const parts = formatter.formatToParts(date);
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
}

/**
 * Returns a live BDT Clock object with time, seconds, day, date, and timezone metadata
 */
export function getLiveBDTClock(date: Date = new Date()) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const bnDateFormatter = new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    timeString: timeFormatter.format(date),
    dateStringEn: dateFormatter.format(date),
    dateStringBn: bnDateFormatter.format(date),
    timezone: "BDT (UTC+6)",
    city: "Dhaka, Bangladesh",
    isoString: date.toISOString(),
  };
}
