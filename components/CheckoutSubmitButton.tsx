"use client";

import { useFormStatus } from "react-dom";

export default function CheckoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-[#3978F6] to-[#548BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080F1E] active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          Creating order...
        </span>
      ) : (
        "Create order"
      )}
    </button>
  );
}
