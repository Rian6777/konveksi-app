import { doc, runTransaction } from "firebase/firestore";
import { db } from "./config";

const COUNTERS_COL = "counters";

/**
 * Mengambil & menaikkan nomor antrian berikutnya untuk satu UMKM secara atomik.
 * Menggunakan Firestore transaction sehingga dijamin tidak ada nomor yang sama
 * meski beberapa pesanan dibuat bersamaan.
 */
export async function getNextQueueNumber(ownerId: string): Promise<number> {
  const counterRef = doc(db, COUNTERS_COL, ownerId);

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    const current = snap.exists() ? Number(snap.data().queueCounter || 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { queueCounter: next }, { merge: true });
    return next;
  });
}
