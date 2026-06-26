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
import type { Customer } from "../utils/types";

const COL = "customers";

export function subscribeCustomers(
  ownerId: string,
  callback: (customers: Customer[]) => void
) {
  const q = query(
    collection(db, COL),
    where("ownerId", "==", ownerId),
    orderBy("name", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
    callback(list);
  });
}

export async function addCustomer(ownerId: string, data: Omit<Customer, "id" | "ownerId">) {
  await addDoc(collection(db, COL), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
  });
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const { id: _omit, ownerId: _omit2, ...rest } = data as any;
  await updateDoc(doc(db, COL, id), rest);
}

export async function deleteCustomer(id: string) {
  await deleteDoc(doc(db, COL, id));
}
