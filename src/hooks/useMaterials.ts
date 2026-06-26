import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
} from "../firebase/materialsService";
import type { Material } from "../utils/types";

export function useMaterials() {
  const { user } = useAuth();
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

  async function create(data: Omit<Material, "id" | "ownerId">) {
    if (!user) return;
    await addMaterial(user.uid, data);
  }

  async function update(id: string, data: Partial<Material>) {
    await updateMaterial(id, data);
  }

  async function remove(id: string) {
    await deleteMaterial(id);
  }

  async function adjustStock(id: string, delta: number, currentStock: number) {
    await updateMaterial(id, { stock: Math.max(0, Number(currentStock) + delta) });
  }

  return { materials, loading, create, update, remove, adjustStock };
}
