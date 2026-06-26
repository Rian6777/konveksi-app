import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { INK, RUST, PAPER_DARK } from "../utils/constants";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: `${INK}99`,
        marginBottom: 6,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </label>
  );
}

export function IconBtn({
  onClick,
  icon: Icon,
  danger,
}: {
  onClick: () => void;
  icon: LucideIcon;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: `1.5px solid ${danger ? RUST + "40" : INK + "20"}`,
        background: "transparent",
        color: danger ? RUST : INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Icon size={14} strokeWidth={2.25} />
    </button>
  );
}

export function StepBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1.5px solid ${INK}30`,
        background: PAPER_DARK,
        fontSize: 17,
        fontWeight: 700,
        color: INK,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}
