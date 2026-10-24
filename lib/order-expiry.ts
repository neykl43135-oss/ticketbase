import { calculateRestoredQuantity } from "@/lib/orders/stock";
import { prisma } from "@/lib/prisma";

type ExpiryClient = typeof prisma;

export async function expirePendingOrders(
  client: ExpiryClient = prisma,
): Promise<number> {
  const now = new Date();

  const expiredCandidates = await client.order.findMany({
    where: {
      status: "pending_payment",
      expiresAt: { lte: now },
    },
    select: {
      id: true,
      ticketListingId: true,
      quantity: true,
    },
    orderBy: { expiresAt: "asc" },
    take: 100,
  });

  let expiredCount = 0;

  for (const candidate of expiredCandidates) {
    const didExpire = await client.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: {
          id: candidate.id,
          status: "pending_payment",
          expiresAt: { lte: now },
        },
        data: {
          status: "expired",
          expiresAt: null,
        },
      });

      if (result.count !== 1) {
        return false;
      }

      const listing = await tx.ticketListing.findUnique({
        where: { id: candidate.ticketListingId },
        select: {
          id: true,
          quantity: true,
          quantityAvailable: true,
          status: true,
        },
      });

      if (!listing) {
        throw new Error(
          `Ticket listing ${candidate.ticketListingId} not found`,
        );
      }

      const restoredQuantity = calculateRestoredQuantity(
        listing.quantity,
        listing.quantityAvailable,
        candidate.quantity,
      );

      await tx.ticketListing.update({
        where: { id: listing.id },
        data: {
          quantityAvailable: restoredQuantity,
          status:
            listing.status === "sold" && restoredQuantity > 0
              ? "active"
              : listing.status,
        },
      });

      return true;
    });

    if (didExpire) expiredCount++;
  }

  return expiredCount;
}