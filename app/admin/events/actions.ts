"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type EventFields = {
  title: string;
  category: string;
  venue: string;
  city: string;
  date: Date;
  time: string | null;
  description: string;
  image: string | null;
  status: string;
  featured: boolean;
  homepageOrder: number;
};

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getEventFields(formData: FormData): EventFields | null {
  const title = readText(formData, "title");
  const category = readText(formData, "category");
  const venue = readText(formData, "venue");
  const city = readText(formData, "city");
  const dateValue = readText(formData, "date");
  const time = readText(formData, "time");
  const description = readText(formData, "description");
  const image = readText(formData, "image");
  const status = readText(formData, "status");
  const featured = formData.get("featured") === "on";
  const homepageOrderValue = readText(formData, "homepageOrder");
  const homepageOrder = homepageOrderValue === "" ? 0 : Number(homepageOrderValue);

  if (!Number.isSafeInteger(homepageOrder) || homepageOrder < 0 || homepageOrder > 9999) {
    return null;
  }

  if (
    !title ||
    title.length > 200 ||
    !category ||
    category.length > 80 ||
    !venue ||
    venue.length > 200 ||
    !city ||
    city.length > 100 ||
    !description ||
    description.length > 10000 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    return null;
  }

  const date = new Date(`${dateValue}T12:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    return null;
  }

  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  if (image && image.length > 1000) {
    return null;
  }

  if (
    image &&
    !image.startsWith("/") &&
    !/^https?:\/\//i.test(image)
  ) {
    return null;
  }

  if (status !== "active" && status !== "hidden") {
    return null;
  }

  return {
    title,
    category,
    venue,
    city,
    date,
    time: time || null,
    description,
    image: image || null,
    status,
    featured,
    homepageOrder,
  };
}

function makeSlug(title: string): string {
  const base =
    title
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "event";

  return `${base}-${randomBytes(4).toString("hex")}`;
}

function refreshEventPages() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const fields = getEventFields(formData);

  if (!fields) {
    redirect("/admin/events?error=invalid");
  }

  await prisma.event.create({
    data: {
      ...fields,
      slug: makeSlug(fields.title),
    },
  });

  refreshEventPages();
  redirect("/admin/events?created=1");
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();

  const idValue = readText(formData, "id");
  const id = Number(idValue);
  const fields = getEventFields(formData);

  if (!Number.isSafeInteger(id) || id <= 0 || !fields) {
    redirect("/admin/events?error=invalid");
  }

  await prisma.event.update({
    where: { id },
    data: fields,
  });

  refreshEventPages();
  redirect("/admin/events?updated=1");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();

  const id = Number(readText(formData, "id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/admin/events?error=invalid");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: { ticketListings: true },
      },
    },
  });

  if (!event) {
    redirect("/admin/events?error=not-found");
  }

  if (event._count.ticketListings > 0) {
    redirect("/admin/events?error=has-listings");
  }

  await prisma.event.delete({
    where: { id },
  });

  refreshEventPages();
  redirect("/admin/events?deleted=1");
}