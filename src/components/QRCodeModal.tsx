import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, X, Loader2 } from "lucide-react";
import { INK, PAPER, THREAD } from "../utils/constants";
import { buildTrackingLink } from "../utils/helpers";

export default function QRCodeModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const link = buildTrackingLink(orderId);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(link, { width: 320, margin: 1, color: { dark: "#2B2622", light: "#F6F0E4" } })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [link]);

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-tracking-${orderId}.png`;
    a.click();
  }

  function handlePrint() {
    if (!dataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR Tracking ${orderId}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <img src="${dataUrl}" style="width:320px;height:320px;" />
          <p style="font-weight:700;margin-top:12px;">${orderId}</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,38,34,0.5)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: 0 }}>QR Tracking</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: INK }}>
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            width: 220,
            height: 220,
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFDF8",
            borderRadius: 12,
            border: `1.5px solid ${INK}15`,
          }}
        >
          {error && <span style={{ fontSize: 13, color: `${INK}70` }}>Gagal membuat QR.</span>}
          {!error && !dataUrl && <Loader2 className="spin-slow" size={24} color={THREAD} />}
          {dataUrl && <img src={dataUrl} alt="QR Tracking" style={{ width: 200, height: 200 }} />}
        </div>

        <div style={{ fontSize: 11.5, color: `${INK}60`, marginBottom: 16, wordBreak: "break-all" }}>{link}</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 0",
              borderRadius: 10,
              border: `1.5px solid ${INK}25`,
              background: "transparent",
              color: INK,
              fontWeight: 700,
              fontSize: 13,
              cursor: dataUrl ? "pointer" : "default",
              opacity: dataUrl ? 1 : 0.5,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Download size={14} /> Unduh
          </button>
          <button
            onClick={handlePrint}
            disabled={!dataUrl}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: INK,
              color: PAPER,
              fontWeight: 700,
              fontSize: 13,
              cursor: dataUrl ? "pointer" : "default",
              opacity: dataUrl ? 1 : 0.5,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
