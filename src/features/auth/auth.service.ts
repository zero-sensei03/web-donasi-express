import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { comparePassword } from "../../utils/bcrypt";
import { generateAuthTokens, verifyRefreshToken } from "../../utils/jwt";
import { agentResult } from "../../utils/userAgent";
import { AuditService } from "../audit/service";
import { RequestLoginDTO } from "./auth.validate";

export class AuthService {

    private auditService: AuditService;

    constructor(){
        this.auditService = new AuditService();
    }

    async login (agent: agentResult, dto: RequestLoginDTO) {
        const normalizedEmail = dto.email.trim().toLowerCase();

        try {
            return await prisma.$transaction(async (tx) => {
                const user = await prisma.user.findUnique({
                    where: {
                        email: normalizedEmail
                    }
                })
                if (!user) throw new AppError(`User dengan email ${normalizedEmail} tidak terdaftar`, 404);
                if (!user.isActive) throw new AppError(`User dengan email ${normalizedEmail} tidak aktif, silahkan hubungi admin jika terdapat kesalahan`, 400);

                const isPasswordValid = await comparePassword(
                    dto.password,
                    user.password || ""
                );
                if (!isPasswordValid) throw new AppError("Email atau password yang kamu masukkan salah", 400);

                const token = await generateAuthTokens({
                    userId: user.id || "",
                    role: user.role || "EDITOR"
                })

                await this.auditService.create(tx, user.id, "LOGIN", "user", user.id, agent, undefined)

                return {
                    ...token,
                    user: {
                        email: user.email,
                        role: user.role
                    }
                }
            })

        } catch (error) {
            throw error;
        }

    };

    async refresh(refreshToken: string) {
        const checkRefreshToken = verifyRefreshToken(refreshToken);
        if(!checkRefreshToken) throw new AppError("Refresh token tidak valid", 401);

        const user = await prisma.user.findUnique({
            where: {
                id: checkRefreshToken.userId
            }
        });
        if (!user) throw new AppError(`User dengan id ${checkRefreshToken.userId} tidak terdaftar`, 404);
        if (!user.isActive) throw new AppError(`User dengan id ${checkRefreshToken.userId} tidak aktif, silahkan hubungi admin jika terdapat kesalahan`, 400);

        try {
            const token = await generateAuthTokens({
                userId: user.id || "",
                role: user.role || "EDITOR"
            })

            return {
                ...token,
                user: {
                    email: user.email,
                    role: user.role
                }
            }
        } catch (error) {
            throw error;
        }
    }
}