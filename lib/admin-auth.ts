import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE = "ticketbase_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  }

  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createAdminSessionToken(): string {
  const expiresAt =
    Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;

  const nonce = randomBytes(16).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresAtText, nonce, receivedSignature] = parts;

  if (!/^\d{10}$/.test(expiresAtText)) return false;
  if (!/^[A-Za-z0-9_-]{20,30}$/.test(nonce)) return false;
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(receivedSignature)) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  const now = Math.floor(Date.now() / 1000);

  if (expiresAt <= now) return false;
  if (expiresAt > now + ADMIN_SESSION_MAX_AGE + 60) {
    return false;
  }

  const payload = `${expiresAtText}.${nonce}`;
  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token);
}