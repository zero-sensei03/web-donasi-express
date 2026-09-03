import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Env } from "../config/env";
import { UploadOptions, UploadResult } from '../types/storage';
import { processImage } from '../utils/imageOptimizer';

export const minioClient = new S3Client({
  endpoint: Env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: Env.MINIO_USERNAME || "",
    secretAccessKey: Env.MINIO_PASSWORD || "",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "";
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "";

export class StorageService {
  async upload(
    fileBuffer: Buffer,
    originalMimeType: string,
    options: UploadOptions = {}
  ): Promise<string> {
    // 1. Process & Optimize Image (Convert to WebP except GIF)
    const { buffer, mimetype, extension } = await processImage(fileBuffer, originalMimeType);

    // 2. Generate Unique Filename & Path
    const folder = options.folder ? `${options.folder}/` : '';
    const filename = `${crypto.randomUUID()}.${extension}`;
    const key = `${folder}${filename}`;

    return this.uploadToS3(key, buffer, mimetype);
  }

  /**
   * Main Method: Delete File
   */
  async delete(key: string): Promise<boolean> {
    try {
      await minioClient.send(
        new DeleteObjectCommand({
          Bucket: Env.MINIO_BUCKET_NAME!,
          Key: key,
        })
      );

      return true;
    } catch (error) {
      console.error(`Failed to delete file (${key}):`, error);
      return false;
    }
  }

  // --- PRIVATE DRIVER IMPLEMENTATIONS ---
  private async uploadToS3(key: string, buffer: Buffer, mimetype: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });


    await minioClient.send(command);

    return `${PUBLIC_URL}/${BUCKET_NAME}/${encodeURIComponent(
      key,
    ).replace(/%2F/g, "/")}`;
  }
}

export const storageService = new StorageService();