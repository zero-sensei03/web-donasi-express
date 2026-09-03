import { AuditTransaction, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
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

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.auditLog.count({
        where: { userId },
      }),
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
    return prisma.auditLog.findUnique({
      where: { id }
    });
  }
}