import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./storage";

/**
 * Mengompres & mengubah ukuran gambar di sisi browser sebelum diupload,
 * agar hemat kuota Storage dan lebih cepat diunggah dari koneksi UMKM yang lambat.
 */
export async function compressImage(file: File, maxDimension = 1280, quality = 0.82): Promise<Blob> {
  try {
    const imageBitmap = await createImageBitmap(file);
    let { width, height } = imageBitmap;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    return blob || file;
  } catch {
    // Jika kompresi gagal (mis. browser lama), upload file asli saja.
    return file;
  }
}

/**
 * Upload satu gambar ke Firebase Storage dengan progress callback.
 * path contoh: `orders/{ownerId}/{orderId}/produk-{timestamp}.jpg`
 */
export function uploadImage(
  file: Blob,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, {
      contentType: "image/jpeg",
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/** Hapus gambar dari Storage berdasarkan URL download-nya. Aman dipanggil meski file sudah tidak ada. */
export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err: any) {
    // Abaikan jika file memang sudah tidak ada (object-not-found)
    if (err?.code !== "storage/object-not-found") {
      throw err;
    }
  }
}
