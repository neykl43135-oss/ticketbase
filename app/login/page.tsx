import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#030712] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#3978F6]/15 blur-[130px]" />
        <div className="absolute -left-48 top-[45%] h-[400px] w-[400px] rounded-full bg-[#3978F6]/[0.07] blur-[110px]" />
        <div className="absolute -right-48 top-[50%] h-[400px] w-[400px] rounded-full bg-emerald-400/[0.06] blur-[110px]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-[-0.06em]">
          TicketBase
        </Link>
        <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:border-white/25 hover:text-white">
          Back to home
        </Link>
      </header>

      <section className="mx-auto my-auto w-full max-w-5xl py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#78A1FF]/20 bg-[#3978F6]/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A9C4FF] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#78A1FF]" />
            Welcome back to TicketBase
          </div>

          <h1 className="mt-7 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl md:text-6xl">
            Good to have you
            <span className="mt-2 block bg-gradient-to-r from-[#78A1FF] via-[#A8C4FF] to-white bg-clip-text text-transparent">
              back.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
            Choose the account type you want to sign in to.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          <article className="group relative flex flex-col overflow-hidden rounded-[28px] border border-[#78A1FF]/20 bg-[#0B1222]/90 p-7 shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:border-[#78A1FF]/45 sm:p-9">
            <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#3978F6]/15 blur-[65px]" />

            <div className="relative flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#78A1FF]/20 bg-[#3978F6]/10 text-xl text-[#A9C4FF]">
                B
              </span>
              <span className="rounded-full border border-[#78A1FF]/20 bg-[#3978F6]/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A9C4FF]">
                For buyers
              </span>
            </div>

            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Ready for your next event?
            </h2>
            <p className="relative mt-3 text-sm leading-6 text-white/55">
              Sign in to keep track of your ticket orders and manage your purchases in one place.
            </p>

            <Link href="/account/login" className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]">
              Buyer sign in
              <span className="ml-2">-&gt;</span>
            </Link>

            <p className="relative mt-5 text-center text-sm text-white/50">
              New to TicketBase?{" "}
              <Link href="/account/register" className="font-medium text-[#A9C4FF] hover:text-white">
                Create buyer account
              </Link>
            </p>
          </article>

          <article className="group relative flex flex-col overflow-hidden rounded-[28px] border border-emerald-300/15 bg-[#091615]/90 p-7 shadow-2xl shadow-emerald-950/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/35 sm:p-9">
            <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/[0.08] blur-[65px]" />

            <div className="relative flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-xl text-emerald-200">
                S
              </span>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                For sellers
              </span>
            </div>

            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Manage your listings.
            </h2>
            <p className="relative mt-3 text-sm leading-6 text-white/55">
              Sign in to manage your ticket listings, offers and seller account.
            </p>

            <Link href="/seller/login" className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-200/[0.14]">
              Seller sign in
              <span className="ml-2">-&gt;</span>
            </Link>

            <p className="relative mt-5 text-center text-sm text-white/50">
              New to selling?{" "}
              <Link href="/seller/register" className="font-medium text-emerald-200 hover:text-white">
                Create seller account
              </Link>
            </p>
          </article>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-white/35">
          One marketplace, separate accounts for buyers and sellers.
        </p>
      </section>
    </main>
  );
}