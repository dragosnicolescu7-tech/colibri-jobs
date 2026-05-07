import { SessionPayload, getSessionCookieName, verifySessionToken } from "@/lib/session";

function readCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = readCookieValue(cookieHeader, getSessionCookieName());
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function requireRole(
  session: SessionPayload | null,
  roles: Array<SessionPayload["role"]>,
) {
  if (!session) return false;
  return roles.includes(session.role);
}
