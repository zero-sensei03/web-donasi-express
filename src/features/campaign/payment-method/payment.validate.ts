import z from "zod";

export const CreatePaymentMethodSchema = z.object({
  body: z.object({
    campaignId: z
      .string("Campaign ID wajib diisi")
      .uuid("Campaign ID tidak valid"),

    name: z
      .string("Nama pemilik rekening tidak boleh kosong")
      .trim()
      .min(1, "Nama pemilik maksimal 255 karakter")
      .max(255, "Nama pemilik maksimal 255 karakter"),

    description: z
      .string()
      .trim()
      .max(255, "Deskripsi maksimal 255 karakter")
      .optional(),

    bankName: z
      .string()
      .trim()
      .max(255, "Nama Bank maksimal 255 karakter")
      .optional(),

    accountNumber: z
      .string()
      .trim()
      .max(255, "Nomor rekening maksimal 255 karakter")
      .optional(),

    type: z.enum(["QRIS", "BANK_TRANSFER"], "Tipe pembayaran tidak valid" ),
  }),
});

export type RequestCreatePaymentMethodDTO =
  z.infer<typeof CreatePaymentMethodSchema>["body"];