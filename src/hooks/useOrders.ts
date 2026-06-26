import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} from "../firebase/ordersService";
import type { Order } from "../utils/types";

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeOrders(user.uid, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function create(data: Omit<Order, "id" | "ownerId">) {
    if (!user) return null;
    return addOrder(user.uid, data);
  }

  async function update(id: string, data: Partial<Order>) {
    await updateOrder(id, data);
  }

  async function remove(id: string) {
    await deleteOrder(id);
  }

  async function cycleStatus(order: Order) {
    const seq: Order["status"][] = ["pending", "proses", "selesai"];
    const next = seq[(seq.indexOf(order.status) + 1) % seq.length];
    await updateOrder(order.id, { status: next });
  }

  return { orders, loading, create, update, remove, cycleStatus };
}
