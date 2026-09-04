import { prisma } from "../../lib/prisma"
import { storageService } from "../../lib/storage.service";
import { AppError } from "../../utils/AppError";
import { agentResult } from "../../utils/userAgent";
import { AuditService } from "../audit/service";

export const SiteSettingPublic = async() => {
    return await prisma.siteSetting.findMany({
        select: {
            key: true,
            value: true
        }
    });
}

export class SiteSettingService {

    private auditService: AuditService;
    constructor() {
        this.auditService = new AuditService();
    }

    async get () {
       return await prisma.siteSetting.findMany({
            select: {
                key: true,
                value: true
            }
        }); 
    };

    async getByKey (key: string) {
       const result = await prisma.siteSetting.findUnique({
            where: {
                key
            },
            select: {
                key: true,
                value: true
            }
        });
        
        if(!result) throw new AppError(`Site Setting dengan key ${key} tidak ditemukan`)

        return result;
    };

    async update (agent: agentResult, userId: string, key: string, value: string | null, file: Express.Multer.File | null) {

        if(!value && !file) throw new AppError("Value atau file tidak boleh kosong")
        
        const data = await this.getByKey(key)

        let dataValue: string = value || "";

        if(key === "app.logo" && file) {
            const logofile = await storageService.upload(file.buffer, file.mimetype, {
                folder: 'others',
            });

            dataValue = logofile
        }

        return await prisma.$transaction( async(tx) => {
            const result = await tx.siteSetting.update({
                where: {
                    key: data.key
                },
                data: {
                    value: dataValue
                }
            })
    
            await this.auditService.create(tx, userId, "UPDATE", "site_settings", result.key, agent, result)
            return result;
        } )
    }
}