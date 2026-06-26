import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Scissors, Loader2 } from "lucide-react";
import GlobalStyle from "../components/GlobalStyle";
import { FieldLabel } from "../components/FormElements";
import { INK, PAPER, RUST, THREAD, inputStyle } from "../utils/constants";
import { loginWithEmail, registerUmkm } from "../firebase/authService";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [umkmName, setUmkmName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!umkmName.trim()) {
          setError("Nama UMKM wajib diisi.");
          setSubmitting(false);
          return;
        }
        await registerUmkm(email.trim(), password, umkmName.trim());
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(mapAuthError(err?.code));
    } finally {
      setSubmitting(false);
    }
  }

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
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-4deg)",
              marginBottom: 14,
            }}
          >
            <Scissors size={24} color={PAPER} strokeWidth={2.25} />
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26,
              fontWeight: 600,
              margin: 0,
              textAlign: "center",
            }}
          >
            Buku Konveksi
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: `${INK}80`, textAlign: "center" }}>
            Sistem informasi UMKM konveksi Anda
          </p>
        </div>

        <div
          style={{
            background: "#FFFDF8",
            border: `1.5px solid ${INK}15`,
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            <ModeButton active={mode === "login"} onClick={() => setMode("login")} label="Masuk" />
            <ModeButton active={mode === "register"} onClick={() => setMode("register")} label="Daftar UMKM" />
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <FieldLabel>Nama UMKM</FieldLabel>
                <input
                  style={inputStyle}
                  value={umkmName}
                  onChange={(e) => setUmkmName(e.target.value)}
                  placeholder="cth. Konveksi Berkah Jaya"
                  required
                />
              </div>
            )}
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <FieldLabel>Kata sandi</FieldLabel>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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
                marginTop: 4,
                background: INK,
                color: PAPER,
                border: "none",
                borderRadius: 10,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: 15,
                cursor: submitting ? "default" : "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting && <Loader2 size={16} className="spin-slow" />}
              {mode === "login" ? "Masuk" : "Buat Akun UMKM"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12.5, color: `${INK}60`, marginTop: 18 }}>
          Setiap UMKM memiliki data bahan baku, pelanggan &amp; pesanan yang terpisah dan privat.
        </p>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "9px 0",
        borderRadius: 8,
        border: `1.5px solid ${active ? THREAD : INK + "20"}`,
        background: active ? THREAD : "transparent",
        color: active ? PAPER : INK,
        fontWeight: 700,
        fontSize: 13.5,
        cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function mapAuthError(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau kata sandi salah.";
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Silakan masuk.";
    case "auth/weak-password":
      return "Kata sandi minimal 6 karakter.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}
