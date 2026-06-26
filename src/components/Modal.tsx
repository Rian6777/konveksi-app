import type { ReactNode } from "react";
import { X } from "lucide-react";
import { INK, PAPER } from "../utils/constants";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,38,34,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: PAPER,
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "20px 20px 0 0",
          border: `2px solid ${INK}`,
          borderBottom: "none",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.2)",
          animation: "slideUp 0.22s ease-out",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: PAPER,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: `2px dashed ${INK}30`,
          }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 21,
              fontWeight: 600,
              color: INK,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: INK,
              color: PAPER,
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
