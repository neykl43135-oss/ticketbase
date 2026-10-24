import Link from "next/link";

const principles = [
  {
    number: "01",
    title: "Fairer resale",
    description:
      "Our aim is to support resale at no more than face value, helping fans connect without inflated ticket prices.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3.5 19 7v5c0 4.2-2.9 7.1-7 8.5C7.9 19.1 5 16.2 5 12V7l7-3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Clear fees",
    description:
      "The buyer service fee is 1%. You should be able to see the applicable fee and total price before confirming your order.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M4 7.5h16M6.5 4.5h11A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17V7a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 14h3m2.5 0H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Find your event",
    description: "Explore available tickets for concerts, sport and theatre.",
  },
  {
    number: "02",
    title: "Review the details",
    description: "Check the listing, ticket information and total price before ordering.",
  },
  {
    number: "03",
    title: "Receive your ticket",
    description: "Follow the order instructions and check your ticket transfer.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative isolate flex-1 overflow-hidden px-5 pb-20 pt-14 text-white sm:px-8 sm:pb-24 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[440px] w-[min(900px,100vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(57,120,246,0.13),transparent_68%)]"
      />

      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#080E1B] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-blue-400/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-blue-400/[0.08] sm:h-72 sm:w-72"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.75fr)] lg:items-center lg:gap-12">
            <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3978F6]" />
              About TicketBase
            </p>

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Tickets should bring people{" "}
              <span className="text-[#7CA5FF]">together.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              TicketBase is a fan-to-fan ticket resale platform built to help
              people find tickets for events they want to attend and give other
              fans a way to pass on tickets they can no longer use.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080E1B]"
              >
                Explore events
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
              >
                How it works
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.09] pt-5 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7CA5FF]" />
                Fan-to-fan resale
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7CA5FF]" />
                1% buyer fee
              </span>
            </div>
            </div>

            <aside className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none" aria-label="TicketBase highlights">
              <div className="absolute -inset-4 rounded-[28px] bg-blue-500/[0.06] blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0B1220]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">The TicketBase approach</p>
                  <span className="h-2 w-2 rounded-full bg-[#78A1FF]" />
                </div>
                <div className="flex items-start gap-4 border-b border-white/[0.08] py-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09] text-[#A9C4FF]">
                    <span className="text-lg font-semibold">01</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Fan-to-fan resale</h3>
                    <p className="mt-1.5 text-sm leading-6 text-white/55">A place for fans to pass tickets on when plans change.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-b border-white/[0.08] py-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09] text-[#A9C4FF]">
                    <span className="text-lg font-semibold">02</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Clear pricing</h3>
                    <p className="mt-1.5 text-sm leading-6 text-white/55">See the applicable fee and total before confirming your order.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09] text-[#A9C4FF]">
                    <span className="text-lg font-semibold">03</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">1% buyer fee</h3>
                    <p className="mt-1.5 text-sm leading-6 text-white/55">A simple buyer service fee, shown as part of the order total.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              What matters to us
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A better way to pass tickets on.
            </h2>
            <p className="mt-4 leading-7 text-white/60">
              Simple principles should make buying and selling easier to
              understand from the start.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {principles.map((item) => (
              <article
                key={item.number}
                className="group rounded-2xl border border-blue-400/[0.14] bg-gradient-to-br from-[#0E192B] via-[#0B1220] to-[#080E1B] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09] text-[#7CA5FF] transition group-hover:bg-blue-500/[0.15]">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium tracking-[0.16em] text-white/30">
                    {item.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-white/70">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="rounded-[24px] border border-white/[0.09] bg-[#080E1B] p-6 sm:p-9 lg:p-10">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                How it works
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Three steps to your next event.
              </h2>
              <p className="mt-4 leading-7 text-white/60">
                Know what to expect as you browse, place an order and receive
                your ticket.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
              {steps.map((step, index) => (
                <div key={step.number} className="group/step relative rounded-xl p-2 transition duration-200 hover:bg-blue-500/[0.04] sm:p-3">
                  {index > 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute -left-3 top-5 hidden h-px w-3 bg-blue-400/25 transition-colors group-hover/step:bg-blue-400/60 sm:block"
                    />
                  )}
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-blue-400/25 bg-blue-500/[0.10] px-3 text-sm font-semibold text-[#A9C4FF] shadow-[0_0_0_3px_rgba(59,130,246,0.03)] transition duration-200 group-hover/step:border-blue-300/50 group-hover/step:bg-blue-500/[0.16]">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/[0.09] pt-6">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#A9C4FF] transition hover:text-white"
              >
                Read the full guide
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>


      </div>
    </main>
  );
}
