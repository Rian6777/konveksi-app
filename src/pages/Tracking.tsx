import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Scissors, Package, AlertCircle } from "lucide-react";
import GlobalStyle from "../components/GlobalStyle";
import StatusPill from "../components/StatusPill";
import { getOrderPublic } from "../firebase/ordersService";
import { INK, PAPER, THREAD } from "../utils/constants";
import { formatDate } from "../utils/helpers";
import type { Order } from "../utils/types";

export default function Tracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const result = await getOrderPublic(orderId);
      setOrder(result);
    })();
  }, [orderId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        fontFamily: "'Inter', sans-serif",
        color: INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <GlobalStyle />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-4deg)",
              marginBottom: 12,
            }}
          >
            <Scissors size={22} color={PAPER} strokeWidth={2.25} />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
            Lacak Pesanan
          </h1>
        </div>

        {order === undefined && (
          <div style={{ textAlign: "center", color: `${INK}70`, padding: "40px 0" }}>
            <Scissors size={26} className="spin-slow" style={{ marginBottom: 10 }} />
            <div>Memuat data pesanan…</div>
          </div>
        )}

        {order === null && (
          <div
            style={{
              background: "#FFFDF8",
              border: `1.5px solid ${INK}15`,
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
            }}
          >
            <AlertCircle size={28} color={INK} style={{ opacity: 0.5, marginBottom: 10 }} />
            <p style={{ fontSize: 14, color: `${INK}80`, margin: 0 }}>
              Pesanan tidak ditemukan. Periksa kembali link tracking yang Anda terima.
            </p>
          </div>
        )}

        {order && (
          <div
            style={{
              background: "#FFFDF8",
              border: `1.5px solid ${INK}15`,
              borderRadius: 16,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={16} color={THREAD} strokeWidth={2.25} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: `${INK}70`, letterSpacing: 0.4 }}>
                  {order.id}
                </span>
              </div>
              <StatusPill status={order.status} />
            </div>

            <div style={{ height: 1, background: `${INK}15` }} />

            <Field label="Nama Pelanggan" value={order.customerName} />
            <Field label="Nama Produk" value={order.productName} />
            <Field label="Jumlah" value={`${order.qty} pcs`} />
            <Field label="Estimasi Selesai" value={order.estimasiSelesai ? formatDate(order.estimasiSelesai) : "Belum ditentukan"} />
            {order.notes && <Field label="Catatan" value={order.notes} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: `${INK}60` }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
