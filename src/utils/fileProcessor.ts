import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';
import { minioClient } from '../config/minio';
import path from 'path';
import fs from 'fs';
import os from 'os';

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'uploads';

// Helper untuk unggah Stream ke MinIO
const uploadStreamToMinio = (stream: Readable, filename: String, mimeType: string, size?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    minioClient.putObject(
      BUCKET_NAME,
      filename.toString(),
      stream,
      size,
      { 'Content-Type': mimeType },
      (err) => {
        if (err) return reject(err);
        const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${filename}`;
        resolve(fileUrl);
      }
    );
  });
};

// 1. Kompres Gambar & Konversi ke WebP
export const processImage = async (fileBuffer: Buffer): Promise<{ url: string; filename: string }> => {
  const compressedBuffer = await sharp(fileBuffer)
    .webp({ quality: 80 }) // Kualitas 80% WebP memberikan rasio kompresi optimal
    .toBuffer();

  const filename = `gallery/images/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const stream = Readable.from(compressedBuffer);

  const url = await uploadStreamToMinio(stream, filename, 'image/webp', compressedBuffer.length);
  return { url, filename };
};

// 2. Kompres Video (FFmpeg)
export const processVideo = async (fileBuffer: Buffer, originalName: string): Promise<{ url: string; filename: string }> => {
  const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}-${originalName}`);
  const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);

  // Tulis buffer sementara ke disk lokal untuk diproses FFmpeg
  await fs.promises.writeFile(tempInputPath, fileBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempInputPath)
      .outputOptions([
        '-vcodec libx264',
        '-crf 28',         // Semakin tinggi CRF, kompresi semakin besar (skala 0-51, default 23)
        '-preset fast',
        '-acodec aac',
        '-b:a 128k',
      ])
      .toFormat('mp4')
      .on('end', async () => {
        try {
          const compressedBuffer = await fs.promises.readFile(tempOutputPath);
          const filename = `gallery/videos/${Date.now()}-${Math.round(Math.random() * 1e9)}.mp4`;
          const stream = Readable.from(compressedBuffer);

          const url = await uploadStreamToMinio(stream, filename, 'video/mp4', compressedBuffer.length);

          // Hapus file sementara
          await fs.promises.unlink(tempInputPath);
          await fs.promises.unlink(tempOutputPath);

          resolve({ url, filename });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', async (err) => {
        // Hapus file sementara jika error
        if (fs.existsSync(tempInputPath)) await fs.promises.unlink(tempInputPath);
        if (fs.existsSync(tempOutputPath)) await fs.promises.unlink(tempOutputPath);
        reject(err);
      })
      .save(tempOutputPath);
  });
};

// 3. Upload Document PDF tanpa Kompresi
export const processPdf = async (fileBuffer: Buffer, category: 'sponsor' | 'proposal'): Promise<{ url: string; filename: string }> => {
  const filename = `${category}/${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
  const stream = Readable.from(fileBuffer);

  const url = await uploadStreamToMinio(stream, filename, 'application/pdf', fileBuffer.length);
  return { url, filename };
};