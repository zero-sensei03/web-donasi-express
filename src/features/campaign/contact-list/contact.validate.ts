import z from "zod";

export const CreateContactSchema = z.object({
  body: z.object({
    campaignId: z
      .string("Campaign ID wajib diisi")
      .uuid("Campaign ID tidak valid"),

    name: z
      .string("Nama cs rekening tidak boleh kosong")
      .trim()
      .min(1, "Nama cs maksimal 255 karakter")
      .max(255, "Nama cs maksimal 255 karakter"),

    role: z
      .string("Fungsi cs tidak boleh kosong")
      .trim()
      .min(1, "Fungsi cs 255 karakter")
      .max(255, "Fungsi cs 255 karakter"),

    phone: z
      .string("Telepon/Username cs tidak boleh kosong")
      .trim()
      .min(1, "Telepon/Username cs 255 karakter")
      .max(255, "Telepon/Username cs 255 karakter"),

    type: z.enum(["WHATSAPP", "TELEGRAM"], "Tipe contact tidak valid" ),
  }),
});

export type RequestCreateContactDTO =
  z.infer<typeof CreateContactSchema>["body"];