import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram-notifications";
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
      !("displayName" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      typeof body.displayName !== "string"
    ) {
      return NextResponse.json(
        { error: "Please enter your name, a valid email and a password." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const email = body.email.trim().toLowerCase();
    const displayName = body.displayName.trim();
    const password = body.password;

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      displayName.length < 2 ||
      displayName.length > 80 ||
      password.length < 10 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { error: "Check your details. Passwords must be at least 10 characters." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const existingBuyer = await prisma.buyer.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingBuyer) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const buyer = await prisma.buyer.create({
      data: { email, displayName, passwordHash },
      select: { id: true },
    });

    void sendTelegramNotification({
      title: "NEW USER — TicketBase",
      lines: [
        `Name: ${displayName}`,
        `Email: ${email}`,
        `Registered: ${new Date().toISOString()}`,
      ],
    });

    const token = createBuyerSessionToken(buyer.id);
    const response = NextResponse.json({ success: true }, { status: 201 });

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
    console.error("Buyer registration failed:", error);
    return NextResponse.json(
      { error: "Unable to create your account right now. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
