import "dotenv/config";

export const Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4001,https://app.apidog.com",

  // JWT Configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "default_access_secret_key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // stprage
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "",
  MINIO_USERNAME: process.env.MINIO_USERNAME || "",
  MINIO_PASSWORD: process.env.MINIO_PASSWORD || "",
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || "",
  MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL || "",
};

// Validasi saat startup
if (!Env.DATABASE_URL) {
  throw new Error("FATAL: DATABASE_URL is not configured in .env file.");
}