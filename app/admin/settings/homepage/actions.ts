"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function saveHomepageSettings(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const raw = formData.get("historicalDeals");
  const value = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;

  if (!Number.isSafeInteger(value) || value < 0 || value > 2147483647) {
    redirect("/admin/settings/homepage?error=invalid-value");
  }

  await prisma.homepageSettings.upsert({
    where: { id: 1 },
    update: { historicalDeals: value },
    create: { id: 1, historicalDeals: value },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings/homepage");
  redirect("/admin/settings/homepage?saved=1");
}