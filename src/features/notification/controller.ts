import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { NotificationService } from "./service";

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService()
    }

    getAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = req.query;
            const result = await this.notificationService.findAll(limit ? Number(limit) : 10, page ? Number(page) : 1)
            return sendSuccess(res, "Data notifikasi berhasil didapatkan", result, 200)
        } catch (error) {
            next(error)
        }
    }
    read = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.notificationService.read(id.toString())
            return sendSuccess(res, "Notifikasi berhasil dibaca", result, 200)
        } catch (error) {
            next(error)
        }
    }
    readAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.notificationService.readAll()
            return sendSuccess(res, "Notifikasi berhasil dibaca", result, 200)
        } catch (error) {
            next(error)
        }
    }
}