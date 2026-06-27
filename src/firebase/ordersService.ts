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
import type { HistoryEntry, Order, OrderStatus, ProductionStep } from "../utils/types";
import { generateOrderNumber } from "../utils/helpers";
import { getNextQueueNumber } from "./countersService";
import { getProgressForStatus, getStepInfo } from "../utils/production";

const COL = "orders";

/**
 * Mengisi nilai default untuk dokumen pesanan lama yang belum memiliki field baru
 * (queueNumber, images, finishedImages, productionStep, progress, history),
 * sehingga data lama tetap bisa dibaca tanpa error setelah migrasi fitur ini.
 */
function normalizeOrder(id: string, data: any): Order {
  return {
    id,
    ownerId: data.ownerId,
    queueNumber: typeof data.queueNumber === "number" ? data.queueNumber : 0,
    customerId: data.customerId || "",
    customerName: data.customerName || "",
    customerPhone: data.customerPhone || "",
    productName: data.productName || "",
    qty: data.qty || 0,
    status: (data.status || "pending") as OrderStatus,
    productionStep: (data.productionStep || "menunggu") as ProductionStep,
    progress:
      typeof data.progress === "number"
        ? data.progress
        : getProgressForStatus(data.status || "pending", data.productionStep),
    images: Array.isArray(data.images) ? data.images : [],
    finishedImages: Array.isArray(data.finishedImages) ? data.finishedImages : [],
    history: Array.isArray(data.history) ? data.history : [],
    tanggalMasuk: data.tanggalMasuk || "",
    estimasiSelesai: data.estimasiSelesai || "",
    notes: data.notes || "",
    createdAt: data.createdAt,
  };
}

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
    const list = snap.docs.map((d) => normalizeOrder(d.id, d.data()));
    callback(list);
  });
}

/** Membuat pesanan baru. Nomor Pesanan dibuat otomatis dan dipakai sebagai ID dokumen. */
export async function addOrder(
  ownerId: string,
  data: Omit<Order, "id" | "ownerId" | "queueNumber" | "productionStep" | "progress" | "images" | "finishedImages" | "history">
) {
  let orderNumber = generateOrderNumber();
  let existing = await getDoc(doc(db, COL, orderNumber));
  while (existing.exists()) {
    orderNumber = generateOrderNumber();
    existing = await getDoc(doc(db, COL, orderNumber));
  }

  const queueNumber = await getNextQueueNumber(ownerId);
  const nowIso = new Date().toISOString();
  const history: HistoryEntry[] = [
    { date: nowIso, title: "Pesanan dibuat" },
  ];
  if (data.status === "proses") {
    history.push({ date: nowIso, title: "Masuk Antrian" });
  }

  await setDoc(doc(db, COL, orderNumber), {
    ...data,
    ownerId,
    queueNumber,
    productionStep: "menunggu",
    progress: getProgressForStatus(data.status, "menunggu"),
    images: [],
    finishedImages: [],
    history,
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

/** Mengubah status utama pesanan dan otomatis menambah riwayat timeline. */
export async function changeOrderStatus(order: Order, newStatus: OrderStatus) {
  const nowIso = new Date().toISOString();
  const titles: Record<OrderStatus, string> = {
    pending: "Pesanan menunggu diproses",
    proses: "Masuk Antrian",
    selesai: "Selesai",
  };
  const newHistory = [...order.history, { date: nowIso, title: titles[newStatus] }];
  const newStep: ProductionStep = newStatus === "proses" ? "menunggu" : order.productionStep;

  await updateOrder(order.id, {
    status: newStatus,
    productionStep: newStep,
    progress: getProgressForStatus(newStatus, newStep),
    history: newHistory,
  });
}

/** Mengubah tahapan produksi (hanya relevan saat status === "proses") dan menambah riwayat. */
export async function changeProductionStep(order: Order, newStep: ProductionStep) {
  const nowIso = new Date().toISOString();
  const label = getStepInfo(newStep).label;
  const newHistory = [...order.history, { date: nowIso, title: label }];

  await updateOrder(order.id, {
    productionStep: newStep,
    progress: getProgressForStatus(order.status, newStep),
    history: newHistory,
  });
}

export async function setOrderImages(id: string, images: string[]) {
  await updateOrder(id, { images });
}

export async function setOrderFinishedImages(id: string, finishedImages: string[]) {
  await updateOrder(id, { finishedImages });
}

/** Diakses tanpa login dari halaman Tracking publik. */
export async function getOrderPublic(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COL, orderId));
  if (!snap.exists()) return null;
  return normalizeOrder(snap.id, snap.data());
}

