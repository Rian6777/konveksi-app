import { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
  Pencil,
  Upload,
} from "lucide-react";
import { INK, PAPER_DARK, RUST, THREAD, PAPER } from "../utils/constants";
import { MAX_IMAGES_PER_FIELD, validateImageFile } from "../utils/helpers";
import { compressImage, uploadImage, deleteImage } from "../firebase/storageService";
import { useToast } from "../contexts/ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import { Skeleton } from "./Skeleton";

type PendingStatus = "preview" | "uploading" | "error";

interface PendingItem {
  tempId: string;
  file: File;
  previewUrl: string;
  status: PendingStatus;
  progress: number;
  errorMsg?: string;
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
  const replaceTargetRef = useRef<string | null>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const remainingSlots = maxImages - images.length - pending.length;
  const hasUploadable = pending.some((p) => p.status === "preview");
  const isAnyUploading = pending.some((p) => p.status === "uploading");

  // Bersihkan object URL saat komponen unmount agar tidak memory leak.
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFilesToPending = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Jika ini adalah aksi "Ganti foto" untuk satu item tertentu
      if (replaceTargetRef.current) {
        const targetId = replaceTargetRef.current;
        replaceTargetRef.current = null;
        const file = files[0];
        const validationError = validateImageFile(file);
        setPending((prev) =>
          prev.map((p) => {
            if (p.tempId !== targetId) return p;
            URL.revokeObjectURL(p.previewUrl);
            return {
              ...p,
              file,
              previewUrl: URL.createObjectURL(file),
              status: validationError ? "error" : "preview",
              errorMsg: validationError || undefined,
              progress: 0,
            };
          })
        );
        if (validationError) showToast(validationError, "error");
        return;
      }

      const fileArray = Array.from(files).slice(0, Math.max(0, remainingSlots));
      if (files.length > fileArray.length) {
        showToast(`Maksimal ${maxImages} foto. Sebagian foto tidak ditambahkan.`, "error");
      }

      const newItems: PendingItem[] = fileArray.map((file) => {
        const validationError = validateImageFile(file);
        return {
          tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: validationError ? "error" : "preview",
          errorMsg: validationError || undefined,
          progress: 0,
        };
      });

      newItems
        .filter((i) => i.errorMsg)
        .forEach((i) => showToast(i.errorMsg as string, "error"));

      setPending((prev) => [...prev, ...newItems]);
    },
    [maxImages, remainingSlots, showToast]
  );

  const removePending = useCallback((tempId: string) => {
    setPending((prev) => {
      const target = prev.find((p) => p.tempId === tempId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.tempId !== tempId);
    });
  }, []);

  const requestReplace = useCallback((tempId: string) => {
    replaceTargetRef.current = tempId;
    inputRef.current?.click();
  }, []);

  const uploadOne = useCallback(
    async (item: PendingItem) => {
      setPending((prev) =>
        prev.map((p) => (p.tempId === item.tempId ? { ...p, status: "uploading", progress: 0, errorMsg: undefined } : p))
      );
      try {
        const compressed = await compressImage(item.file);
        const path = `${storagePathPrefix}/${item.tempId}.jpg`;
        const url = await uploadImage(compressed, path, (percent) => {
          setPending((prev) => prev.map((p) => (p.tempId === item.tempId ? { ...p, progress: percent } : p)));
        });
        URL.revokeObjectURL(item.previewUrl);
        setPending((prev) => prev.filter((p) => p.tempId !== item.tempId));
        onChange([...images, url]);
        setJustAdded(url);
        setTimeout(() => setJustAdded(null), 500);
        showToast("Foto berhasil diunggah.", "success");
      } catch (err) {
        console.error(err);
        setPending((prev) =>
          prev.map((p) =>
            p.tempId === item.tempId
              ? { ...p, status: "error", errorMsg: "Gagal mengunggah. Periksa koneksi internet Anda." }
              : p
          )
        );
        showToast("Gagal mengunggah foto. Periksa koneksi internet Anda.", "error");
      }
    },
    [images, onChange, showToast, storagePathPrefix]
  );

  const handleUploadAll = useCallback(async () => {
    const toUpload = pending.filter((p) => p.status === "preview");
    for (const item of toUpload) {
      // eslint-disable-next-line no-await-in-loop
      await uploadOne(item);
    }
  }, [pending, uploadOne]);

  const handleRetry = useCallback(
    (tempId: string) => {
      const item = pending.find((p) => p.tempId === tempId);
      if (item) uploadOne(item);
    },
    [pending, uploadOne]
  );

  const handleConfirmDelete = useCallback(async () => {
    const url = deleteTarget;
    setDeleteTarget(null);
    if (!url) return;
    try {
      await deleteImage(url);
      onChange(images.filter((u) => u !== url));
      showToast("Foto berhasil dihapus.", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus foto. Coba lagi.", "error");
    }
  }, [deleteTarget, images, onChange, showToast]);

  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: `${INK}99`,
          marginBottom: 8,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {label} ({images.length}/{maxImages})
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {images.map((url) => (
          <PhotoThumb
            key={url}
            url={url}
            onZoom={onZoom}
            onDeleteRequest={setDeleteTarget}
            justAdded={justAdded === url}
          />
        ))}

        {pending.map((item) => (
          <PendingThumb
            key={item.tempId}
            item={item}
            onRemove={removePending}
            onReplace={requestReplace}
            onRetry={handleRetry}
          />
        ))}

        {remainingSlots > 0 && (
          <button
            onClick={() => {
              replaceTargetRef.current = null;
              inputRef.current?.click();
            }}
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
        multiple={!replaceTargetRef.current}
        hidden
        onChange={(e) => {
          addFilesToPending(e.target.files);
          e.target.value = "";
        }}
      />

      {pending.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <button
            onClick={handleUploadAll}
            disabled={!hasUploadable || isAnyUploading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: hasUploadable && !isAnyUploading ? THREAD : `${INK}25`,
              color: PAPER,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: hasUploadable && !isAnyUploading ? "pointer" : "default",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Upload size={13} strokeWidth={2.5} />
            {isAnyUploading ? "Mengunggah…" : `Unggah ${pending.filter((p) => p.status === "preview").length} Foto`}
          </button>
          <span style={{ fontSize: 11.5, color: `${INK}60` }}>Foto belum tersimpan sampai diunggah.</span>
        </div>
      )}

      <div style={{ fontSize: 11.5, color: `${INK}55`, marginTop: 6 }}>
        Format JPG/PNG/WebP, maksimal 5MB per foto.
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus foto ini?"
          message="Foto akan dihapus permanen dari penyimpanan dan tidak dapat dikembalikan."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

const PhotoThumb = memo(function PhotoThumb({
  url,
  onZoom,
  onDeleteRequest,
  justAdded,
}: {
  url: string;
  onZoom?: (url: string) => void;
  onDeleteRequest: (url: string) => void;
  justAdded?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={justAdded ? "photo-pop" : undefined}
      style={{
        position: "relative",
        width: 76,
        height: 76,
        borderRadius: 10,
        overflow: "hidden",
        border: `1.5px solid ${INK}20`,
        flexShrink: 0,
        background: PAPER_DARK,
      }}
    >
      {!loaded && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Skeleton height={76} width={76} radius={10} />
        </div>
      )}
      <img
        src={url}
        alt="Foto produk"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onClick={() => onZoom?.(url)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: onZoom ? "zoom-in" : "default",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          position: "relative",
          display: "block",
        }}
      />
      <button
        onClick={() => onDeleteRequest(url)}
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
  );
});

const PendingThumb = memo(function PendingThumb({
  item,
  onRemove,
  onReplace,
  onRetry,
}: {
  item: PendingItem;
  onRemove: (tempId: string) => void;
  onReplace: (tempId: string) => void;
  onRetry: (tempId: string) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 76,
        height: 76,
        borderRadius: 10,
        overflow: "hidden",
        border: `1.5px solid ${item.status === "error" ? RUST + "60" : THREAD + "50"}`,
        flexShrink: 0,
        background: PAPER_DARK,
      }}
    >
      <img
        src={item.previewUrl}
        alt="Pratinjau foto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: item.status === "uploading" ? 0.45 : item.status === "error" ? 0.3 : 1,
          display: "block",
        }}
      />

      {item.status === "uploading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 size={16} className="spin-slow" color={THREAD} />
          <span style={{ fontSize: 10.5, color: THREAD, marginTop: 4, fontWeight: 700 }}>{item.progress}%</span>
        </div>
      )}

      {item.status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: 4,
            textAlign: "center",
          }}
        >
          <AlertCircle size={15} color={RUST} />
          <button
            onClick={() => onRetry(item.tempId)}
            style={{
              background: "none",
              border: "none",
              color: RUST,
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              fontSize: 9.5,
              fontWeight: 700,
              padding: 0,
            }}
          >
            <RotateCcw size={9} /> Ulangi
          </button>
        </div>
      )}

      {item.status !== "uploading" && (
        <>
          <button
            onClick={() => onReplace(item.tempId)}
            title="Ganti foto"
            style={{
              position: "absolute",
              bottom: 3,
              left: 3,
              width: 18,
              height: 18,
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
            <Pencil size={9} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onRemove(item.tempId)}
            title="Batalkan"
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              width: 18,
              height: 18,
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
            <X size={10} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
});
