import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createTicketListing,
  updateTicketListing,
} from "./actions";
import DeleteTicketButton from "./delete-button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TicketsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black";

const labelClass = "block text-sm font-medium text-neutral-700";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default async function AdminTicketsPage({
  searchParams,
}: TicketsPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [events, sellers, listings, params] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "asc" },
    }),
    prisma.seller.findMany({
      orderBy: { displayName: "asc" },
    }),
    prisma.ticketListing.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            verified: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    searchParams,
  ]);

  const availableEvents = events.filter(
    (event) => event.status === "active",
  );

  const availableSellers = sellers.filter(
    (seller) => seller.verified && seller.status === "active",
  );

  const activeListings = listings.filter(
    (listing) => listing.status === "active",
  ).length;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/events"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100"
            >
              Events
            </Link>

            <Link
              href="/admin/sellers"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100"
            >
              Sellers
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
          Marketplace management
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Ticket listings
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-neutral-500">
          Create offers for your events. Each listing can contain multiple
          tickets, a price, seating details and a transfer method.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">All listings</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {listings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Active listings</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {activeListings}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Available events</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {availableEvents.length}
            </p>
          </div>
        </div>

        {params.created === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Ticket listing created successfully.
          </div>
        )}

        {params.updated === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Ticket listing updated successfully.
          </div>
        )}

        {params.deleted === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Ticket listing deleted successfully.
          </div>
        )}

        {params.error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {params.error === "invalid" &&
              "Some fields are invalid. Check the form and try again."}

            {params.error === "event-or-seller" &&
              "Choose an active event and a verified, active seller."}

            {params.error === "not-found" &&
              "This ticket listing could not be found."}
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div>
            <p className="text-sm text-neutral-400">New offer</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Create ticket listing
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Only active events and verified, active sellers can be selected.
            </p>
          </div>

          {availableEvents.length === 0 ||
          availableSellers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              {availableEvents.length === 0 && (
                <p className="text-sm">
                  You need at least one active event.{" "}
                  <Link
                    href="/admin/events"
                    className="font-medium underline underline-offset-4"
                  >
                    Manage events
                  </Link>
                </p>
              )}

              {availableSellers.length === 0 && (
                <p className="mt-2 text-sm">
                  You need a verified, active seller.{" "}
                  <Link
                    href="/admin/sellers"
                    className="font-medium underline underline-offset-4"
                  >
                    Manage sellers
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <form action={createTicketListing} className="mt-7 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className={labelClass}>
                  Event *
                  <select
                    name="eventId"
                    className={inputClass}
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose an event
                    </option>

                    {availableEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} — {event.city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Verified seller *
                  <select
                    name="sellerId"
                    className={inputClass}
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose a seller
                    </option>

                    {availableSellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.displayName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Price per ticket (€) *
                  <input
                    name="price"
                    type="number"
                    className={inputClass}
                    min="0.01"
                    max="9999999.99"
                    step="0.01"
                    placeholder="65.00"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Number of tickets *
                  <input
                    name="quantity"
                    type="number"
                    className={inputClass}
                    min="1"
                    max="10000"
                    step="1"
                    defaultValue="1"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Minimum order
                  <input
                    name="minQuantity"
                    type="number"
                    className={inputClass}
                    min="1"
                    max="10000"
                    defaultValue="1"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Ticket type
                  <select
                    name="ticketType"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Not specified</option>
                    <option value="Standing">Standing</option>
                    <option value="Seated">Seated</option>
                    <option value="VIP">VIP</option>
                    <option value="General admission">
                      General admission
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Section / block
                  <input
                    name="section"
                    className={inputClass}
                    maxLength={100}
                    placeholder="e.g. Block B"
                  />
                </label>

                <label className={labelClass}>
                  Row
                  <input
                    name="row"
                    className={inputClass}
                    maxLength={100}
                    placeholder="e.g. Row 12"
                  />
                </label>

                <label className={labelClass}>
                  Seat numbers
                  <input
                    name="seats"
                    className={inputClass}
                    maxLength={200}
                    placeholder="e.g. 21, 22"
                  />
                </label>

                <label className={labelClass}>
                  Original ticket platform
                  <select
                    name="sourcePlatform"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Not specified</option>
                    <option value="Ticketmaster">Ticketmaster</option>
                    <option value="Eventbrite">Eventbrite</option>
                    <option value="AXS">AXS</option>
                    <option value="See Tickets">See Tickets</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Transfer method
                  <select
                    name="transferMethod"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Not specified</option>
                    <option value="Official ticket transfer">
                      Official ticket transfer
                    </option>
                    <option value="Mobile ticket transfer">
                      Mobile ticket transfer
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Listing status
                  <select
                    name="status"
                    className={inputClass}
                    defaultValue="active"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </label>
              </div>

              <label className={labelClass}>
                Additional details
                <textarea
                  name="description"
                  className={inputClass}
                  rows={4}
                  maxLength={5000}
                  placeholder="Additional information about these tickets..."
                />
              </label>

              <div className="flex justify-end border-t border-neutral-100 pt-5">
                <button
                  type="submit"
                  className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Create listing
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              All ticket listings
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Review and edit the details of existing offers.
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No ticket listings yet
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Create your first offer using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center md:px-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                          {listing.status}
                        </span>

                        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">
                          Listing #{listing.id}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold">
                        {listing.event.title}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        Seller: {listing.seller.displayName}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                        <span>
                          {formatPrice(listing.pricePerTicketCents)} / ticket
                        </span>

                        <span>
                          {listing.quantityAvailable} of {listing.quantity} available
                        </span>

                        {listing.section && (
                          <span>{listing.section}</span>
                        )}

                        {listing.row && <span>{listing.row}</span>}
                      </div>
                    </div>

                    <DeleteTicketButton
                      id={listing.id}
                      title={listing.event.title}
                    />
                  </div>

                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium hover:bg-neutral-50 md:px-7">
                      <span>Edit listing details</span>

                      <span className="text-neutral-400 transition-transform group-open:rotate-180">
                        ↓
                      </span>
                    </summary>

                    <div className="border-t border-neutral-100 p-5 md:p-7">
                      <form action={updateTicketListing} className="space-y-6">
                        <input
                          type="hidden"
                          name="id"
                          value={listing.id}
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                          <label className={labelClass}>
                            Event *
                            <select
                              name="eventId"
                              className={inputClass}
                              defaultValue={String(listing.eventId)}
                              required
                            >
                              {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                  {event.title} — {event.city}
                                  {event.status !== "active"
                                    ? " (hidden)"
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={labelClass}>
                            Seller *
                            <select
                              name="sellerId"
                              className={inputClass}
                              defaultValue={String(listing.sellerId)}
                              required
                            >
                              {sellers.map((seller) => (
                                <option key={seller.id} value={seller.id}>
                                  {seller.displayName}
                                  {!seller.verified ? " (not verified)" : ""}
                                  {seller.status !== "active" ? " (blocked)" : ""}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={labelClass}>
                            Price per ticket (€) *
                            <input
                              name="price"
                              type="number"
                              className={inputClass}
                              min="0.01"
                              max="9999999.99"
                              step="0.01"
                              defaultValue={(
                                listing.pricePerTicketCents / 100
                              ).toFixed(2)}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Total quantity *
                            <input
                              name="quantity"
                              type="number"
                              className={inputClass}
                              min="1"
                              max="10000"
                              defaultValue={listing.quantity}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Available quantity *
                            <input
                              name="quantityAvailable"
                              type="number"
                              className={inputClass}
                              min="0"
                              max={listing.quantity}
                              defaultValue={listing.quantityAvailable}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Minimum order *
                            <input
                              name="minQuantity"
                              type="number"
                              className={inputClass}
                              min="1"
                              max="10000"
                              defaultValue={listing.minQuantity}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Ticket type
                            <input
                              name="ticketType"
                              className={inputClass}
                              maxLength={100}
                              defaultValue={listing.ticketType ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Section / block
                            <input
                              name="section"
                              className={inputClass}
                              maxLength={100}
                              defaultValue={listing.section ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Row
                            <input
                              name="row"
                              className={inputClass}
                              maxLength={100}
                              defaultValue={listing.row ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Seat numbers
                            <input
                              name="seats"
                              className={inputClass}
                              maxLength={200}
                              defaultValue={listing.seats ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Original ticket platform
                            <input
                              name="sourcePlatform"
                              className={inputClass}
                              maxLength={100}
                              defaultValue={listing.sourcePlatform ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Transfer method
                            <input
                              name="transferMethod"
                              className={inputClass}
                              maxLength={150}
                              defaultValue={listing.transferMethod ?? ""}
                            />
                          </label>

                          <label className={labelClass}>
                            Listing status
                            <select
                              name="status"
                              className={inputClass}
                              defaultValue={
                                listing.status === "active"
                                  ? "active"
                                  : "hidden"
                              }
                            >
                              <option value="active">Active</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </label>
                        </div>

                        <label className={labelClass}>
                          Additional details
                          <textarea
                            name="description"
                            className={inputClass}
                            rows={4}
                            maxLength={5000}
                            defaultValue={listing.description ?? ""}
                          />
                        </label>

                        <div className="flex justify-end border-t border-neutral-100 pt-5">
                          <button
                            type="submit"
                            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}