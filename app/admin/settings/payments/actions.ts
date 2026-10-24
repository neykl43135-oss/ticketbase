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

export async function savePaymentSettings(formData: FormData) {
  await requireAdmin();

  const bankTransferInstructions = readText(formData, "bankTransferInstructions");
  const revolutSlots = [1, 2, 3, 4, 5].map((n) =>
    readText(formData, `revolutInstruction${n}`),
  );
  const paypalSlots = [1, 2, 3, 4, 5].map((n) =>
    readText(formData, `paypalInstruction${n}`),
  );

  if (
    bankTransferInstructions.length > 5000 ||
    [...revolutSlots, ...paypalSlots].some((value) => value.length > 5000)
  ) {
    redirect("/admin/settings/payments?error=too-long");
  }

  const bankTransferEnabled = formData.get("bankTransferEnabled") === "on";
  const revolutEnabled = formData.get("revolutEnabled") === "on";
  const paypalEnabled = formData.get("paypalEnabled") === "on";

  if (!bankTransferEnabled && !revolutEnabled && !paypalEnabled) {
    redirect("/admin/settings/payments?error=no-methods");
  }

  const existing = await prisma.paymentSettings.findUnique({
    where: { id: 1 },
  });

  const oldRevolut = existing
    ? [
        existing.revolutInstruction1,
        existing.revolutInstruction2,
        existing.revolutInstruction3,
        existing.revolutInstruction4,
        existing.revolutInstruction5,
      ]
    : ["", "", "", "", ""];

  const oldPaypal = existing
    ? [
        existing.paypalInstruction1,
        existing.paypalInstruction2,
        existing.paypalInstruction3,
        existing.paypalInstruction4,
        existing.paypalInstruction5,
      ]
    : ["", "", "", "", ""];

  const queueFields = {
    revolutInstruction1: revolutSlots[0],
    revolutInstruction2: revolutSlots[1],
    revolutInstruction3: revolutSlots[2],
    revolutInstruction4: revolutSlots[3],
    revolutInstruction5: revolutSlots[4],
    revolutInstructions: revolutSlots[0],
    revolutNextIndex: formData.get("resetRevolutQueue") === "on" ? 0 : (existing?.revolutNextIndex ?? 0),

    paypalInstruction1: paypalSlots[0],
    paypalInstruction2: paypalSlots[1],
    paypalInstruction3: paypalSlots[2],
    paypalInstruction4: paypalSlots[3],
    paypalInstruction5: paypalSlots[4],
    paypalInstructions: paypalSlots[0],
    paypalNextIndex: formData.get("resetPaypalQueue") === "on" ? 0 : (existing?.paypalNextIndex ?? 0),
  };

  await prisma.paymentSettings.upsert({
    where: { id: 1 },
    update: {
      bankTransferEnabled,
      bankTransferInstructions,
      revolutEnabled,
      paypalEnabled,
      ...queueFields,
    },
    create: {
      id: 1,
      bankTransferEnabled,
      bankTransferInstructions,
      revolutEnabled,
      paypalEnabled,
      ...queueFields,
    },
  });

  revalidatePath("/admin/settings/payments");
  revalidatePath("/checkout");
  redirect("/admin/settings/payments?saved=1");
}