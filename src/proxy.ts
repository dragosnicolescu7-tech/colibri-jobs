import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const roleRoutes: Array<{
  prefix: string;
  roles: Array<"ADMIN" | "COMPANY" | "UNIVERSITY">;
}> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/company", roles: ["COMPANY"] },
  { prefix: "/university", roles: ["UNIVERSITY"] },
];

export async function proxy(request: NextRequest) {
  const matched = roleRoutes.find((route) =>
    request.nextUrl.pathname.startsWith(route.prefix),
  );

  if (!matched) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = await verifySessionToken(token);
    if (!matched.roles.includes(session.role as "ADMIN" | "COMPANY" | "UNIVERSITY")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/company/:path*", "/university/:path*"],
};
