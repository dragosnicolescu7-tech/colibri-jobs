import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!requireRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
    }

    const [
      usersLast30Days,
      usersLast6Months,
      usersLastYear,
      candidateCount,
      companyCount,
      universityCount,
      pendingCompanies,
      pendingUniversities,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 183 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      prisma.user.count({ where: { role: UserRole.COMPANY } }),
      prisma.user.count({ where: { role: UserRole.UNIVERSITY } }),
      prisma.companyProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
      prisma.universityProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
    ]);

    return NextResponse.json({
      usersLast30Days,
      usersLast6Months,
      usersLastYear,
      candidateCount,
      companyCount,
      universityCount,
      pendingCompanies,
      pendingUniversities,
    });
  } catch {
    return NextResponse.json(
      { message: "Nu am putut incarca statisticile admin." },
      { status: 500 },
    );
  }
}
