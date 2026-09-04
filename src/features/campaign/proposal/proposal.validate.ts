import z from "zod";

export const CreateCampaignProposalSchema = z.object({
  body: z.object({
    campaignId: z
      .string("Campaign ID wajib diisi")
      .uuid("Campaign ID tidak valid"),

    title: z
      .string("Title wajib diisi")
      .trim()
      .min(1, "Title wajib diisi")
      .max(255, "Title maksimal 255 karakter"),

    description: z
      .string("Description wajib diisi")
      .trim()
      .min(1, "Description wajib diisi"),

    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], "Status tidak valid" ),
  }),
});

export type RequestCreateCampaignProposalDTO =
  z.infer<typeof CreateCampaignProposalSchema>["body"];