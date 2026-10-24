import type { PaymentSettings, Prisma } from "../../generated/prisma/client";

export type QueuedPaymentMethod = "REVOLUT" | "PAYPAL";

type QueueSettings = Pick<
  PaymentSettings,
  | "revolutEnabled"
  | "revolutInstruction1"
  | "revolutInstruction2"
  | "revolutInstruction3"
  | "revolutInstruction4"
  | "revolutInstruction5"
  | "revolutNextIndex"
  | "paypalEnabled"
  | "paypalInstruction1"
  | "paypalInstruction2"
  | "paypalInstruction3"
  | "paypalInstruction4"
  | "paypalInstruction5"
  | "paypalNextIndex"
>;

export async function reserveQueuedPaymentInstructions(
  tx: Prisma.TransactionClient,
  method: QueuedPaymentMethod,
  settings: QueueSettings,
): Promise<string> {
  const isRevolut = method === "REVOLUT";

  const enabled = isRevolut
    ? settings.revolutEnabled
    : settings.paypalEnabled;

  if (!enabled) {
    throw new Error("PAYMENT_METHOD_UNAVAILABLE");
  }

  const slots = isRevolut
    ? [
        settings.revolutInstruction1,
        settings.revolutInstruction2,
        settings.revolutInstruction3,
        settings.revolutInstruction4,
        settings.revolutInstruction5,
      ]
    : [
        settings.paypalInstruction1,
        settings.paypalInstruction2,
        settings.paypalInstruction3,
        settings.paypalInstruction4,
        settings.paypalInstruction5,
      ];

  const storedIndex = isRevolut
    ? settings.revolutNextIndex
    : settings.paypalNextIndex;

  if (!Number.isInteger(storedIndex) || storedIndex < 0) {
    throw new Error("PAYMENT_METHOD_UNAVAILABLE");
  }

  // Wrap around to the first slot after the fifth.
  // Also recovers existing stored indexes such as 5.
  const index = storedIndex % slots.length;
  const instructions = slots[index];

  if (!instructions.trim()) {
    throw new Error("PAYMENT_METHOD_UNAVAILABLE");
  }

  const nextIndex = (index + 1) % slots.length;

  // Claim the slot atomically so concurrent orders cannot
  // silently reserve the same queue position.
  const claimed = await tx.paymentSettings.updateMany({
    where: isRevolut
      ? { id: 1, revolutNextIndex: storedIndex }
      : { id: 1, paypalNextIndex: storedIndex },
    data: isRevolut
      ? { revolutNextIndex: nextIndex }
      : { paypalNextIndex: nextIndex },
  });

  if (claimed.count !== 1) {
    throw new Error("PAYMENT_QUEUE_RACE");
  }

  return instructions;
}
