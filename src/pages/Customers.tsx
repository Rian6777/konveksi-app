import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, Users, MessageCircle } from "lucide-react";
import Modal from "../components/Modal";
import { FieldLabel, IconBtn } from "../components/FormElements";
import { useCustomers } from "../hooks/useCustomers";
import { INK, PAPER, RUST, THREAD, inputStyle } from "../utils/constants";
import type { Customer } from "../utils/types";

export default function CustomersPage() {
  const { customers, loading, create, update, remove } = useCustomers();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [query, setQuery] = useState("");

  if (loading) return null;

  const filtered = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  async function handleSave(data: Omit<Customer, "id" | "ownerId">) {
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
            placeholder="Cari nama atau nomor WhatsApp…"
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
          Pelanggan
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: `${INK}60` }}>
          <Users size={32} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>
            {customers.length === 0 ? "Belum ada pelanggan tercatat." : "Tidak ada yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#FFFDF8",
                border: `1.5px solid ${INK}15`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {c.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <MessageCircle size={13} color={THREAD} strokeWidth={2.25} />
                    <span style={{ fontSize: 13.5, color: `${INK}85` }}>{c.phone}</span>
                  </div>
                  {c.address && (
                    <div style={{ fontSize: 12.5, color: `${INK}60`, marginTop: 3 }}>{c.address}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <IconBtn onClick={() => { setEditing(c); setShowForm(true); }} icon={Pencil} />
                  <IconBtn onClick={() => remove(c.id)} icon={Trash2} danger />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CustomerForm
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

function CustomerForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Customer | null;
  onSave: (data: Omit<Customer, "id" | "ownerId">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, phone: initial.phone, address: initial.address || "" }
      : { name: "", phone: "", address: "" }
  );

  function update<K extends keyof typeof form>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    onSave(form);
  }

  return (
    <Modal title={initial ? "Ubah Pelanggan" : "Pelanggan Baru"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <FieldLabel>Nama pelanggan</FieldLabel>
          <input
            autoFocus
            style={inputStyle}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="cth. Bu Sari"
            required
          />
        </div>
        <div>
          <FieldLabel>Nomor WhatsApp</FieldLabel>
          <input
            style={inputStyle}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="cth. 081234567890"
            required
          />
        </div>
        <div>
          <FieldLabel>Alamat (opsional)</FieldLabel>
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="cth. Jl. Mawar No. 12, Bandung"
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
          {initial ? "Simpan Perubahan" : "Simpan Pelanggan"}
        </button>
      </form>
    </Modal>
  );
}
