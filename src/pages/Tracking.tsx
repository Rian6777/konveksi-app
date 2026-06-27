import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Scissors, Package, AlertCircle, Users, Hash, Calendar, CheckCircle2 } from "lucide-react";
import GlobalStyle from "../components/GlobalStyle";
import StatusPill from "../components/StatusPill";
import ProgressBar from "../components/ProgressBar";
import Timeline from "../components/Timeline";
import ImageZoomModal from "../components/ImageZoomModal";
import { getOrderPublic } from "../firebase/ordersService";
import { INK, PAPER, THREAD, RUST } from "../utils/constants";
import { formatDate } from "../utils/helpers";
import { formatQueueNumber, getProgressForStatus, getStepInfo, daysRemaining, isLate } from "../utils/production";
import type { Order } from "../utils/types";

type LoadState = "loading" | "notfound" | "error" | "ready";

export default function Tracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setState("loading");
    (async () => {
      try {
        const result = await getOrderPublic(orderId);
        if (cancelled) return;
        if (!result) {
          setState("notfound");
        } else {
          setOrder(result);
          setState("ready");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const remaining = order ? daysRemaining(order.estimasiSelesai) : null;
  const late = order ? isLate(order.estimasiSelesai, order.status) : false;
  const step = order ? getStepInfo(order.productionStep) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        fontFamily: "'Inter', sans-serif",
        color: INK,
        padding: "24px 16px 40px",
      }}
    >
      <GlobalStyle />
      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
        {/* Header / Logo UMKM */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-4deg)",
              marginBottom: 10,
            }}
          >
            <Scissors size={22} color={PAPER} strokeWidth={2.25} />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 600, margin: 0 }}>Buku Konveksi</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: `${INK}70` }}>Lacak status pesanan Anda</p>
        </div>

        {state === "loading" && (
          <div style={{ textAlign: "center", color: `${INK}70`, padding: "50px 0" }}>
            <Scissors size={26} className="spin-slow" style={{ marginBottom: 10 }} />
            <div>Memuat data pesanan…</div>
          </div>
        )}

        {state === "error" && (
          <StateCard
            icon={<AlertCircle size={28} color={RUST} style={{ marginBottom: 10 }} />}
            text="Gagal memuat data pesanan. Periksa koneksi internet Anda dan coba muat ulang halaman."
          />
        )}

        {state === "notfound" && (
          <StateCard
            icon={<AlertCircle size={28} color={INK} style={{ opacity: 0.5, marginBottom: 10 }} />}
            text="Pesanan tidak ditemukan. Periksa kembali link tracking yang Anda terima."
          />
        )}

        {state === "ready" && order && step && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s ease" }}>
            {/* Kartu utama */}
            <div
              style={{
                background: "#FFFDF8",
                border: `1.5px solid ${INK}15`,
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Hash size={13} color={THREAD} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: `${INK}70` }}>{order.id}</span>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 800,
                      color: THREAD,
                      background: `${THREAD}12`,
                      borderRadius: 7,
                      padding: "3px 10px",
                    }}
                  >
                    Antrian {formatQueueNumber(order.queueNumber)}
                  </div>
                </div>
                <StatusPill status={order.status} />
              </div>

              {late && (
                <div
                  style={{
                    marginTop: 12,
                    background: `${RUST}12`,
                    border: `1.5px solid ${RUST}40`,
                    color: RUST,
                    borderRadius: 9,
                    padding: "8px 12px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <AlertCircle size={14} /> Terlambat dari estimasi selesai
                </div>
              )}

              <div style={{ height: 1, background: `${INK}12`, margin: "16px 0" }} />

              <Field icon={<Users size={14} color={THREAD} />} label="Nama Pelanggan" value={order.customerName} />
              <Field icon={<Package size={14} color={THREAD} />} label="Produk" value={`${order.productName} · ${order.qty} pcs`} />
              <Field
                icon={<Calendar size={14} color={THREAD} />}
                label="Estimasi Selesai"
                value={
                  order.estimasiSelesai
                    ? `${formatDate(order.estimasiSelesai)}${
                        remaining !== null && order.status !== "selesai"
                          ? remaining >= 0
                            ? ` (${remaining} hari lagi)`
                            : ` (lewat ${Math.abs(remaining)} hari)`
                          : ""
                      }`
                    : "Belum ditentukan"
                }
              />
              {order.notes && <Field icon={<CheckCircle2 size={14} color={THREAD} />} label="Catatan" value={order.notes} />}
            </div>

            {/* Progress produksi */}
            {order.status !== "pending" && (
              <div
                style={{
                  background: "#FFFDF8",
                  border: `1.5px solid ${INK}15`,
                  borderRadius: 18,
                  padding: 20,
                }}
              >
                <SectionTitle>Progres Produksi</SectionTitle>
                <div style={{ marginBottom: 4 }}>
                  <ProgressBar progress={getProgressForStatus(order.status, order.productionStep)} label={step.label} />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div
              style={{
                background: "#FFFDF8",
                border: `1.5px solid ${INK}15`,
                borderRadius: 18,
                padding: 20,
              }}
            >
              <SectionTitle>Riwayat Pesanan</SectionTitle>
              <Timeline history={order.history} />
            </div>

            {/* Foto produk */}
            {order.images.length > 0 && (
              <div
                style={{
                  background: "#FFFDF8",
                  border: `1.5px solid ${INK}15`,
                  borderRadius: 18,
                  padding: 20,
                }}
              >
                <SectionTitle>Foto Produk</SectionTitle>
                <PhotoGrid images={order.images} onZoom={setZoomUrl} />
              </div>
            )}

            {/* Foto hasil jadi */}
            {order.status === "selesai" && order.finishedImages.length > 0 && (
              <div
                style={{
                  background: "#E8F0E3",
                  border: `1.5px solid #3F634230`,
                  borderRadius: 18,
                  padding: 20,
                }}
              >
                <SectionTitle color="#3F6342">Foto Hasil Jadi</SectionTitle>
                <PhotoGrid images={order.finishedImages} onZoom={setZoomUrl} />
              </div>
            )}
          </div>
        )}
      </div>

      {zoomUrl && <ImageZoomModal url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
}

function StateCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        background: "#FFFDF8",
        border: `1.5px solid ${INK}15`,
        borderRadius: 16,
        padding: 28,
        textAlign: "center",
      }}
    >
      {icon}
      <p style={{ fontSize: 14, color: `${INK}80`, margin: 0 }}>{text}</p>
    </div>
  );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: color || `${INK}70`,
        marginBottom: 14,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: `${INK}55` }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      </div>
    </div>
  );
}

function PhotoGrid({ images, onZoom }: { images: string[]; onZoom: (url: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {images.map((url) => (
        <img
          key={url}
          src={url}
          alt="Foto pesanan"
          loading="lazy"
          onClick={() => onZoom(url)}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: 10,
            border: `1px solid ${INK}15`,
            cursor: "zoom-in",
          }}
        />
      ))}
    </div>
  );
}
