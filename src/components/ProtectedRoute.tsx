import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { Scissors } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PAPER, INK } from "../utils/constants";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          color: INK,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Scissors size={28} className="spin-slow" style={{ marginBottom: 10 }} />
          <div>Membuka buku catatan…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
