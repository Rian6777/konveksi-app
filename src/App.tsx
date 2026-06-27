import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MaterialsPage from "./pages/Materials";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import SettingsPage from "./pages/Settings";
import Tracking from "./pages/Tracking";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Halaman publik, tanpa login */}
            <Route path="/login" element={<Login />} />
            <Route path="/tracking/:orderId" element={<Tracking />} />

            {/* Halaman privat, wajib login */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/bahan-baku" element={<MaterialsPage />} />
              <Route path="/pelanggan" element={<CustomersPage />} />
              <Route path="/pesanan" element={<OrdersPage />} />
              <Route path="/pengaturan" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
