import { NotificationType, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export class NotificationService {
  async create(
    prisma: Prisma.TransactionClient,
    title: string,
    message: string,
    type: NotificationType,
    donationId?: string | null,
  ) {
    const payload = {
        title,
        message,
        type,
        donationId,
        isRead: false
    }

    return prisma.notification.create({
      data: payload,
    });
  }
  async findAll(limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;

    const [data, total, totalNotRead] = await Promise.all([
      prisma.notification.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit
      }),

      prisma.notification.count({}),

      prisma.notification.count({
        where: {
          isRead: false
        }
      }),
    ]);

    return {
      result: {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      totalNotRead
    };
  }
  async read(id: string) {
    try {
      const lastData = await prisma.notification.findUnique({
        where: { id }
      })

      if (!lastData) throw new AppError("Data tidak ditemukan", 404)

      return await prisma.notification.update({
        where: { id },
        data: {
          isRead: true
        }
      })
    } catch (error) {
      throw error
    }
  }
  async readAll() {
    try {
      return await prisma.notification.updateMany({
        where: {
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } catch (error) {
      throw error
    }
  }
}