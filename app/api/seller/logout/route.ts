import { NextResponse } from "next/server";
import { SELLER_SESSION_COOKIE } from "@/lib/seller-auth";

export async function POST(request: Request) {
  const url = new URL("/seller/login", request.url);
  const response = NextResponse.redirect(url, 303);

  response.cookies.set({
    name: SELLER_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}