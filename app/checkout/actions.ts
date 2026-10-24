"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import { reserveTicketStock } from "@/lib/orders/reserve-stock";
import { reserveQueuedPaymentInstructions } from "@/lib/orders/payment-queue";
import {
  ACTIVE_ORDER_STATUSES,
  hasReachedActiveOrderLimit,
} from "@/lib/orders/active-order-limit";
import { getBuyerSession } from "@/lib/buyer-auth";
import { sendTelegramNotification } from "@/lib/telegram-notifications";

type PaymentMethod = "BANK_TRANSFER" | "REVOLUT" | "PAYPAL";

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function getBankTransferInstructions(settings: {
  bankTransferEnabled: boolean;
  bankTransferInstructions: string;
}): string | null {
  if (!settings.bankTransferEnabled || !settings.bankTransferInstructions.trim()) {
    return null;
  }
  return settings.bankTransferInstructions;
}
export async function createOrder(formData: FormData) {
  const listingId = parsePositiveInt(readText(formData, "listingId"));
  const quantity = parsePositiveInt(readText(formData, "quantity"));
  const buyerEmail = readText(formData, "buyerEmail").toLowerCase();
  const methodValue = readText(formData, "paymentMethod");

  if (!listingId || !quantity || quantity > 10000) {
    redirect(`/checkout/${listingId ?? ""}?error=invalid`);
  }

  if (!isValidEmail(buyerEmail)) {
    redirect(`/checkout/${listingId}?error=email`);
  }

  if (
    methodValue !== "BANK_TRANSFER" &&
    methodValue !== "REVOLUT" &&
    methodValue !== "PAYPAL"
  ) {
    redirect(`/checkout/${listingId}?error=payment-method`);
  }

  const paymentMethod: PaymentMethod = methodValue;
  const buyerSession = await getBuyerSession();

  if (!buyerSession) {
    redirect(`/account/login?returnTo=${encodeURIComponent(`/checkout/${listingId}`)}`);
  }
  let orderNumber = "";
  let orderEventTitle = "";
  let orderTotalCents = 0;
  let orderCurrency = "";

  try {
    // Release expired reservations before checking ticket availability.
    await expirePendingOrders();

    await prisma.$transaction(async (tx) => {
      const listing = await tx.ticketListing.findUnique({
        where: { id: listingId },
        include: {
          event: true,
          seller: true,
        },
      });

      if (
        !listing ||
        listing.status !== "active" ||
        listing.event.status !== "active" ||
        listing.seller.status !== "active" ||
        quantity < listing.minQuantity ||
        quantity > listing.quantityAvailable
      ) {
        throw new Error("LISTING_UNAVAILABLE");
      }

      const settings = await tx.paymentSettings.findUnique({
        where: { id: 1 },
      });

      if (!settings) {
        throw new Error("PAYMENT_SETTINGS_MISSING");
      }

      let paymentInstructions: string | null = null;

      if (paymentMethod === "BANK_TRANSFER") {
        paymentInstructions = getBankTransferInstructions(settings);
      } else if (paymentMethod === "REVOLUT" || paymentMethod === "PAYPAL") {
        paymentInstructions = await reserveQueuedPaymentInstructions(
          tx,
          paymentMethod,
          settings,
        );
      }

      if (!paymentInstructions) {
        throw new Error("PAYMENT_METHOD_UNAVAILABLE");
      }
      const subtotalCents =
        listing.pricePerTicketCents * quantity;
      const buyerFeeCents = Math.round(subtotalCents * 0.01);
      const totalCents = subtotalCents + buyerFeeCents;

      if (
        !Number.isSafeInteger(subtotalCents) ||
        !Number.isSafeInteger(buyerFeeCents) ||
        !Number.isSafeInteger(totalCents) ||
        totalCents > 2147483647
      ) {
        throw new Error("INVALID_TOTAL");
      }

      // Reserve available tickets atomically.
      const reserved = await reserveTicketStock(tx, listingId, quantity);

      if (!reserved) {
        throw new Error("LISTING_UNAVAILABLE");
      }

      // Enforce the limit inside the transaction. Throwing rolls back stock.
      const activeOrderCount = await tx.order.count({
        where: {
          buyerId: buyerSession.buyerId,
          status: { in: [...ACTIVE_ORDER_STATUSES] },
        },
      });

      if (hasReachedActiveOrderLimit(activeOrderCount)) {
        throw new Error("BUYER_ORDER_LIMIT_REACHED");
      }
      orderNumber = `TB-${randomBytes(10).toString("hex").toUpperCase()}`;
      orderEventTitle = listing.event.title;
      orderTotalCents = totalCents;
      orderCurrency = listing.currency;

      await tx.order.create({
        data: {
          orderNumber,
          buyerId: buyerSession?.buyerId ?? null,
          buyerEmail,
          paymentMethod,
          status: "pending_payment",
          quantity,
          currency: listing.currency,
          pricePerTicketCents: listing.pricePerTicketCents,
          subtotalCents,
          buyerFeeCents,
          totalCents,
          paymentInstructions,
          ticketListingId: listing.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    });
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "UNKNOWN";

    if (code === "PAYMENT_SETTINGS_MISSING") {
      redirect(`/checkout/${listingId}?error=payment-settings`);
    }

    if (code === "PAYMENT_METHOD_UNAVAILABLE") {
      redirect(`/checkout/${listingId}?error=payment-method`);
    }

    if (code === "LISTING_UNAVAILABLE") {
      redirect(`/checkout/${listingId}?error=unavailable`);
    }
    if (code === "BUYER_ORDER_LIMIT_REACHED") {
      redirect(`/checkout/${listingId}?error=order-limit`);
    }

    redirect(`/checkout/${listingId}?error=failed`);
  }

  void sendTelegramNotification({
    title: "NEW ORDER - TicketBase",
    lines: [
      `Order: ${orderNumber}`,
      `Event: ${orderEventTitle}`,
      `Tickets: ${quantity}`,
      `Total: ${(orderTotalCents / 100).toFixed(2)} ${orderCurrency}`,
      `Payment: ${paymentMethod}`,
      `Buyer: ${buyerEmail}`,
    ],
  });

  redirect(`/orders/${orderNumber}`);
}


