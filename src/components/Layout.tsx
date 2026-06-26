import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Users,
  ClipboardList,
  Settings as SettingsIcon,
} from "lucide-react";
import GlobalStyle from "./GlobalStyle";
import Header from "./Header";
import Tab from "./Tab";
import { PAPER } from "../utils/constants";

const MENU = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/bahan-baku", label: "Bahan Baku", icon: Boxes },
  { path: "/pelanggan", label: "Pelanggan", icon: Users },
  { path: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { path: "/pengaturan", label: "Pengaturan", icon: SettingsIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 40,
      }}
    >
      <GlobalStyle />
      <Header />
      <nav
        style={{
          display: "flex",
          gap: 8,
          padding: "0 20px",
          marginTop: 18,
          marginBottom: 22,
          overflowX: "auto",
        }}
      >
        {MENU.map((m) => (
          <Tab
            key={m.path}
            active={location.pathname === m.path}
            onClick={() => navigate(m.path)}
            icon={m.icon}
            label={m.label}
          />
        ))}
      </nav>

      <main style={{ padding: "0 20px", maxWidth: 720, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
