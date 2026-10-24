import MobileMenu from "@/components/MobileMenu";

const buyingSteps = [
  {
    number: "01",
    title: "Find your tickets",
    description:
      "Browse events and find the tickets you are looking for. Use search and filters to find the right event quickly.",
  },
  {
    number: "02",
    title: "Choose your tickets",
    description:
      "Check the ticket details, quantity, price and seller information before placing your order.",
  },
  {
    number: "03",
    title: "Pay securely",
    description:
      "Complete your purchase through TicketBase. Buyers pay just a 1% service fee on top of the ticket price.",
  },
  {
    number: "04",
    title: "Receive your tickets",
    description:
      "The seller transfers your tickets to the account or email address provided during the purchase.",
  },
  {
    number: "05",
    title: "Enjoy your event",
    description:
      "Once your tickets are received, you're ready to go. Enjoy the event.",
  },
];

const sellingSteps = [
  {
    number: "01",
    title: "Create your listing",
    description:
      "Find your event and add the details of the tickets you want to sell.",
  },
  {
    number: "02",
    title: "Set your price",
    description:
      "Choose the price you want to receive for your tickets and publish your listing.",
  },
  {
    number: "03",
    title: "Wait for a buyer",
    description:
      "Your listing becomes available to buyers browsing TicketBase for the event.",
  },
  {
    number: "04",
    title: "Transfer the tickets",
    description:
      "Once your tickets are sold, follow the instructions to transfer them to the buyer.",
  },
  {
    number: "05",
    title: "Get paid",
    description:
      "After the transaction is completed, your payment is released according to the TicketBase transaction process.",
  },
];

const faqs = [
  {
    question: "How much does TicketBase charge buyers?",
    answer:
      "TicketBase charges a 1% service fee on the ticket price. For example, a €100 ticket has a €1 service fee, so the buyer pays €101 in total.",
  },
  {
    question: "Can I sell tickets on TicketBase?",
    answer:
      "Yes. Verified sellers can create listings for tickets they want to sell and provide the relevant ticket details.",
  },
  {
    question: "How are tickets transferred?",
    answer:
      "The seller transfers the tickets using the ticketing platform or transfer method associated with the tickets.",
  },
  {
    question: "Can I see the ticket details before buying?",
    answer:
      "Yes. Each listing can include relevant ticket information such as quantity, section, row, seats and other available details.",
  },
];

function StepCards({
  steps,
}: {
  steps: { number: string; title: string; description: string }[];
}) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => (
        <article
          key={step.number}
          className="group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0D172B] to-[#080F1E] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3978F6]/45 hover:shadow-[0_18px_45px_rgba(57,120,246,0.12)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-[0.16em] text-[#8FB0FF]">
              {step.number}
            </span>
          </div>
          <div className="mt-8 h-px w-10 bg-gradient-to-r from-[#3978F6] to-transparent transition-all duration-300 group-hover:w-16" />
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {step.description}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#11141E]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:h-[76px] sm:px-8">
          <a href="/" className="group inline-flex items-center gap-2.5">
            <span className="text-[21px] font-semibold tracking-[-0.055em]">
              TicketBase
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/55 md:flex">
            <a href="/events" className="transition hover:text-white">
              Events
            </a>
            <a
              href="/how-it-works"
              aria-current="page"
              className="text-white transition hover:text-white"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#selling"
              className="hidden rounded-full px-4 py-3 text-sm font-medium text-white/70 transition hover:text-white sm:inline-flex"
            >
              Sell tickets
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_20px_rgba(57,120,246,0.2)] transition hover:bg-[#5B8EFF] sm:px-5"
            >
              <span className="hidden sm:inline">Browse events</span>
              <span className="sm:hidden">Events</span>
              <span aria-hidden="true">→</span>
            </a>
            <MobileMenu />
          </div>
        </div>


      </header>
      {/* Hero */}
      <section className="relative isolate border-b border-white/[0.08]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-270px] h-[560px] w-[850px] -translate-x-1/2 rounded-full bg-[#1D4ED8]/20 blur-[120px]" />
          <div className="absolute left-[8%] top-[35%] h-40 w-40 rounded-full bg-[#3978F6]/[0.07] blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-5 pb-14 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-28 md:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#7FA6FF]/20 bg-[#3978F6]/[0.08] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A9C4FF]">
            <span className="size-1.5 rounded-full bg-[#7FA6FF] shadow-[0_0_12px_rgba(127,166,255,0.9)]" />
            How it works
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl">
            Buy &amp; sell tickets.
            <span className="mt-2 block bg-gradient-to-r from-white via-white to-[#8CAEFF] bg-clip-text text-transparent">
              Simple.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
            TicketBase makes buying and selling tickets straightforward. Find
            an event, choose your tickets, and complete the transaction in just
            a few simple steps.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/events"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3978F6] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(57,120,246,0.25)] transition hover:-translate-y-0.5 hover:bg-[#5B8EFF]"
            >
              Explore events <span aria-hidden="true">→</span>
            </a>
            <a
              href="#selling"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
            >
              How to sell
            </a>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-2xl grid-cols-3 sm:mt-14 divide-x divide-white/10 border-t border-white/[0.08] pt-6 text-left">
            <div className="min-w-0 px-3 first:pl-0 sm:px-6 sm:first:pl-0">
              <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">1%</p>
              <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">Buyer service fee</p>
            </div>
            <div className="min-w-0 px-3 sm:px-6">
              <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">5 steps</p>
              <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">To buy or sell</p>
            </div>
            <div className="min-w-0 px-3 sm:pl-6 sm:pr-0">
              <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Simple</p>
              <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">From start to finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee banner */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-14">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0D172B] via-[#0A1222] to-[#080F1E] px-6 py-9 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:px-10 md:py-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 -z-10 size-72 rounded-full bg-[#3978F6]/15 blur-[90px]"
          />
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
                Clear pricing
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                Just <span className="text-[#8FB0FF]">1%.</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                We keep the buyer service fee simple. Pay only 1% on top of the
                ticket price.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#050B17]/70 p-6 shadow-inner shadow-black/20 md:min-w-[290px]">
              <div className="flex items-center justify-between text-sm text-white/45">
                <span>Example checkout</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  Transparent fee
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-sm text-white/55">Ticket price</span>
                <span className="text-xl font-semibold tabular-nums">€100.00</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-sm text-white/55">Service fee (1%)</span>
                <span className="text-sm font-medium tabular-nums text-white/80">€1.00</span>
              </div>
              <div className="my-5 border-t border-dashed border-white/15" />
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-white/75">Total</span>
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-white">€101.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buying */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
              For buyers
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
              Buying tickets
            </h2>
            <p className="mt-4 text-base leading-8 text-white/50 sm:text-lg">
              Find the event you want, choose your tickets and complete your
              purchase without unnecessary complexity.
            </p>
          </div>
          <span className="hidden rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-white/45 md:inline-flex">
            01 — 05 / BUY
          </span>
        </div>
        <StepCards steps={buyingSteps} />

        {/* Buyer Protection */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#3978F6]/25 bg-gradient-to-br from-[#0D1B35] via-[#0A1428] to-[#080F1E] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.18)] sm:p-8 md:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#3978F6]/10 blur-[70px]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#7FA6FF]/20 bg-[#3978F6]/10 text-[#A9C4FF]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
                Shop with confidence
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Buyer Protection
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
                Your payment stays with TicketBase until the seller successfully transfers your tickets to you.
              </p>
              <p className="mt-5 inline-flex rounded-full border border-[#7FA6FF]/20 bg-[#3978F6]/10 px-4 py-2 text-sm font-semibold text-[#A9C4FF]">
                No ticket transfer, no payout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border-t border-white/[0.08]" />
      </div>

      {/* Selling */}
      <section id="selling" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
              For sellers
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
              Selling tickets
            </h2>
            <p className="mt-4 text-base leading-8 text-white/50 sm:text-lg">
              List your tickets, set your price and manage your sale through
              TicketBase.
            </p>
          </div>
          <span className="hidden rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-white/45 md:inline-flex">
            01 — 05 / SELL
          </span>
        </div>
        <StepCards steps={sellingSteps} />
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden border-y border-white/[0.08] bg-[#060C19]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(57,120,246,0.16),transparent_62%)]"
        />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
            Your next event starts here
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
            Ready to find your next event?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
            Explore upcoming events or list tickets you no longer need.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/events"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#3978F6] px-7 py-4 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(57,120,246,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5B8EFF]"
            >
              Browse events <span aria-hidden="true">→</span>
            </a>
            <a
              href="#selling"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-semibold text-white transition hover:border-[#3978F6]/60 hover:bg-white/[0.07]"
            >
              Sell tickets
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB0FF]">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
            Common questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            The essentials, clearly explained.
          </p>
        </div>

        <div className="mt-10 divide-y divide-white/[0.09] border-y border-white/[0.09]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-base font-medium text-white/85 transition-colors hover:text-[#A9C4FF] sm:text-lg [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl font-light text-white/50 transition-all group-open:rotate-45 group-open:border-[#3978F6]/40 group-open:text-[#A9C4FF] group-hover:border-white/20">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-white/55">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
    </main>
  );
}
