import { jwtVerify, SignJWT } from "jose";

export type SessionPayload = {
  userId: string;
  role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN";
  email: string;
  fullName: string;
};

const SESSION_COOKIE_NAME = "colibri_session";
const DEFAULT_SECRET = "colibri-dev-secret-change-me";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? DEFAULT_SECRET);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  const verified = await jwtVerify<SessionPayload>(token, getSecretKey());
  return verified.payload;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
