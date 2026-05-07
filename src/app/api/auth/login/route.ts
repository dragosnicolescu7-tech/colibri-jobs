import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionCookieName } from "@/lib/session";
import { loginSchema } from "@/lib/validations/login";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Date de autentificare invalide." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { message: "Email sau parola invalida." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "Email sau parola invalida." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Autentificare reusita.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "A aparut o eroare la autentificare." },
      { status: 500 },
    );
  }
}
