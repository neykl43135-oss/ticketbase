import { redirect } from "next/navigation";

import {
  createSeller,
  setSellerTransferTime,
  setSellerStatus,
  setSellerVerification,
} from "./actions";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SellersPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    error?: string;
    filter?: string;
    q?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";

export default async function AdminSellersPage({
  searchParams,
}: SellersPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [sellers, params] = await Promise.all([
    prisma.seller.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    searchParams,
  ]);

  const searchQuery = (params.q ?? "").trim().slice(0, 120);
  const verifiedCount = sellers.filter(
    (seller) => seller.verified && seller.status === "active",
  ).length;

  const blockedCount = sellers.filter(
    (seller) => seller.status === "blocked",
  ).length;

  const activeFilter =
    ["pending", "verified", "blocked"].includes(params.filter ?? "")
      ? params.filter!
      : "all";

  const filteredSellers = sellers.filter((seller) => {
    let matchesFilter = true;

    if (activeFilter === "pending") {
      matchesFilter = !seller.verified && seller.status === "active";
    } else if (activeFilter === "verified") {
      matchesFilter = seller.verified && seller.status === "active";
    } else if (activeFilter === "blocked") {
      matchesFilter = seller.status === "blocked";
    }

    const query = searchQuery.toLocaleLowerCase();
    const matchesSearch =
      !query ||
      seller.displayName.toLocaleLowerCase().includes(query) ||
      (seller.email ?? "").toLocaleLowerCase().includes(query) ||
      String(seller.id) === query;

    return matchesFilter && matchesSearch;
  });
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </a>

          <nav className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Dashboard
            </a>

            <a
              href="/admin/events"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Events
            </a>

            <a
              href="/"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:border-black"
            >
              View website
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
            Marketplace management
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Sellers
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-neutral-500">
            Manage seller accounts, verify sellers and control who can
            participate in the TicketBase marketplace.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Total sellers</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {sellers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Verified & active</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {verifiedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Blocked</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {blockedCount}
            </p>
          </div>
        </div>

        {params.created === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Seller created successfully.
          </div>
        )}

        {params.updated === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Seller settings updated successfully.
          </div>
        )}

        {params.error === "invalid" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Check the submitted details and try again.
          </div>
        )}

        {params.error === "duplicate" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            The seller could not be created. Check whether that email
            address is already registered.
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Add seller
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            New sellers start as unverified. You can verify them after
            reviewing their details.
          </p>

          <form
            action={createSeller}
            className="mt-7 grid gap-5 md:grid-cols-2"
          >
            <label className="block text-sm font-medium">
              Display name *
              <input
                className={inputClass}
                name="displayName"
                required
                minLength={1}
                maxLength={120}
                placeholder="Seller name"
              />
            </label>

            <label className="block text-sm font-medium">
              Email address
              <input
                className={inputClass}
                name="email"
                type="email"
                maxLength={254}
                placeholder="seller@example.com"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Add seller
              </button>
            </div>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                { value: "all", label: "All sellers" },
                { value: "pending", label: "Pending verification" },
                { value: "verified", label: "Verified & active" },
                { value: "blocked", label: "Blocked" },
              ].map((item) => (
                <a
                  key={item.value}
                  href={item.value === "all" ? "/admin/sellers" : `/admin/sellers?filter=${item.value}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeFilter === item.value
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <form action="/admin/sellers" method="get" className="mb-5 flex flex-col gap-3 sm:flex-row">
              {activeFilter !== "all" && (
                <input type="hidden" name="filter" value={activeFilter} />
              )}
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by name, email or Seller ID..."
                aria-label="Search sellers by name, email or Seller ID"
                maxLength={120}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Search
              </button>
              {searchQuery && (
                <a
                  href={activeFilter === "all" ? "/admin/sellers" : `/admin/sellers?filter=${activeFilter}`}
                  className="rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm transition hover:border-black"
                >
                  Clear
                </a>
              )}
            </form>
            <h2 className="text-2xl font-semibold tracking-tight">
              All sellers
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Review verification and account status for each seller.
            </p>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">{sellers.length === 0 ? "No sellers yet" : "No sellers match your search or filter"}</h3>

              <p className="mt-2 text-sm text-neutral-500">
                Add your first seller using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSellers.map((seller) => (
                <article
                  key={seller.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-7"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {seller.displayName}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {seller.email || "No email provided"}
                      </p>

                      <p className="mt-2 text-xs text-neutral-400">
                        Seller ID: {seller.id}
                      </p>

                      <form
                        action={setSellerTransferTime}
                        className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <input type="hidden" name="id" value={seller.id} />
                        <label className="block text-xs font-medium text-neutral-600">
                          Typical transfer time (minutes)
                          <input
                            type="number"
                            name="typicalTransferMinutes"
                            min={1}
                            max={10080}
                            step={1}
                            defaultValue={seller.typicalTransferMinutes ?? ""}
                            placeholder="Not specified"
                            className={inputClass}
                          />
                        </label>
                        <p className="mt-1 text-xs text-neutral-500">
                          Leave empty to clear the value. Maximum: 7 days.
                        </p>
                        <button
                          type="submit"
                          className="mt-3 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                          Save transfer time
                        </button>
                      </form>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            seller.verified
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {seller.verified ? "Verified" : "Not verified"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            seller.status === "active"
                              ? "bg-neutral-100 text-neutral-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {seller.status === "active" ? "Active" : "Blocked"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <form action={setSellerVerification}>
                        <input
                          type="hidden"
                          name="id"
                          value={seller.id}
                        />

                        <input
                          type="hidden"
                          name="verified"
                          value={seller.verified ? "false" : "true"}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:border-black"
                        >
                          {seller.verified
                            ? "Remove verification"
                            : "Verify seller"}
                        </button>
                      </form>

                      <form action={setSellerStatus}>
                        <input
                          type="hidden"
                          name="id"
                          value={seller.id}
                        />

                        <input
                          type="hidden"
                          name="status"
                          value={
                            seller.status === "active"
                              ? "blocked"
                              : "active"
                          }
                        />

                        <button
                          type="submit"
                          className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                            seller.status === "active"
                              ? "border border-red-200 text-red-700 hover:bg-red-50"
                              : "bg-black text-white hover:bg-neutral-800"
                          }`}
                        >
                          {seller.status === "active"
                            ? "Block seller"
                            : "Unblock seller"}
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}