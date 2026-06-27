import { useState, useMemo, useCallback, memo } from "react";
import type { FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Link2,
  Check,
  MessageCircle,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import Modal from "../components/Modal";
import StatusPill from "../components/StatusPill";
import ProgressBar from "../components/ProgressBar";
import Timeline from "../components/Timeline";
import ImageUploader from "../components/ImageUploader";
import ImageZoomModal from "../components/ImageZoomModal";
import QRCodeModal from "../components/QRCodeModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { ListSkeleton } from "../components/Skeleton";
import { FieldLabel, IconBtn } from "../components/FormElements";
import { useOrders } from "../hooks/useOrders";
import { useCustomers } from "../hooks/useCustomers";
import { useAuth } from "../contexts/AuthContext";
import { INK, PAPER, RUST, THREAD, inputStyle } from "../utils/constants";
import {
  formatDate,
  todayISO,
  buildTrackingLink,
  buildWhatsAppLink,
  buildTrackingWhatsAppMessage,
  copyToClipboard,
} from "../utils/helpers";
import { PRODUCTION_STEPS, daysRemaining, isLate, formatQueueNumber, getProgressForStatus } from "../utils/production";
import type { Order, OrderStatus, ProductionStep } from "../utils/types";

const FILTERS: { key: "semua" | OrderStatus; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "proses", label: "Proses" },
  { key: "selesai", label: "Selesai" },
];

export default function OrdersPage() {
  const { orders, loading, create, update, remove, setStatus, setStep, updateImages, updateFinishedImages } = useOrders();
  const { customers, loading: loadingCustomers } = useCustomers();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => filter === "semua" || o.status === filter)
        .filter(
          (o) =>
            o.customerName.toLowerCase().includes(query.toLowerCase()) ||
            o.productName.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toLowerCase().includes(query.toLowerCase())
        ),
    [orders, filter, query]
  );

  async function handleSave(data: Omit<Order, "id" | "ownerId" | "queueNumber" | "productionStep" | "progress" | "images" | "finishedImages" | "history">) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditing(null);
  }

  const handleCopyLink = useCallback(async (orderId: string) => {
    const ok = await copyToClipboard(buildTrackingLink(orderId));
    if (ok) {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }, []);

  if (loading || loadingCustomers) {
    return <ListSkeleton count={4} />;
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
            <OrderCard
              key={o.id}
              order={o}
              copied={copiedId === o.id}
              onCopyLink={() => handleCopyLink(o.id)}
              onEdit={() => {
                setEditing(o);
                setShowForm(true);
              }}
              onDelete={() => setConfirmDeleteId(o.id)}
              onZoom={setZoomUrl}
              onShowQr={() => setQrOrderId(o.id)}
              onSetStatus={(s) => setStatus(o, s)}
              onSetStep={(s) => setStep(o, s)}
              onUpdateImages={(imgs) => updateImages(o.id, imgs)}
              onUpdateFinishedImages={(imgs) => updateFinishedImages(o.id, imgs)}
              ownerId={user?.uid || ""}
            />
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

      {zoomUrl && <ImageZoomModal url={zoomUrl} onClose={() => setZoomUrl(null)} />}
      {qrOrderId && <QRCodeModal orderId={qrOrderId} onClose={() => setQrOrderId(null)} />}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Hapus pesanan ini?"
          message="Tindakan ini tidak dapat dibatalkan. Riwayat dan foto pesanan akan ikut terhapus."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            remove(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

const OrderCard = memo(function OrderCard({
  order: o,
  copied,
  onCopyLink,
  onEdit,
  onDelete,
  onZoom,
  onShowQr,
  onSetStatus,
  onSetStep,
  onUpdateImages,
  onUpdateFinishedImages,
  ownerId,
}: {
  order: Order;
  copied: boolean;
  onCopyLink: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onZoom: (url: string) => void;
  onShowQr: () => void;
  onSetStatus: (s: OrderStatus) => void;
  onSetStep: (s: ProductionStep) => void;
  onUpdateImages: (imgs: string[]) => void;
  onUpdateFinishedImages: (imgs: string[]) => void;
  ownerId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const remaining = daysRemaining(o.estimasiSelesai);
  const late = isLate(o.estimasiSelesai, o.status);
  const waLink = buildWhatsAppLink(o.customerPhone, buildTrackingWhatsAppMessage(o.id));

  return (
    <div
      style={{
        background: "#FFFDF8",
        border: `1.5px solid ${late ? RUST + "50" : INK + "15"}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {o.images[0] && (
          <img
            src={o.images[0]}
            alt={o.productName}
            loading="lazy"
            onClick={() => onZoom(o.images[0])}
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0, cursor: "zoom-in", border: `1px solid ${INK}15` }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: THREAD,
                background: `${THREAD}12`,
                borderRadius: 6,
                padding: "1px 6px",
              }}
            >
              {formatQueueNumber(o.queueNumber)}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: `${INK}55`, letterSpacing: 0.3 }}>{o.id}</span>
            {late && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: "#fff",
                  background: RUST,
                  borderRadius: 6,
                  padding: "1px 6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <AlertTriangle size={10} /> Terlambat
              </span>
            )}
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
            {remaining !== null && o.status !== "selesai" && (
              <> · {remaining >= 0 ? `Sisa ${remaining} hari` : `Lewat ${Math.abs(remaining)} hari`}</>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <select
            value={o.status}
            onChange={(e) => onSetStatus(e.target.value as OrderStatus)}
            style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
          >
            <option value="pending">Pending</option>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
          </select>
          <StatusPill status={o.status} />
          <div style={{ display: "flex", gap: 6 }}>
            <IconBtn onClick={onEdit} icon={Pencil} />
            <IconBtn onClick={onDelete} icon={Trash2} danger />
          </div>
        </div>
      </div>

      {o.status === "proses" && (
        <div style={{ marginTop: 12 }}>
          <select
            value={o.productionStep}
            onChange={(e) => onSetStep(e.target.value as ProductionStep)}
            style={{ ...inputStyle, marginBottom: 8, fontSize: 13 }}
          >
            {PRODUCTION_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <ProgressBar progress={getProgressForStatus(o.status, o.productionStep)} />
        </div>
      )}
      {o.status === "selesai" && (
        <div style={{ marginTop: 12 }}>
          <ProgressBar progress={100} />
        </div>
      )}

      {o.notes && (
        <>
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 13, color: `${INK}75`, fontStyle: "italic" }}>&ldquo;{o.notes}&rdquo;</div>
        </>
      )}

      <div style={{ height: 10 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={onCopyLink}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: copied ? "#E8F0E3" : THREAD + "12",
            color: copied ? "#3F6342" : THREAD,
            border: `1.5px solid ${copied ? "#3F634240" : THREAD + "30"}`,
            borderRadius: 8,
            padding: "8px 0",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", justifyContent: "center",
          }}
        >
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} strokeWidth={2.5} />}
          {copied ? "Disalin!" : "Copy Link"}
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#25D36615",
            color: "#1f8a52",
            border: "1.5px solid #25D36640",
            borderRadius: 8,
            padding: "8px 0",
            fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif", justifyContent: "center",
          }}
        >
          <MessageCircle size={13} strokeWidth={2.5} /> WhatsApp
        </a>
        <button
          onClick={onShowQr}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: `${INK}08`,
            color: INK,
            border: `1.5px solid ${INK}25`,
            borderRadius: 8,
            padding: "8px 0",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", justifyContent: "center",
          }}
        >
          <QrCode size={13} strokeWidth={2.5} /> QR
        </button>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ background: "none", border: "none", color: THREAD, fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 10, padding: 0 }}
      >
        {expanded ? "Tutup detail" : "Lihat foto, riwayat & detail"}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
          <ImageUploader
            images={o.images}
            onChange={onUpdateImages}
            storagePathPrefix={`orders/${ownerId}/${o.id}/produk`}
            label="Foto Produk"
            onZoom={onZoom}
          />
          {o.status === "selesai" && (
            <ImageUploader
              images={o.finishedImages}
              onChange={onUpdateFinishedImages}
              storagePathPrefix={`orders/${ownerId}/${o.id}/hasil`}
              label="Foto Hasil Jadi"
              onZoom={onZoom}
            />
          )}
          <div>
            <FieldLabel>Riwayat Produksi</FieldLabel>
            <Timeline history={o.history} />
          </div>
        </div>
      )}
    </div>
  );
});

function OrderForm({
  initial,
  customers,
  onSave,
  onClose,
}: {
  initial: Order | null;
  customers: { id: string; name: string; phone: string }[];
  onSave: (data: Omit<Order, "id" | "ownerId" | "queueNumber" | "productionStep" | "progress" | "images" | "finishedImages" | "history">) => void;
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
            <div style={{ ...inputStyle, background: "#EDE3CF", fontWeight: 700, color: `${INK}90` }}>
              {initial.id} &middot; {formatQueueNumber(initial.queueNumber)}
            </div>
          </div>
        )}
        <div>
          <FieldLabel>Pelanggan</FieldLabel>
          <select style={inputStyle} value={form.customerId} onChange={(e) => update("customerId", e.target.value)} required>
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
            <input type="number" min="1" style={inputStyle} value={form.qty} onChange={(e) => update("qty", Number(e.target.value) as any)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Status</FieldLabel>
            <select style={inputStyle} value={form.status} onChange={(e) => update("status", e.target.value as OrderStatus)}>
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Tanggal masuk</FieldLabel>
            <input type="date" style={inputStyle} value={form.tanggalMasuk} onChange={(e) => update("tanggalMasuk", e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Estimasi selesai</FieldLabel>
            <input type="date" style={inputStyle} value={form.estimasiSelesai} onChange={(e) => update("estimasiSelesai", e.target.value)} />
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
        {!initial && (
          <div style={{ fontSize: 12, color: `${INK}60`, fontStyle: "italic" }}>
            Nomor antrian &amp; foto produk dapat diatur setelah pesanan tersimpan, melalui tombol &ldquo;Lihat foto, riwayat &amp; detail&rdquo;.
          </div>
        )}
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
