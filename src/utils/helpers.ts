export const formatRupiah = (n: number | string) =>
  "Rp" + Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** Menghasilkan Nomor Pesanan unik, contoh: ORD-LX3K9A7B */
export function generateOrderNumber() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${time}${rand}`;
}

/** Membangun link tracking publik berdasarkan domain aplikasi saat ini */
export function buildTrackingLink(orderId: string) {
  return `${window.location.origin}/tracking/${orderId}`;
}

/** Membersihkan nomor WhatsApp ke format internasional (62...) tanpa karakter non-digit */
export function normalizeWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return digits;
}

/** Membangun link wa.me dengan pesan yang sudah diisi otomatis */
export function buildWhatsAppLink(phone: string, message: string) {
  const number = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildTrackingWhatsAppMessage(orderId: string) {
  const link = buildTrackingLink(orderId);
  return `Halo, pesanan Anda sedang diproses.\n\nSilakan cek status melalui:\n${link}`;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGES_PER_FIELD = 5;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Format file harus JPG, JPEG, PNG, atau WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Ukuran file maksimal ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
