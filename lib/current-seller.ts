import { prisma } from "@/lib/prisma";
import { getSellerSession } from "@/lib/seller-auth";

export async function getCurrentSeller() {
  const session = await getSellerSession();

  if (!session) return null;

  const seller = await prisma.seller.findUnique({
    where: { id: session.sellerId },
    select: {
      id: true,
      displayName: true,
      email: true,
      verified: true,
      status: true,
    },
  });

  if (!seller || seller.status !== "active") {
    return null;
  }

  return seller;
}