import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  changeOrderStatus,
  changeProductionStep,
  setOrderImages,
  setOrderFinishedImages,
} from "../firebase/ordersService";
import type { Order, OrderStatus, ProductionStep } from "../utils/types";
import { useToast } from "../contexts/ToastContext";

export function useOrders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsub = subscribeOrders(
      user.uid,
      (list) => {
        setOrders(list);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function withErrorHandling<T>(action: () => Promise<T>, errorMessage: string): Promise<T | null> {
    try {
      return await action();
    } catch (err) {
      console.error(err);
      showToast(errorMessage, "error");
      setError(errorMessage);
      return null;
    }
  }

  async function create(data: Omit<Order, "id" | "ownerId" | "queueNumber" | "productionStep" | "progress" | "images" | "finishedImages" | "history">) {
    if (!user) return null;
    return withErrorHandling(() => addOrder(user.uid, data), "Gagal menyimpan pesanan. Periksa koneksi internet Anda.");
  }

  async function update(id: string, data: Partial<Order>) {
    return withErrorHandling(() => updateOrder(id, data), "Gagal memperbarui pesanan.");
  }

  async function remove(id: string) {
    return withErrorHandling(() => deleteOrder(id), "Gagal menghapus pesanan.");
  }

  async function cycleStatus(order: Order) {
    const seq: OrderStatus[] = ["pending", "proses", "selesai"];
    const next = seq[(seq.indexOf(order.status) + 1) % seq.length];
    return withErrorHandling(() => changeOrderStatus(order, next), "Gagal mengubah status pesanan.");
  }

  async function setStatus(order: Order, status: OrderStatus) {
    return withErrorHandling(() => changeOrderStatus(order, status), "Gagal mengubah status pesanan.");
  }

  async function setStep(order: Order, step: ProductionStep) {
    return withErrorHandling(() => changeProductionStep(order, step), "Gagal memperbarui tahapan produksi.");
  }

  async function updateImages(id: string, images: string[]) {
    return withErrorHandling(() => setOrderImages(id, images), "Gagal memperbarui foto produk.");
  }

  async function updateFinishedImages(id: string, finishedImages: string[]) {
    return withErrorHandling(() => setOrderFinishedImages(id, finishedImages), "Gagal memperbarui foto hasil jadi.");
  }

  return {
    orders,
    loading,
    error,
    create,
    update,
    remove,
    cycleStatus,
    setStatus,
    setStep,
    updateImages,
    updateFinishedImages,
  };
}
