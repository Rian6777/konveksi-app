import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import type { CSSProperties } from "react";
import type { OrderStatus } from "./types";

export const INK = "#2B2622";
export const PAPER = "#F6F0E4";
export const PAPER_DARK = "#EDE3CF";
export const RUST = "#B5502F";
export const THREAD = "#1D4E5F";

export const STATUS: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: { label: "Pending", color: "#B45309", bg: "#FEF3E2", icon: Clock },
  proses: { label: "Proses", color: "#1D4E5F", bg: "#E3EEF0", icon: Loader2 },
  selesai: { label: "Selesai", color: "#3F6342", bg: "#E8F0E3", icon: CheckCircle2 },
};

export const UNITS = ["meter", "kg", "pcs", "roll", "yard", "gram"];

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${INK}25`,
  background: PAPER,
  color: INK,
  fontSize: 14.5,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
