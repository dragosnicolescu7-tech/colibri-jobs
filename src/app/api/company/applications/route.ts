import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  ownerUserId: z.string().min(3),
});

const statusSchema = z.object({
  applicationId: z.string().min(3),
  status: z.enum(["APPLIED", "REJECTED", "INTERVIEW", "HIRED"]),
});

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireRole(session, ["COMPANY", "ADMIN"])) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    ownerUserId: url.searchParams.get("ownerUserId") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "ownerUserId este obligatoriu." },
      { status: 400 },
    );
  }
  if (session.role !== "ADMIN" && parsed.data.ownerUserId !== session.userId) {
    return NextResponse.json(
      { message: "Nu poti vizualiza aplicatii pentru alta companie." },
      { status: 403 },
    );
  }

  const applications = await prisma.application.findMany({
    where: { listing: { ownerUserId: parsed.data.ownerUserId } },
    include: {
      candidate: true,
      listing: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function PATCH(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireRole(session, ["COMPANY", "ADMIN"])) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Date invalide pentru actualizare status." },
      { status: 400 },
    );
  }

  const existing = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { listing: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Aplicatia nu exista." }, { status: 404 });
  }
  if (session.role !== "ADMIN" && existing.listing.ownerUserId !== session.userId) {
    return NextResponse.json(
      { message: "Nu poti modifica aplicatii pentru alta companie." },
      { status: 403 },
    );
  }

  const updated = await prisma.application.update({
    where: { id: parsed.data.applicationId },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(updated);
}
