import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
} from "../firebase/materialsService";
import type { Material } from "../utils/types";
import { useToast } from "../contexts/ToastContext";

export function useMaterials() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeMaterials(user.uid, (list) => {
      setMaterials(list);
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

  async function create(data: Omit<Material, "id" | "ownerId">) {
    if (!user) return null;
    return withErrorHandling(() => addMaterial(user.uid, data), "Gagal menyimpan bahan baku.");
  }

  async function update(id: string, data: Partial<Material>) {
    return withErrorHandling(() => updateMaterial(id, data), "Gagal memperbarui bahan baku.");
  }

  async function remove(id: string) {
    return withErrorHandling(() => deleteMaterial(id), "Gagal menghapus bahan baku.");
  }

  async function adjustStock(id: string, delta: number, currentStock: number) {
    return withErrorHandling(
      () => updateMaterial(id, { stock: Math.max(0, Number(currentStock) + delta) }),
      "Gagal memperbarui stok."
    );
  }

  return { materials, loading, create, update, remove, adjustStock };
}
