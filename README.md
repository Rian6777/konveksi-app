# Buku Konveksi — Sistem Informasi UMKM Konveksi

Aplikasi manajemen UMKM konveksi: bahan baku, pelanggan, pesanan, dan tracking
pesanan publik untuk pelanggan — dibangun dengan React + TypeScript + Firebase
(Authentication & Firestore), siap deploy ke Vercel.

## 1. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/) → buat project baru.
2. Aktifkan **Authentication** → Sign-in method → **Email/Password**.
3. Aktifkan **Firestore Database** (mode production).
4. Di **Project Settings → General**, tambahkan Web App, lalu salin konfigurasi
   (`apiKey`, `authDomain`, `projectId`, dst).
5. Deploy `firestore.rules` ke project Anda:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # pilih project yang sudah dibuat
   firebase deploy --only firestore:rules
   ```
   Atau salin isi `firestore.rules` ke tab **Rules** di Firestore Console secara manual.

## 2. Konfigurasi environment

Salin `.env.example` menjadi `.env` dan isi dengan kredensial dari langkah 1:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Klik **Daftar UMKM** di halaman Login untuk membuat
akun UMKM pertama Anda (email + password + nama UMKM).

## 4. Deploy ke Vercel

1. Push project ini ke repository GitHub.
2. Import repository di [vercel.com](https://vercel.com/new).
3. Di **Environment Variables**, tambahkan 6 variabel `VITE_FIREBASE_*` yang sama
   seperti di `.env`.
4. Deploy. File `vercel.json` sudah menangani SPA routing (termasuk halaman
   `/tracking/:orderId`) agar tidak 404 saat refresh.

## Struktur Project

```
src/
├── pages/          Dashboard, Orders, Materials, Customers, Tracking, Login, Settings
├── components/     Layout, Modal, Tab, StatusPill, Card, FormElements, dll.
├── firebase/       config.ts, authService.ts, materialsService.ts,
│                   customersService.ts, ordersService.ts, profileService.ts
├── hooks/          useMaterials, useCustomers, useOrders
├── contexts/       AuthContext (status login + profil UMKM)
├── utils/          constants (warna/desain), helpers, types
├── App.tsx         React Router
└── main.tsx        Entry point
firestore.rules     Aturan keamanan: data terisolasi per UMKM
```

## Cara Kerja Multi-Tenant

- Setiap dokumen di koleksi `materials`, `customers`, dan `orders` memiliki field
  `ownerId` berisi UID akun Firebase Auth pemiliknya.
- Firestore Security Rules (`firestore.rules`) memastikan satu UMKM **tidak bisa**
  membaca atau mengubah data UMKM lain.
- Pengecualian: dokumen pesanan (`orders/{orderId}`) bisa di-**get** satu per satu
  tanpa login — ini yang memungkinkan halaman `/tracking/:orderId` diakses publik
  oleh pelanggan lewat link yang dikirim via WhatsApp, tanpa membuka akses ke
  seluruh daftar pesanan UMKM tersebut.

## Tracking Link

Nomor Pesanan dibuat otomatis (contoh: `ORD-LX3K9A7B`) dan sekaligus menjadi ID
dokumen di Firestore. Tombol **Copy Tracking Link** di setiap pesanan menyalin:

```
https://<domain-vercel-anda>/tracking/ORD-LX3K9A7B
```

Link inilah yang dikirim ke pelanggan melalui WhatsApp.
