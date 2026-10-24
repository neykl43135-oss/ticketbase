import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const SELLER_SESSION_COOKIE = "ticketbase_seller_session";
export const SELLER_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const secret = process.env.SELLER_SESSION_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SELLER_SESSION_SECRET is missing or too short");
  }

  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createSellerSessionToken(sellerId: number): string {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SELLER_SESSION_MAX_AGE;

  const nonce = randomBytes(16).toString("base64url");
  const payload = `${sellerId}.${expiresAt}.${nonce}`;

  return `${payload}.${signPayload(payload)}`;
}

export function verifySellerSessionToken(
  token: string | undefined,
): { sellerId: number } | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [sellerIdText, expiresAtText, nonce, receivedSignature] = parts;

  if (!/^[1-9]\d{0,9}$/.test(sellerIdText)) return null;
  if (!/^\d{10}$/.test(expiresAtText)) return null;
  if (!/^[A-Za-z0-9_-]{20,30}$/.test(nonce)) return null;
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(receivedSignature)) return null;

  const sellerId = Number(sellerIdText);
  const expiresAt = Number(expiresAtText);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isSafeInteger(sellerId)) return null;
  if (expiresAt <= now) return null;
  if (expiresAt > now + SELLER_SESSION_MAX_AGE + 60) return null;

  const payload = `${sellerIdText}.${expiresAtText}.${nonce}`;
  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  return { sellerId };
}

export async function getSellerSession(): Promise<{ sellerId: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SELLER_SESSION_COOKIE)?.value;

  return verifySellerSessionToken(token);
}