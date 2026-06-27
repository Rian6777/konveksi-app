import { useNavigate } from "react-router-dom";
import { AlertTriangle, Link2, Check } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { Card, StatCard, EmptyNote } from "../components/Card";
import StatusPill from "../components/StatusPill";
import ProgressBar from "../components/ProgressBar";
import { ListSkeleton } from "../components/Skeleton";
import { useMaterials } from "../hooks/useMaterials";
import { useOrders } from "../hooks/useOrders";
import { RUST, THREAD, INK } from "../utils/constants";
import { formatQueueNumber, getProgressForStatus, getStepInfo, isLate } from "../utils/production";
import { buildTrackingLink, copyToClipboard, formatDate } from "../utils/helpers";
import type { Order } from "../utils/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { materials, loading: loadingMaterials } = useMaterials();
  const { orders, loading: loadingOrders } = useOrders();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = useCallback(async (orderId: string) => {
    const ok = await copyToClipboard(buildTrackingLink(orderId));
    if (ok) {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }, []);

  if (loadingMaterials || loadingOrders) {
    return <ListSkeleton count={4} />;
  }

  const pending = orders.filter((o) => o.status === "pending").length;
  const proses = orders.filter((o) => o.status === "proses").length;
  const selesai = orders.filter((o) => o.status === "selesai").length;
  const lowStock = materials.filter((m) => Number(m.stock) <= Number(m.minStock || 0));
  const activeOrders = orders.filter((o) => o.status !== "selesai").slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label="Total bahan baku" value={materials.length} accent={THREAD} />
        <StatCard label="Pesanan Pending" value={pending} accent="#B45309" />
        <StatCard label="Pesanan Proses" value={proses} accent={RUST} />
        <StatCard label="Pesanan Selesai" value={selesai} accent="#3F6342" />
      </div>

      <StatCard label="Jumlah stok menipis" value={lowStock.length} accent={lowStock.length > 0 ? RUST : THREAD} />

      <Card title="Bahan yang menipis" accentBorder={lowStock.length > 0} onClick={() => navigate("/bahan-baku")}>
        {lowStock.length === 0 ? (
          <EmptyNote text="Aman — semua bahan masih di atas batas minimum." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lowStock.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} color={RUST} strokeWidth={2.25} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                </div>
                <span style={{ fontSize: 13, color: RUST, fontWeight: 700 }}>
                  {m.stock} {m.unit} tersisa
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: `${INK}70`,
            marginBottom: 10,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Pesanan Aktif
        </div>
        {activeOrders.length === 0 ? (
          <div
            style={{
              background: "#FFFDF8",
              borderRadius: 16,
              padding: 18,
              border: `1.5px solid ${INK}15`,
            }}
          >
            <EmptyNote text="Belum ada pesanan yang berjalan." />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeOrders.map((o) => (
              <DashboardOrderCard
                key={o.id}
                order={o}
                copied={copiedId === o.id}
                onCopyLink={() => handleCopyLink(o.id)}
                onClickTracking={() => navigate(`/tracking/${o.id}`)}
              />
            ))}
          </div>
        )}
        {orders.filter((o) => o.status !== "selesai").length > 6 && (
          <button
            onClick={() => navigate("/pesanan")}
            style={{
              marginTop: 8,
              width: "100%",
              background: "transparent",
              border: `1.5px solid ${INK}25`,
              borderRadius: 10,
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 13,
              color: INK,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Lihat semua pesanan
          </button>
        )}
      </div>
    </div>
  );
}

const DashboardOrderCard = memo(function DashboardOrderCard({
  order: o,
  copied,
  onCopyLink,
  onClickTracking,
}: {
  order: Order;
  copied: boolean;
  onCopyLink: () => void;
  onClickTracking: () => void;
}) {
  const late = isLate(o.estimasiSelesai, o.status);
  const step = getStepInfo(o.productionStep);

  return (
    <div
      style={{
        background: "#FFFDF8",
        border: `1.5px solid ${late ? RUST + "50" : INK + "15"}`,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {o.images[0] ? (
          <img
            src={o.images[0]}
            alt={o.productName}
            loading="lazy"
            style={{ width: 48, height: 48, borderRadius: 9, objectFit: "cover", flexShrink: 0, border: `1px solid ${INK}15` }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 9,
              background: `${INK}10`,
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: THREAD, background: `${THREAD}12`, borderRadius: 6, padding: "1px 6px" }}>
              {formatQueueNumber(o.queueNumber)}
            </span>
            {late && (
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: RUST, borderRadius: 6, padding: "1px 6px" }}>
                Terlambat
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14.5, fontFamily: "'Space Grotesk', sans-serif", marginTop: 1 }}>{o.customerName}</div>
          <div style={{ fontSize: 12.5, color: `${INK}80` }}>
            {o.productName} · {o.qty} pcs
          </div>
        </div>
        <StatusPill status={o.status} />
      </div>

      {o.status === "proses" && (
        <div style={{ marginTop: 10 }}>
          <ProgressBar progress={getProgressForStatus(o.status, o.productionStep)} label={step.label} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ fontSize: 11.5, color: `${INK}60` }}>
          {o.estimasiSelesai ? `Estimasi ${formatDate(o.estimasiSelesai)}` : "Belum ada estimasi"}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={onCopyLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: copied ? "#E8F0E3" : `${THREAD}12`,
              color: copied ? "#3F6342" : THREAD,
              border: "none",
              borderRadius: 7,
              padding: "5px 9px",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {copied ? <Check size={11} /> : <Link2 size={11} />}
          </button>
          <button
            onClick={onClickTracking}
            style={{
              background: INK,
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "5px 10px",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Tracking
          </button>
        </div>
      </div>
    </div>
  );
});
