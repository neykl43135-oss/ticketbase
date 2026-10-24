import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import EventCategoryCarousel from "@/app/components/EventCategoryCarousel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerSession } from "@/lib/buyer-auth";
import { getSellerSession } from "@/lib/seller-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = ["Concerts", "Sports", "Theatre", "Festivals"];

const fallbackImages = [
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1675886051964-e54e7d28cece?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4.5 10h10.75M10.5 4.75 15.75 10l-5.25 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function Home() {
  const [buyerSession, sellerSession] = await Promise.all([
    getBuyerSession(),
    getSellerSession(),
  ]);
  const homepageSettings = await prisma.homepageSettings.findUnique({
    where: { id: 1 },
  });
  const historicalDeals = homepageSettings?.historicalDeals ?? 3236;
  const completedOrderCount = await prisma.order.count({
    where: { status: "completed" },
  });
  const totalSuccessfulDeals = 3200 + completedOrderCount;
  const databaseEvents = await prisma.event.findMany({
    where: {
      status: "active",
      featured: true,
      date: { gte: new Date() },
    },
    orderBy: [
      { homepageOrder: "asc" },
      { date: "asc" },
    ],
    take: 50,
  });

  const eligibleEvents = databaseEvents.filter(
    (event) => !/test/i.test(event.title),
  );

  const sortedEvents = [
    ...eligibleEvents.filter((event) => event.homepageOrder > 0),
    ...eligibleEvents.filter((event) => event.homepageOrder === 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
  ];

  const events = sortedEvents.map((event, index) => {
    const title = event.title.toLowerCase();
    let image = event.image || fallbackImages[index % fallbackImages.length];

    if (title.includes("manic street preachers")) {
      image = title.includes("22 october") || title.includes("22 oct")
        ? "/images/events/manic-street-preachers-2026-10-22.jpg"
        : "/images/events/manic-street-preachers-2026.jpg";
    } else if (title.includes("brandon flowers")) {
      image = "/images/events/brandon-flowers-2026.jpg";
    } else if (title.includes("coronas")) {
      image = "/images/events/the-coronas-2026.jpg";
    } else if (title.includes("strokes")) {
      image = "/images/events/the-strokes-2026.jpg";
    } else if (title.includes("ireland v south africa") || title.includes("springboks")) {
      image = "/images/events/ireland-v-south-africa-2026.jpg";
    } else if (title.includes("2manydjs")) {
      image = "/images/events/2manydjs-2026.jpg";
    } else if (title.includes("macklemore")) {
      image = "/images/events/macklemore-2026.jpg";
    } else if (title.includes("panchiko")) {
      image = "/images/events/panchiko-2026.jpg";
    } else if (title.includes("stevie wonder")) {
      image = "/images/events/stevie-wonder-2026.jpg";
    } else if (title.includes("jungle")) {
      image = "/images/events/jungle-2026.jpg";
    } else if (title.includes("aaron rowe")) {
      image = "/images/events/aaron-rowe-2026.jpg";
    } else if (title.includes("damien dempsey")) {
      image = "/images/events/damien-dempsey-2026.jpg";
    }

    return {
      slug: event.slug,
      title: event.title,
      venue: event.venue,
      city: event.city,
      date: formatEventDate(event.date),
      category: event.category || "Live event",
      image,
      imageAlt: `${event.title} at ${event.venue}`,
    };
  });

  const carouselEvents = events;

  const featuredEvent = events[0] ?? {
    slug: "",
    title: "Discover live events",
    venue: "Dublin and beyond",
    city: "Dublin",
    date: "New events coming soon",
    category: "Live events",
    image: fallbackImages[0],
    imageAlt: "Live concert crowd beneath stage lights",
  };
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171714] antialiased">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#030712]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-8">
          <BrandLogo className="h-12 w-auto sm:h-14" priority />


          <nav className="hidden items-center gap-8 text-sm font-medium text-white/65 md:flex">
            <Link href="/events" className="transition hover:text-[#78A1FF]">Events</Link>
            <Link href="/how-it-works" className="transition hover:text-[#78A1FF]">How it works</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {sellerSession ? (
              <Link href="/seller/dashboard" className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2.5 text-sm font-medium text-white/90 transition hover:border-white/30 hover:text-white sm:px-4">
                Seller dashboard
              </Link>
            ) : buyerSession ? (
              <Link href="/account" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#3978F6] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-4 sm:py-2.5 sm:text-sm">
                My account
              </Link>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:text-white sm:px-4">
                  Sign in
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#3978F6] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-4">
                  Create account
                </Link>
              </>
            )}
            <Link href="/events" className="hidden items-center gap-2 rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] sm:inline-flex">
              Browse events <ArrowIcon />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[620px] overflow-hidden bg-[#030712] text-white lg:min-h-[690px]">

        <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-[#030712]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/20" />
        <div aria-hidden="true" className="absolute -left-40 top-10 h-[440px] w-[440px] rounded-full bg-[#3978F6]/10 blur-[110px]" />

        <div className="relative mx-auto grid min-h-[500px] max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:min-h-[540px] lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.035] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B7CBFF] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3978F6]" />
              Your next unforgettable night
            </div>

            <h1 className="mt-8 max-w-[760px] text-[clamp(3.6rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.085em]">
              Life happens
              <span className="mt-2 block text-[#3978F6]">live.</span>
            </h1>

            <p className="mt-8 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              The concerts, matches and nights worth remembering.
              Find your next experience with clear pricing and no surprises.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/events" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#3978F6] px-7 py-4 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(57,120,246,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5B8EFF] hover:shadow-[0_12px_32px_rgba(57,120,246,0.32)]">
                Discover events <ArrowIcon />
              </Link>
              <Link href="/how-it-works" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.035] px-7 py-4 text-sm font-semibold text-white transition duration-200 hover:border-white/40 hover:bg-white/[0.08]">
                How it works
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-4 text-xs font-medium text-white/60 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-[#3978F6]"><path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> Only 1% buyer fee
              </span>
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-[#3978F6]"><path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> Clear ticket details
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[460px] lg:ml-auto">
            <div className="absolute -inset-4 rounded-[32px] border border-white/10" />
            <Link
              href={featuredEvent.slug ? `/events/${featuredEvent.slug}` : "/events"}
              aria-label={`Explore ${featuredEvent.title}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-[26px] border border-white/15 bg-neutral-900 shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
            >
              <Image
                src={featuredEvent.image}
                alt={featuredEvent.imageAlt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10" />
              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/30 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white backdrop-blur-md">
                Featured experience
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A9C4FF]">
                  {featuredEvent.city} · {featuredEvent.date}
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl">
                  {featuredEvent.title}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  {featuredEvent.venue.replace(/ B$/, "")}
                </p>
                <span className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-[#DCE7FF]">
                  Explore event <ArrowIcon />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#030712] text-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#0B1426] via-[#0A1120] to-[#080F1E] px-5 py-5 shadow-[0_12px_45px_rgba(0,0,0,0.16)] sm:px-8 sm:py-6"><div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#3978F6]/10 blur-3xl" /><div className="relative">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:items-center sm:gap-6">
              <div className="sm:pr-2">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{historicalDeals.toLocaleString("en-IE")}</p>
                <p className="mt-1.5 text-xs font-medium text-white/55 sm:text-sm">Historical deals</p>
              </div>
              <div className="sm:px-2">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">1%</p>
                <p className="mt-1.5 text-xs font-medium text-white/55 sm:text-sm">Buyer fee</p>
              </div>
              <div className="sm:pl-2">
                <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Find your next event</p>
                <p className="mt-1.5 text-xs font-medium text-white/55 sm:text-sm">Concerts, sports and theatre</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
      <section className="bg-[#080F1E] text-white"><div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 sm:pb-14 sm:pt-9">
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#3978F6]">Make it a date</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">Coming up next.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/55 sm:text-base">
                Good nights start with the right ticket.
              </p>
            </div>
            <Link href="/events" className="group inline-flex items-center gap-2 self-start pb-1 text-sm font-semibold text-white/75 transition hover:text-[#3978F6] sm:self-auto">
              View all events <span className="transition group-hover:translate-x-1"><ArrowIcon /></span>
            </Link>
          </div>
        </div>

        <EventCategoryCarousel events={carouselEvents} />
      </div></section>

      <section className="bg-[#030712] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#080F1E] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="absolute -right-20 -top-36 h-96 w-96 rounded-full border border-[#3978F6]/20" />
          <div aria-hidden="true" className="absolute -right-4 -top-20 h-72 w-72 rounded-full border border-[#3978F6]/15" />
          <div className="relative flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#3978F6]">Good experiences. Clear pricing.</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">
                More memories.<br />Less fees.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                Know what you will pay before checkout. TicketBase keeps the buyer fee simple and transparent.
              </p>
            </div>
            <div className="w-full max-w-[330px] rounded-2xl border border-white/10 bg-[#0B1426] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3978F6]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">A clear checkout</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-white/40">Example only</span>
              </div>
              <div className="mt-7 flex items-center justify-between text-sm">
                <span className="text-white/60">Ticket price</span>
                <span className="font-medium tabular-nums">€100.00</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/60">Buyer fee · 1%</span>
                <span className="font-medium tabular-nums text-[#A9C4FF]">€1.00</span>
              </div>
              <div className="my-5 border-t border-dashed border-white/15" />
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-white/50">Total including fee</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">€101.00</p>
                </div>
                <span className="mb-1 rounded-full border border-[#3978F6]/30 bg-[#3978F6]/10 px-2.5 py-1 text-[10px] font-semibold text-[#A9C4FF]">1% fee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community reviews */}
      <section className="bg-[#030712] px-5 pb-14 pt-8 text-white sm:px-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#78A1FF]">
              From the TicketBase community
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Real fans. Real experiences.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
              Experiences shared by people who have bought and sold tickets through TicketBase.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
            <article className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101D33] to-[#080F1E] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-7">
              <div aria-hidden="true" className="text-3xl leading-none text-[#78A1FF]">“</div>
              <p className="mt-3 min-h-[140px] flex-1 text-sm font-medium leading-7 text-white/80">
                Bought tickets through TicketBase and the whole process was straightforward. Communication was good, and everything went smoothly. Would definitely use it again.
              </p>
              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <p className="font-semibold text-white">Colm</p>
                <p className="mt-1 text-xs text-white/45">Cork</p>
              </div>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101D33] to-[#080F1E] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-7">
              <div aria-hidden="true" className="text-3xl leading-none text-[#78A1FF]">“</div>
              <p className="mt-3 min-h-[140px] flex-1 text-sm font-medium leading-7 text-white/80">
                Really easy to use and a much better experience than I expected. The process was clear from start to finish, and I’d happily recommend TicketBase to other fans.
              </p>
              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <p className="font-semibold text-white">Sarah</p>
                <p className="mt-1 text-xs text-white/45">Dublin</p>
              </div>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101D33] to-[#080F1E] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-7">
              <div aria-hidden="true" className="text-3xl leading-none text-[#78A1FF]">“</div>
              <p className="mt-3 min-h-[140px] flex-1 text-sm font-medium leading-7 text-white/80">
                The low service fee is a big plus. It makes buying and selling tickets more affordable, and the whole process is simple and straightforward. I’d happily use TicketBase again.
              </p>
              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <p className="font-semibold text-white">Frank</p>
                <p className="mt-1 text-xs text-white/45">Laois</p>
              </div>
            </article>
            <article className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101D33] to-[#080F1E] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-7">
              <div aria-hidden="true" className="text-3xl leading-none text-[#78A1FF]">“</div>
              <p className="mt-3 min-h-[140px] flex-1 text-sm font-medium leading-7 text-white/80">
                Buying through TicketBase was really simple. Everything was easy to understand, and the whole experience felt smooth from beginning to end. I’d happily use it again.
              </p>
              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <p className="font-semibold text-white">Laura</p>
                <p className="mt-1 text-xs text-white/45">Dublin</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}



