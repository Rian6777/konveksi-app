import { AlertTriangle } from "lucide-react";
import { INK, PAPER, RUST } from "../utils/constants";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
  danger = true,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,38,34,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: PAPER,
          borderRadius: 16,
          border: `2px solid ${INK}`,
          padding: 22,
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: danger ? `${RUST}18` : `${INK}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <AlertTriangle size={20} color={danger ? RUST : INK} strokeWidth={2.25} />
        </div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: "0 0 6px" }}>
          {title}
        </h3>
        <p style={{ fontSize: 13.5, color: `${INK}80`, margin: "0 0 18px" }}>{message}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: `1.5px solid ${INK}30`,
              background: "transparent",
              color: INK,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: danger ? RUST : INK,
              color: PAPER,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
