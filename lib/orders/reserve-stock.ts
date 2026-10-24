type StockReservationClient = {
  ticketListing: {
    updateMany(args: {
      where: {
        id: number;
        status: "active";
        quantityAvailable: { gte: number };
      };
      data: {
        quantityAvailable: { decrement: number };
      };
    }): Promise<{ count: number }>;
  };
};

export async function reserveTicketStock(
  tx: StockReservationClient,
  listingId: number,
  quantity: number,
): Promise<boolean> {
  if (
    !Number.isSafeInteger(listingId) ||
    listingId <= 0 ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error("INVALID_RESERVATION_QUANTITY");
  }

  const result = await tx.ticketListing.updateMany({
    where: {
      id: listingId,
      status: "active",
      quantityAvailable: { gte: quantity },
    },
    data: {
      quantityAvailable: { decrement: quantity },
    },
  });

  return result.count === 1;
}