import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Material } from "../utils/types";

const COL = "materials";

export function subscribeMaterials(
  ownerId: string,
  callback: (materials: Material[]) => void
) {
  const q = query(
    collection(db, COL),
    where("ownerId", "==", ownerId),
    orderBy("name", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material));
    callback(list);
  });
}

export async function addMaterial(ownerId: string, data: Omit<Material, "id" | "ownerId">) {
  await addDoc(collection(db, COL), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
  });
}

export async function updateMaterial(id: string, data: Partial<Material>) {
  const { id: _omit, ownerId: _omit2, ...rest } = data as any;
  await updateDoc(doc(db, COL, id), rest);
}

export async function deleteMaterial(id: string) {
  await deleteDoc(doc(db, COL, id));
}
