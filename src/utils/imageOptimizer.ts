import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  mimetype: string;
  extension: string;
}

export const processImage = async (
  buffer: Buffer,
  originalMimeType: string
): Promise<ProcessedImage> => {
  // Jika file adalah GIF, pertahankan format aslinya
  if (originalMimeType === 'image/gif') {
    return { buffer, mimetype: 'image/gif', extension: 'gif' };
  }

  // Jika file adalah gambar lainnya, konversi ke WebP
  if (originalMimeType.startsWith('image/')) {
    const convertedBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // Kualitas 80% (Standar Industri Web)
      .toBuffer();

    return {
      buffer: convertedBuffer,
      mimetype: 'image/webp',
      extension: 'webp',
    };
  }

  // Jika file non-gambar (misal: PDF, ZIP, DOCX)
  const ext = originalMimeType.split('/')[1] || 'bin';
  return { buffer, mimetype: originalMimeType, extension: ext };
};