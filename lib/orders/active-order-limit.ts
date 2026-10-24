export const MAX_ACTIVE_ORDERS_PER_BUYER = 2;

export const ACTIVE_ORDER_STATUSES = [
  "pending_payment",
  "payment_submitted",
  "payment_confirmed",
  "awaiting_ticket_transfer",
] as const;

export function hasReachedActiveOrderLimit(
  activeOrderCount: number,
): boolean {
  return activeOrderCount >= MAX_ACTIVE_ORDERS_PER_BUYER;
}
