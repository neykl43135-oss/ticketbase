import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerSession } from "@/lib/buyer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function statusInfo(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Awaiting payment",
    payment_submitted: "Payment under review",
    payment_confirmed: "Payment confirmed",
    awaiting_ticket_transfer: "Awaiting ticket transfer",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
  };

  const tones: Record<string, string> = {
    pending_payment: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    payment_submitted: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    payment_confirmed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    awaiting_ticket_transfer: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    cancelled: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    expired: "border-white/10 bg-white/5 text-white/55",
  };

  return {
    label: labels[status] ?? "Status updated",
    tone: tones[status] ?? "border-white/10 bg-white/5 text-white/65",
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function BuyerOrdersPage() {
  const session = await getBuyerSession();

  if (!session) {
    redirect("/account/login");
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id: session.buyerId },
    select: { id: true },
  });

  if (!buyer) {
    redirect("/account/login");
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: buyer.id },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      status: true,
      quantity: true,
      currency: true,
      totalCents: true,
      createdAt: true,
      ticketListing: {
        select: {
          event: {
            select: {
              title: true,
              date: true,
            },
          },
        },
      },
    },
  });

  const activeStatuses = [
    "pending_payment",
    "payment_submitted",
    "payment_confirmed",
    "awaiting_ticket_transfer",
  ];

  const activeCount = orders.filter((order) =>
    activeStatuses.includes(order.status)
  ).length;
  const completedCount = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <header className="border-b border-white/[0.08] bg-[#030712]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-[-0.06em] sm:text-[22px]"
          >
            TicketBase
          </Link>
          <Link
            href="/account"
            className="whitespace-nowrap rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
          >
            My account
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-12">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-[#9CB9FF]"
        >
          <span aria-hidden="true">&larr;</span>
          Back to account
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[26px] border border-[#789AFF]/20 bg-gradient-to-br from-[#14264B] via-[#0D1730] to-[#101024] p-5 sm:mt-6 sm:rounded-[28px] sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full bg-[#3978F6]/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9CCFF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#78A1FF]" />
              Your ticket collection
            </span>
            <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] sm:mt-5 sm:text-5xl">
              My orders<span className="text-[#91B0FF]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:mt-4 sm:text-base">
              Keep track of your purchases, payment updates and ticket transfers
              in one place.
            </p>
            <Link
              href="/events"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] sm:mt-7"
            >
              Discover events <span className="ml-2" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A1020] p-4 sm:p-5">
            <p className="text-sm text-white/50">Total orders</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{orders.length}</p>
            <p className="mt-1 text-xs text-white/35">All purchases</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A1020] p-4 sm:p-5">
            <p className="text-sm text-white/50">In progress</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{activeCount}</p>
            <p className="mt-1 text-xs text-white/35">Payment or transfer updates</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/[0.08] bg-[#0A1020] p-4 sm:col-span-1 sm:p-5">
            <p className="text-sm text-white/50">Completed</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{completedCount}</p>
            <p className="mt-1 text-xs text-white/35">Successfully completed</p>
          </div>
        </section>

        <section className="mt-6 sm:mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#91B0FF]">
                Your activity
              </p>
              <h2 className="mt-2 text-xl font-semibold">Order history</h2>
            </div>
            <p className="text-sm text-white/40">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A1020] px-5 py-9 text-center sm:px-10 sm:py-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#789AFF]/20 bg-[#3978F6]/10 text-[#A8C0FF]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M4 7.5h16v11H4z" />
                  <path d="M8 7.5V5h8v2.5M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold">Your next show starts here</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
                You have no orders yet. Find a gig, discover a new favourite
                or plan a night out.
              </p>
              <Link
                href="/events"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
              >
                Explore events <span className="ml-2" aria-hidden="true">&rarr;</span>
              </Link>
              <p className="mt-5 text-xs leading-5 text-white/30">
                Guest orders are not automatically attached to an account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusInfo(order.status);

                return (
                  <article
                    key={order.orderNumber}
                    className="group rounded-2xl border border-white/[0.08] bg-[#0A1020] p-5 transition hover:border-[#789AFF]/30 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/40">
                          Order {order.orderNumber}
                        </p>
                        <h3 className="mt-2 break-words text-lg font-semibold tracking-tight sm:text-xl">
                          {order.ticketListing.event.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/50">
                          <span>{formatDate(order.ticketListing.event.date)}</span>
                          <span className="hidden text-white/20 sm:inline">/</span>
                          <span>
                            {order.quantity} {order.quantity === 1 ? "ticket" : "tickets"}
                          </span>
                          <span className="hidden text-white/20 sm:inline">/</span>
                          <span>Placed {formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-xl font-semibold tabular-nums">
                          {money(order.totalCents, order.currency)}
                        </p>
                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                      <span className="text-xs text-white/35">
                        Reference: {order.orderNumber}
                      </span>
                      <Link
                        href={`/orders/${encodeURIComponent(order.orderNumber)}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#91B0FF] transition group-hover:text-white"
                      >
                        View order details <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6">
          <p className="text-xs text-white/35">
            Need help with an order? Open its details to review the latest status.
          </p>
          <Link
            href="/account"
            className="text-sm font-medium text-white/55 transition hover:text-white"
          >
            Return to account
          </Link>
        </div>
      </div>
    </main>
  );
}