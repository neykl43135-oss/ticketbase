"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data: { success?: boolean; error?: string } =
        await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Incorrect password. Please try again.");
        return;
      }

      setPassword("");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 py-12 text-neutral-900">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="block text-center text-3xl font-bold tracking-tight"
        >
          TicketBase
        </a>

        <p className="mt-2 text-center text-sm text-neutral-500">
          Buy & sell tickets. Simple.
        </p>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Private area
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Admin sign in
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Sign in to manage events and TicketBase listings.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Admin password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={16}
                maxLength={1024}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-neutral-200"
                placeholder="Enter your admin password"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 16}
              className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
            Authorised administrators only.
          </p>
        </section>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-neutral-500 transition hover:text-black"
        >
          ← Back to TicketBase
        </a>
      </div>
    </main>
  );
}