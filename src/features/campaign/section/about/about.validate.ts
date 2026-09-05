import z from "zod";

// --- ABOUT US SECTION SCHEMA ---
export const UpsertAboutUsSchema = z.object({
  body: z.object({
    heroTagline: z.string().trim().optional().nullable(),
    heroTitle: z.string().trim().optional().nullable(),
    heroDescription: z.string().trim().optional().nullable(),
    vision: z.string().trim().optional().nullable(),
    mission: z.array(z.string().trim()).optional().default([]),
  }),
});

export type RequestUpsertAboutUsDTO = z.infer<typeof UpsertAboutUsSchema>["body"];

// --- CAMPAIGN TIM SCHEMAS ---
export const CreateCampaignTimSchema = z.object({
  body: z.object({
    aboutUsSectionId: z
      .string("About Us Section ID wajib diisi")
      .uuid("About Us Section ID tidak valid"),
    name: z
      .string("Nama anggota tim wajib diisi")
      .trim()
      .min(1, "Nama anggota tim tidak boleh kosong"),
    position: z.string().trim().optional().nullable(),
    instagram: z.string().trim().optional().nullable(),
    linkedin: z.string().trim().optional().nullable(),
  }),
});

export type RequestCreateCampaignTimDTO = z.infer<typeof CreateCampaignTimSchema>["body"];

// --- WORK STRUCTURE DIVISION SCHEMAS ---
export const CreateWorkStructureSchema = z.object({
  body: z.object({
    aboutUsSectionId: z
      .string("About Us Section ID wajib diisi")
      .uuid("About Us Section ID tidak valid"),
    divisionName: z
      .string("Nama divisi wajib diisi")
      .trim()
      .min(1, "Nama divisi tidak boleh kosong"),
    divisionJobDescription: z
      .string("Deskripsi pekerjaan divisi wajib diisi")
      .trim()
      .min(1, "Deskripsi pekerjaan divisi tidak boleh kosong"),
  }),
});
export type RequestCreateWorkStructureDTO = z.infer<typeof CreateWorkStructureSchema>["body"];