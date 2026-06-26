import { INK, PAPER } from "../utils/constants";
import type { LucideIcon } from "lucide-react";

interface TabProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export default function Tab({ active, onClick, icon: Icon, label }: TabProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        border: `1.5px solid ${active ? INK : "transparent"}`,
        background: active ? INK : "transparent",
        color: active ? PAPER : INK,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={16} strokeWidth={2.25} />
      {label}
    </button>
  );
}
