"use client";

import { useCheckoutQuantity } from "@/components/CheckoutQuantityContext";

type TicketQuantityProps = {
  min: number;
  max: number;
};

export default function TicketQuantity({ min, max }: TicketQuantityProps) {
  const { quantity, setQuantity } = useCheckoutQuantity();
  const safeMin = Math.max(1, Math.min(min, max));
  const safeMax = Math.max(safeMin, max);

  return (
    <div className="mt-2 flex h-12 items-center overflow-hidden rounded-lg border border-white/15 bg-[#0D172B]">
      <button
        type="button"
        aria-label="Decrease ticket quantity"
        disabled={quantity <= safeMin}
        onClick={() => setQuantity(Math.max(safeMin, quantity - 1))}
        className="flex h-full w-14 items-center justify-center text-2xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>

      <output
        aria-live="polite"
        className="flex-1 text-center text-base font-semibold text-white"
      >
        {quantity} {quantity === 1 ? "ticket" : "tickets"}
      </output>

      <input type="hidden" name="quantity" value={quantity} />

      <button
        type="button"
        aria-label="Increase ticket quantity"
        disabled={quantity >= safeMax}
        onClick={() => setQuantity(Math.min(safeMax, quantity + 1))}
        className="flex h-full w-14 items-center justify-center text-2xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
