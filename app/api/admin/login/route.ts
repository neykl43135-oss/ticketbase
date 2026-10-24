import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

function safeCompare(candidate: string, expected: string): boolean {
  const candidateHash = createHash("sha256")
    .update(candidate, "utf8")
    .digest();

  const expectedHash = createHash("sha256")
    .update(expected, "utf8")
    .digest();

  return timingSafeEqual(candidateHash, expectedHash);
}

export async function POST(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (
    !configuredPassword ||
    configuredPassword.length < 16 ||
    configuredPassword === "ReplaceWithYourOwnLongRandomPassword" ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret) < 32
  ) {
    return NextResponse.json(
      { error: "Admin authentication is not configured correctly." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("password" in body) ||
    typeof body.password !== "string" ||
    body.password.length > 1024
  ) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  if (!safeCompare(body.password, configuredPassword)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}