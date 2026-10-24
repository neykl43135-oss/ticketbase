"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyerLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/buyer/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Could not sign out. Please try again.");
        return;
      }

      router.replace("/account/login");
      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-60"
      >
        {loading ? "Signing out..." : "Sign out"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
