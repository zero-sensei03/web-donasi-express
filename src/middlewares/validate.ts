import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { sendError } from "../utils/response";

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Memvalidasi body, query, dan params sekaligus
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // 1. req.body aman untuk ditimpa langsung
      req.body = parsed.body;

      // 2. req.query & req.params ditimpa nilainya menggunakan Object.assign
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.slice(1).join("."), // Menghapus prefix 'body'/'query'/'params'
          message: issue.message,
        }));

        return sendError(
          res,
          "Validation failed. Please check your input and try again.",
          formattedErrors,
          400
        );
      }

      next(error);
    }
  };
};