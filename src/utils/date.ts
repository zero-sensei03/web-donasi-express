import { Request } from "express";

/**
 * Mendapatkan Timezone IANA (contoh: "Asia/Jakarta", "America/New_York") dari Request Header/IP.
 * Default ke "UTC" jika tidak terdeteksi.
 */
export const getTimezoneFromReq = (req: Request): string => {
  // 1. Cek jika frontend mengirimkan Timezone via Custom Header
  const clientTz = req.headers["x-timezone"] as string;
  if (clientTz) return clientTz;

  // 2. Cek header Vercel / Cloudflare IP Geolocation (jika dideploy di cloud)
  const cfTz = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-timezone"];
  if (typeof cfTz === "string" && cfTz) return cfTz;

  return "UTC";
};

/**
 * Memformat DateTime sesuai dengan timezone client
 */
export const formatDate = (
  date: Date | string,
  timeZone: string = "UTC",
  locale: string = "en-US"
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(d);
};

export const formatDateTime = (
  date: Date | string,
  timeZone: string = "UTC",
  locale: string = "en-US"
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(d);
};

export const formatDateTimeYMDHIS = (
  date: Date | string,
  timeZone: string = "UTC"
): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23", // Memaksa format 24 jam (00-23)
    timeZone,
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "00";

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");
  const minute = getPart("minute");
  const second = getPart("second");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > new Date(expiryDate);
};