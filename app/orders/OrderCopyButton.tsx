"use client";

import { useEffect, useState } from "react";

type OrderCopyButtonProps = {
  value: string;
  label?: string;
};

export default function OrderCopyButton({
  value,
  label = "Copy order number",
}: OrderCopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status === "idle") return;

    const timeout = window.setTimeout(() => {
      setStatus("idle");
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [status]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#111B2E] px-3.5 py-2 text-sm font-medium text-white transition hover:border-[#3978F6] hover:bg-[#172642] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080F1F]"
    >
      {status === "copied" ? (
        <>
          <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : status === "error" ? (
        "Copy failed — copy manually"
      ) : (
        <>
          <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="7" y="7" width="9" height="10" rx="1.5" />
            <path d="M13 7V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5v8A1.5 1.5 0 0 0 4.5 14H7" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}