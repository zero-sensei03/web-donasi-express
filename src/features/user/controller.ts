import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { UserService } from "./service";
import { RequestCreateUserDTO, RequestUpdateUserDTO } from "./validate";
import { userAgent } from "../../utils/userAgent";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService()
    }

    create = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const body: RequestCreateUserDTO = req.body;

            const userData = req.user
            const agent = await userAgent(req)

            const result = await this.userService.create(agent, userData ? userData.userId : "", body)
            return sendSuccess(res, "Data user berhasil ditambahkan", result, 201)
        } catch (error) {
            next(error)
        }
    }
    update = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const body: RequestUpdateUserDTO = req.body;

            const userData = req.user
            const agent = await userAgent(req)

            const result = await this.userService.update(agent, userData ? userData.userId : "", id.toString(), body)
            return sendSuccess(res, "Data user berhasil diperbarui", result, 200)
        } catch (error) {
            next(error)
        }
    }
    delete = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params

            const userData = req.user
            const agent = await userAgent(req)

            const result = await this.userService.delete(agent, userData ? userData.userId : "", id.toString())
            return sendSuccess(res, "Data user berhasil dihapus", result, 200)
        } catch (error) {
            next(error)
        }
    }
    getAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit, search, status } = req.query;
            const result = await this.userService.findAll(limit ? Number(limit) : 10, page ? Number(page) : 1, search ? search.toString() : undefined, status ? status.toString() : undefined)
            return sendSuccess(res, "Data user berhasil didapatkan", result, 200)
        } catch (error) {
            next(error)
        }
    }
    getById = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.userService.findById(id.toString())
            return sendSuccess(res, "Data user berhasil didapatkan", result, 200)
        } catch (error) {
            next(error)
        }
    }
}