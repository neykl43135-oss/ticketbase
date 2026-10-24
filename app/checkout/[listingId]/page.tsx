import Link from "next/link";
import { siPaypal, siRevolut } from "simple-icons";
import { notFound, redirect } from "next/navigation";
import { getBuyerSession } from "@/lib/buyer-auth";

import { createOrder } from "../actions";
import { prisma } from "@/lib/prisma";
import { expirePendingOrders } from "@/lib/order-expiry";
import CheckoutPricing from "@/components/CheckoutPricing";
import CheckoutSubmitButton from "@/components/CheckoutSubmitButton";
import { CheckoutQuantityProvider } from "@/components/CheckoutQuantityContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{
    listingId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#0D172B] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 focus:border-[#3978F6] focus:ring-2 focus:ring-[#3978F6]/25 focus:bg-[#101B30]";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const [{ listingId: rawId }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!(await getBuyerSession())) {
    redirect(`/account/login?returnTo=${encodeURIComponent(`/checkout/${rawId}`)}`);
  }

  if (!/^\d+$/.test(rawId)) {
    notFound();
  }

  const listingId = Number(rawId);

  if (!Number.isSafeInteger(listingId) || listingId <= 0) {
    notFound();
  }

  await expirePendingOrders();

  const [listing, settings] = await Promise.all([
    prisma.ticketListing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        event: true,
        seller: true,
      },
    }),
    prisma.paymentSettings.findUnique({
      where: {
        id: 1,
      },
    }),
  ]);

  if (
    !listing ||
    listing.status !== "active" ||
    listing.event.status !== "active" ||
    listing.seller.status !== "active" ||
    listing.quantityAvailable < 1
  ) {
    notFound();
  }

  const availableMethods = [
    {
      value: "PAYPAL",
      label: "PayPal",
      enabled: settings?.paypalEnabled ?? false,
      instructions: settings?.paypalInstructions ?? "",
      description: "Pay using the PayPal details provided after ordering.",
    },
    {
      value: "REVOLUT",
      label: "Revolut",
      enabled: settings?.revolutEnabled ?? false,
      instructions: settings?.revolutInstructions ?? "",
      description: "Use the Revolut payment details provided after ordering.",
    },
    {
      value: "BANK_TRANSFER",
      label: "Bank Transfer",
      enabled: settings?.bankTransferEnabled ?? false,
      instructions: settings?.bankTransferInstructions ?? "",
      description: "Pay using the bank details provided after ordering.",
    },
  ].filter(
    (method) => method.enabled && method.instructions.trim().length > 0,
  );

  const formattedDate = new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(listing.event.date);

  const feePerTicket = Math.round(
    listing.pricePerTicketCents * 0.01,
  );

  const errorMessages: Record<string, string> = {
    invalid: "Please check the ticket quantity and try again.",
    email: "Please enter a valid email address.",
    "payment-method": "That payment method is currently unavailable.",
    "payment-settings":
      "Payment methods have not been configured yet. Please try again later.",
    "order-limit":
      "You already have 2 active orders. Complete or cancel an existing order before placing another.",
    unavailable:
      "These tickets are no longer available in the requested quantity.",
    failed: "We could not create your order. Please try again.",
  };

  const errorMessage = query.error
    ? errorMessages[query.error]
    : undefined;

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#080F1E]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
          </Link>

          <Link
            href={`/events/${listing.event.slug}`}
            className="text-sm text-white/55 transition hover:text-[#78A1FF]"
          >
            Back to event
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8FB1FF]">
              TicketBase checkout
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Complete your order
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Enter your ticket delivery email, choose a payment method, and review your total.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0B1425] px-3 py-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#3978F6]/20 text-xs font-semibold text-[#A9C4FF]">
              1
            </span>
            <span className="text-xs font-medium text-white/70">
              Order details
            </span>
          </div>
        </div>

        <div className="mb-8 h-px bg-gradient-to-r from-[#3978F6]/35 via-white/10 to-transparent" />

        {errorMessage && (
          <div
            role="alert"
            className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <CheckoutQuantityProvider initialQuantity={Math.max(1, listing.quantityAvailable)}>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Checkout form */}
          <section className="order-2 rounded-2xl border border-white/10 bg-[#080F1E] p-6 md:p-8 lg:order-1">
            <h2 className="text-xl font-semibold">
              Your details
            </h2>

            <form action={createOrder} className="mt-6 space-y-7">
              <input
                type="hidden"
                name="listingId"
                value={listing.id}
              />

              <div>
                <label
                  htmlFor="buyerEmail"
                  className="text-sm font-medium"
                >
                  Email for ticket delivery (Ticketmaster) *
                </label>

                <div className="relative mt-2">
                  <input
                    id="buyerEmail"
                    name="buyerEmail"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className={`${inputClass} !mt-0`}
                    placeholder="you@example.com"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>

                <p className="mt-2 text-xs leading-5 text-white/55">
                  Enter the email address linked to your Ticketmaster account
                  so the seller can transfer your tickets. It can be different
                  from your TicketBase account email.
                </p>
              </div>

              <div>
                <CheckoutPricing
                  mode="quantity"
                  minQuantity={listing.quantityAvailable}
                  maxQuantity={listing.quantityAvailable}
                  pricePerTicketCents={listing.pricePerTicketCents}
                  feePerTicketCents={feePerTicket}
                />
              </div>
<div>
                <h2 className="text-xl font-semibold">
                  Payment method
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Choose how you would like to pay. Instructions will be
                  displayed after your order is created.
                </p>
              </div>

              {availableMethods.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
                  <p className="font-medium">
                    Checkout is temporarily unavailable
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    There are no payment methods configured for checkout.
                    Please try again later.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMethods.map((method, index) => {


                    return (
                      <label
                        key={method.value}
                        className="group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0D172B] to-[#0A1120] p-4 transition duration-200 hover:border-white/20 hover:from-[#111D33] hover:to-[#0D172B] has-[:checked]:border-[#4B83FF]/80 has-[:checked]:from-[#142748] has-[:checked]:to-[#101C32] has-[:checked]:shadow-[0_0_0_1px_rgba(75,131,255,0.15),0_8px_24px_rgba(0,0,0,0.12)] sm:gap-4 sm:p-5"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          defaultChecked={index === 0}
                          required
                          className="mt-0.5 size-4 shrink-0 accent-[#3978F6]"
                        />

                        <span
                          className={`flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                            method.value === "PAYPAL"
                              ? "border-[#2790E8]/25 bg-white"
                              : method.value === "REVOLUT"
                                ? "border-white/10 bg-[#111827]"
                                : "border-white/10 bg-white/5"
                          }`}
                        >
                          {method.value === "PAYPAL" ? (
                            <svg
                              aria-label="PayPal"
                              role="img"
                              viewBox="0 0 24 24"
                              className="size-7 text-[#003087]"
                              fill="currentColor"
                            >
                              <path d={siPaypal.path} />
                            </svg>
                          ) : method.value === "REVOLUT" ? (
                            <svg
                              aria-label="Revolut"
                              role="img"
                              viewBox="0 0 24 24"
                              className="size-6 text-white"
                              fill="currentColor"
                            >
                              <path d={siRevolut.path} />
                            </svg>
                          ) : (
                            <svg
                              aria-label="Bank transfer"
                              role="img"
                              viewBox="0 0 24 24"
                              className="size-6 text-white/75"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 9h18L12 4 3 9Z" />
                              <path d="M5 10v7m4-7v7m6-7v7m4-7v7M3 20h18M4 17h16" />
                            </svg>
                          )}
                        </span>

                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                            {method.label}
                            {method.value === "PAYPAL" && (
                              <span className="rounded-full border border-[#3978F6]/30 bg-[#3978F6]/15 px-2 py-0.5 text-[10px] font-semibold text-[#A9C4FF]">
                                Recommended
                              </span>
                            )}

                          </span>
                          <span className="mt-1 block text-sm leading-6 text-white/55">
                            {method.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {availableMethods.length > 0 && (
                <CheckoutSubmitButton />
              )}

              <p className="text-xs leading-5 text-white/40">
                Creating an order reserves the selected tickets. Payment is
                not automatic; follow the instructions shown on your order
                page and wait for payment confirmation.
              </p>
            </form>
          </section>

          {/* Order summary */}
          <aside className="order-1 self-start rounded-2xl border border-white/[0.09] bg-gradient-to-b from-[#0B1425] to-[#080F1E] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.16)] sm:p-6 md:p-7 lg:sticky lg:top-6 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Order summary
            </p>

            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-white sm:mt-3 sm:text-[1.7rem]">
              {listing.event.title}
            </h2>

            <p className="mt-1.5 text-sm text-white/55 sm:mt-2">
              {listing.event.venue}, {listing.event.city}
            </p>

            <p className="mt-1 text-sm text-white/55">
              {formattedDate}
              {listing.event.time ? ` В· ${listing.event.time}` : ""}
            </p>

            <div className="mt-4 rounded-xl bg-[#0D172B] p-3.5 sm:mt-7 sm:p-4">
              <p className="text-sm font-medium">
                {listing.ticketType || "Ticket"}
              </p>

              <p className="mt-1 text-sm text-white/55">
                Seller: {listing.seller.displayName}
              </p>

              {listing.section && (
                <p className="mt-1.5 text-sm text-white/55 sm:mt-2">
                  Section: {listing.section}
                </p>
              )}

              {listing.row && (
                <p className="mt-1 text-sm text-white/55">
                  Row: {listing.row}
                </p>
              )}

              {listing.seats && (
                <p className="mt-1 text-sm text-white/55">
                  Seats: {listing.seats}
                </p>
              )}
            </div>

            <CheckoutPricing
              mode="summary"
              pricePerTicketCents={listing.pricePerTicketCents}
              feePerTicketCents={feePerTicket}
            />

            <section
              aria-labelledby="purchase-protection-title"
              className="mt-5 rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] to-[#0D172B] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 id="purchase-protection-title" className="text-sm font-semibold text-white">
                    Your purchase is protected
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    TicketBase helps manage your order from payment through ticket transfer.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-white/[0.08] pt-4">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-300" aria-hidden="true">✓</span>
                  <p className="text-xs leading-5 text-white/75">
                    <span className="font-medium text-white">Payment through TicketBase</span>
                    <span className="text-white/55"> — follow the payment instructions shown on your order page.</span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-300" aria-hidden="true">✓</span>
                  <p className="text-xs leading-5 text-white/75">
                    <span className="font-medium text-white">Ticket transfer comes first</span>
                    <span className="text-white/55"> — the seller receives payment after the transfer is completed under TicketBase's process.</span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-300" aria-hidden="true">✓</span>
                  <p className="text-xs leading-5 text-white/75">
                    <span className="font-medium text-white">Help if something goes wrong</span>
                    <span className="text-white/55"> — if the ticket isn't transferred, you can use TicketBase's refund process.</span>
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
          </CheckoutQuantityProvider>
      </div>
    </main>
  );
}
