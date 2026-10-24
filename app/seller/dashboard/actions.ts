"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentSeller } from "@/lib/current-seller";
import { prisma } from "@/lib/prisma";

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function readOptionalText(
  formData: FormData,
  name: string,
  maxLength: number,
): string | null | undefined {
  const value = readText(formData, name);

  if (value.length > maxLength) return undefined;

  return value || null;
}

function readPriceInCents(value: string): number | null {
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return null;

  const cents = Math.round(Number(value) * 100);

  return Number.isSafeInteger(cents) && cents > 0
    ? cents
    : null;
}

export async function createSellerListing(formData: FormData) {
  const seller = await getCurrentSeller();

  if (!seller) {
    redirect("/seller/login");
  }

  if (!seller.verified) {
    redirect("/seller/dashboard?error=verification");
  }

  const eventId = readPositiveInt(readText(formData, "eventId"));
  const quantity = readPositiveInt(readText(formData, "quantity"));
  const minQuantity = quantity;
  const pricePerTicketCents = readPriceInCents(
    readText(formData, "price"),
  );

  const ticketType = readOptionalText(formData, "ticketType", 100);
  const section = readOptionalText(formData, "section", 100);
  const row = readOptionalText(formData, "row", 100);
  const seats = readOptionalText(formData, "seats", 200);
  const sourcePlatform = readOptionalText(
    formData,
    "sourcePlatform",
    100,
  );
  const transferMethod = readOptionalText(
    formData,
    "transferMethod",
    150,
  );
  const description = readOptionalText(
    formData,
    "description",
    5000,
  );

  if (
    !eventId ||
    !quantity ||
    quantity > 10000 ||
    !minQuantity ||
    minQuantity > quantity ||
    !pricePerTicketCents ||
    ticketType === undefined ||
    section === undefined ||
    row === undefined ||
    seats === undefined ||
    sourcePlatform === undefined ||
    transferMethod === undefined ||
    description === undefined
  ) {
    redirect("/seller/dashboard?error=invalid");
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      status: "active",
      date: { gte: new Date() },
    },
    select: { id: true, slug: true },
  });

  if (!event) {
    redirect("/seller/dashboard?error=event");
  }

  await prisma.ticketListing.create({
    data: {
      eventId: event.id,
      sellerId: seller.id,
      quantity,
      quantityAvailable: quantity,
      minQuantity,
      pricePerTicketCents,
      currency: "EUR",
      ticketType,
      section,
      row,
      seats,
      sourcePlatform,
      transferMethod,
      description,
      status: "active",
    },
  });

  revalidatePath("/seller/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/");

  redirect("/seller/dashboard?created=1");
}
export async function unpublishSellerListing(formData: FormData) {
  const seller = await getCurrentSeller();

  if (!seller) {
    redirect("/seller/login");
  }

  if (!seller.verified) {
    redirect("/seller/dashboard?error=verification");
  }

  const listingId = readPositiveInt(readText(formData, "listingId"));

  if (!listingId) {
    redirect("/seller/dashboard?error=invalid");
  }

  const listing = await prisma.ticketListing.findFirst({
    where: {
      id: listingId,
      sellerId: seller.id,
    },
    select: {
      id: true,
      status: true,
      event: { select: { slug: true } },
    },
  });

  if (!listing) {
    redirect("/seller/dashboard?error=listing-not-found");
  }

  if (listing.status !== "active") {
    redirect("/seller/dashboard?error=listing-inactive");
  }

  await prisma.ticketListing.updateMany({
    where: {
      id: listing.id,
      sellerId: seller.id,
      status: "active",
    },
    data: { status: "hidden" },
  });

  revalidatePath("/seller/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${listing.event.slug}`);
  revalidatePath("/");

  redirect("/seller/dashboard?unpublished=1");
}

export async function updateSellerListing(formData: FormData) {
  const seller = await getCurrentSeller();

  if (!seller) {
    redirect("/seller/login");
  }

  if (!seller.verified) {
    redirect("/seller/dashboard?error=verification");
  }

  const listingId = readPositiveInt(readText(formData, "listingId"));
  const pricePerTicketCents = readPriceInCents(readText(formData, "price"));

  const ticketType = readOptionalText(formData, "ticketType", 100);
  const section = readOptionalText(formData, "section", 100);
  const row = readOptionalText(formData, "row", 100);
  const seats = readOptionalText(formData, "seats", 200);
  const sourcePlatform = readOptionalText(formData, "sourcePlatform", 100);
  const transferMethod = readOptionalText(formData, "transferMethod", 150);
  const description = readOptionalText(formData, "description", 5000);

  if (
    !listingId ||
    !pricePerTicketCents ||
    ticketType === undefined ||
    section === undefined ||
    row === undefined ||
    seats === undefined ||
    sourcePlatform === undefined ||
    transferMethod === undefined ||
    description === undefined
  ) {
    redirect("/seller/dashboard?error=invalid");
  }

  const listing = await prisma.ticketListing.findFirst({
    where: {
      id: listingId,
      sellerId: seller.id,
    },
    select: {
      id: true,
      status: true,
      event: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!listing) {
    redirect("/seller/dashboard?error=listing-not-found");
  }

  if (!["active", "hidden"].includes(listing.status)) {
    redirect("/seller/dashboard?error=listing-inactive");
  }

  await prisma.ticketListing.updateMany({
    where: {
      id: listing.id,
      sellerId: seller.id,
      status: listing.status,
    },
    data: {
      pricePerTicketCents,
      ticketType,
      section,
      row,
      seats,
      sourcePlatform,
      transferMethod,
      description,
    },
  });

  revalidatePath("/seller/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${listing.event.slug}`);
  revalidatePath("/");
  revalidatePath(`/seller/listings/${listing.id}/edit`);

  redirect(`/seller/listings/${listing.id}/edit?saved=1`);
}