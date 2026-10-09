import { StatusGizi } from "@/types";

export interface StatusGiziMeta {
  enumValue: StatusGizi;
  label: "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Stunting";
  chartHex: string;
  badgeBg: string;
  badgeText: string;
  badgeFullClass: string;
  deskripsi: string;
}

/**
 * Single Source of Truth Token Desain & Status Gizi
 * Sesuai aturan terkunci AGENTS.md Bagian 1.D
 */
export const STATUS_GIZI_MAP: Record<StatusGizi, StatusGiziMeta> = {
  normal: {
    enumValue: "normal",
    label: "Normal",
    chartHex: "#368364",
    badgeBg: "#eaf5ec",
    badgeText: "#0d472c",
    badgeFullClass:
      "bg-[#eaf5ec] dark:bg-emerald-950/40 text-[#0d472c] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40",
    deskripsi: "Pertumbuhan dan proporsi berat serta tinggi badan optimal sesuai kurva WHO.",
  },
  gizi_kurang: {
    enumValue: "gizi_kurang",
    label: "Gizi Kurang",
    chartHex: "#FFEA00",
    badgeBg: "#fef6dc",
    badgeText: "#b45309",
    badgeFullClass:
      "bg-[#fef6dc] dark:bg-[#332b00] text-[#b45309] dark:text-[#fde047] border border-amber-200/60 dark:border-amber-900/40",
    deskripsi: "Berat badan berada di bawah rentang standar (-2 SD s/d -3 SD). Perlu evaluasi nutrisi & MP-ASI.",
  },
  gizi_buruk: {
    enumValue: "gizi_buruk",
    label: "Gizi Buruk",
    chartHex: "#FFA382",
    badgeBg: "#fff0eb",
    badgeText: "#c2410c",
    badgeFullClass:
      "bg-[#fff0eb] dark:bg-[#3a1d17] text-[#c2410c] dark:text-[#FFA382] border border-orange-200/60 dark:border-orange-950/40",
    deskripsi: "Kondisi sangat kurus (Severely Wasted < -3 SD). Wajib segera dirujuk ke Puskesmas.",
  },
  stunting: {
    enumValue: "stunting",
    label: "Stunting",
    chartHex: "#ef4444",
    badgeBg: "#fde8e8",
    badgeText: "#a81a1a",
    badgeFullClass:
      "bg-[#fde8e8] dark:bg-[#3b1212] text-[#a81a1a] dark:text-[#f87171] border border-rose-200/60 dark:border-rose-950/40",
    deskripsi: "Tinggi badan balita berada di bawah standar umur (< -2 SD). Berisiko gangguan kognitif dini.",
  },
};

/**
 * Format angka Z-Score numerik ke string standar tampilan medis ("-2.03 SD" / "+1.25 SD")
 */
export function formatZScore(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0.00 SD";
  const num = typeof val === "number" ? val : parseFloat(String(val));
  const formatted = num.toFixed(2);
  return num > 0 ? `+${formatted} SD` : `${formatted} SD`;
}

/**
 * Parsing string Z-Score seperti "-3.1 SD" ke desimal numerik murni (-3.10)
 */
export function parseZScore(val: string | number | null | undefined): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Pemetaan enum database ke teks tampilan TitleCase
 */
export function mapDbStatusToDisplay(
  status: StatusGizi | string,
): "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Stunting" {
  const normalized = String(status).toLowerCase().trim();
  if (normalized === "stunting") return "Stunting";
  if (normalized === "gizi_buruk" || normalized === "gizi buruk") return "Gizi Buruk";
  if (normalized === "gizi_kurang" || normalized === "gizi kurang") return "Gizi Kurang";
  return "Normal";
}

/**
 * Pemetaan teks tampilan TitleCase ke enum database
 */
export function mapDisplayStatusToDb(display: string): StatusGizi {
  const normalized = display.toLowerCase().trim();
  if (normalized === "stunting") return "stunting";
  if (normalized.includes("buruk")) return "gizi_buruk";
  if (normalized.includes("kurang")) return "gizi_kurang";
  return "normal";
}

/**
 * Masking NIK untuk privasi orang tua (UU PDP: 3201••••••••0001)
 */
export function maskNIK(nik: string | null | undefined): string {
  if (!nik) return "••••••••••••••••";
  const clean = nik.trim();
  if (clean.length < 8) return clean;
  const prefix = clean.substring(0, 4);
  const suffix = clean.substring(clean.length - 4);
  const dots = "•".repeat(Math.max(4, clean.length - 8));
  return `${prefix}${dots}${suffix}`;
}
