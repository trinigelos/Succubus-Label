import imageCompression from "browser-image-compression";

/** Single WebP per photo, resized client-side (no server left to run `sharp`). */
export async function compressForUpload(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxWidthOrHeight: 1600,
    maxSizeMB: 1,
    fileType: "image/webp",
    useWebWorker: true,
    initialQuality: 0.82,
  });
}
