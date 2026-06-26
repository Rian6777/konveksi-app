import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Order } from "../utils/types";
import { generateOrderNumber } from "../utils/helpers";

const COL = "orders";

export function subscribeOrders(
  ownerId: string,
  callback: (orders: Order[]) => void
) {
  const q = query(
    collection(db, COL),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(list);
  });
}

/** Membuat pesanan baru. Nomor Pesanan dibuat otomatis dan dipakai sebagai ID dokumen. */
export async function addOrder(ownerId: string, data: Omit<Order, "id" | "ownerId">) {
  let orderNumber = generateOrderNumber();
  // Pastikan ID belum terpakai (sangat jarang terjadi, tapi dijaga agar aman)
  let existing = await getDoc(doc(db, COL, orderNumber));
  while (existing.exists()) {
    orderNumber = generateOrderNumber();
    existing = await getDoc(doc(db, COL, orderNumber));
  }
  await setDoc(doc(db, COL, orderNumber), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
  });
  return orderNumber;
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const { id: _omit, ownerId: _omit2, ...rest } = data as any;
  await updateDoc(doc(db, COL, id), rest);
}

export async function deleteOrder(id: string) {
  await deleteDoc(doc(db, COL, id));
}

/** Diakses tanpa login dari halaman Tracking publik. */
export async function getOrderPublic(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COL, orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}
