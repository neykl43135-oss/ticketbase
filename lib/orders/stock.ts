export function calculateRestoredQuantity(
  totalQuantity: number,
  availableQuantity: number,
  orderQuantity: number,
): number {
  if (
    !Number.isSafeInteger(totalQuantity) ||
    !Number.isSafeInteger(availableQuantity) ||
    !Number.isSafeInteger(orderQuantity) ||
    totalQuantity < 0 ||
    availableQuantity < 0 ||
    orderQuantity < 0
  ) {
    throw new Error("INVALID_STOCK_QUANTITY");
  }

  return Math.min(totalQuantity, availableQuantity + orderQuantity);
}
