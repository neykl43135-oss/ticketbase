"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SellerRegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
setLoading(true);

    try {
      const response = await fetch("/api/seller/register", {
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
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setPassword("");
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] px-5 py-12 text-white">
      <section className="w-full max-w-md">
        <Link
          href="/"
          className="inline-block text-2xl font-semibold tracking-[-0.06em]"
        >
          TicketBase
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78A1FF]">
            Seller account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Register to get started with selling tickets on TicketBase.
          </p>

          {success ? (
            <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="font-medium text-emerald-300">
                Account created successfully.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                You can now sign in with your email and password.
              </p>
              <Link
                href="/seller/login"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF]"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Display name
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
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
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
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
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
                <p className="mt-2 text-xs leading-5 text-white/45">
                  Use at least 10 characters.
                </p>
              </div>
{error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#3978F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B8EFF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-white/55">
              Already have an account?{" "}
              <Link
                href="/seller/login"
                className="font-medium text-[#A9C4FF] transition hover:text-white"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          By registering, you agree to use TicketBase in accordance with its terms.
        </p>
      </section>
    </main>
  );
}
