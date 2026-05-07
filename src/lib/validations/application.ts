import { z } from "zod";

export const applicationSchema = z.object({
  listingId: z.string().min(3),
  candidateId: z.string().min(3),
  motivation: z
    .string()
    .min(20, "Mesajul de aplicare trebuie sa fie detaliat."),
  cvUrl: z.string().min(5, "CV-ul este obligatoriu."),
});
