import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import BuyTicketsButton from "@/components/BuyTicketsButton";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import { getBuyerSession } from "@/lib/buyer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getEventImage(title: string, image: string | null): string | null {
  const name = title.toLowerCase();

  if (name.includes("manic street preachers")) {
    if (name.includes("22 october") || name.includes("22 oct")) {
      return "/images/events/manic-street-preachers-2026-10-22.jpg";
    }
    return "/images/events/manic-street-preachers-2026.jpg";
  }

  if (name.includes("brandon flowers")) {
    return "/images/events/brandon-flowers-2026.jpg";
  }

  if (name.includes("coronas")) {
    return "/images/events/the-coronas-2026.jpg";
  }

  if (name.includes("strokes")) {
    return "/images/events/the-strokes-2026.jpg";
  }

  if (image) return image;

  if (name.includes("oasis")) {
    return "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=85";
  }

  if (name.includes("ireland v south africa")) {
    return "/images/events/ireland-v-south-africa-2026.jpg";
  }

  if (name.includes("2manydjs")) return "/images/events/2manydjs-2026.jpg";
  if (name.includes("macklemore")) return "/images/events/macklemore-2026.jpg";
  if (name.includes("panchiko")) return "/images/events/panchiko-2026.jpg";
  if (name.includes("stevie wonder")) return "/images/events/stevie-wonder-2026.jpg";
  if (name.includes("jungle")) return "/images/events/jungle-2026.jpg";
  if (name.includes("aaron rowe")) return "/images/events/aaron-rowe-2026.jpg";
  if (name.includes("damien dempsey")) return "/images/events/damien-dempsey-2026.jpg";

  return null;
}
export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const buyerSession = await getBuyerSession();

  await expirePendingOrders();

  const event = await prisma.event.findFirst({
    where: {
      slug,
      status: "active",
    },
  });

  if (!event) {
    notFound();
  }

  const allListings = await prisma.ticketListing.findMany({
    where: {
      eventId: event.id,
      status: "active",
      quantityAvailable: {
        gt: 0,
      },
    },
    include: {
      seller: {
        select: {
          displayName: true,
          verified: true,
          typicalTransferMinutes: true,
          status: true,
        },
      },
    },
    orderBy: {
      pricePerTicketCents: "asc",
    },
  });

  const listings = allListings.filter(
    (listing) =>
      listing.seller.status === "active",
  );

  const formattedDate = new Intl.DateTimeFormat("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(event.date);

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#030712]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo className="h-8 w-auto sm:h-9" priority />

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/65 md:flex">
            <Link href="/events" className="transition hover:text-[#78A1FF]">
              Events
            </Link>
            <Link href="/how-it-works" className="transition hover:text-[#78A1FF]">
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {buyerSession ? (
              <Link
                href="/account"
                className="inline-flex whitespace-nowrap rounded-full bg-[#3978F6] px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                My account
              </Link>
            ) : (
              <>
                <Link href="/seller/login" className="hidden rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:text-white sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/seller/register" className="hidden rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] md:inline-flex">
                  Create account
                </Link>
              </>
            )}
            <Link
              href="/events"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#3978F6] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5B8EFF] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Browse events
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <MobileMenu activePage="other" isBuyerAuthenticated={Boolean(buyerSession)} />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5">
        <Link
          href="/events"
          className="text-sm text-white/55 transition hover:text-white"
        >&larr; Back to events</Link>
      </div>

      {/* Event content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <div className="grid min-w-0 items-start gap-7 sm:gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)] lg:gap-12 xl:gap-16">
          {/* Main column */}
          <div className="min-w-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#0D172B] ring-1 ring-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:aspect-[16/10]">
              {getEventImage(event.title, event.image) ? (
                <Image
                  src={getEventImage(event.title, event.image)!}
                  alt={event.title}
                  width={1400}
                  height={875}
                  unoptimized
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-[#111827] shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="8.5" cy="9" r="1.5" />
                      <path d="m21 15-5-5L5 20" />
                    </svg>
                  </div>

                  <span className="text-sm text-white/40">
                    Event image
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/75">
                  {event.category}
                </span>


              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:mt-5 sm:text-4xl md:text-5xl lg:text-[3.5rem]">
                {event.title}
              </h1>

              <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0D172B] p-4 sm:p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#111827] shadow-sm ring-1 ring-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 11h18" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/55">Date &amp; time</p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-white">
                      {formattedDate}
                    </p>

                    {event.time && (
                      <p className="mt-1 text-sm text-white/65">
                        {event.time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0D172B] p-4 sm:p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#111827] shadow-sm ring-1 ring-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/55">Venue</p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-white">{event.venue}</p>
                    <p className="mt-1 text-sm text-white/65">
                      {event.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-10 hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 lg:block xl:p-7">
              <h2 className="text-2xl font-semibold tracking-tight">
                About this event
              </h2>

              <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-white/65">
                {event.description}
              </p>
            </div>
          </div>

          {/* Ticket listings */}
          <aside>
            <div className="rounded-2xl border border-white/[0.10] bg-gradient-to-b from-[#0B1425] to-[#080F1E] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-6 md:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78A1FF]">
                TicketBase marketplace
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Available tickets
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Compare available ticket offers.
              </p>

              {listings.length === 0 ? (
                <div className="mt-6 rounded-xl border border-white/[0.10] bg-gradient-to-br from-[#101D33] to-[#0D172B] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <p className="font-medium">No tickets listed yet</p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Check back later to see tickets for this event.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                  {listings.map((listing) => {
                    const feeCents = Math.round(
                      listing.pricePerTicketCents * 0.01,
                    );

                    const totalCents =
                      listing.pricePerTicketCents + feeCents;

                    return (
                      <article
                        key={listing.id}
                        className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#0D1729] to-[#080F1E] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-[#3978F6]/45 hover:shadow-[0_14px_38px_rgba(0,0,0,0.28)] sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">
                              {listing.ticketType || "Ticket"}
                            </h3>

                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#5B8EFF]/35 bg-gradient-to-br from-[#3978F6]/30 via-[#172B4D] to-[#0B1425] text-xs font-bold tracking-wide text-[#D8E5FF] shadow-[0_0_18px_rgba(57,120,246,0.12)] ring-1 ring-white/[0.06]">
                                {listing.seller.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-white">
                                  {listing.seller.displayName}
                                </span>
                                <p className="mt-0.5 text-xs text-white/55">
                                  Ticket seller
                                </p>
                                <p className="mt-1 text-xs text-white/65">
                                  Typical transfer:{" "}
                                  <span className="font-medium text-white/85">
                                    {listing.seller.typicalTransferMinutes == null
                                      ? "Not specified"
                                      : `${listing.seller.typicalTransferMinutes} ${listing.seller.typicalTransferMinutes === 1 ? "minute" : "minutes"}`}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {listing.seller.verified && (
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-200">
                              Verified
                            </span>
                          )}
                        </div>

                        {(listing.section ||
                          listing.row ||
                          listing.seats) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {listing.section && (
                              <span className="inline-flex items-center rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/75">
                                <span className="mr-1.5 text-white/40">Section</span>
                                <span className="font-medium text-white/90">{listing.section}</span>
                              </span>
                            )}

                            {listing.row && (
                              <span className="inline-flex items-center rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/75">
                                <span className="mr-1.5 text-white/40">Row</span>
                                <span className="font-medium text-white/90">{listing.row}</span>
                              </span>
                            )}

                            {listing.seats && (
                              <span className="inline-flex items-center rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/75">
                                <span className="mr-1.5 text-white/40">Seats</span>
                                <span className="font-medium text-white/90">{listing.seats}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {listing.sourcePlatform && (
                          <p className="mt-3 text-sm text-white/55">
                            Platform: {listing.sourcePlatform}
                          </p>
                        )}

                        <div className="mt-5 border-t border-white/[0.08] pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/55">
                              Ticket price
                            </span>

                            <span className="font-medium">
                              {formatPrice(listing.pricePerTicketCents)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-white/55">
                              Buyer fee (1%)
                            </span>

                            <span>{formatPrice(feeCents)}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-white/[0.08] pt-3">
                            <div className="min-w-0">
                              <p className="text-xs text-white/40">
                                Total per ticket
                              </p>

                              <p className="mt-1 text-2xl font-bold tracking-tight text-[#78A1FF]">
                                {formatPrice(totalCents)}
                              </p>
                            </div>

                            <p className="max-w-[45%] text-right text-xs leading-5 text-white/65 sm:max-w-none">
                              <span className="font-semibold text-[#8DB0FF]">{listing.quantityAvailable}</span>{" "}
                              {listing.quantityAvailable === 1
                                ? "ticket"
                                : "tickets"}{" "}
                              available
                            </p>
                          </div>
                        </div>
                        <BuyTicketsButton
                          listingId={listing.id}
                          isAuthenticated={Boolean(buyerSession)}
                        />
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 rounded-xl border border-[#3978F6]/20 bg-gradient-to-br from-[#101D33] via-[#0D172B] to-[#0A1221] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#3978F6]/25 bg-[#3978F6]/10 text-[#8DB0FF]">
                    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                      <path d="M12 3.5v17M16.5 7.5c0-1.7-1.9-3-4.5-3s-4.5 1.3-4.5 3 1.8 2.6 4.5 3 4.5 1.3 4.5 3-1.9 3-4.5 3-4.5-1.3-4.5-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">Simple, transparent pricing</p>
                      <span className="rounded-full border border-[#3978F6]/25 bg-[#3978F6]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#A9C3FF]">
                        1% FEE
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/65">
                      A 1% buyer service fee is added to the ticket price. You can review the full total before completing your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:mt-10 sm:p-6 lg:hidden">
          <h2 className="text-2xl font-semibold tracking-tight">
            About this event
          </h2>
          <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-white/65">
            {event.description}
          </p>
        </div>
      </section>

      {/* Footer */}
    </main>
  );
}





