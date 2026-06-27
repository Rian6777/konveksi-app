export type OrderStatus = "pending" | "proses" | "selesai";

/** Tahapan produksi yang berlaku hanya ketika status === "proses" */
export type ProductionStep =
  | "menunggu"
  | "potong"
  | "jahit"
  | "obras"
  | "qc"
  | "packing"
  | "siap";

export interface HistoryEntry {
  date: string; // ISO datetime
  title: string;
}

export interface Material {
  id: string;
  ownerId: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  minStock: number;
  createdAt?: any;
}

export interface Customer {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  address?: string;
  createdAt?: any;
}

export interface Order {
  id: string; // sekaligus berfungsi sebagai Nomor Pesanan
  ownerId: string;
  queueNumber: number; // nomor antrian otomatis, dimulai dari 1 (ditampilkan #001)
  customerId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  qty: number;
  status: OrderStatus;
  productionStep: ProductionStep; // hanya relevan saat status === "proses"
  progress: number; // 0-100
  images: string[]; // foto produk
  finishedImages: string[]; // foto hasil jadi, tampil saat status selesai
  history: HistoryEntry[];
  tanggalMasuk: string; // ISO date (yyyy-mm-dd)
  estimasiSelesai: string; // ISO date (yyyy-mm-dd), opsional
  notes: string;
  createdAt?: any;
}
