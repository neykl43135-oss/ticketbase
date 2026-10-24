"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type BuyTicketsButtonProps = {
  listingId: number;
  isAuthenticated: boolean;
};

export default function BuyTicketsButton({
  listingId,
  isAuthenticated,
}: BuyTicketsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const checkoutUrl = `/checkout/${listingId}`;
  const loginUrl = `/account/login?returnTo=${encodeURIComponent(checkoutUrl)}`;
  const registerUrl = `/account/register?returnTo=${encodeURIComponent(checkoutUrl)}`;

  if (isAuthenticated) {
    return (
      <Link
        href={checkoutUrl}
        className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(57,120,246,0.30)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5B8EFF] hover:shadow-[0_8px_28px_rgba(57,120,246,0.36)] active:translate-y-0 sm:min-h-12"
      >
        Buy tickets
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(57,120,246,0.30)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5B8EFF] hover:shadow-[0_8px_28px_rgba(57,120,246,0.36)] active:translate-y-0 sm:min-h-12"
      >
        Buy tickets
      </button>

      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/65 px-4 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="buy-tickets-auth-title"
            className="relative my-auto w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#0B1425] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-8"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/10 text-xl leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <div className="flex size-12 items-center justify-center rounded-2xl border border-[#3978F6]/30 bg-[#3978F6]/10 text-[#8DB0FF]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  d="M5 8.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M8 8.5V6a4 4 0 0 1 8 0v2.5M12 12v3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2
              id="buy-tickets-auth-title"
              className="mt-5 text-2xl font-semibold tracking-tight text-white"
            >
              Sign in to continue
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Create an account or sign in to securely continue with your ticket purchase.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href={loginUrl}
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5B8EFF]"
              >
                Log in
              </Link>

              <Link
                href={registerUrl}
                className="flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.08]"
              >
                Create account
              </Link>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-white/40">
              Your selected ticket will be waiting when you continue.
            </p>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}