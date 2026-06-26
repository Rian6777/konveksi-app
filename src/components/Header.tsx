import { Scissors } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { INK, PAPER } from "../utils/constants";

export default function Header() {
  const { profile } = useAuth();

  return (
    <header
      style={{
        padding: "26px 20px 0",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: "rotate(-4deg)",
        }}
      >
        <Scissors size={20} color={PAPER} strokeWidth={2.25} />
      </div>
      <div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 24,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {profile?.umkmName || "Buku Konveksi"}
        </h1>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: `${INK}80` }}>
          Pesanan &amp; stok bahan, dalam satu jahitan
        </p>
      </div>
    </header>
  );
}
