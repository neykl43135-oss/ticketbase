import { NextResponse } from "next/server";
import {
  BUYER_SESSION_COOKIE,
} from "@/lib/buyer-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(BUYER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}
