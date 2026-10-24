import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import {
  cancelOrder,
  confirmOrderPayment,
  completeTicketTransfer,
  moveLegacyPaymentToTransfer,
} from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams: Promise<{
    confirmed?: string;
    cancelled?: string;
    error?: string;
    status?: string;
  }>;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Dublin",
  }).format(date);
}

const statusLabels: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_submitted: "Payment reported",
  payment_confirmed: "Payment confirmed",
  awaiting_ticket_transfer: "Awaiting ticket transfer",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  await expirePendingOrders();

  const [orders, params] = await Promise.all([
    prisma.order.findMany({
      include: {
        ticketListing: {
          include: {
            event: {
              select: { title: true, slug: true },
            },
            seller: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    searchParams,
  ]);

  const selectedStatus = params.status ?? "all";
  const allowedStatuses = ["all", "pending_payment", "payment_submitted", "payment_confirmed", "awaiting_ticket_transfer", "cancelled", "expired"];
  const safeStatus = allowedStatuses.includes(selectedStatus) ? selectedStatus : "all";
  const filteredOrders = safeStatus === "all" ? orders : orders.filter((order) => safeStatus === "payment_confirmed" ? ["payment_confirmed", "completed"].includes(order.status) : order.status === safeStatus);
  const needsReview = orders.filter(
    (order) => order.status === "payment_submitted",
  ).length;

  const awaitingPayment = orders.filter(
    (order) => order.status === "pending_payment",
  ).length;

  const confirmedPayments = orders.filter(
    (order) =>
      order.status === "payment_confirmed" ||
      order.status === "awaiting_ticket_transfer" ||
      order.status === "completed",
  ).length;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </Link>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Events
            </Link>
            <Link
              href="/admin/tickets"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Listings
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
          Marketplace management
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Orders
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-neutral-500">
          Review payment reports, verify incoming transfers and manage order
          status. Only confirm a payment after checking that the money arrived.
        </p>

        {params.confirmed === "1" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Payment confirmed.
          </div>
        )}

        {params.cancelled === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Order cancelled and available ticket quantity restored.
          </div>
        )}

        {params.error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {params.error === "invalid" && "Invalid order number."}
            {params.error === "not-pending" && "This order is no longer awaiting payment review."}
            {params.error === "not-cancellable" && "This order cannot be cancelled in its current state."}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "All orders", value: orders.length },
            { label: "Awaiting payment", value: awaitingPayment },
            { label: "Needs review", value: needsReview },
            { label: "Payment confirmed", value: confirmedPayments },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight">
            All orders
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Orders will appear here after a buyer checks out.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const canConfirm = order.status === "payment_submitted";
                const canCancel =
                  order.status === "pending_payment" ||
                  order.status === "payment_submitted";
                const canCompleteTransfer = order.status === "awaiting_ticket_transfer";
                const canMoveLegacyPayment = order.status === "payment_confirmed";

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 p-5 md:flex-row md:items-start md:px-7">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                            {statusLabels[order.status] ?? order.status}
                          </span>
                          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">
                            {order.orderNumber}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-semibold">
                          {order.ticketListing.event.title}
                        </h3>

                        <p className="mt-1 break-all text-sm text-neutral-600">
                          Ticket delivery email: {order.buyerEmail}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
                          <span>Created: {formatDate(order.createdAt)}</span>
                          <span>Payment method: {order.paymentMethod}</span>
                          <span>Quantity: {order.quantity}</span>
                          <span>Seller: {order.ticketListing.seller.displayName}</span>
                        </div>
                      </div>

                      <div className="shrink-0 md:text-right">
                        <p className="text-sm text-neutral-500">Order total</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums">
                          {formatPrice(order.totalCents, order.currency)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Subtotal {formatPrice(order.subtotalCents, order.currency)}
                          {" · "}Fee {formatPrice(order.buyerFeeCents, order.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2 md:px-7">
                      <div>
                        <p className="text-sm font-medium">Payment timeline</p>
                        <p className="mt-2 text-sm text-neutral-500">
                          Buyer reported payment: {formatDate(order.paymentSubmittedAt)}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Payment confirmed: {formatDate(order.paymentConfirmedAt)}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Reservation expires: {formatDate(order.expiresAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Ticket details</p>
                        <p className="mt-2 text-sm text-neutral-500">
                          {[
                            order.ticketListing.ticketType,
                            order.ticketListing.section,
                            order.ticketListing.row,
                            order.ticketListing.seats,
                          ].filter(Boolean).join(" · ") || "No seating details"}
                        </p>
                        <Link
                          href={`/events/${order.ticketListing.event.slug}`}
                          className="mt-2 inline-block text-sm underline underline-offset-4"
                        >
                          View event
                        </Link>
                      </div>
                    </div>

                    {order.adminNote && (
                      <div className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-600 md:px-7">
                        Admin note: {order.adminNote}
                      </div>
                    )}

                    {(canConfirm || canCancel || canCompleteTransfer || canMoveLegacyPayment) && (
                      <div className="flex flex-wrap gap-3 border-t border-neutral-100 bg-neutral-50 p-5 md:px-7">
                        {canConfirm && (
                          <form action={confirmOrderPayment}>
                            <input type="hidden" name="orderNumber" value={order.orderNumber} />
                            <button
                              type="submit"
                              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                              Confirm payment received
                            </button>
                          </form>
                        )}

                        {canMoveLegacyPayment && (
                          <form action={moveLegacyPaymentToTransfer}>
                            <input type="hidden" name="orderNumber" value={order.orderNumber} />
                            <button
                              type="submit"
                              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                              Move to ticket transfer
                            </button>
                          </form>
                        )}

                        {canCompleteTransfer && (
                          <form action={completeTicketTransfer}>
                            <input type="hidden" name="orderNumber" value={order.orderNumber} />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                            >
                              Ticket transferred — complete order
                            </button>
                          </form>
                        )}

                        {canCancel && (
                          <form action={cancelOrder}>
                            <input type="hidden" name="orderNumber" value={order.orderNumber} />
                            <button
                              type="submit"
                              className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-red-400 hover:text-red-700"
                            >
                              Cancel order
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

