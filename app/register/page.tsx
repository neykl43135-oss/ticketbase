import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#030712] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#3978F6]/15 blur-[130px]" />
        <div className="absolute -left-48 top-[45%] h-[400px] w-[400px] rounded-full bg-[#3978F6]/[0.07] blur-[110px]" />
        <div className="absolute -right-48 top-[50%] h-[400px] w-[400px] rounded-full bg-emerald-400/[0.06] blur-[110px]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="text-xl font-semibold tracking-[-0.06em]">TicketBase</span>
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:border-white/25 hover:text-white"
        >
          Back to home
        </Link>
      </header>

      <section className="mx-auto my-auto w-full max-w-5xl py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#78A1FF]/20 bg-[#3978F6]/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A9C4FF] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#78A1FF] shadow-[0_0_10px_#78A1FF]" />
            Your TicketBase journey starts here
          </div>

          <h1 className="mt-7 text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl md:text-6xl">
            Your next great night
            <span className="mt-2 block bg-gradient-to-r from-[#78A1FF] via-[#A8C4FF] to-white bg-clip-text text-transparent">
              starts here.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
            Whether you are finding your next unforgettable event or sharing tickets with others, there is a place for you.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          <article className="group relative flex flex-col overflow-hidden rounded-[28px] border border-[#78A1FF]/20 bg-[#0B1222]/90 p-7 shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:border-[#78A1FF]/45 sm:p-9">
            <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#3978F6]/15 blur-[65px] transition group-hover:bg-[#3978F6]/25" />

            <div className="relative flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#78A1FF]/15 bg-[#3978F6]/15 text-[#9AB9FF]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 10h18M7 15h4" />
                </svg>
              </span>
              <span className="rounded-full border border-[#78A1FF]/15 bg-[#3978F6]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9AB9FF]">
                For fans
              </span>
            </div>

            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Find your next experience.
            </h2>
            <p className="relative mt-3 min-h-[72px] text-sm leading-6 text-white/55">
              Discover live events, keep your orders together and make every ticket easier to manage.
            </p>

            <ul className="relative mt-5 space-y-3 text-sm text-white/75">
              <li className="flex items-center gap-3">
                <span className="text-[#8FB0FF]">✓</span>
                Keep track of your ticket orders
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#8FB0FF]">✓</span>
                Manage purchases in one place
              </li>
            </ul>

            <Link
              href="/account/register"
              className="relative mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#3978F6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-[#5489FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FB0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1222]"
            >
              Create buyer account
              <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
            </Link>

            <p className="relative mt-5 text-center text-sm text-white/45">
              Already a member?{" "}
              <Link href="/account/login" className="font-medium text-[#9AB9FF] transition hover:text-white">
                Sign in
              </Link>
            </p>
          </article>

          <article className="group relative flex flex-col overflow-hidden rounded-[28px] border border-emerald-300/15 bg-[#0B1518]/90 p-7 shadow-2xl shadow-emerald-950/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/35 sm:p-9">
            <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-[65px] transition group-hover:bg-emerald-400/20" />

            <div className="relative flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 10 9-7 9 7" />
                  <path d="M5.5 9v11h13V9M9 20v-6h6v6" />
                </svg>
              </span>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200">
                For sellers
              </span>
            </div>

            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Share the excitement.
            </h2>
            <p className="relative mt-3 min-h-[72px] text-sm leading-6 text-white/55">
              List your tickets, manage your offers and keep your sales organised from one account.
            </p>

            <ul className="relative mt-5 space-y-3 text-sm text-white/75">
              <li className="flex items-center gap-3">
                <span className="text-emerald-300">✓</span>
                Create and manage ticket listings
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-300">✓</span>
                Keep your offers in one place
              </li>
            </ul>

            <Link
              href="/seller/register"
              className="relative mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-200/40 hover:bg-emerald-200/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1518]"
            >
              Create seller account
              <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
            </Link>

            <p className="relative mt-5 text-center text-sm text-white/45">
              Already selling?{" "}
              <Link href="/seller/login" className="font-medium text-emerald-200 transition hover:text-white">
                Sign in
              </Link>
            </p>
          </article>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-white/35">
          By creating an account, you can get started with TicketBase in just a few steps.
        </p>
      </section>
    </main>
  );
}