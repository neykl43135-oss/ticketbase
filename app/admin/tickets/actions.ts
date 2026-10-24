"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

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
  // Price is entered in euros, for example 65.00.
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const cents = Math.round(Number(value) * 100);

  return Number.isSafeInteger(cents) && cents > 0
    ? cents
    : null;
}

type ListingFields = {
  eventId: number;
  sellerId: number;
  quantity: number;
  quantityAvailable: number;
  minQuantity: number;
  pricePerTicketCents: number;
  currency: string;
  ticketType: string | null;
  section: string | null;
  row: string | null;
  seats: string | null;
  sourcePlatform: string | null;
  transferMethod: string | null;
  description: string | null;
  status: string;
};

function getListingFields(
  formData: FormData,
  editing = false,
): ListingFields | null {
  const eventId = readPositiveInt(readText(formData, "eventId"));
  const sellerId = readPositiveInt(readText(formData, "sellerId"));
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

  const status = readText(formData, "status") || "active";

  if (
    !eventId ||
    !sellerId ||
    !quantity ||
    !minQuantity ||
    !pricePerTicketCents ||
    quantity > 10000 ||
    minQuantity > quantity ||
    ticketType === undefined ||
    section === undefined ||
    row === undefined ||
    seats === undefined ||
    sourcePlatform === undefined ||
    transferMethod === undefined ||
    description === undefined ||
    (status !== "active" && status !== "hidden")
  ) {
    return null;
  }

  const availableValue = readText(formData, "quantityAvailable");
  const quantityAvailable = editing
    ? readPositiveInt(availableValue) ?? (availableValue === "0" ? 0 : -1)
    : quantity;

  if (
    quantityAvailable < 0 ||
    quantityAvailable > quantity
  ) {
    return null;
  }

  return {
    eventId,
    sellerId,
    quantity,
    quantityAvailable,
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
    status:
      quantityAvailable === 0 && status === "active"
        ? "sold"
        : status,
  };
}

async function validateEventAndSeller(
  eventId: number,
  sellerId: number,
) {
  const [event, seller] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, status: true },
    }),
    prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true, verified: true, status: true },
    }),
  ]);

  if (!event || event.status !== "active") return null;

  if (!seller || !seller.verified || seller.status !== "active") {
    return null;
  }

  return { event, seller };
}

function refreshListingPages(slugs: string[] = []) {
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");

  for (const slug of new Set(slugs)) {
    revalidatePath(`/events/${slug}`);
  }
}

export async function createTicketListing(formData: FormData) {
  await requireAdmin();

  const fields = getListingFields(formData);

  if (!fields) {
    redirect("/admin/tickets?error=invalid");
  }

  const validated = await validateEventAndSeller(
    fields.eventId,
    fields.sellerId,
  );

  if (!validated) {
    redirect("/admin/tickets?error=event-or-seller");
  }

  await prisma.ticketListing.create({
    data: fields,
  });

  refreshListingPages([validated.event.slug]);
  redirect("/admin/tickets?created=1");
}

export async function updateTicketListing(formData: FormData) {
  await requireAdmin();

  const id = readPositiveInt(readText(formData, "id"));
  const fields = getListingFields(formData, true);

  if (!id || !fields) {
    redirect("/admin/tickets?error=invalid");
  }

  const existing = await prisma.ticketListing.findUnique({
    where: { id },
    include: {
      event: { select: { slug: true } },
    },
  });

  if (!existing) {
    redirect("/admin/tickets?error=not-found");
  }

  const validated = await validateEventAndSeller(
    fields.eventId,
    fields.sellerId,
  );

  if (!validated) {
    redirect("/admin/tickets?error=event-or-seller");
  }

  await prisma.ticketListing.update({
    where: { id },
    data: fields,
  });

  refreshListingPages([
    existing.event.slug,
    validated.event.slug,
  ]);

  redirect("/admin/tickets?updated=1");
}

export async function deleteTicketListing(formData: FormData) {
  await requireAdmin();

  const id = readPositiveInt(readText(formData, "id"));

  if (!id) {
    redirect("/admin/tickets?error=invalid");
  }

  const existing = await prisma.ticketListing.findUnique({
    where: { id },
    include: {
      event: { select: { slug: true } },
    },
  });

  if (!existing) {
    redirect("/admin/tickets?error=not-found");
  }

  await prisma.ticketListing.delete({
    where: { id },
  });

  refreshListingPages([existing.event.slug]);
  redirect("/admin/tickets?deleted=1");
}