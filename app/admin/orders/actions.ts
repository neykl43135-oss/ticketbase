
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import { calculateRestoredQuantity } from "@/lib/orders/stock";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

function readOrderNumber(formData: FormData): string {
  const value = formData.get("orderNumber");
  return typeof value === "string" ? value.trim() : "";
}

export async function confirmOrderPayment(formData: FormData) {
  await requireAdmin();

  const orderNumber = readOrderNumber(formData);

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    redirect("/admin/orders?error=invalid");
  }

  await expirePendingOrders();

  const now = new Date();

  // Only orders reported as paid by the buyer can be confirmed.
  // updateMany prevents confirming the same order twice.
  const result = await prisma.order.updateMany({
    where: {
      orderNumber,
      status: "payment_submitted",
    },
    data: {
      status: "awaiting_ticket_transfer",
      paymentConfirmedAt: now,
      expiresAt: null,
    },
  });

  if (result.count !== 1) {
    redirect("/admin/orders?error=not-pending");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderNumber}`);

  redirect("/admin/orders?confirmed=1");
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();

  const orderNumber = readOrderNumber(formData);

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    redirect("/admin/orders?error=invalid");
  }

  await expirePendingOrders();

  const cancelled = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        status: true,
        quantity: true,
        ticketListingId: true,
        expiresAt: true,
      },
    });

    if (
      !order ||
      !["pending_payment", "payment_submitted"].includes(order.status)
    ) {
      return false;
    }

    const now = new Date();

    // Do not cancel an expired pending reservation as if it were active.
    if (
      order.status === "pending_payment" &&
      order.expiresAt &&
      order.expiresAt <= now
    ) {
      return false;
    }

    // Conditional update prevents duplicate cancellation and restoration.
    const changed = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
      },
      data: {
        status: "cancelled",
        expiresAt: null,
      },
    });

    if (changed.count !== 1) {
      return false;
    }

    const listing = await tx.ticketListing.findUnique({
      where: { id: order.ticketListingId },
      select: {
        id: true,
        quantity: true,
        quantityAvailable: true,
      },
    });

    if (listing) {
      const restoredQuantity = calculateRestoredQuantity(
        listing.quantity,
        listing.quantityAvailable,
        order.quantity,
      );

      const currentListing = await tx.ticketListing.findUnique({
        where: { id: listing.id },
        select: { status: true },
      });

      if (currentListing) {
        await tx.ticketListing.update({
          where: { id: listing.id },
          data: {
            quantityAvailable: restoredQuantity,
            status:
              currentListing.status === "sold" && restoredQuantity > 0
                ? "active"
                : currentListing.status,
          },
        });
      }
    }

    return true;
  });

  if (!cancelled) {
    redirect("/admin/orders?error=not-cancellable");
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/tickets");
  revalidatePath("/events");
  revalidatePath("/");

  redirect("/admin/orders?cancelled=1");
}

export async function moveLegacyPaymentToTransfer(formData: FormData) {
  await requireAdmin();

  const orderNumber = readOrderNumber(formData);

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    redirect("/admin/orders?error=invalid");
  }

  const result = await prisma.order.updateMany({
    where: {
      orderNumber,
      status: "payment_confirmed",
    },
    data: {
      status: "awaiting_ticket_transfer",
      expiresAt: null,
    },
  });

  if (result.count !== 1) {
    redirect("/admin/orders?error=not-legacy-payment-confirmed");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderNumber}`);

  redirect("/admin/orders?transfer-ready=1");
}
export async function completeTicketTransfer(formData: FormData) {
  await requireAdmin();

  const orderNumber = readOrderNumber(formData);

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    redirect("/admin/orders?error=invalid");
  }

  // Only an order awaiting ticket transfer can be completed.
  const result = await prisma.order.updateMany({
    where: {
      orderNumber,
      status: "awaiting_ticket_transfer",
    },
    data: {
      status: "completed",
      expiresAt: null,
    },
  });

  // Prevent duplicate completion or changes to orders in another state.
  if (result.count !== 1) {
    redirect("/admin/orders?error=not-awaiting-transfer");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderNumber}`);

  redirect("/admin/orders?completed=1");
}
