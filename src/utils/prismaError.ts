import { Prisma } from "../generated/prisma/client";

interface ParsedPrismaError {
  statusCode: number;
  message: string;
}

export const parsePrismaError = (error: Prisma.PrismaClientKnownRequestError): ParsedPrismaError => {
  console.error(error)
  switch (error.code) {
    case "P2002": {
      const target =
        (error.meta?.target as string[])?.join(", ") || "field";

      return {
        statusCode: 409,
        message: `Data with ${target} already exists.`,
      };
    }

    case "P2025":
      return {
        statusCode: 404,
        message: "The requested data was not found.",
      };

    case "P2003":
      return {
        statusCode: 400,
        message: "Failed to process the data because the related data is invalid.",
      };

    case "P2014":
      return {
        statusCode: 400,
        message: "The operation cannot be completed because the data is related to other records.",
      };

    default:
      return {
        statusCode: 400,
        message: `A database error occurred (Code: ${error.code}).`,
      };
  }
};