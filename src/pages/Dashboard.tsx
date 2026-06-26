import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card, StatCard, EmptyNote } from "../components/Card";
import StatusPill from "../components/StatusPill";
import { useMaterials } from "../hooks/useMaterials";
import { useOrders } from "../hooks/useOrders";
import { RUST, THREAD, INK } from "../utils/constants";
import { Scissors } from "lucide-react";
import { PAPER } from "../utils/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const { materials, loading: loadingMaterials } = useMaterials();
  const { orders, loading: loadingOrders } = useOrders();

  if (loadingMaterials || loadingOrders) {
    return <LoadingNote />;
  }

  const pending = orders.filter((o) => o.status === "pending").length;
  const proses = orders.filter((o) => o.status === "proses").length;
  const selesai = orders.filter((o) => o.status === "selesai").length;
  const lowStock = materials.filter((m) => Number(m.stock) <= Number(m.minStock || 0));

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

      <Card title="Pesanan aktif" onClick={() => navigate("/pesanan")}>
        {orders.filter((o) => o.status !== "selesai").length === 0 ? (
          <EmptyNote text="Belum ada pesanan yang berjalan." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders
              .filter((o) => o.status !== "selesai")
              .slice(0, 4)
              .map((o) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{o.customerName}</div>
                    <div style={{ fontSize: 12.5, color: `${INK}80` }}>{o.productName}</div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LoadingNote() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: INK,
        fontFamily: "'Space Grotesk', sans-serif",
        background: PAPER,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Scissors size={28} className="spin-slow" style={{ marginBottom: 10 }} />
        <div>Memuat data…</div>
      </div>
    </div>
  );
}
