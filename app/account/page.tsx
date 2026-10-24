import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerSession } from "@/lib/buyer-auth";
import BuyerLogoutButton from "./BuyerLogoutButton";
import { getEventImage } from "@/lib/event-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Awaiting payment",
    payment_submitted: "Payment under review",
    payment_confirmed: "Payment confirmed",
    awaiting_ticket_transfer: "Awaiting ticket transfer",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
  };
  return labels[status] ?? "Status updated";
}

function statusStyle(status: string) {
  if (status === "completed") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (status === "cancelled" || status === "expired") return "border-white/10 bg-white/[0.05] text-white/50";
  return "border-[#78A1FF]/20 bg-[#3978F6]/10 text-[#A9C4FF]";
}

export default async function BuyerAccountPage() {
  const session = await getBuyerSession();

  if (!session) redirect("/account/login");

  const buyer = await prisma.buyer.findUnique({
    where: { id: session.buyerId },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  if (!buyer) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: buyer.id },
    orderBy: { createdAt: "desc" },
    take: 5,
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
              venue: true,
              city: true,
              image: true,
            },
          },
        },
      },
    },
  });

  const [totalOrders, activeOrders, completedOrders] = await Promise.all([
    prisma.order.count({ where: { buyerId: buyer.id } }),
    prisma.order.count({
      where: {
        buyerId: buyer.id,
        status: {
          in: [
            "pending_payment",
            "payment_submitted",
            "payment_confirmed",
            "awaiting_ticket_transfer",
          ],
        },
      },
    }),
    prisma.order.count({
      where: { buyerId: buyer.id, status: "completed" },
    }),
  ]);

  const displayName = buyer.displayName?.trim() || buyer.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-[#3978F6]/10 blur-[140px]" />
        <div className="absolute right-[-180px] top-[42%] h-[380px] w-[380px] rounded-full bg-violet-500/[0.06] blur-[120px]" />
      </div>

      <header className="relative border-b border-white/[0.08] bg-[#050A16]/80">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:h-[76px] sm:px-8 sm:py-0">
          <Link href="/" className="shrink-0 text-xl font-semibold tracking-[-0.06em] sm:text-[22px]">
            TicketBase
          </Link>
          <nav className="flex items-center gap-2 min-[400px]:gap-3 sm:gap-7">
            <Link href="/events" className="whitespace-nowrap text-xs font-medium text-white/65 transition hover:text-white sm:text-sm">
              Discover events
            </Link>
            <Link href="/account/orders" className="whitespace-nowrap text-xs font-medium text-white/65 transition hover:text-white sm:text-sm">
              My orders
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-12">
        <section className="relative overflow-hidden rounded-[26px] border border-[#78A1FF]/20 bg-gradient-to-br from-[#14264A] via-[#0C1730] to-[#0A1020] p-5 shadow-2xl shadow-blue-950/20 sm:rounded-[30px] sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-12 -top-24 hidden h-72 w-72 rounded-full border border-white/[0.06] sm:block" />
          <div aria-hidden="true" className="absolute -right-1 top-[-45px] hidden h-56 w-56 rounded-full bg-[#3978F6]/15 blur-[70px] sm:block" />
          <div aria-hidden="true" className="absolute bottom-[-110px] right-[18%] h-52 w-52 rounded-full bg-violet-500/10 blur-[70px]" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#A9C4FF]/20 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BBD0FF] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8FB0FF]" />
              Buyer dashboard
            </div>
            <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.045em] sm:mt-5 sm:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#8FB0FF] to-white bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Your next unforgettable night is out there. Discover live music, incredible shows and events worth remembering.
            </p>
            <div className="mt-5 flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:flex-wrap sm:mt-7">
              <Link href="/events" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#5B8EFF] sm:min-h-12 sm:px-6">
                <span>Discover events</span>
<span aria-hidden="true" className="ml-2 inline-flex items-center leading-none">
  &rarr;
</span>
              </Link>
              <Link href="/account/orders" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] sm:min-h-12 sm:px-6">
                View my orders
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="relative mt-5 hidden items-center gap-3 sm:absolute sm:bottom-10 sm:right-10 sm:mt-0 sm:flex lg:bottom-12 lg:right-12">
            <div className="flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] shadow-xl backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#A9C4FF]" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7.5A2.5 2.5 0 0 0 4 12.5v4A1.5 1.5 0 0 0 5.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-4a2.5 2.5 0 0 1 0-5v-1A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5z" />
                <path d="M14 5v13M14 8v1M14 12v1M14 16v1" strokeDasharray="1.5 1.5" />
              </svg>
            </div>
            <div className="flex h-11 w-11 rotate-[9deg] items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/[0.08] text-lg text-violet-200">
              *
            </div>
          </div>
        </section>

        <section aria-label="Order statistics" className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/[0.09] bg-[#0A1020]/90 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/55">Total orders</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3978F6]/10 text-[#A9C4FF]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6"><path d="M5 4.75h14A1.25 1.25 0 0 1 20.25 6v12A1.25 1.25 0 0 1 19 19.25H5A1.25 1.25 0 0 1 3.75 18V6A1.25 1.25 0 0 1 5 4.75Z"/><path d="M8 9h8M8 13h8M8 16h4"/></svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{totalOrders}</p>
            <p className="mt-1 text-xs text-white/35">All-time purchases</p>
          </article>

          <article className="rounded-2xl border border-white/[0.09] bg-[#0A1020]/90 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/55">In progress</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/[0.08] text-amber-200">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8.25"/><path d="M12 7v5l3.25 2"/></svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{activeOrders}</p>
            <p className="mt-1 text-xs text-white/35">Orders needing attention</p>
          </article>

          <article className="rounded-2xl border border-white/[0.09] bg-[#0A1020]/90 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/55">Completed</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/[0.08] text-emerald-200">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6"><path d="M20 11.1V12a8 8 0 1 1-4.75-7.33"/><path d="m8.5 11.5 3 3L20.5 5"/></svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{completedOrders}</p>
            <p className="mt-1 text-xs text-white/35">Successfully completed</p>
          </article>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)]">
          <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0A1020]/90">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8FB0FF]">Your activity</p>
                <h2 className="mt-1.5 text-xl font-semibold">Recent orders</h2>
              </div>
              <Link href="/account/orders" className="text-sm font-medium text-[#A9C4FF] transition hover:text-white">
                View all <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#78A1FF]/15 bg-[#3978F6]/[0.08]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#A9C4FF]" stroke="currentColor" strokeWidth="1.5"><path d="M4 7.5A2.5 2.5 0 0 0 4 12.5v4A1.5 1.5 0 0 0 5.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-4a2.5 2.5 0 0 1 0-5v-1A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5z"/><path d="M14 5v13" strokeDasharray="1.5 1.5"/></svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold">Your next show starts here</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">
                  You have no orders yet. Find a gig, discover a new favourite or plan a night out.
                </p>
                <Link href="/events" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3978F6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]">
                  Explore events <span className="ml-2">-&gt;</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {orders.map((order) => (
                  <Link
                    key={order.orderNumber}
                    href={`/orders/${encodeURIComponent(order.orderNumber)}`}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:px-7"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#18294B] to-[#101526] text-[#A9C4FF]">
                      {getEventImage(order.ticketListing.event.title, order.ticketListing.event.image) ? (
                        <img src={getEventImage(order.ticketListing.event.title, order.ticketListing.event.image) ?? undefined} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5"><path d="M4 7.5A2.5 2.5 0 0 0 4 12.5v4A1.5 1.5 0 0 0 5.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-4a2.5 2.5 0 0 1 0-5v-1A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5z"/></svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-white">{order.ticketListing.event.title}</h3>
                      <p className="mt-1 text-sm text-white/45">
                        {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(order.ticketListing.event.date)}
                        {" · "}{order.quantity} {order.quantity === 1 ? "ticket" : "tickets"}
                      </p>
                      <p className="mt-1 text-xs text-white/35">{order.ticketListing.event.venue}, {order.ticketListing.event.city}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyle(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                      <span className="text-sm font-semibold">{money(order.totalCents, order.currency)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/[0.09] bg-[#0A1020]/90 p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3978F6] to-violet-500 text-xl font-semibold shadow-lg shadow-blue-950/30">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Your account</p>
                  <h2 className="mt-1 break-words text-lg font-semibold">{displayName}</h2>
                  <p className="mt-1 break-all text-sm text-white/45">{buyer.email}</p>
                </div>
              </div>
              <div className="mt-6 border-t border-white/[0.07] pt-5">
                <p className="text-xs text-white/40">Member since</p>
                <p className="mt-1 text-sm text-white/80">
                  {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(buyer.createdAt)}
                </p>
              </div>
              <div className="mt-5">
                <BuyerLogoutButton />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-violet-300/15 bg-gradient-to-br from-[#17132D] to-[#0C1020] p-6 sm:p-7">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/75">Make a night of it</p>
              <h2 className="relative mt-3 text-xl font-semibold">Your next memory is waiting.</h2>
              <p className="relative mt-2 text-sm leading-6 text-white/55">
                Browse upcoming events and find something worth getting excited about.
              </p>
              <Link href="/events" className="relative mt-5 inline-flex text-sm font-semibold text-violet-200 transition hover:text-white">
                Find your next event <span className="ml-2">-&gt;</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}