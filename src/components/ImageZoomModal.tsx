import { X } from "lucide-react";

export default function ImageZoomModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>
      <img
        src={url}
        alt="Pratinjau foto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 8, objectFit: "contain" }}
      />
    </div>
  );
}
