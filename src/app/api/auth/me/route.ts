import { getSessionFromRequest } from "@/lib/request-session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Sesiune invalida." }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
