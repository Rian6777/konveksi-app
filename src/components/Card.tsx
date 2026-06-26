import type { ReactNode } from "react";
import { INK, PAPER_DARK, RUST } from "../utils/constants";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: PAPER_DARK,
        borderRadius: 14,
        padding: "16px 16px",
        border: `1.5px solid ${INK}18`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: accent }} />
      <div style={{ fontSize: 12, fontWeight: 700, color: `${INK}80`, marginBottom: 6, letterSpacing: 0.2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export function Card({
  title,
  children,
  onClick,
  accentBorder,
}: {
  title: string;
  children: ReactNode;
  onClick?: () => void;
  accentBorder?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFDF8",
        borderRadius: 16,
        padding: 18,
        border: `1.5px solid ${accentBorder ? RUST + "55" : INK + "15"}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: `${INK}70`,
          marginBottom: 12,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function EmptyNote({ text }: { text: string }) {
  return <div style={{ fontSize: 13.5, color: `${INK}70`, fontStyle: "italic" }}>{text}</div>;
}
