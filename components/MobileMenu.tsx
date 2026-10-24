"use client";

import { useState } from "react";

type MobileMenuProps = {
  activePage?: "events" | "how-it-works" | "other";
  isBuyerAuthenticated?: boolean;
};

export default function MobileMenu({
  activePage = "how-it-works",
  isBuyerAuthenticated = false,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (page: "events" | "how-it-works") =>
    `block rounded-xl px-4 py-3 text-sm transition ${
      activePage === page
        ? "bg-white/[0.05] font-medium text-white hover:bg-white/[0.08]"
        : "text-white/75 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/[0.08]"
      >
        <span className="sr-only">
          {isOpen ? "Close menu" : "Open menu"}
        </span>
        <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true">
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
              isOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
              isOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#030712] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        >
          <a
            href="/events"
            aria-current={activePage === "events" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
            className={linkClass("events")}
          >
            Events
          </a>
          <a
            href="/how-it-works"
            aria-current={activePage === "how-it-works" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
            className={linkClass("how-it-works")}
          >
            How it works
          </a>
                    {isBuyerAuthenticated ? (
            <a
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
            >
              My account
            </a>
          ) : (
            <>
              <a
                href="/seller/login"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white"
              >
                Sign in
              </a>
              <a
                href="/seller/register"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl bg-[#3978F6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
              >
                Create account
              </a>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
