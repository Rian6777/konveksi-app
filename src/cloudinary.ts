import axios from "axios";

const CLOUD_NAME = "dzxovhavb";
const UPLOAD_PRESET = "konveksi_upload";

export async function compressImage(file: File): Promise<File> {
  return file;
}

export async function uploadImage(
  file: Blob,
  _path?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    {
      onUploadProgress: (e) => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress?.(percent);
        }
      },
    }
  );

  onProgress?.(100);

  return response.data.secure_url;
}

export async function deleteImage(_url: string): Promise<void> {
  return;
} 