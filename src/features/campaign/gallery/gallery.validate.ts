import { z } from "zod";

export const CreateGallerySchema = z.object({
  body: z.object({
    campaignId: z
      .string("Campaign ID wajib diisi")
      .uuid("Campaign ID tidak valid"),

    galleryType: z
      .enum(["IMAGE", "VIDEO"], "Gallery type tidak valid")
      .default("IMAGE"),

    title: z
      .string()
      .trim()
      .max(255, "Title maksimal 255 karakter")
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, "Description maksimal 5000 karakter")
      .optional(),

    timeStamp: z
      .coerce
      .date("Timestamp tidak valid"),
  }),
});

export type RequestCreateGalleryDTO =
  z.infer<typeof CreateGallerySchema>["body"];