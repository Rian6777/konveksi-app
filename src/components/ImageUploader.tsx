import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react";
import { INK, PAPER_DARK, RUST, THREAD } from "../utils/constants";
import {
  MAX_IMAGES_PER_FIELD,
  validateImageFile,
} from "../utils/helpers";
import { compressImage, uploadImage, deleteImage } from "../firebase/storageService";
import { useToast } from "../contexts/ToastContext";

interface UploadingItem {
  tempId: string;
  progress: number;
  error?: string;
}

export default function ImageUploader({
  images,
  onChange,
  storagePathPrefix,
  maxImages = MAX_IMAGES_PER_FIELD,
  label = "Foto",
  onZoom,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  storagePathPrefix: string;
  maxImages?: number;
  label?: string;
  onZoom?: (url: string) => void;
}) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);

  const remainingSlots = maxImages - images.length - uploading.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, Math.max(0, remainingSlots));
    if (files.length > fileArray.length) {
      showToast(`Maksimal ${maxImages} foto. Sebagian foto tidak diunggah.`, "error");
    }

    for (const file of fileArray) {
      const validationError = validateImageFile(file);
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      if (validationError) {
        showToast(validationError, "error");
        continue;
      }

      setUploading((prev) => [...prev, { tempId, progress: 0 }]);

      try {
        const compressed = await compressImage(file);
        const path = `${storagePathPrefix}/${tempId}.jpg`;
        const url = await uploadImage(compressed, path, (percent) => {
          setUploading((prev) =>
            prev.map((u) => (u.tempId === tempId ? { ...u, progress: percent } : u))
          );
        });
        onChange([...images, url]);
        setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
      } catch (err) {
        console.error(err);
        setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
        showToast("Gagal mengunggah foto. Periksa koneksi internet Anda.", "error");
      }
    }
  }

  async function handleDelete(url: string) {
    const next = images.filter((u) => u !== url);
    onChange(next);
    try {
      await deleteImage(url);
    } catch (err) {
      console.error(err);
      // Tetap lanjut walau gagal hapus dari storage; tidak menghalangi UX
    }
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: `${INK}99`, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label} ({images.length}/{maxImages})
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {images.map((url) => (
          <div
            key={url}
            style={{
              position: "relative",
              width: 76,
              height: 76,
              borderRadius: 10,
              overflow: "hidden",
              border: `1.5px solid ${INK}20`,
              flexShrink: 0,
            }}
          >
            <img
              src={url}
              alt="Foto produk"
              loading="lazy"
              onClick={() => onZoom?.(url)}
              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: onZoom ? "zoom-in" : "default" }}
            />
            <button
              onClick={() => handleDelete(url)}
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(43,38,34,0.75)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={11} strokeWidth={3} />
            </button>
          </div>
        ))}

        {uploading.map((u) => (
          <div
            key={u.tempId}
            style={{
              width: 76,
              height: 76,
              borderRadius: 10,
              border: `1.5px dashed ${u.error ? RUST : THREAD}50`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: PAPER_DARK,
            }}
          >
            {u.error ? (
              <AlertCircle size={16} color={RUST} />
            ) : (
              <>
                <Loader2 size={16} className="spin-slow" color={THREAD} />
                <span style={{ fontSize: 10.5, color: THREAD, marginTop: 4, fontWeight: 700 }}>{u.progress}%</span>
              </>
            )}
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              width: 76,
              height: 76,
              borderRadius: 10,
              border: `1.5px dashed ${INK}35`,
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: `${INK}70`,
              flexShrink: 0,
              gap: 3,
            }}
          >
            <ImagePlus size={18} strokeWidth={2} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>Tambah</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div style={{ fontSize: 11.5, color: `${INK}55`, marginTop: 6 }}>
        Format JPG/PNG/WebP, maksimal 5MB per foto.
      </div>
    </div>
  );
}
