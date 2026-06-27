import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../firebase/customersService";
import type { Customer } from "../utils/types";
import { useToast } from "../contexts/ToastContext";

export function useCustomers() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeCustomers(user.uid, (list) => {
      setCustomers(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function withErrorHandling<T>(action: () => Promise<T>, message: string): Promise<T | null> {
    try {
      return await action();
    } catch (err) {
      console.error(err);
      showToast(message, "error");
      return null;
    }
  }

  async function create(data: Omit<Customer, "id" | "ownerId">) {
    if (!user) return null;
    return withErrorHandling(() => addCustomer(user.uid, data), "Gagal menyimpan pelanggan.");
  }

  async function update(id: string, data: Partial<Customer>) {
    return withErrorHandling(() => updateCustomer(id, data), "Gagal memperbarui pelanggan.");
  }

  async function remove(id: string) {
    return withErrorHandling(() => deleteCustomer(id), "Gagal menghapus pelanggan.");
  }

  return { customers, loading, create, update, remove };
}
