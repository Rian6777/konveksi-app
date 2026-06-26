import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, Package, Link2, Check } from "lucide-react";
import Modal from "../components/Modal";
import StatusPill from "../components/StatusPill";
import { FieldLabel, IconBtn } from "../components/FormElements";
import { useOrders } from "../hooks/useOrders";
import { useCustomers } from "../hooks/useCustomers";
import { INK, PAPER, RUST, THREAD, inputStyle } from "../utils/constants";
import { formatDate, todayISO, buildTrackingLink, copyToClipboard } from "../utils/helpers";
import type { Order, OrderStatus } from "../utils/types";

const FILTERS: { key: "semua" | OrderStatus; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "proses", label: "Proses" },
  { key: "selesai", label: "Selesai" },
];

export default function OrdersPage() {
  const { orders, loading, create, update, remove, cycleStatus } = useOrders();
  const { customers, loading: loadingCustomers } = useCustomers();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading || loadingCustomers) return null;

  const filtered = orders
    .filter((o) => filter === "semua" || o.status === filter)
    .filter(
      (o) =>
        o.customerName.toLowerCase().includes(query.toLowerCase()) ||
        o.productName.toLowerCase().includes(query.toLowerCase()) ||
        o.id.toLowerCase().includes(query.toLowerCase())
    );

  async function handleSave(data: Omit<Order, "id" | "ownerId">) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditing(null);
  }

  async function handleCopyLink(orderId: string) {
    const ok = await copyToClipboard(buildTrackingLink(orderId));
    if (ok) {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: `${INK}60` }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pelanggan, produk, atau no. pesanan…"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          disabled={customers.length === 0}
          title={customers.length === 0 ? "Tambahkan pelanggan terlebih dahulu" : undefined}
          style={{
            background: RUST,
            color: PAPER,
            border: "none",
            borderRadius: 8,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            fontSize: 14,
            cursor: customers.length === 0 ? "not-allowed" : "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            opacity: customers.length === 0 ? 0.5 : 1,
          }}
        >
          <Plus size={17} strokeWidth={2.5} />
          Pesanan
        </button>
      </div>

      {customers.length === 0 && (
        <div style={{ fontSize: 12.5, color: `${INK}70`, fontStyle: "italic" }}>
          Tambahkan pelanggan di menu Pelanggan sebelum membuat pesanan.
        </div>
      )}

      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 13px",
              borderRadius: 999,
              border: `1.5px solid ${INK}25`,
              background: filter === f.key ? INK : "transparent",
              color: filter === f.key ? PAPER : INK,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: `${INK}60` }}>
          <Package size={32} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>
            {orders.length === 0 ? "Belum ada pesanan. Catat pesanan pertama." : "Tidak ada yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#FFFDF8",
                border: `1.5px solid ${INK}15`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: `${INK}55`, letterSpacing: 0.4 }}>
                    {o.id}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>
                    {o.customerName}
                  </div>
                  <div style={{ fontSize: 13.5, color: `${INK}85`, marginTop: 1 }}>
                    {o.productName} · {o.qty} pcs
                  </div>
                  <div style={{ fontSize: 12, color: `${INK}60`, marginTop: 4 }}>
                    Masuk {formatDate(o.tanggalMasuk)}
                    {o.estimasiSelesai && ` · Estimasi ${formatDate(o.estimasiSelesai)}`}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <button onClick={() => cycleStatus(o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <StatusPill status={o.status} />
                  </button>
                  <div style={{ display: "flex", gap: 6 }}>
                    <IconBtn onClick={() => { setEditing(o); setShowForm(true); }} icon={Pencil} />
                    <IconBtn onClick={() => remove(o.id)} icon={Trash2} danger />
                  </div>
                </div>
              </div>

              {o.notes && (
                <>
                  <div style={{ height: 8 }} />
                  <div style={{ fontSize: 13, color: `${INK}75`, fontStyle: "italic" }}>&ldquo;{o.notes}&rdquo;</div>
                </>
              )}

              <div style={{ height: 10 }} />
              <button
                onClick={() => handleCopyLink(o.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: copiedId === o.id ? "#E8F0E3" : THREAD + "12",
                  color: copiedId === o.id ? "#3F6342" : THREAD,
                  border: `1.5px solid ${copiedId === o.id ? "#3F634240" : THREAD + "30"}`,
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {copiedId === o.id ? <Check size={14} strokeWidth={2.5} /> : <Link2 size={14} strokeWidth={2.5} />}
                {copiedId === o.id ? "Link tracking disalin!" : "Copy Tracking Link"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OrderForm
          initial={editing}
          customers={customers}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function OrderForm({
  initial,
  customers,
  onSave,
  onClose,
}: {
  initial: Order | null;
  customers: { id: string; name: string; phone: string }[];
  onSave: (data: Omit<Order, "id" | "ownerId">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? {
          customerId: initial.customerId,
          productName: initial.productName,
          qty: initial.qty,
          status: initial.status,
          tanggalMasuk: initial.tanggalMasuk,
          estimasiSelesai: initial.estimasiSelesai,
          notes: initial.notes,
        }
      : {
          customerId: customers[0]?.id || "",
          productName: "",
          qty: 1,
          status: "pending" as OrderStatus,
          tanggalMasuk: todayISO(),
          estimasiSelesai: "",
          notes: "",
        }
  );

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer || !form.productName.trim()) return;
    onSave({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      productName: form.productName,
      qty: Number(form.qty) || 1,
      status: form.status,
      tanggalMasuk: form.tanggalMasuk || todayISO(),
      estimasiSelesai: form.estimasiSelesai,
      notes: form.notes,
    });
  }

  return (
    <Modal title={initial ? "Ubah Pesanan" : "Pesanan Baru"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {initial && (
          <div>
            <FieldLabel>Nomor Pesanan</FieldLabel>
            <div
              style={{
                ...inputStyle,
                background: "#EDE3CF",
                fontWeight: 700,
                color: `${INK}90`,
              }}
            >
              {initial.id}
            </div>
          </div>
        )}
        <div>
          <FieldLabel>Pelanggan</FieldLabel>
          <select
            style={inputStyle}
            value={form.customerId}
            onChange={(e) => update("customerId", e.target.value)}
            required
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Nama produk</FieldLabel>
          <input
            style={inputStyle}
            value={form.productName}
            onChange={(e) => update("productName", e.target.value)}
            placeholder="cth. Kaos seragam panitia"
            required
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Jumlah (pcs)</FieldLabel>
            <input
              type="number"
              min="1"
              style={inputStyle}
              value={form.qty}
              onChange={(e) => update("qty", Number(e.target.value) as any)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Status</FieldLabel>
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => update("status", e.target.value as OrderStatus)}
            >
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Tanggal masuk</FieldLabel>
            <input
              type="date"
              style={inputStyle}
              value={form.tanggalMasuk}
              onChange={(e) => update("tanggalMasuk", e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Estimasi selesai</FieldLabel>
            <input
              type="date"
              style={inputStyle}
              value={form.estimasiSelesai}
              onChange={(e) => update("estimasiSelesai", e.target.value)}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Catatan (opsional)</FieldLabel>
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="cth. Warna navy, ukuran campur"
          />
        </div>
        <button
          type="submit"
          style={{
            marginTop: 6,
            background: INK,
            color: PAPER,
            border: "none",
            borderRadius: 10,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {initial ? "Simpan Perubahan" : "Simpan Pesanan"}
        </button>
      </form>
    </Modal>
  );
}
