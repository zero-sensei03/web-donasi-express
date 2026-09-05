import z from "zod";

export const CreateUserSchema = z.object({
  body: z.object({
    email: z
      .string("Email wajib diisi")
      .trim()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid"),

    password: z
      .string("Password wajib diisi")
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter"),

    role: z.enum(["ADMIN", "EDITOR"], "Role tidak valid"),

    isActive: z
      .boolean("isActive harus berupa boolean")
      .optional()
      .default(true),
  }),
});

export type RequestCreateUserDTO = z.infer<typeof CreateUserSchema>["body"];

export const UpdateUserSchema = z.object({
  body: z.object({
    email: z
      .string("Email wajib diisi")
      .trim()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid"),

    password: z
      .string("Password wajib diisi")
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter")
      .optional(),

    role: z.enum(["ADMIN", "EDITOR"], "Role tidak valid"),

    isActive: z
      .boolean("isActive harus berupa boolean")
      .optional()
      .default(true),
  }),
});

export type RequestUpdateUserDTO = z.infer<typeof UpdateUserSchema>["body"];
