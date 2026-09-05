import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { hashPassword } from "../../utils/bcrypt";
import { agentResult } from "../../utils/userAgent";
import { AuditService } from "../audit/service";
import { RequestCreateUserDTO, RequestUpdateUserDTO } from "./validate";

export class UserService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async create(agent: agentResult, userId: string, data: RequestCreateUserDTO) {
    const payload = {
        ...data,
        password: await hashPassword(data.password)
    }

    return await prisma.$transaction(async(tx) => {
      const result = await tx.user.create({
        data: payload,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
      });
  
      await this.auditService.create(tx, userId, "CREATE", "user", result.id, agent, result)

      return result
    })
  }
  async findAll(limit: number = 10, page: number = 1, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(
        search ? {
          OR: [
            {
              email: {
                contains: search,
                mode: "insensitive"
              }
            }
          ]
        } : {}
      ),
      ...(
        status ? {
          isActive: status.toLowerCase() === "active" ? true : false
        } : {}
      )
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        skip,
        take: limit
      }),

      prisma.user.count({ where }),
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
  async findById(id: string) {
    try {
      const lastData = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
      })

      if (!lastData) throw new AppError("Data tidak ditemukan", 404)

      return lastData;
    } catch (error) {
      throw error
    }
  }
  async update(agent: agentResult, userId: string, id: string, data: RequestUpdateUserDTO) {
    const lastData = await prisma.user.findUnique({
      where: { id }
    })

    if (!lastData) throw new AppError("Data tidak ditemukan", 404)

    const payload = {
        ...data,
        password: data.password ? await hashPassword(data.password) : lastData.password
    }

    return await prisma.$transaction(async(tx) => {
      const result = await tx.user.update({
        where: {
          id
        },
        data: payload,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
      });
  
      await this.auditService.create(tx, userId, "UPDATE", "user", result.id, agent, result)

      return result
    })
  }
  async delete(agent: agentResult, userId: string, id: string) {
    try {
      const lastData = await prisma.user.findUnique({
        where: { id }
      })

      if (!lastData) throw new AppError("Data tidak ditemukan", 404)

      return await prisma.$transaction(async(tx) => {
        const result = await tx.user.delete({
          where: {
            id
          },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          },
        })

        await this.auditService.create(tx, userId, "DELETE", "user", result.id, agent, result)

        return result;
      })
    } catch (error) {
      throw error
    }
  }
}