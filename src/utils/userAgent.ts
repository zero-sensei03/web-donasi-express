import { Request } from "express";

export type agentResult = {
    ipAddress: string;
    userAgent: string;
}

function normalizeIp(ip: string) {
  if (ip === "::1") {
    return "127.0.0.1";
  }

  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  return ip;
}

export const userAgent = async (req: Request): Promise<agentResult> => {
    return {
        ipAddress: normalizeIp(req.ip || "127.0.0.1"),
        userAgent: req.get("user-agent") || "-"
    }
}