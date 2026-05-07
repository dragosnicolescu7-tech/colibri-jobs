import { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  type: z.enum(["company", "university"]).default("company"),
});

const actionSchema = z.object({
  type: z.enum(["company", "university"]),
  profileId: z.string().min(3),
  action: z.enum(["approve", "reject"]),
});

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ type: url.searchParams.get("type") ?? "company" });
  if (!parsed.success) {
    return NextResponse.json({ message: "Tip invalid." }, { status: 400 });
  }

  if (parsed.data.type === "company") {
    const companies = await prisma.companyProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(companies);
  }

  const universities = await prisma.universityProfile.findMany({
    where: { verificationStatus: VerificationStatus.PENDING },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(universities);
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Date invalide pentru aprobare/respingere." },
      { status: 400 },
    );
  }

  const status =
    parsed.data.action === "approve"
      ? VerificationStatus.APPROVED
      : VerificationStatus.REJECTED;
  const approvedAt = parsed.data.action === "approve" ? new Date() : null;

  if (parsed.data.type === "company") {
    await prisma.companyProfile.update({
      where: { id: parsed.data.profileId },
      data: { verificationStatus: status, approvedAt },
    });
    return NextResponse.json({ message: "Status companie actualizat." });
  }

  await prisma.universityProfile.update({
    where: { id: parsed.data.profileId },
    data: { verificationStatus: status, approvedAt },
  });
  return NextResponse.json({ message: "Status universitate actualizat." });
}
