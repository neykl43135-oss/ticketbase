import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSeller } from "@/lib/current-seller";
import { prisma } from "@/lib/prisma";
import { createSellerListing, unpublishSellerListing } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ error?: string; created?: string; unpublished?: string }>;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#080F20] px-4 py-3 text-sm text-white outline-none transition focus:border-[#78A1FF]";

const labelClass = "block text-sm font-medium text-white/75";

export default async function SellerDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const seller = await getCurrentSeller();

  if (!seller) redirect("/seller/login");

  const params = await searchParams;
  const now = new Date();

  const [events, listings] = await Promise.all([
    prisma.event.findMany({
      where: { status: "active", date: { gte: now } },
      orderBy: [{ date: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        venue: true,
        city: true,
        date: true,
      },
    }),
    prisma.ticketListing.findMany({
      where: { sellerId: seller.id },
      include: {
        event: {
          select: { title: true, slug: true, date: true, venue: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const dateFormat = new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const moneyFormat = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
    }).format(cents / 100);

  const errorMessage =
    params.error === "verification"
      ? "Your account must be verified before you can publish tickets."
      : params.error === "invalid"
        ? "Please check the listing details and try again."
        : params.error === "event"
          ? "That event is no longer available. Please select another event."
          : null;

  return (
    <main className="min-h-screen bg-[#030712] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.06em]">
            TicketBase
          </Link>
          <form action="/api/seller/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78A1FF]">
            Seller dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome, {seller.displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            Create ticket listings and manage your offers on TicketBase.
          </p>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">Email address</p>
            <p className="mt-2 break-all text-lg font-medium">
              {seller.email ?? "Not provided"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/50">Account status</p>
            <p className="mt-2 text-lg font-medium text-emerald-300">Active</p>
            <p className="mt-2 text-sm text-white/50">
              {seller.verified
                ? "Seller verification completed"
                : "Seller verification pending"}
            </p>
          </div>
        </section>

        {params.unpublished === "1" && (
          <p role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
            Your listing has been taken off sale.
          </p>
        )}

        {params.error === "listing-not-found" && (
          <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            Listing not found or it does not belong to your account.
          </p>
        )}

        {params.error === "listing-inactive" && (
          <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            This listing is already inactive.
          </p>
        )}

        {params.created === "1" && (
          <p role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
            Your ticket listing has been created.
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Create a ticket listing</h2>
          {!seller.verified ? (
            <p className="mt-3 text-sm leading-6 text-amber-200/90">
              Your account is awaiting verification. You can prepare your details,
              but publishing will become available after verification.
            </p>
          ) : events.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-white/55">
              There are no upcoming active events to list tickets for yet.
            </p>
          ) : (
            <form action={createSellerListing} className="mt-6 space-y-6">
              <div>
                <label className={labelClass} htmlFor="eventId">Event</label>
                <select id="eventId" name="eventId" className={inputClass} required defaultValue="">
                  <option value="" disabled>Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} — {event.venue}, {event.city} ({dateFormat.format(event.date)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="price">Price per ticket (€)</label>
                  <input className={inputClass} id="price" name="price" type="number" min="0.01" max="9999999.99" step="0.01" placeholder="65.00" required />
                </div>
                <div>
                  <label className={labelClass} htmlFor="quantity">Number of tickets</label>
                  <input className={inputClass} id="quantity" name="quantity" type="number" min="1" max="10000" step="1" placeholder="2" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="ticketType">Ticket type</label>
                  <input className={inputClass} id="ticketType" name="ticketType" maxLength={100} placeholder="General admission / seated" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="section">Section / block</label>
                  <input className={inputClass} id="section" name="section" maxLength={100} placeholder="Block A" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="row">Row</label>
                  <input className={inputClass} id="row" name="row" maxLength={100} placeholder="Row 12" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="seats">Seat numbers</label>
                  <input className={inputClass} id="seats" name="seats" maxLength={200} placeholder="Seats 10–11" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="sourcePlatform">Original ticket platform</label>
                  <input className={inputClass} id="sourcePlatform" name="sourcePlatform" maxLength={100} placeholder="Ticketmaster" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="transferMethod">Transfer method</label>
                  <input className={inputClass} id="transferMethod" name="transferMethod" maxLength={150} placeholder="Official mobile transfer" />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="description">Additional details</label>
                <textarea className={inputClass} id="description" name="description" maxLength={5000} rows={4} placeholder="Add any useful details about the tickets." />
              </div>

              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3978F6] px-6 py-3 text-sm font-semibold transition hover:bg-[#5B8EFF]">
                Publish listing
              </button>
            </form>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your ticket listings</h2>
            <span className="text-sm text-white/50">{listings.length} total</span>
          </div>

          {listings.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-white/55">
              You haven’t listed any tickets yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {listings.map((listing) => (
                <article key={listing.id} className="rounded-xl border border-white/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{listing.event.title}</h3>
                      <p className="mt-1 text-sm text-white/55">
                        {listing.event.venue} · {dateFormat.format(listing.event.date)}
                      </p>
                      <p className="mt-3 text-sm text-white/70">
                        {moneyFormat(listing.pricePerTicketCents, listing.currency)} per ticket
                        {" · "}{listing.quantityAvailable} available of {listing.quantity}
                      </p>
                      {(listing.section || listing.row || listing.seats) && (
                        <p className="mt-1 text-sm text-white/50">
                          {[listing.section, listing.row, listing.seats].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                      {listing.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Link href={`/events/${listing.event.slug}`} className="inline-flex text-sm font-medium text-[#78A1FF] hover:text-white">
                      View event
                    </Link>
                    {seller.verified && ["active", "hidden"].includes(listing.status) && (
                      <Link
                        href={`/seller/listings/${listing.id}/edit`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                      >
                        Edit listing
                      </Link>
                    )}
                    {listing.status === "active" && seller.verified && (
                      <form action={unpublishSellerListing}>
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-300/60 hover:bg-red-400/10"
                        >
                          Take off sale
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link href="/events" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-white/30">
            Browse events
          </Link>
        </div>
      </div>
    </main>
  );
}


