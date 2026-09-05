import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { Role } from "../generated/prisma/client";

/**
 * Middleware untuk memverifikasi apakah pengguna terautentikasi (Bearer Token)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization;

  if (!accessToken || !accessToken.startsWith("Bearer ")) {
    return sendError(
      res,
      "Authentication required. Access token not found.",
      null,
      401
    );
  }

  try {
    const dataToken = accessToken.split(" ")
    const decoded = verifyAccessToken(dataToken[1]);
    req.user = decoded; // Menyimpan data payload JWT (userId & role) ke request
    next();
  } catch (error) {
    return sendError(
      res,
      "Invalid or expired access token.",
      null,
      401
    );
  }
};

/**
 * Middleware Role-based Access Control (RBAC)
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return sendError(
        res,
        "Authentication required.",
        null,
        401
      );
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return sendError(
        res,
        "You do not have permission to perform this action.",
        null,
        403
      );
    }

    next();
  };
};