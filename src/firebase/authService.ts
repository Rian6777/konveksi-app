import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerUmkm(
  email: string,
  password: string,
  umkmName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: umkmName });
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    umkmName,
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}
