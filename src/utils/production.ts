import type { ProductionStep } from "./types";

export const PRODUCTION_STEPS: { key: ProductionStep; label: string; progress: number }[] = [
  { key: "menunggu", label: "Menunggu Antrian", progress: 5 },
  { key: "potong", label: "Pemotongan Kain", progress: 20 },
  { key: "jahit", label: "Menjahit", progress: 45 },
  { key: "obras", label: "Obras", progress: 60 },
  { key: "qc", label: "Quality Control", progress: 80 },
  { key: "packing", label: "Packing", progress: 95 },
  { key: "siap", label: "Siap Diambil", progress: 100 },
];

export function getStepInfo(step: ProductionStep | undefined) {
  return PRODUCTION_STEPS.find((s) => s.key === step) || PRODUCTION_STEPS[0];
}

export function getProgressForStatus(status: string, step?: ProductionStep) {
  if (status === "selesai") return 100;
  if (status === "pending") return 0;
  return getStepInfo(step).progress;
}

/** Sisa hari sampai estimasi selesai. Negatif berarti sudah lewat (terlambat). */
export function daysRemaining(estimasiSelesai?: string): number | null {
  if (!estimasiSelesai) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(estimasiSelesai);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isLate(estimasiSelesai: string | undefined, status: string): boolean {
  if (!estimasiSelesai || status === "selesai") return false;
  const remaining = daysRemaining(estimasiSelesai);
  return remaining !== null && remaining < 0;
}

export function formatQueueNumber(n: number | undefined | null): string {
  if (!n || n < 1) return "—";
  return "#" + String(n).padStart(3, "0");
}
