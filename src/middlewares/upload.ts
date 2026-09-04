import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

export interface UploadMiddlewareOptions {
  maxFileSizeMB?: number;   // Batas ukuran per file (default: 5MB)
  maxFilesCount?: number;  // Batas jumlah file upload majemuk (default: 5)
  allowedMimeTypes?: string[];
}

export const createUploadMiddleware = (options: UploadMiddlewareOptions = {}) => {
  const {
    maxFileSizeMB = 5,
    maxFilesCount = 5,
    allowedMimeTypes,
  } = options;

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          `File type '${file.mimetype}' is not allowed. Allowed formats: ${allowedMimeTypes.join(", ")}`
        )
      );
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
      files: maxFilesCount,
    },
    fileFilter,
  });

  return {
    /**
     * Middleware untuk Upload 1 File
     */
    single: (fieldName: string) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err: any) => {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                message: `File size is too large. Maximum allowed size is ${maxFileSizeMB} MB per file.`,
              });
            }
            return res.status(400).json({ success: false, message: err.message });
          } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
          }
          next();
        });
      };
    },

    /**
     * Middleware untuk Upload Majemuk / Banyak File (Array)
     */
    array: (fieldName: string) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName, maxFilesCount)(req, res, (err: any) => {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                message: `One or more files exceed the maximum allowed size of ${maxFileSizeMB} MB.`,
              });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({
                success: false,
                message: `The number of files exceeds the limit. A maximum of ${maxFilesCount} files can be uploaded at once.`,
              });
            }
            return res.status(400).json({ success: false, message: err.message });
          } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
          }
          next();
        });
      };
    },
    

    fields: (
      fields: { name: string; maxCount: number }[],
    ) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.fields(fields)(req, res, (err: any) => {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message: `One or more files exceed the maximum allowed size of ${maxFileSizeMB} MB.`,
              });
            }

            if (
              err.code === "LIMIT_UNEXPECTED_FILE" ||
              err.code === "LIMIT_FILE_COUNT"
            ) {
              return res.status(400).json({
                success: false,
                message: `The number of files exceeds the limit.`,
              });
            }

            return res.status(400).json({
              success: false,
              message: err.message,
            });
          }

          if (err) {
            return res.status(400).json({
              success: false,
              message: err.message,
            });
          }

          next();
        });
      };
    },
  };
};