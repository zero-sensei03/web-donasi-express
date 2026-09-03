import z from "zod";

export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string("Email tidak boleh kosong")
      .trim()
      .min(1, "Email tidak boleh kosong")
      .email("Email tidak valid")
      .max(255, "Email maksimal terdiri dari 255 karakter"),

    password: z
      .string("Password tidak boleh kosong")
      .min(8, "Password minimal 8 karakter")
      .max(128, "Password maksimal 128 karakter")
      .regex(
        /[a-z]/,
        "Password harus terdiri dari minimal 1 huruf kecil"
      )
      .regex(
        /[A-Z]/,
        "Password harus terdiri dari minimal 1 huruf besar"
      )
      .regex(
        /[0-9]/,
        "Password harus terdiri dari minimal 1 angka"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password harus terdiri dari minimal 1 spesial karakter"
      ),
  }),
})


export type RequestLoginDTO = z.infer<typeof LoginSchema>["body"];