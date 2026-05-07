import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email invalid."),
  password: z.string().min(1, "Parola este obligatorie."),
});
