import { ListingCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { listingSchema } from "@/lib/validations/listing";
import { NextResponse } from "next/server";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { promotions: true },
  });
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!requireRole(session, ["COMPANY", "UNIVERSITY", "ADMIN"])) {
      return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
    }
    if (!session) {
      return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Date invalide pentru listare.", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    if (session.role !== "ADMIN" && data.ownerUserId !== session.userId) {
      return NextResponse.json(
        { message: "Nu poti publica in numele altui cont." },
        { status: 403 },
      );
    }

    if (data.relocationSupport && !data.relocationDetails) {
      return NextResponse.json(
        { message: "Detaliile de relocare sunt obligatorii pentru joburile cu relocare." },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);
    const listing = await prisma.listing.create({
      data: {
        ownerUserId: data.ownerUserId,
        category: data.category,
        title: data.title,
        description: data.description,
        employmentType: "employmentType" in data ? data.employmentType : null,
        experienceLevel: "experienceLevel" in data ? data.experienceLevel : null,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        city: data.city,
        country: data.country,
        benefits: data.benefits,
        applicationEmail: data.applicationEmail,
        deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
        relocationSupport: data.relocationSupport,
        relocationDetails: data.relocationDetails,
        disabilityFriendly: data.disabilityFriendly,
        studyLevel: data.category === ListingCategory.STUDY_PROGRAM ? data.studyLevel : null,
        studyYears: data.category === ListingCategory.STUDY_PROGRAM ? data.studyYears : null,
        seatsAvailable:
          data.category === ListingCategory.STUDY_PROGRAM ? data.seatsAvailable : null,
        eligibility:
          data.category === ListingCategory.STUDY_PROGRAM ? data.eligibility : null,
        requiredDocuments:
          data.category === ListingCategory.STUDY_PROGRAM ? data.requiredDocuments : null,
        selectionProcess:
          data.category === ListingCategory.STUDY_PROGRAM ? data.selectionProcess : null,
        feesAndScholarships:
          data.category === ListingCategory.STUDY_PROGRAM ? data.feesAndScholarships : null,
        curriculum:
          data.category === ListingCategory.STUDY_PROGRAM ? data.curriculum : null,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        message:
          data.category === ListingCategory.JOB
            ? "Anunt publicat cu succes. Poti promova acest job din dashboard."
            : "Listare publicata cu succes.",
        listingId: listing.id,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "A aparut o eroare la publicare." },
      { status: 500 },
    );
  }
}
