import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
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

/**
 * Mengubah password akun yang sedang login.
 * Melakukan re-authentication terlebih dahulu dengan password lama (wajib oleh
 * Firebase untuk operasi sensitif seperti updatePassword), baru kemudian
 * menetapkan password baru.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("not-authenticated");
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
