import { z } from "zod";

export const CreateDonationSchema = z.object({
  body: z.object({
    campaignId: z
      .string("Campaign ID wajib diisi")
      .uuid("Campaign ID tidak valid"),

    donorName: z
      .string()
      .trim()
      .max(255, "Nama pendonor maksimal 255 karakter")
      .optional(),
      
    message: z
      .string()
      .trim()
      .max(1000, "Nama pendonor maksimal 1000 karakter")
      .optional(),

    amount: z.coerce
      .number("Jumlah donasi harus berupa angka")
      .finite("Jumlah donasi harus berupa angka valid")
      .nonnegative("Jumlah donasi tidak boleh negatif"),
  }),
});

export type RequestCreateDonationDTO =
  z.infer<typeof CreateDonationSchema>["body"];