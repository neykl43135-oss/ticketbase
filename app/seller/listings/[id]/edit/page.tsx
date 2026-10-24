import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentSeller } from "@/lib/current-seller";
import { prisma } from "@/lib/prisma";
import { updateSellerListing } from "@/app/seller/dashboard/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#080F20] px-4 py-3 text-sm text-white outline-none transition focus:border-[#78A1FF]";

const labelClass = "block text-sm font-medium text-white/75";

export default async function EditSellerListingPage({ params, searchParams }: PageProps) {
  const query = await searchParams;
  const seller = await getCurrentSeller();

  if (!seller) {
    redirect("/seller/login");
  }

  if (!seller.verified) {
    redirect("/seller/dashboard?error=verification");
  }

  const { id } = await params;
  const listingId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(listingId) || listingId < 1) {
    notFound();
  }

  const listing = await prisma.ticketListing.findFirst({
    where: {
      id: listingId,
      sellerId: seller.id,
    },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          date: true,
          venue: true,
          city: true,
        },
      },
    },
  });

  if (!listing || !["active", "hidden"].includes(listing.status)) {
    notFound();
  }

  const price = (listing.pricePerTicketCents / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-[#050914] text-white"><div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/seller/dashboard"
        className="text-sm font-medium text-[#78A1FF] hover:text-white"
      >
        ← Back to seller dashboard
      </Link>

      <header className="mt-6">
        <p className="text-sm text-white/50">Edit ticket listing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {listing.event.title}
        </h1>
        <p className="mt-3 text-sm text-white/55">
          {listing.event.venue}, {listing.event.city}
        </p>
        <p className="mt-1 text-sm text-white/55">
          Listing status: {listing.status}
        </p>
      </header>

            {query.saved === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          Changes saved successfully.
        </p>
      )}
<form
        action={updateSellerListing}
        className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
      >
        <input type="hidden" name="listingId" value={listing.id} />

        <div>
          <label htmlFor="price" className={labelClass}>
            Price per ticket (€)
          </label>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            pattern="[0-9]{1,7}([.][0-9]{1,2})?"
            required
            defaultValue={price}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ticketType" className={labelClass}>
            Ticket type
          </label>
          <input
            id="ticketType"
            name="ticketType"
            maxLength={100}
            defaultValue={listing.ticketType ?? ""}
            className={inputClass}
            placeholder="e.g. Seated, Standing, VIP"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="section" className={labelClass}>
              Section
            </label>
            <input
              id="section"
              name="section"
              maxLength={100}
              defaultValue={listing.section ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="row" className={labelClass}>
              Row
            </label>
            <input
              id="row"
              name="row"
              maxLength={100}
              defaultValue={listing.row ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="seats" className={labelClass}>
            Seat numbers
          </label>
          <input
            id="seats"
            name="seats"
            maxLength={200}
            defaultValue={listing.seats ?? ""}
            className={inputClass}
            placeholder="e.g. 12–13"
          />
        </div>

        <div>
          <label htmlFor="sourcePlatform" className={labelClass}>
            Ticket platform
          </label>
          <input
            id="sourcePlatform"
            name="sourcePlatform"
            maxLength={100}
            defaultValue={listing.sourcePlatform ?? ""}
            className={inputClass}
            placeholder="e.g. Ticketmaster"
          />
        </div>

        <div>
          <label htmlFor="transferMethod" className={labelClass}>
            Transfer method
          </label>
          <input
            id="transferMethod"
            name="transferMethod"
            maxLength={150}
            defaultValue={listing.transferMethod ?? ""}
            className={inputClass}
            placeholder="e.g. Official mobile transfer"
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={5000}
            defaultValue={listing.description ?? ""}
            className={inputClass}
            placeholder="Add details about your tickets"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <p className="text-sm font-medium text-white/80">
            Ticket quantity is unchanged
          </p>
          <p className="mt-1 text-sm text-white/55">
            {listing.quantityAvailable} available out of {listing.quantity} total.
            Quantity and order reservations cannot be edited here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#78A1FF] px-6 py-3 text-sm font-semibold text-[#081020] transition hover:bg-white"
          >
            Save changes
          </button>

          <Link
            href="/seller/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-white/30"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div></main>
  );
}