import cors, { CorsOptions } from "cors";
import { Env } from "./env";

const origin = Env.CORS_ORIGIN.split(",")

export const corsOptions: CorsOptions = {
  origin, 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-timezone", "x-sa-signature"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);