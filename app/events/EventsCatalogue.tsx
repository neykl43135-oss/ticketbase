
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type CatalogueEvent = {
  id: number;
  title: string;
  slug: string;
  category: string;
  venue: string;
  city: string;
  date: Date | string;
  time: string | null;
  description: string;
  image: string | null;
  featured: boolean;
  minPriceCents: number | null;
};

type Props = {
  events: CatalogueEvent[];
  isBuyerAuthenticated?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date | string) {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date TBC";

  return dateFormatter.format(parsed);
}

function formatStartingPrice(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function getCategory(category: string) {
  const value = category.trim().toLowerCase();

  if (value.includes("sport")) return "Sports";
  if (value.includes("theatre") || value.includes("theater")) {
    return "Theatre";
  }
  if (value.includes("festival")) return "Festivals";
  if (
    value.includes("electronic") ||
    value.includes("dance") ||
    value.includes("dj")
  ) {
    return "Electronic";
  }
  if (
    value.includes("rock") ||
    value.includes("metal") ||
    value.includes("punk")
  ) {
    return "Rock";
  }
  if (value.includes("concert") || value.includes("music")) {
    return "Concerts";
  }

  return category.trim() || "Live events";
}

function getEventImage(event: CatalogueEvent): string | null {
  if (event.slug === "manic-street-preachers-3olympia-2026-10-22") {
    return "/images/events/manic-street-preachers-2026-10-22.jpg";
  }

  if (event.image) return event.image;

  const title = event.title.toLowerCase();

  if (title.includes("coronas")) {
    return "/images/events/the-coronas-2026.jpg";
  }
  if (title.includes("manic street preachers")) {
    return "/images/events/manic-street-preachers-2026.jpg";
  }
  if (title.includes("brandon flowers")) {
    return "/images/events/brandon-flowers-2026.jpg";
  }
  if (title.includes("strokes")) {
    return "/images/events/the-strokes-2026.jpg";
  }
  if (title.includes("ireland v south africa")) {
    return "/images/events/ireland-v-south-africa-2026.jpg";
  }
  if (title.includes("duke dumont")) {
    return "/images/events/duke-dumont-2026.jpg";
  }
  if (title.includes("2manydjs")) {
    return "/images/events/2manydjs-2026.jpg";
  }
  if (title.includes("macklemore")) {
    return "/images/events/macklemore-2026.jpg";
  }
  if (title.includes("panchiko")) {
    return "/images/events/panchiko-2026.jpg";
  }
  if (title.includes("stevie wonder")) {
    return "/images/events/stevie-wonder-2026.jpg";
  }
  if (title.includes("jungle")) {
    return "/images/events/jungle-2026.jpg";
  }
  if (title.includes("aaron rowe")) {
    return "/images/events/aaron-rowe-2026.jpg";
  }
  if (title.includes("damien dempsey")) {
    return "/images/events/damien-dempsey-2026.jpg";
  }

  return null;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      <circle
        cx="10.8"
        cy="10.8"
        r="6.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m16 16 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M4.5 10h10.75M10.5 4.75 15.75 10l-5.25 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EventsCatalogue({ events, isBuyerAuthenticated = false }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All events");
  const [sortOrder, setSortOrder] = useState("soonest");

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(events.map((event) => getCategory(event.category))),
    );

    return [
      "All events",
      ...unique.filter((category) => category !== "Live events"),
      ...(unique.includes("Live events") ? ["Live events"] : []),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        if (event.title.toLowerCase().includes("ticketbase test event")) {
          return false;
        }

        const matchesCategory =
          activeCategory === "All events" ||
          getCategory(event.category) === activeCategory;

        const searchableText = [
          event.title,
          event.category,
          event.venue,
          event.city,
          event.description,
        ]
          .join(" ")
          .toLowerCase();

        return matchesCategory && (!query || searchableText.includes(query));
      })
      .sort((a, b) => {
        const difference =
          new Date(a.date).getTime() - new Date(b.date).getTime();

        return sortOrder === "soonest" ? difference : -difference;
      });
  }, [events, search, activeCategory, sortOrder]);

  return (
    <main className="min-h-screen bg-[#030712] text-white antialiased">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080D19]/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link
            href="/"
            className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.06em] sm:text-[22px]"
          >
            TicketBase
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <Link href="/events" className="text-white">
              Events
            </Link>
            <Link
              href="/how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isBuyerAuthenticated ? (
              <Link
                href="/account"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#3978F6] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                My account
              </Link>
            ) : (
              <>
                <Link
                  href="/account/login"
                  className="inline-flex rounded-full border border-white/15 px-3 py-2.5 text-sm transition hover:border-white/35 sm:px-4"
                >
                  Sign in
                </Link>
                <Link
                  href="/account/register"
                  className="hidden rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#5B8EFF] md:inline-flex"
                >
                  Create account
                </Link>
              </>
            )}
            <Link
              href="/events"
              className="hidden items-center gap-2 rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] md:inline-flex"
            >
              Browse events <ArrowIcon />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#080F1E]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-48 h-[480px] w-[480px] rounded-full bg-[#3978F6]/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3978F6]" />
              Find your next live moment
            </span>

            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
              Find your next{" "}
              <span className="bg-gradient-to-r from-[#A9C4FF] to-[#78A1FF] bg-clip-text text-transparent">event</span><span className="text-white">.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              From unforgettable gigs to big match days. Discover events and
              compare tickets with a clear 1% buyer fee.
            </p>
          </div>

          <div className="mt-8 max-w-2xl">
            <label htmlFor="event-search" className="sr-only">
              Search events, artists or venues
            </label>

            <div className="flex items-center rounded-2xl border border-white/[0.10] bg-[#030712]/70 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition duration-300 focus-within:border-[#3978F6]/70 focus-within:shadow-[0_0_0_3px_rgba(57,120,246,0.10)]">
              <span className="pl-3 text-white/35">
                <SearchIcon />
              </span>
              <input
                id="event-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search artists, venues or events..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-white/35"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mr-1 rounded-xl px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/45">
              <span className="font-semibold tabular-nums text-[#A9C4FF] transition-colors">
                {filteredEvents.length}
              </span>
              <span>
                {filteredEvents.length === 1 ? "event" : "events"} to explore
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78A1FF]">
              The next big thing
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Upcoming events
            </h2>
          </div>

          <label className="flex items-center gap-3 self-start rounded-xl border border-white/[0.10] bg-[#0B1220] px-4 py-3 text-sm shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition hover:border-white/20 sm:self-auto">
            <span className="text-white/45">Sort by</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="bg-transparent font-medium text-white outline-none"
              aria-label="Sort events"
            >
              <option value="soonest" className="bg-[#080F1E]">
                Soonest first
              </option>
              <option value="latest" className="bg-[#080F1E]">
                Latest first
              </option>
            </select>
          </label>
        </div>

        <div className="category-scroll mt-7 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const selected = category === activeCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={selected}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                  selected
                    ? "border-[#3978F6] bg-[#3978F6] text-white"
                    : "border-white/10 bg-white/[0.035] text-white/60 hover:border-white/25 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[0.10] bg-gradient-to-b from-[#0D1729] to-[#080F1E] px-6 py-20 text-center shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#3978F6]/10 text-[#A9C4FF]">
              <SearchIcon />
            </div>
            <h3 className="mt-5 text-xl font-semibold">No events found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
              Try another artist, venue or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All events");
              }}
              className="mt-5 rounded-full bg-[#3978F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(57,120,246,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5B8EFF] hover:shadow-[0_10px_26px_rgba(57,120,246,0.28)]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event, index) => {
              const image = getEventImage(event);

              return (
                <article
                  key={event.id}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#0B1220] transition duration-300 hover:-translate-y-1 hover:border-[#3978F6]/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]"
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="flex h-full flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#111827]">
                      {image ? (
                        <Image
                          src={image}
                          alt={event.title}
                          width={900}
                          height={675}
                          unoptimized
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#111C32] to-[#080F1E]">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                            TicketBase
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/60 via-transparent to-black/15" />

                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#030712]/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                        {getCategory(event.category)}
                      </span>

                      {event.featured && (
                        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-[#3978F6] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-blue-950/30">
                          Featured
                        </span>
                      )}

                      <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-[#030712]/75 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                        {formatDate(event.date)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 tracking-[-0.025em] text-white transition-colors group-hover:text-[#A9C4FF]">
                        {event.title}
                      </h3>

                      <p className="mt-2 truncate text-sm text-white/55">
                        {event.venue.replace(/ B$/, "")} · {event.city}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        {event.minPriceCents !== null ? (
                          <span className="text-sm font-semibold text-[#A9C4FF]">
                            From {formatStartingPrice(event.minPriceCents)}
                          </span>
                        ) : (
                          <span className="text-xs text-white/40">
                            No tickets listed
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                        <span className="text-[11px] text-white/30">
                          {event.time || "Event details"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A9C4FF] transition duration-200 group-hover:gap-2 group-hover:text-white">
                          View event <ArrowIcon />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}


