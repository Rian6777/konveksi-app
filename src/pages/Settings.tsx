import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Save, Check, KeyRound, Loader2 } from "lucide-react";
import { FieldLabel } from "../components/FormElements";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { updateUmkmProfile } from "../firebase/profileService";
import { logout, changePassword } from "../firebase/authService";
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

      <ChangePasswordCard />

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

function ChangePasswordCard() {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!oldPassword) {
      setError("Password lama wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      resetForm();
      showToast("Password berhasil diubah.", "success");
    } catch (err: any) {
      setError(mapChangePasswordError(err?.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Ubah Password">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Password Lama</FieldLabel>
          <input
            type="password"
            style={inputStyle}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Masukkan password saat ini"
            autoComplete="current-password"
          />
        </div>
        <div>
          <FieldLabel>Password Baru</FieldLabel>
          <input
            type="password"
            style={inputStyle}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
        </div>
        <div>
          <FieldLabel>Konfirmasi Password Baru</FieldLabel>
          <input
            type="password"
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div
            style={{
              background: `${RUST}15`,
              border: `1.5px solid ${RUST}40`,
              color: RUST,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: INK,
            color: PAPER,
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            fontWeight: 700,
            fontSize: 14.5,
            cursor: submitting ? "default" : "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? <Loader2 size={16} className="spin-slow" /> : <KeyRound size={16} strokeWidth={2.25} />}
          {submitting ? "Memproses…" : "Ubah Password"}
        </button>
      </form>
    </Card>
  );
}

function mapChangePasswordError(code?: string) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Password lama salah.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    case "auth/weak-password":
      return "Password baru terlalu lemah, gunakan minimal 8 karakter.";
    case "auth/requires-recent-login":
      return "Sesi login terlalu lama. Silakan keluar dan masuk kembali, lalu coba lagi.";
    default:
      return "Gagal mengubah password. Periksa kembali data Anda dan coba lagi.";
  }
}
