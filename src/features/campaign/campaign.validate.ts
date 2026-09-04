import z from "zod";


export const CreateCampaignSchema = z.object({
  body: z.object({
    startAt: z.coerce
      .date("Start date tidak valid"),

    endAt: z.coerce
      .date("End date tidak valid"),

    title: z
      .string("Title tidak boleh kosong")
      .trim()
      .min(1, "Title tidak boleh kosong")
      .max(255, "Title maksimal 255 karakter"),

    description: z
      .string("Description tidak boleh kosong")
      .trim()
      .min(1, "Description tidak boleh kosong"),

    targetDonationAmount: z
      .number("Target donasi harus berupa angka")
      .finite("Target donasi harus berupa angka valid")
      .nonnegative("Target donasi tidak boleh negatif"),

    sponsorCount: z
      .number("Sponsor count harus berupa angka")
      .int("Sponsor count harus berupa angka bulat")
      .nonnegative("Sponsor count tidak boleh negatif"),
  }),
}).refine(
  (data) => data.body.endAt > data.body.startAt,
  {
    message: "End date harus lebih besar dari start date",
    path: ["body", "endAt"],
  }
);

export type RequestCreateCampaignDTO =
  z.infer<typeof CreateCampaignSchema>["body"];


export const UpdateCampaignSchema = z.object({
  body: z.object({
    startAt: z.coerce
      .date("Start date tidak valid")
      .optional(),

    endAt: z.coerce
      .date("End date tidak valid")
      .optional(),

    title: z
      .string()
      .trim()
      .min(1, "Title tidak boleh kosong")
      .max(255, "Title maksimal 255 karakter")
      .optional(),

    description: z
      .string()
      .trim()
      .min(1, "Description tidak boleh kosong")
      .optional(),

    targetDonationAmount: z
      .number()
      .finite()
      .nonnegative("Target donasi tidak boleh negatif")
      .optional(),

    sponsorCount: z
      .number()
      .int()
      .nonnegative("Sponsor count tidak boleh negatif")
      .optional(),
  }),
});

export type RequestUpdateCampaignDTO =
  z.infer<typeof UpdateCampaignSchema>["body"];


export const SetActiveCampaignSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("ID campaign tidak valid"),
  }),
});

export type RequestSetActiveCampaignDTO =
  z.infer<typeof SetActiveCampaignSchema>["params"];