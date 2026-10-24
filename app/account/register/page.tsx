"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyerRegisterPage() {
  const router = useRouter();
  const [returnTo, setReturnTo] = useState("/account");

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("returnTo");

    if (
      candidate &&
      candidate.startsWith("/") &&
      !candidate.startsWith("//") &&
      !candidate.includes("\\")
    ) {
      setReturnTo(candidate);
    }
  }, []);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
setLoading(true);

    try {
      const response = await fetch("/api/buyer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not create your account.");
        return;
      }

      router.push(returnTo);
      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] px-5 py-12 text-white">
      <section className="w-full max-w-md">
        <Link href="/" className="inline-block text-2xl font-semibold tracking-[-0.06em]">
          TicketBase
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78A1FF]">
            Buyer account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Keep your ticket orders together in one place.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-white/80">
                Your name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#3978F6]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#3978F6]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#3978F6]"
                placeholder="At least 10 characters"
              />
            </div>
{error && (
              <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href={returnTo === "/account" ? "/account/login" : `/account/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-medium text-[#78A1FF] hover:text-white">
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-white/40">
            Want to sell tickets?{" "}
            <Link href="/seller/register" className="hover:text-white">Create a seller account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
