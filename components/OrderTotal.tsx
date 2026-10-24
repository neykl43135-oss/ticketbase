"use client";

import { useState } from "react";

type OrderTotalProps = {
  pricePerTicketCents: number;
  feePerTicketCents: number;
  currency?: string;
};

export default function OrderTotal({
  pricePerTicketCents,
  feePerTicketCents,
  currency = "EUR",
}: OrderTotalProps) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
    }).format(cents / 100);

  const totalPerTicket = pricePerTicketCents + feePerTicketCents;
  const total = totalPerTicket * quantity;

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-white/55">Total per ticket</span>
        <span className="font-medium">{formatPrice(totalPerTicket)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-sm text-white/55">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-white/15 text-xl hover:bg-white/10 disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-6 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-9 items-center justify-center rounded-lg border border-white/15 text-xl hover:bg-white/10"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-sm font-medium">Order total</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-[#78A1FF]">
          {formatPrice(total)}
        </p>
      </div>
    </div>
  );
}
