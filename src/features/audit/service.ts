import { AuditTransaction, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { agentResult } from "../../utils/userAgent";

function generateAuditDescription(
  action: AuditTransaction,
  resource: string,
): string {
  switch (action) {
    case "CREATE":
      return `${resource} created.`;

    case "UPDATE":
      return `${resource} updated.`;

    case "DELETE":
      return `${resource} deleted.`;

    case "LOGIN":
      return "User logged in.";

    case "LOGOUT":
      return "User logged out.";

    case "VERIFY":
      return `${resource} verified`;

    case "REJECT":
      return `${resource} rejected`;

    default:
      return `${resource} action performed.`;
  }
}

 export interface FindAllAuditLogDto {
  page?: number;
  limit?: number;
  userId?: string;
  transaction?: AuditTransaction;
  entity?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export class AuditService {
  async create(
    prisma: Prisma.TransactionClient,
    userId: string | null,
    action: AuditTransaction,
    entity: string,
    entityId: string | null,
    agent: agentResult,
    data?: Prisma.InputJsonValue,
  ) {
    const payload = {
        userId,
        transaction: action,
        entity: entity.toUpperCase(),
        entityId: entityId,
        description: generateAuditDescription(action, entity),
        metadata: data,
        ...agent
    }

    return prisma.auditLog.create({
      data: payload,
    });
  }
  async findAll(query: FindAllAuditLogDto = {}) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    // Susun kueri filter Prisma
    const where: Prisma.AuditLogWhereInput = {
      ...(query.userId && { userId: query.userId }),
      ...(query.transaction && { transaction: query.transaction }),
      ...(query.entity && { entity: { contains: query.entity, mode: 'insensitive' } }),
      ...((query.startDate || query.endDate) && {
        createdAt: {
          ...(query.startDate && { gte: query.startDate }),
          ...(query.endDate && { lte: query.endDate }),
        },
      }),
      ...(query.search && {
        OR: [
          { description: { contains: query.search, mode: 'insensitive' } },
          { entityId: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),

      prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByResource(
    entity: string,
    entityId: string,
  ) {
    return prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    try {
      const data = prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!data) throw new AppError("Data tidak ditemukan", 404)

      return data
    } catch (error) {
      throw error
    }
  }
}