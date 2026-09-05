import { NextFunction, Request, Response } from "express";
import { AuditService, FindAllAuditLogDto } from "./service";
import { sendSuccess } from "../../utils/response";

export class AuditController {
    private auditService: AuditService;

    constructor() {
        this.auditService = new AuditService()
    }

    getAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const query: FindAllAuditLogDto = req.query;
            const result = await this.auditService.findAll(query)
            return sendSuccess(res, "Data audit berhasil didapatkan", result, 200)
        } catch (error) {
            next(error)
        }
    }
    getByid = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.auditService.findById(id.toString())
            return sendSuccess(res, "Data audit berhasil didapatkan", result, 200)
        } catch (error) {
            next(error)
        }
    }
}