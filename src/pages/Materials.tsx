import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Search, AlertTriangle, Pencil, Trash2, Boxes } from "lucide-react";
import Modal from "../components/Modal";
import { FieldLabel, IconBtn, StepBtn } from "../components/FormElements";
import { useMaterials } from "../hooks/useMaterials";
import { INK, PAPER, PAPER_DARK, RUST, THREAD, UNITS, inputStyle } from "../utils/constants";
import { formatRupiah } from "../utils/helpers";
import type { Material } from "../utils/types";

export default function MaterialsPage() {
  const { materials, loading, create, update, remove, adjustStock } = useMaterials();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [query, setQuery] = useState("");

  if (loading) return null;

  const filtered = materials
    .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  async function handleSave(data: Omit<Material, "id" | "ownerId">) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: `${INK}60` }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bahan…"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          style={{
            background: THREAD,
            color: PAPER,
            border: "none",
            borderRadius: 8,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <Plus size={17} strokeWidth={2.5} />
          Bahan
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: `${INK}60` }}>
          <Boxes size={32} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>
            {materials.length === 0 ? "Belum ada bahan baku tercatat." : "Tidak ada yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((m) => {
            const low = Number(m.stock) <= Number(m.minStock || 0);
            return (
              <div
                key={m.id}
                style={{
                  background: "#FFFDF8",
                  border: `1.5px solid ${low ? RUST + "50" : INK + "15"}`,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {m.name}
                      </span>
                      {low && <AlertTriangle size={14} color={RUST} strokeWidth={2.5} />}
                    </div>
                    <div style={{ fontSize: 13, color: `${INK}70`, marginTop: 2 }}>
                      {formatRupiah(m.price)} / {m.unit}
                      {m.minStock ? ` · min. ${m.minStock} ${m.unit}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <IconBtn onClick={() => { setEditing(m); setShowForm(true); }} icon={Pencil} />
                    <IconBtn onClick={() => remove(m.id)} icon={Trash2} danger />
                  </div>
                </div>

                <div style={{ height: 10 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: low ? RUST : INK,
                      }}
                    >
                      {m.stock}
                    </span>
                    <span style={{ fontSize: 13, color: `${INK}70` }}>{m.unit}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <StepBtn onClick={() => adjustStock(m.id, -1, m.stock)} label="−" />
                    <StepBtn onClick={() => adjustStock(m.id, 1, m.stock)} label="+" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <MaterialForm
          initial={editing}
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

function MaterialForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Material | null;
  onSave: (data: Omit<Material, "id" | "ownerId">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, stock: initial.stock, unit: initial.unit, price: initial.price, minStock: initial.minStock }
      : { name: "", stock: 0, unit: "meter", price: 0, minStock: 0 }
  );

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      name: form.name,
      stock: Number(form.stock) || 0,
      unit: form.unit,
      price: Number(form.price) || 0,
      minStock: Number(form.minStock) || 0,
    });
  }

  return (
    <Modal title={initial ? "Ubah Bahan" : "Bahan Baru"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <FieldLabel>Nama bahan</FieldLabel>
          <input
            autoFocus
            style={inputStyle}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="cth. Kain Katun Combed 24s"
            required
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Jumlah stok</FieldLabel>
            <input
              type="number"
              min="0"
              step="any"
              style={inputStyle}
              value={form.stock}
              onChange={(e) => update("stock", Number(e.target.value) as any)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Satuan</FieldLabel>
            <select style={inputStyle} value={form.unit} onChange={(e) => update("unit", e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Harga / satuan (Rp)</FieldLabel>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value) as any)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Stok minimum</FieldLabel>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={form.minStock}
              onChange={(e) => update("minStock", Number(e.target.value) as any)}
              placeholder="Alert jika di bawah ini"
            />
          </div>
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
          {initial ? "Simpan Perubahan" : "Simpan Bahan"}
        </button>
      </form>
    </Modal>
  );
}
