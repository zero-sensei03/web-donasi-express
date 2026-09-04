import sharp from "sharp";

export interface ProcessedFile {
  buffer: Buffer;
  mimetype: string;
  extension: string;
}

export const processFile = async (
  buffer: Buffer,
  originalMimeType: string,
): Promise<ProcessedFile> => {
  // GIF tetap dipertahankan
  if (originalMimeType === "image/gif") {
    return {
      buffer,
      mimetype: "image/gif",
      extension: "gif",
    };
  }

  // Semua gambar dikonversi ke WebP
  if (originalMimeType.startsWith("image/")) {
    const convertedBuffer = await sharp(buffer)
      .webp({
        quality: 80,
      })
      .toBuffer();

    return {
      buffer: convertedBuffer,
      mimetype: "image/webp",
      extension: "webp",
    };
  }

  // Video, PDF, DOCX, ZIP, dll langsung disimpan
  const extension = originalMimeType.split("/")[1] || "bin";

  return {
    buffer,
    mimetype: originalMimeType,
    extension,
  };
};