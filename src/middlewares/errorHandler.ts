import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import { parsePrismaError } from "../utils/prismaError";
import { sendError } from "../utils/response";
import { Env } from "../config/env";
import { AppError } from "../utils/AppError";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Custom application error
    if (err instanceof AppError) {
        return sendError(
            res,
            err.message,
            null,
            err.statusCode
        );
    }

    // Prisma known request error
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const { statusCode, message } = parsePrismaError(err);

        return sendError(
            res,
            message,
            null,
            statusCode
        );
    }

    // Unexpected error
    console.error(
        `[Unhandled Error]: ${err.message}`,
        err.stack
    );

    return sendError(
        res,
        "Internal Server Error",
        Env.NODE_ENV === "development" ? err.stack : null,
        500
    );
};