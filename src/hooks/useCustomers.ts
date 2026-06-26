import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../firebase/customersService";
import type { Customer } from "../utils/types";

export function useCustomers() {
  const { user } = useAuth();
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

  async function create(data: Omit<Customer, "id" | "ownerId">) {
    if (!user) return;
    await addCustomer(user.uid, data);
  }

  async function update(id: string, data: Partial<Customer>) {
    await updateCustomer(id, data);
  }

  async function remove(id: string) {
    await deleteCustomer(id);
  }

  return { customers, loading, create, update, remove };
}
