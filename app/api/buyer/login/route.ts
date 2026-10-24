import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createBuyerSessionToken,
  BUYER_SESSION_COOKIE,
  BUYER_SESSION_MAX_AGE,
} from "@/lib/buyer-auth";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email and password." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!email || email.length > 254 || !password || password.length > 1024) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 },
      );
    }

    const buyer = await prisma.buyer.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (
      !buyer ||
      !(await bcrypt.compare(password, buyer.passwordHash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = createBuyerSessionToken(buyer.id);
    const response = NextResponse.json({ success: true });

    response.cookies.set(BUYER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: BUYER_SESSION_MAX_AGE,
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Buyer login failed:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please try again." },
      { status: 500 },
    );
  }
}
