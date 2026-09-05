import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { AuthService } from "./auth.service";
import { RequestLoginDTO } from "./auth.validate";
import { userAgent } from "../../utils/userAgent";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: RequestLoginDTO = req.body;
            const agent = await userAgent(req);
            const result = await this.authService.login(agent, payload);
            return sendSuccess(res, "Congratulation!, Anda berhasil login", result, 200);
        } catch (error) {
            next(error)
        }
    }
    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return sendError(res, "Refresh token tidak boleh kosong", undefined, 404)
            const result = await this.authService.refresh(refreshToken.toString());
            return sendSuccess(res, "Congratulation!, Token anda berhasil diperbarui", result, 200);
        } catch (error) {
            next(error)
        }
    }
    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return sendError(
                    res,
                    "Refresh token tidak boleh kosong",
                    undefined,
                    400
                );
            }

            const result = await this.authService.logout(
                refreshToken.toString()
            );

            return sendSuccess(
                res,
                "Anda berhasil logout",
                result,
                200
            );
        } catch (error) {
            next(error);
        }
    };
}