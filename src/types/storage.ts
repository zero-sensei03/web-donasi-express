import { z } from 'zod';

export interface UploadOptions {
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  mimetype: string;
}

// Zod Schema untuk validasi dinamis file buffer & MIME type di Controller
export const createFileTypeSchema = (allowedMimeTypes: string[]) =>
  z.object({
    mimetype: z.string().refine((val) => allowedMimeTypes.includes(val), {
      message: `Tipe file tidak diizinkan. MimeType yang diterima: ${allowedMimeTypes.join(', ')}`,
    }),
    buffer: z.instanceof(Buffer, { message: 'File buffer tidak valid' }),
  });