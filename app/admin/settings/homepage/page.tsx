import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveHomepageSettings } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function HomepageSettingsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [settings, params] = await Promise.all([
    prisma.homepageSettings.findUnique({ where: { id: 1 } }),
    searchParams,
  ]);

  const value = settings?.historicalDeals ?? 3236;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TicketBase <span className="ml-3 text-sm font-normal text-neutral-400">Admin</span>
          </Link>
          <Link href="/admin" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:border-black">
            Back to admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Homepage Settings</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Manage the Historical deals counter shown on the homepage.
        </p>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          {params.saved === "1" && (
            <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Settings saved successfully.
            </p>
          )}
          {params.error === "invalid-value" && (
            <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              Enter a whole number between 0 and 2,147,483,647.
            </p>
          )}

          <p className="text-sm text-neutral-500">Current value</p>
          <p className="mb-6 mt-1 text-3xl font-semibold">{value.toLocaleString("en-IE")}</p>

          <form action={saveHomepageSettings} className="space-y-5">
            <label htmlFor="historicalDeals" className="block text-sm font-medium">
              Historical deals
            </label>
            <input
              id="historicalDeals"
              name="historicalDeals"
              type="number"
              min="0"
              max="2147483647"
              step="1"
              required
              defaultValue={value}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-lg font-semibold outline-none focus:border-black"
            />
            <p className="text-sm text-neutral-500">
              Enter the new value and save your changes.
            </p>
            <button type="submit" className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700">
              Save changes
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}