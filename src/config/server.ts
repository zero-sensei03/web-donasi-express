import express from "express";

import { Env } from "./env";
import { corsMiddleware } from "./cors";
import { router } from "./router";
import { errorHandler } from "../middlewares/errorHandler"

const PORT = Env.PORT;

const app = express();
app.use(corsMiddleware)

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/health", async (req, res) => {
  res.json({
    message: "Service is healthy",
    data: {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: Env.NODE_ENV || "development",
    }
  })
});

app.use("/api", router)

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});