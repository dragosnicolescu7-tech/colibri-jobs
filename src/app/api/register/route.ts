import { UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/register";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datele trimise sunt invalide.", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const passwordHash = await hashPassword(input.password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { phoneNumber: input.phoneNumber }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Exista deja un cont cu acest email sau telefon." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        phoneNumber: input.phoneNumber,
        phoneVerified: false,
        role: input.role,
        city: input.city,
        country: input.country,
        title: input.role === UserRole.CANDIDATE ? input.title : null,
        cvUrl: input.role === UserRole.CANDIDATE ? input.cvUrl : null,
        openToOpportunities:
          input.role === UserRole.CANDIDATE ? input.openToOpportunities : false,
      },
    });

    if (input.role === UserRole.COMPANY) {
      await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: input.companyName,
          cui: input.cui,
          fiscalCode: input.fiscalCode,
          address: input.companyAddress,
          contactName: input.companyContactName,
          contactEmail: input.companyContactEmail,
        },
      });
    }

    if (input.role === UserRole.UNIVERSITY) {
      await prisma.universityProfile.create({
        data: {
          userId: user.id,
          universityName: input.universityName,
          address: input.universityAddress,
          faculties: input.faculties,
          contactPhone: input.universityContactPhone,
          contactEmail: input.universityContactEmail,
          description: input.universityDescription,
        },
      });
    }

    // TODO: Hook for SMS OTP verification and branded welcome emails.
    return NextResponse.json(
      {
        message:
          input.role === UserRole.CANDIDATE
            ? "Cont candidat creat. Urmeaza verificarea telefonului."
            : "Cont creat cu succes. Urmeaza validarea manuala de catre administrator.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "A aparut o eroare la inregistrare." },
      { status: 500 },
    );
  }
}
