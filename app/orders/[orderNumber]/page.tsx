import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerSession } from "@/lib/buyer-auth";
import OrderAutoRefresh from "../OrderAutoRefresh";
import OrderCopyButton from "../OrderCopyButton";
import { cancelBuyerOrder, submitPayment } from "../actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ error?: string }>;
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Awaiting payment",
    payment_submitted: "We're checking your payment",
    payment_confirmed: "Payment confirmed",
    awaiting_ticket_transfer: "Awaiting ticket transfer",
    completed: "Order completed",
    cancelled: "Order cancelled",
    expired: "Order expired",
  };

  return labels[status] ?? "Order status updated";
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Bank Transfer",
    REVOLUT: "Revolut",
    PAYPAL: "PayPal",
  };

  return labels[method] ?? method;
}

function Step({
  number,
  title,
  children,
  last = false,
}: {
  number: number;
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <li className="flex flex-col items-stretch">
      <div className="flex gap-4 rounded-xl border border-white/10 bg-gradient-to-br from-[#101B35] to-[#0B1220] p-4 shadow-sm shadow-black/10 sm:p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3978F6] text-sm font-semibold text-white">
          {number}
        </span>
        <div className="min-w-0 pt-1">
          <h3 className="font-semibold text-white">{title}</h3>
          <div className="mt-1 text-sm leading-6 text-white/65">{children}</div>
        </div>
      </div>
      {!last && (
        <div aria-hidden="true" className="flex h-9 items-center pl-7 text-xl text-neutral-400">
          &#8595;
        </div>
      )}
    </li>
  );
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);

  if (!/^TB-[A-F0-9]{20}$/.test(orderNumber)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      ticketListing: {
        include: {
          event: true,
          seller: true,
        },
      },
    },
  });

  if (!order) notFound();

  const buyerSession = await getBuyerSession();

  // Orders linked to a buyer account are visible only to that buyer.
  if (order.buyerId !== null && buyerSession?.buyerId !== order.buyerId) {
    notFound();
  }

  const listing = order.ticketListing;
  const event = listing.event;
  const isCancelled = order.status === "cancelled" || order.status === "expired";
  const awaitingPayment = order.status === "pending_payment";
  const paymentSubmitted = order.status === "payment_submitted";
  const awaitingTransfer = order.status === "awaiting_ticket_transfer";
  const shouldAutoRefresh = awaitingPayment || paymentSubmitted || awaitingTransfer;
  const paymentDetails = order.paymentInstructions.trim();
  const hasTestInstructions = /\btest\b|placeholder|example\.com|example details/i.test(
    paymentDetails,
  );
  const paymentDetailsReady = Boolean(paymentDetails) && !hasTestInstructions;

  const formattedDate = formatDate(event.date);
  const errorMessage = query.error === "confirm"
    ? "Please confirm that you have sent the payment before continuing."
    : undefined;

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <OrderAutoRefresh enabled={shouldAutoRefresh} />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#030712]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group inline-flex items-center">
            <span className="text-[22px] font-semibold tracking-[-0.06em] text-white transition group-hover:text-[#78A1FF]">
              TicketBase
            </span>
          </Link>

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
                className="inline-flex items-center justify-center rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
              >
                My account
              </Link>
            ) : (
              <>
                <Link
                  href="/account/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:text-white sm:px-4"
                >
                  Sign in
                </Link>
                <Link
                  href="/account/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#3978F6] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-4"
                >
                  Create account
                </Link>
              </>
            )}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#3978F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] sm:px-5"
            >
              Browse events
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/events"
          className="text-sm font-medium text-white/50 transition hover:text-[#78A1FF]"
        >
          &larr; Back to events
        </Link>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#080F1F] p-6 shadow-xl shadow-black/20 sm:p-9">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white/50">TicketBase order</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {isCancelled
                  ? "Order closed"
                  : awaitingTransfer
                    ? "Payment confirmed Р В Р’В Р вЂ™Р’В Р В Р’В Р Р†Р вЂљР’В Р В Р’В Р вЂ™Р’В Р В Р вЂ Р В РІР‚С™Р РЋРІвЂћСћР В Р’В Р В РІР‚В Р В Р’В Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРЎв„ў awaiting ticket transfer"
                    : paymentSubmitted
                      ? "We're checking your payment"
                      : awaitingPayment
                        ? "Complete your payment"
                        : "Order details"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Keep your order number handy until the order is complete.
              </p>
            </div>

{!isCancelled && (
            <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-medium ${
              paymentSubmitted || awaitingTransfer
              ? "bg-blue-50 text-blue-800"
                : order.status === "payment_confirmed" || order.status === "completed"
                  ? "bg-emerald-50 text-emerald-800"
                  : isCancelled
                    ? "bg-neutral-100 text-white/65"
                    : "border border-[#3978F6]/25 bg-[#3978F6]/10 text-[#A9C4FF]"
            }`}>
              {getStatusLabel(order.status)}
            </span>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#0B1220] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Your order number
              </p>
              <p className="mt-1 break-all text-base font-semibold text-white">
                {order.orderNumber}
              </p>
            </div>
            <div className="mt-3 shrink-0 sm:mt-0">
              <OrderCopyButton value={order.orderNumber} />
            </div>
          </div>

          <div className="grid gap-8 py-7 sm:grid-cols-2">
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#78A1FF]">Your event</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{event.title}</h2>
              <p className="mt-2 text-sm text-white/65">{event.venue}, {event.city}</p>
              <p className="mt-1 text-sm text-white/65">
                {formattedDate}{event.time ? `, ${event.time}` : ""}
              </p>
              {(listing.section || listing.row || listing.seats) && (
                <p className="mt-3 text-sm text-white/75">
                  {listing.section ? `Section: ${listing.section}` : ""}
                  {listing.row ? `${listing.section ? " / " : ""}Row ${listing.row}` : ""}
                  {listing.seats ? `${listing.section || listing.row ? " / " : ""}Seats ${listing.seats}` : ""}
                </p>
              )}
              <p className="mt-3 text-sm text-white/65">Seller: {listing.seller.displayName}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#3978F6]/25 bg-gradient-to-br from-[#101B35] via-[#0B1220] to-[#080F1F] p-5 shadow-lg shadow-black/10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3978F6] via-[#78A1FF] to-transparent" />
              <h2 className="text-base font-semibold tracking-tight">Order summary</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/65">Tickets ({order.quantity})</span>
                  <span className="font-medium tabular-nums">{money(order.subtotalCents, order.currency)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/65">Buyer fee (1%)</span>
                  <span className="font-medium tabular-nums">{money(order.buyerFeeCents, order.currency)}</span>
                </div>
                <div className="mt-2 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A9C4FF]">Total to pay</span>
                    <span className="text-3xl font-semibold tracking-tight tabular-nums text-white">
                      {money(order.totalCents, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {paymentSubmitted && !isCancelled && (
            <div className="border-t border-white/10 pt-7">
              <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[#78A1FF]">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 8v4l2.5 1.5" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-blue-100">We're checking your payment</h2>
                    <p className="mt-2 text-sm leading-6 text-blue-100/80">
                      Thanks for letting us know. Your payment is being checked, and your order status will be updated here once it has been confirmed.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-blue-100/80">
                      Please keep your order number for reference and avoid sending the payment a second time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {awaitingTransfer && (
            <div className="border-t border-white/10 pt-7">
              <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-blue-100">Payment confirmed</h2>
                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Your payment has been confirmed. The seller is now expected to transfer your tickets. Please keep your order number for reference.
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  This page will update automatically when your order status changes.
                </p>
              </div>
            </div>
          )}
          {awaitingPayment && !isCancelled && (
            <div className="border-t border-white/10 pt-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Step-by-step guide</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">How to pay with {getPaymentMethodLabel(order.paymentMethod)}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Follow the steps below and double-check the recipient before sending money.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-white/10 bg-[#3978F6]/10 px-3 py-1.5 text-xs font-medium text-[#A9C4FF]">Secure checkout</span>
              </div>

              {!paymentDetailsReady ? (
                <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                  <p className="font-semibold">Payment details aren't ready yet</p>
                  <p className="mt-2">
                    Do not send money using these details. The payment recipient needs to be configured before you can continue.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#3978F6]/30 bg-gradient-to-br from-[#101B35] via-[#0B1220] to-[#080F1F] shadow-lg shadow-black/10">
  <div className="border-b border-white/10 px-5 py-5 sm:px-6">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#3978F6]/15 text-lg font-bold text-[#A9C4FF]">
          {order.paymentMethod === "PAYPAL" ? (
            "P"
          ) : order.paymentMethod === "REVOLUT" ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-label="Revolut" role="img">
              <path d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z" />
            </svg>
          ) : (
            "$"
          )}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Payment method</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{getPaymentMethodLabel(order.paymentMethod)}</h3>
        </div>
      </div>
      <span className="rounded-full border border-[#3978F6]/30 bg-[#3978F6]/10 px-3 py-1 text-xs font-medium text-[#A9C4FF]">Manual payment</span>
    </div>
    <p className="mt-4 text-sm leading-6 text-white/65">
      Follow the instructions below and verify the recipient carefully before sending your payment.
    </p>
  </div>

  <div className="p-5 sm:p-6">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Total amount to send</p>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
      <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{money(order.totalCents, order.currency)}</p>
      {order.paymentMethod !== "REVOLUT" && <OrderCopyButton value={paymentDetails} label="Copy payment details" />}
    </div>

    <div className="mt-5 rounded-xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{getPaymentMethodLabel(order.paymentMethod)} recipient and instructions</p>
      <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-white/85">{order.paymentMethod === "REVOLUT" ? paymentDetails.split(/\s+/).filter((part) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)).join(" ").trim() : paymentDetails}</div>
      {order.paymentMethod === "PAYPAL" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#080F1F] p-3">
          <div className="min-w-0">
            <p className="text-xs text-white/50">Recipient email</p>
            <p className="mt-1 break-all text-sm font-medium text-white">{paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) ?? "Check the payment instructions above"}</p>
          </div>
          {paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) && (
            <OrderCopyButton value={paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part))!} label="Copy email" />
          )}
        </div>
      )}
      {order.paymentMethod === "REVOLUT" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#080F1F] p-3">
          <div className="min-w-0">
            <p className="text-xs text-white/50">Revolut recipient email</p>
            <p className="mt-1 break-all text-sm font-medium text-white">{paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) ?? "Check the payment instructions above"}</p>
          </div>
          {paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) && (
            <OrderCopyButton value={paymentDetails.split(/\s+/).find((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part))!} label="Copy email" />
          )}
        </div>
      )}
      {order.paymentMethod === "PAYPAL" && (
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
          <a
            href="https://www.paypal.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
          >
            Open PayPal
          </a>
          <p className="flex-1 self-center text-xs leading-5 text-white/50">
            After sending your payment, return here to report it. Your order is not confirmed until it has been checked.
          </p>
        </div>
      )}
      {order.paymentMethod === "REVOLUT" && (
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
          <a
            href="https://www.revolut.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
          >
            Open Revolut
          </a>
          <p className="flex-1 self-center text-xs leading-5 text-white/50">
            After sending your payment, return here to report it. Your order is not confirmed until it has been checked.
          </p>
        </div>
      )}
    </div>

    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-400/5 p-4">
      <span className="mt-0.5 text-amber-200" aria-hidden="true">!</span>
      <p className="text-sm leading-6 text-white/70">
        Check the recipient and payment method before sending. The amount must match your order total. Keep your payment receipt until the order is complete.
      </p>
    </div>
  </div>
</div>
                  <ol className="mt-6">
                    {order.paymentMethod === "PAYPAL" ? (
                      <>
                        <Step number={1} title="Open PayPal">
                          Select <strong className="text-white">Open PayPal</strong> above and sign in to your PayPal account.
                        </Step>
                        <Step number={2} title="Verify the recipient">
                          Carefully compare the recipient email with the details shown on this page. If anything differs, stop and contact support before sending money.
                        </Step>
                        <Step number={3} title="Check the amount">
                          Send exactly <strong className="text-white">{money(order.totalCents, order.currency)}</strong>. Use a payment method permitted by PayPal for this purchase.
                        </Step>
                        <Step number={4} title="Add your order reference">
                          If PayPal provides a suitable reference field, enter your order number below. Otherwise, keep the number for your records.
                          <span className="mt-3 block break-all font-semibold text-white">{order.orderNumber}</span>
                          <span className="mt-3 inline-flex">
                            <OrderCopyButton value={order.orderNumber} label="Copy order number" />
                          </span>
                        </Step>
                        <Step number={5} title="Return to TicketBase" last>
                          Keep your PayPal receipt, return to this page, and select <strong className="text-white">I've sent the payment</strong>. Your payment will be reviewed before the order is confirmed.
                        </Step>
                      </>
                    ) : order.paymentMethod === "REVOLUT" ? (
                      <>
                        <Step number={1} title="Open Revolut">
                          Open the Revolut app and go to <strong className="text-white">Payments</strong>.
                        </Step>
                        <Step number={2} title="Search for the recipient">
                          Tap the <strong className="text-white">+</strong> button or start a new payment, choose the Revolut contact option, then search using the email above. The exact labels can vary by app version.
                        </Step>
                        <Step number={3} title="Check the recipient">
                          Select the matching result and carefully check the recipient details. If the email or details don't match, stop and contact support before sending.
                        </Step>
                        <Step number={4} title="Enter the exact amount">
                          Send <strong className="text-white">{money(order.totalCents, order.currency)}</strong>. This includes the ticket price and the 1% buyer fee.
                        </Step>
                        <Step number={5} title="Send and keep your receipt" last>
                          If Revolut offers a payment note or message, add order number <strong className="break-all text-white">{order.orderNumber}</strong>. Confirm the transfer and keep the receipt.
                        </Step>
                      </>
                    ) : (
                      <>
                        <Step number={1} title={`Open ${getPaymentMethodLabel(order.paymentMethod)}`}>
                          Use the payment details shown above and check the recipient carefully.
                        </Step>
                        <Step number={2} title="Send the exact amount">
                          Send <strong className="text-white">{money(order.totalCents, order.currency)}</strong>, including the 1% buyer fee.
                        </Step>
                        <Step number={3} title="Add your order number if possible">
                          If the payment method has a note or reference field, enter <strong className="break-all text-white">{order.orderNumber}</strong>.
                          <span className="mt-3 inline-flex">
                            <OrderCopyButton value={order.orderNumber} label="Copy order number" />
                          </span>
                        </Step>
                        <Step number={4} title="Keep your receipt" last>
                          Save the payment confirmation in case you need it later.
                        </Step>
                      </>
                    )}</ol>

                  {errorMessage && (
                    <p role="alert" className="mt-5 rounded-lg border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-100">
                      {errorMessage}
                    </p>
                  )}

                  <form action={submitPayment} className="mt-7 rounded-2xl border border-white/10 bg-[#0B1220] p-5 sm:p-6">
                    <input type="hidden" name="orderNumber" value={order.orderNumber} />
                    <label className="flex items-start gap-3 text-sm leading-6 text-white/75">
                      <input
                        type="checkbox"
                        name="confirmPaymentSent"
                        value="yes"
                        required
                        className="mt-1 size-4 shrink-0 accent-[#3978F6]"
                      />
                      <span>I confirm that I've sent the payment using the details above.</span>
                    </label>
                    <button
                      type="submit"
                      className="mt-5 flex w-full items-center justify-center rounded-lg bg-[#3978F6] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
                    >
                      I've sent the payment
                    </button>
                    <p className="mt-3 text-center text-xs leading-5 text-white/50">
                      Only press this after you've completed the transfer in your payment app.
                    </p>
                  </form>
                </>
              )}
            </div>
          )}

          {awaitingPayment && !isCancelled && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <form action={cancelBuyerOrder}>
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  Cancel order
                </button>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  Cancel this reservation and return to checkout. You can only cancel before reporting payment.
                </p>
              </form>
            </div>
          )}
          {!awaitingPayment && !paymentSubmitted && !awaitingTransfer && !isCancelled && (
            <div className="mt-2 border-t border-white/10 pt-7">
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                <h2 className="font-semibold text-emerald-100">{getStatusLabel(order.status)}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                  Your order status is shown here. Keep your order number until your order is complete.
                </p>
              </div>
            </div>
          )}

          {isCancelled && (
            <p className="border-t border-neutral-200 pt-6 text-sm leading-6 text-white/65">
              This order is no longer active. Return to the events page to browse available tickets.
            </p>
          )}

          <div className="mt-8">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
            >
              Browse events
            </Link>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-white/50">
          Never share your payment app password or one-time security codes.
        </p>
      </div>
    </main>
  );
}
