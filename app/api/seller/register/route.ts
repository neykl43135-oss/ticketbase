import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 72;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("password" in body) ||
    !("displayName" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.displayName !== "string"
  ) {
    return NextResponse.json(
      { error: "Please provide your name, email and password." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const email = body.email.trim().toLowerCase();
  const displayName = body.displayName.trim();
  const password = body.password;

  if (
    email.length > EMAIL_MAX_LENGTH ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (displayName.length < 2 || displayName.length > 80) {
    return NextResponse.json(
      { error: "Name must be between 2 and 80 characters." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, "utf8") > PASSWORD_MAX_LENGTH
  ) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters and no more than 72 bytes." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }



  try {
    const existingSeller = await prisma.seller.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingSeller) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.seller.create({
      data: {
        displayName,
        email,
        passwordHash,
        verified: false,
        status: "active",
      },
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, message: "Account created. You can now sign in." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Seller registration failed:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { error: "Registration is temporarily unavailable. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
