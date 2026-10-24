import { timingSafeEqual } from "node:crypto";
import { expirePendingOrders } from "@/lib/order-expiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  const provided = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(secret, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { ok: false, error: "Cron secret is not configured" },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const expired = await expirePendingOrders();

    return Response.json({
      ok: true,
      expired,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Could not expire orders" },
      { status: 500 },
    );
  }
}