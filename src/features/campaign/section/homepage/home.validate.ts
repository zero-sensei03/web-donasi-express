import z from "zod";

// --- HOME PAGE SECTION SCHEMA ---
export const UpsertHomePageSchema = z.object({
  body: z.object({
    heroTagline: z.string().trim().optional().nullable(),
    heroTitle: z.string().trim().optional().nullable(),
    heroDescription: z.string().trim().optional().nullable(),

    whyHomeDescription: z.string().trim().optional().nullable(),

    supportWorkTagline: z.string().trim().optional().nullable(),
    supportWorkDescription: z.string().trim().optional().nullable(),

    ctaSectionTagline: z.string().trim().optional().nullable(),
    ctaSectionTitle: z.string().trim().optional().nullable(),
    ctaSectionSubtitle: z.string().trim().optional().nullable(),
  }),
});

export type RequestUpsertHomePageDTO = z.infer<typeof UpsertHomePageSchema>["body"];

// --- WHY SECTION SCHEMAS ---
export const CreateWhySectionSchema = z.object({
  body: z.object({
    homePageSectionId: z
      .string("HomePage Section ID wajib diisi")
      .uuid("HomePage Section ID tidak valid"),
    icon: z.string().trim().optional().nullable(),
    title: z
      .string("Title wajib diisi")
      .trim()
      .min(1, "Title tidak boleh kosong"),
    subTitle: z.string().trim().optional().nullable(),
  }),
});

export type RequestCreateWhySectionDTO = z.infer<typeof CreateWhySectionSchema>["body"];

// --- SUPPORT WORK SECTION SCHEMAS ---
export const CreateSupportWorkSchema = z.object({
  body: z.object({
    homePageSectionId: z
      .string("HomePage Section ID wajib diisi" )
      .uuid("HomePage Section ID tidak valid"),
    order: z
      .number("Order wajib diisi" )
      .int("Order harus berupa angka bulat")
      .min(1, "Order minimal 1"),
    title: z
      .string("Title wajib diisi" )
      .trim()
      .min(1, "Title tidak boleh kosong"),
    description: z.string().trim().optional().nullable(),
    tagline: z.string().trim().optional().nullable(),
    focus: z.array(z.string().trim()).optional().default([]),
  }),
});

export type RequestCreateSupportWorkDTO = z.infer<typeof CreateSupportWorkSchema>["body"];