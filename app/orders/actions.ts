"use server";

import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import { redirect } from "next/navigation";
import { getBuyerSession } from "@/lib/buyer-auth";
import { revalidatePath } from "next/cache";
import { calculateRestoredQuantity } from "@/lib/orders/stock";

export async function cancelBuyerOrder(formData: FormData) {
  const rawOrderNumber = formData.get("orderNumber");
  const orderNumber =
    typeof rawOrderNumber === "string" ? rawOrderNumber.trim() : "";

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) redirect("/events");

  const buyerSession = await getBuyerSession();
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber },
    select: { buyerId: true },
  });

  if (!existingOrder) redirect("/events");
  if (
    existingOrder.buyerId !== null &&
    existingOrder.buyerId !== buyerSession?.buyerId
  ) {
    redirect("/account/login");
  }

  await expirePendingOrders();
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        buyerId: true,
        status: true,
        quantity: true,
        ticketListingId: true,
        expiresAt: true,
      },
    });

    if (
      !order ||
      order.status !== "pending_payment" ||
      !order.expiresAt ||
      order.expiresAt <= now ||
      (order.buyerId !== null &&
        order.buyerId !== buyerSession?.buyerId)
    ) return null;

    const changed = await tx.order.updateMany({
      where: {
        id: order.id,
        status: "pending_payment",
        expiresAt: { gt: now },
      },
      data: { status: "cancelled" },
    });

    if (changed.count !== 1) return null;

    const listing = await tx.ticketListing.findUnique({
      where: { id: order.ticketListingId },
      select: {
        id: true,
        quantity: true,
        quantityAvailable: true,
        status: true,
      },
    });

    if (!listing) throw new Error("TICKET_LISTING_NOT_FOUND");

    const restoredQuantity = calculateRestoredQuantity(
      listing.quantity,
      listing.quantityAvailable,
      order.quantity,
    );

    await tx.ticketListing.update({
      where: { id: listing.id },
      data: {
        quantityAvailable: restoredQuantity,
        status:
          listing.status === "sold" && restoredQuantity > 0
            ? "active"
            : listing.status,
      },
    });

    return { listingId: listing.id };
  });

  if (!result) redirect(`/orders/${orderNumber}?error=not-cancellable`);

  revalidatePath(`/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tickets");
  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/checkout/${result.listingId}`);
}
export async function submitPayment(formData: FormData) {
  const rawOrderNumber = formData.get("orderNumber");
  const orderNumber =
    typeof rawOrderNumber === "string" ? rawOrderNumber.trim() : "";

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    redirect("/events");
  }

  if (formData.get("confirmPaymentSent") !== "yes") {
    redirect(`/orders/${orderNumber}?error=confirm`);
  }

  // Account-owned orders require a valid session for their owner.
  const buyerSession = await getBuyerSession();
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber },
    select: { buyerId: true },
  });

  if (!existingOrder) {
    redirect("/events");
  }

  if (
    existingOrder.buyerId !== null &&
    existingOrder.buyerId !== buyerSession?.buyerId
  ) {
    redirect("/account/login");
  }

  // Expire old unpaid reservations before processing this request.
  await expirePendingOrders();

  const now = new Date();

  // Accept the payment notice only while the reservation is valid.
  const result = await prisma.order.updateMany({
    where: {
      orderNumber,
      status: "pending_payment",
      expiresAt: {
        gt: now,
      },
    },
    data: {
      status: "payment_submitted",
      paymentSubmittedAt: now,
    },
  });

  // Handle the case where the reservation expired between checks.
  if (result.count === 0) {
    await expirePendingOrders();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { orderNumber: true },
  });

  if (!order) {
    redirect("/events");
  }

  redirect(`/orders/${orderNumber}`);
}