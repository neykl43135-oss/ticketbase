"use client";

import { useCheckoutQuantity } from "@/components/CheckoutQuantityContext";

type CheckoutPricingProps = {
  pricePerTicketCents: number;
  feePerTicketCents: number;
  mode: "quantity" | "summary";
  maxQuantity?: number;
  minQuantity?: number;
};

export default function CheckoutPricing({
  pricePerTicketCents,
  feePerTicketCents,
  mode,
  maxQuantity = 1,
  minQuantity = 1,
}: CheckoutPricingProps) {
  const { quantity } = useCheckoutQuantity();

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);

  const subtotalCents = pricePerTicketCents * quantity;
  const orderFeeCents = Math.round(subtotalCents * 0.01);
  const orderTotal = subtotalCents + orderFeeCents;

  if (mode === "quantity") {
    return (
      <div>
        <label className="text-sm font-medium">
          Number of tickets *
        </label>

        <QuantityControls
          min={minQuantity}
          max={maxQuantity}
        />

        <p className="mt-2 text-xs text-white/55">
          {maxQuantity} {maxQuantity === 1 ? "ticket" : "tickets"} currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-white/55">Price per ticket</span>
          <span className="font-medium tabular-nums text-white/90">
            {formatPrice(pricePerTicketCents)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-white/55">Subtotal</span>
          <span className="font-medium tabular-nums text-white/90">
            {formatPrice(subtotalCents)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-white/55">Buyer fee (1%)</span>
          <span className="font-medium tabular-nums text-white/90">
            {formatPrice(orderFeeCents)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-white/55">Quantity</span>
          <span className="font-medium tabular-nums text-white/90">
            {quantity}
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="rounded-2xl border border-[#3978F6]/30 bg-gradient-to-br from-[#14284A] via-[#0F1D35] to-[#0B1425] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-white/75">Total to pay</p>
            <span className="rounded-full border border-[#6D98FF]/25 bg-[#3978F6]/15 px-2.5 py-1 text-[11px] font-semibold text-[#B8CEFF]">
              Includes 1% fee
            </span>
          </div>

          <p
            aria-live="polite"
            className="mt-4 text-[2.5rem] font-bold leading-none tracking-[-0.04em] text-white tabular-nums sm:text-5xl"
          >
            {formatPrice(orderTotal)}
          </p>

          <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 size-4 shrink-0 text-[#8FB1FF]"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8h.01" />
            </svg>
            <p className="text-xs leading-5 text-white/55">
              Final amount shown before you create your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuantityControls({
  min,
  max,
}: {
  min: number;
  max: number;
}) {
  const { quantity, setQuantity } = useCheckoutQuantity();
  const safeMin = Math.max(1, Math.min(min, max));
  const safeMax = Math.max(safeMin, max);

  return (
    <div className="mt-2 flex h-14 items-center rounded-xl border border-white/10 bg-gradient-to-r from-[#0D172B] via-[#101B30] to-[#0D172B] p-1 shadow-inner shadow-black/10 transition-colors focus-within:border-[#3978F6]/50">
      <button
        type="button"
        aria-label="Decrease ticket quantity"
        disabled={quantity <= safeMin}
        onClick={() => setQuantity(Math.max(safeMin, quantity - 1))}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-xl font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:text-white/20 disabled:hover:bg-transparent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M5 12h14" />
        </svg>
      </button>

      <output
        aria-live="polite"
        className="flex min-w-0 flex-1 flex-col items-center justify-center text-center"
      >
        <span className="text-sm font-semibold tabular-nums text-white">
          {quantity} {quantity === 1 ? "ticket" : "tickets"}
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
          Quantity
        </span>
      </output>

      <input type="hidden" name="quantity" value={quantity} />

      <button
        type="button"
        aria-label="Increase ticket quantity"
        disabled={quantity >= safeMax}
        onClick={() => setQuantity(Math.min(safeMax, quantity + 1))}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-xl font-medium text-white/80 transition hover:bg-[#3978F6]/15 hover:text-[#A9C4FF] active:scale-95 disabled:cursor-not-allowed disabled:text-white/20 disabled:hover:bg-transparent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}