import { UserRole } from "@prisma/client";
import { z } from "zod";

const baseSchema = z.object({
  fullName: z.string().min(3, "Numele complet este obligatoriu."),
  email: z.email("Email invalid."),
  password: z
    .string()
    .min(8, "Parola trebuie sa aiba minim 8 caractere."),
  phoneNumber: z
    .string()
    .min(10, "Numarul de telefon este obligatoriu.")
    .max(20, "Numar de telefon invalid."),
  role: z.enum(UserRole),
  city: z.string().optional(),
  country: z.string().optional(),
});

const candidateSchema = baseSchema.extend({
  role: z.literal(UserRole.CANDIDATE),
  title: z.string().min(2, "Functia este obligatorie."),
  cvUrl: z.string().min(5, "CV-ul este obligatoriu pentru candidati."),
  openToOpportunities: z.boolean().default(true),
});

const companySchema = baseSchema.extend({
  role: z.literal(UserRole.COMPANY),
  companyName: z.string().min(2, "Numele companiei este obligatoriu."),
  cui: z.string().min(2, "CUI este obligatoriu."),
  fiscalCode: z.string().min(2, "Codul fiscal este obligatoriu."),
  companyAddress: z.string().min(5, "Adresa companiei este obligatorie."),
  companyContactName: z
    .string()
    .min(2, "Persoana de contact este obligatorie."),
  companyContactEmail: z.email("Email de contact companie invalid."),
});

const universitySchema = baseSchema.extend({
  role: z.literal(UserRole.UNIVERSITY),
  universityName: z.string().min(2, "Denumirea universitatii este obligatorie."),
  universityAddress: z.string().min(5, "Adresa universitatii este obligatorie."),
  faculties: z.string().min(5, "Detalii facultati sunt obligatorii."),
  universityContactPhone: z
    .string()
    .min(10, "Telefonul de contact este obligatoriu."),
  universityContactEmail: z.email("Email de contact universitate invalid."),
  universityDescription: z
    .string()
    .min(15, "Descrierea universitatii este obligatorie."),
});

export const registerSchema = z.discriminatedUnion("role", [
  candidateSchema,
  companySchema,
  universitySchema,
]);

export type RegisterInput = z.infer<typeof registerSchema>;
