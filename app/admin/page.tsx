import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
  const [pendingVerification, verifiedSellers, blockedSellers] =
    await Promise.all([
      prisma.seller.count({
        where: { verified: false, status: "active" },
      }),
      prisma.seller.count({
        where: { verified: true, status: "active" },
      }),
      prisma.seller.count({
        where: { status: "blocked" },
      }),
    ]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </a>

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-black"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
          Control panel
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-neutral-500">
          Manage events, ticket listings and the TicketBase marketplace
          from one place.
        </p>

        <section className="mt-10 mb-6"><a href="/admin/orders" className="inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">Manage orders →</a></section>
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <a href="/admin/sellers" className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm">
            <p className="text-sm text-neutral-500">Pending verification</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{pendingVerification}</p>
            <p className="mt-1 text-xs text-neutral-500">Active accounts awaiting review</p>
          </a>
          <a href="/admin/sellers" className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm">
            <p className="text-sm text-neutral-500">Verified sellers</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{verifiedSellers}</p>
            <p className="mt-1 text-xs text-neutral-500">Verified and active accounts</p>
          </a>
          <a href="/admin/sellers" className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm">
            <p className="text-sm text-neutral-500">Blocked sellers</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{blockedSellers}</p>
            <p className="mt-1 text-xs text-neutral-500">Accounts blocked from selling</p>
          </a>
        </section>
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/events"
            className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <p className="text-sm text-neutral-500">Content management</p>

            <h2 className="mt-3 text-xl font-semibold">Events →</h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Create events, edit details, upload images and control
              publication status.
            </p>

            <span className="mt-5 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Manage events
            </span>
          </a>

          <a
            href="/admin/tickets"
            className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <p className="text-sm text-neutral-500">Marketplace</p>
            <h2 className="mt-3 text-xl font-semibold">Ticket listings →</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Manage ticket quantities, prices, availability and seller listings.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Manage listings
            </span>
          </a>

          <a
            href="/admin/sellers"
            className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <p className="text-sm text-neutral-500">Marketplace management</p>
            <h2 className="mt-3 text-xl font-semibold">Sellers →</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Review new sellers, verify accounts and manage seller access to the marketplace.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Manage sellers
            </span>
          </a>

          <a
            href="/admin/settings/homepage"
            className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <p className="text-sm text-neutral-500">Platform</p>
            <h2 className="mt-3 text-xl font-semibold">Homepage Settings →</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Edit the Historical deals counter displayed on the homepage.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Edit homepage counter
            </span>
          </a>
          <a
            href="/admin/settings/payments"
            className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <p className="text-sm text-neutral-500">Platform</p>
            <h2 className="mt-3 text-xl font-semibold">Payment Settings →</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Configure payment methods, enable or disable them, and manage
              the payment instructions shown to buyers.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Configure payments
            </span>
          </a>
        </section>
      </div>
    </main>
  );
}
