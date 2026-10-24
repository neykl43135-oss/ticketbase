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

function getSellerId(formData: FormData): number | null {
  const value = formData.get("id");

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function refreshSellerPages() {
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/tickets");
}

export async function createSeller(formData: FormData) {
  await requireAdmin();

  const displayNameValue = formData.get("displayName");
  const emailValue = formData.get("email");

  const displayName =
    typeof displayNameValue === "string"
      ? displayNameValue.trim()
      : "";

  const email =
    typeof emailValue === "string"
      ? emailValue.trim().toLowerCase()
      : "";

  if (
    !displayName ||
    displayName.length > 120 ||
    email.length > 254 ||
    (email !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    redirect("/admin/sellers?error=invalid");
  }

  try {
    await prisma.seller.create({
      data: {
        displayName,
        email: email || null,
        verified: false,
        status: "active",
      },
    });
  } catch {
    redirect("/admin/sellers?error=duplicate");
  }

  refreshSellerPages();
  redirect("/admin/sellers?created=1");
}

export async function setSellerVerification(formData: FormData) {
  await requireAdmin();

  const id = getSellerId(formData);
  const verifiedValue = formData.get("verified");

  if (
    !id ||
    (verifiedValue !== "true" && verifiedValue !== "false")
  ) {
    redirect("/admin/sellers?error=invalid");
  }

  await prisma.seller.update({
    where: { id },
    data: { verified: verifiedValue === "true" },
  });

  refreshSellerPages();
  redirect("/admin/sellers?updated=1");
}

export async function setSellerTransferTime(formData: FormData) {
  await requireAdmin();

  const id = getSellerId(formData);
  const value = formData.get("typicalTransferMinutes");

  if (!id || typeof value !== "string") {
    redirect("/admin/sellers?error=invalid");
  }

  const trimmed = value.trim();
  let minutes: number | null = null;

  if (trimmed !== "") {
    if (!/^\d+$/.test(trimmed)) {
      redirect("/admin/sellers?error=invalid");
    }

    const parsed = Number(trimmed);

    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 10080) {
      redirect("/admin/sellers?error=invalid");
    }

    minutes = parsed;
  }

  await prisma.seller.update({
    where: { id },
    data: { typicalTransferMinutes: minutes },
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/admin/tickets");
  revalidatePath("/sellers/[id]", "page");
  revalidatePath("/events/[slug]", "page");

  redirect("/admin/sellers?updated=1");
}
export async function setSellerStatus(formData: FormData) {
  await requireAdmin();

  const id = getSellerId(formData);
  const statusValue = formData.get("status");

  if (
    !id ||
    (statusValue !== "active" && statusValue !== "blocked")
  ) {
    redirect("/admin/sellers?error=invalid");
  }

  await prisma.seller.update({
    where: { id },
    data: { status: statusValue },
  });

  refreshSellerPages();
  redirect("/admin/sellers?updated=1");
}