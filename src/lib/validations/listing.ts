import { ListingCategory } from "@prisma/client";
import { z } from "zod";

const baseSchema = z.object({
  ownerUserId: z.string().min(3),
  category: z.enum(ListingCategory),
  title: z.string().min(3, "Titlul este obligatoriu."),
  description: z.string().min(20, "Descrierea trebuie sa fie completa."),
  city: z.string().min(2, "Orasul este obligatoriu."),
  country: z.string().min(2, "Tara este obligatorie."),
  relocationSupport: z.boolean().default(false),
  relocationDetails: z.string().optional(),
  disabilityFriendly: z.boolean().default(false),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  benefits: z.string().optional(),
  applicationEmail: z.email("Email de aplicare invalid."),
  deadlineAt: z.string().datetime().optional(),
});

const jobSchema = baseSchema.extend({
  category: z.literal(ListingCategory.JOB),
  employmentType: z.string().min(2, "Tipul de angajare este obligatoriu."),
  experienceLevel: z.string().min(2, "Nivelul de experienta este obligatoriu."),
});

const courseSchema = baseSchema.extend({
  category: z.literal(ListingCategory.COURSE),
  employmentType: z.string().optional(),
  experienceLevel: z.string().optional(),
});

const studyProgramSchema = baseSchema.extend({
  category: z.literal(ListingCategory.STUDY_PROGRAM),
  studyLevel: z.string().min(2, "Nivelul de studiu este obligatoriu."),
  studyYears: z.string().min(1, "Anul de studiu este obligatoriu."),
  seatsAvailable: z.number().int().positive("Numarul de locuri este obligatoriu."),
  eligibility: z.string().min(5, "Eligibilitatea este obligatorie."),
  requiredDocuments: z.string().min(5, "Documentele necesare sunt obligatorii."),
  selectionProcess: z.string().min(5, "Procesul de selectie este obligatoriu."),
  feesAndScholarships: z
    .string()
    .min(5, "Informatiile despre taxe/burse sunt obligatorii."),
  curriculum: z.string().min(5, "Curriculum-ul este obligatoriu."),
});

export const listingSchema = z.discriminatedUnion("category", [
  jobSchema,
  courseSchema,
  studyProgramSchema,
]);
