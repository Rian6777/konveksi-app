# Buku Konveksi — Sistem Informasi UMKM Konveksi

Aplikasi manajemen UMKM konveksi: bahan baku, pelanggan, pesanan dengan nomor
antrian otomatis, progres produksi bertahap, foto produk & hasil jadi, QR Code
dan tracking pesanan publik untuk pelanggan — dibangun dengan React + TypeScript
+ Firebase (Authentication, Firestore, Storage), siap deploy ke Vercel.

## 1. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/) → buat project baru.
2. Aktifkan **Authentication** → Sign-in method → **Email/Password**.
3. Aktifkan **Firestore Database** (mode production).
4. Aktifkan **Storage** (mode production) — dipakai untuk menyimpan foto produk & foto hasil jadi.
5. Di **Project Settings → General**, tambahkan Web App, lalu salin konfigurasi
   (`apiKey`, `authDomain`, `projectId`, `storageBucket`, dst).
6. Deploy `firestore.rules` dan `storage.rules` ke project Anda:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # pilih project yang sudah dibuat
   firebase deploy --only firestore:rules,storage:rules
   ```
   Atau salin isi kedua file tersebut ke tab **Rules** di Firestore Console dan
   Storage Console secara manual.

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
   `/tracking/:orderId`) agar tidak 404 saat refresh. Tombol "Copy Tracking
   Link" dan QR Code otomatis memakai domain Vercel yang sedang aktif
   (`window.location.origin`), bukan localhost.

## Fitur Utama

- **Nomor antrian otomatis** (`#001`, `#002`, …) — dijamin tidak ada duplikat
  lewat Firestore transaction per UMKM (`counters/{ownerId}`).
- **Upload foto produk & foto hasil jadi** ke Firebase Storage — maksimal 5
  foto/field, format JPG/PNG/WebP, maksimal 5MB/foto, dengan kompresi otomatis,
  preview, progress upload, dan penanganan error.
- **Progres produksi bertahap** (Menunggu Antrian → Potong → Jahit → Obras →
  QC → Packing → Siap Diambil) dengan progress bar otomatis.
- **Timeline riwayat** — setiap perubahan status/tahapan otomatis tercatat
  dengan tanggal.
- **Estimasi selesai & badge "Terlambat"** jika sudah lewat tanggal estimasi.
- **QR Code tracking** — lihat, unduh PNG, atau print langsung dari detail
  pesanan.
- **Tombol WhatsApp** di halaman Pelanggan & Pesanan, otomatis mengisi pesan +
  link tracking.
- **Toast notification, dialog konfirmasi hapus, skeleton loading, zoom foto**
  di seluruh aplikasi.

## Struktur Project

```
src/
├── pages/          Dashboard, Orders, Materials, Customers, Tracking, Login, Settings
├── components/     Layout, Modal, ImageUploader, ProgressBar, Timeline, QRCodeModal,
│                   ConfirmDialog, Skeleton, ImageZoomModal, dll.
├── firebase/       config.ts, storage.ts, authService.ts, storageService.ts,
│                   countersService.ts, materialsService.ts, customersService.ts,
│                   ordersService.ts, profileService.ts
├── hooks/          useMaterials, useCustomers, useOrders
├── contexts/       AuthContext, ToastContext
├── utils/          constants, helpers, types, production (tahapan & progress)
├── App.tsx         React Router
└── main.tsx        Entry point
firestore.rules     Aturan keamanan Firestore: data terisolasi per UMKM
storage.rules       Aturan keamanan Storage: upload privat, baca publik (untuk tracking)
```

## Cara Kerja Multi-Tenant

- Setiap dokumen di koleksi `materials`, `customers`, dan `orders` memiliki field
  `ownerId` berisi UID akun Firebase Auth pemiliknya.
- Firestore Security Rules (`firestore.rules`) memastikan satu UMKM **tidak bisa**
  membaca atau mengubah data UMKM lain.
- Pengecualian: dokumen pesanan (`orders/{orderId}`) bisa di-**get** satu per satu
  tanpa login — ini yang memungkinkan halaman `/tracking/:orderId` diakses publik
  oleh pelanggan lewat link atau QR Code yang dikirim via WhatsApp, tanpa membuka
  akses ke seluruh daftar pesanan UMKM tersebut.
- Foto di Firebase Storage disimpan di path `orders/{ownerId}/{orderId}/...` dan
  bisa dibaca publik (agar tracking page bisa menampilkan foto), tapi hanya bisa
  diunggah/dihapus oleh UMKM pemiliknya (`storage.rules`).

## Migrasi Data Lama

Field baru (`queueNumber`, `images`, `finishedImages`, `productionStep`,
`progress`, `history`) diisi dengan nilai default secara otomatis saat membaca
dokumen pesanan lama yang belum memiliki field tersebut (lihat fungsi
`normalizeOrder` di `src/firebase/ordersService.ts`), sehingga data lama tetap
bisa dibaca tanpa error.

## Tracking Link & QR Code

Nomor Pesanan dibuat otomatis (contoh: `ORD-LX3K9A7B`) dan sekaligus menjadi ID
dokumen di Firestore. Tombol **Copy Tracking Link** dan **QR** di setiap pesanan
menghasilkan:

```
https://<domain-vercel-anda>/tracking/ORD-LX3K9A7B
```

Link/QR inilah yang dikirim ke pelanggan melalui WhatsApp.

