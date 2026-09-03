import { Response } from "express";
import { ApiResponse } from "../types/response.type";



export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  error: unknown = null,
  statusCode: number = 500
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(error !== null && { error }),
  };
  return res.status(statusCode).json(responsePayload);
};