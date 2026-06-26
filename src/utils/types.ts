export type OrderStatus = "pending" | "proses" | "selesai";

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
  customerId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  qty: number;
  status: OrderStatus;
  tanggalMasuk: string; // ISO date (yyyy-mm-dd)
  estimasiSelesai: string; // ISO date (yyyy-mm-dd), opsional
  notes: string;
  createdAt?: any;
}
