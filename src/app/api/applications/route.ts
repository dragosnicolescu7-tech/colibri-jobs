import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { applicationSchema } from "@/lib/validations/application";
import { NextResponse } from "next/server";
import { sendApplicationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!requireRole(session, ["CANDIDATE", "ADMIN"])) {
      return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
    }
    if (!session) {
      return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Date de aplicare invalide.", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    if (session.role !== "ADMIN" && input.candidateId !== session.userId) {
      return NextResponse.json(
        { message: "Nu poti aplica in numele altui candidat." },
        { status: 403 },
      );
    }

    const [listing, candidate] = await Promise.all([
      prisma.listing.findUnique({
        where: { id: input.listingId },
        include: { owner: true },
      }),
      prisma.user.findUnique({ where: { id: input.candidateId } }),
    ]);

    if (!listing || !candidate) {
      return NextResponse.json(
        { message: "Listarea sau candidatul nu exista." },
        { status: 404 },
      );
    }

    const application = await prisma.application.create({
      data: {
        listingId: input.listingId,
        candidateId: input.candidateId,
        motivation: input.motivation,
        cvUrl: input.cvUrl,
      },
    });

    if (listing.applicationEmail) {
      await sendApplicationEmail({
        to: listing.applicationEmail,
        listingTitle: listing.title,
        candidateName: candidate.fullName,
        candidateEmail: candidate.email,
        motivation: input.motivation,
        cvUrl: input.cvUrl,
      });
    }

    return NextResponse.json(
      {
        message:
          "Aplicatia a fost trimisa. Compania va primi automat datele si CV-ul pe email.",
        applicationId: application.id,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "A aparut o eroare la aplicare." },
      { status: 500 },
    );
  }
}
