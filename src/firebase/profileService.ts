import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export interface UmkmProfile {
  email: string;
  umkmName: string;
}

export async function getUmkmProfile(uid: string): Promise<UmkmProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UmkmProfile;
}

export async function updateUmkmProfile(uid: string, data: Partial<UmkmProfile>) {
  await setDoc(
    doc(db, "users", uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
