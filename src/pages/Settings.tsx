import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Save, Check } from "lucide-react";
import { FieldLabel } from "../components/FormElements";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { updateUmkmProfile } from "../firebase/profileService";
import { logout } from "../firebase/authService";
import { INK, PAPER, RUST, THREAD, inputStyle } from "../utils/constants";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [umkmName, setUmkmName] = useState(profile?.umkmName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user || !umkmName.trim()) return;
    setSaving(true);
    await updateUmkmProfile(user.uid, { umkmName: umkmName.trim() });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Akun UMKM">
        <div style={{ fontSize: 13, color: `${INK}70`, marginBottom: 14 }}>
          Masuk sebagai <strong style={{ color: INK }}>{user?.email}</strong>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel>Nama UMKM</FieldLabel>
            <input
              style={inputStyle}
              value={umkmName}
              onChange={(e) => setUmkmName(e.target.value)}
              placeholder="cth. Konveksi Berkah Jaya"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: saved ? "#3F6342" : THREAD,
              color: PAPER,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 14.5,
              cursor: saving ? "default" : "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? <Check size={16} strokeWidth={2.5} /> : <Save size={16} strokeWidth={2.25} />}
            {saved ? "Tersimpan" : "Simpan Perubahan"}
          </button>
        </form>
      </Card>

      <Card title="Sesi">
        <div style={{ fontSize: 13.5, color: `${INK}75`, marginBottom: 14 }}>
          Keluar dari akun ini di perangkat ini.
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "transparent",
            color: RUST,
            border: `1.5px solid ${RUST}50`,
            borderRadius: 10,
            padding: "12px 0",
            fontWeight: 700,
            fontSize: 14.5,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            width: "100%",
          }}
        >
          <LogOut size={16} strokeWidth={2.25} />
          Keluar
        </button>
      </Card>
    </div>
  );
}
