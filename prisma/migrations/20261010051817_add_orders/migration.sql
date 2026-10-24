-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "quantity" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "pricePerTicketCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "buyerFeeCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "paymentSubmittedAt" DATETIME,
    "paymentConfirmedAt" DATETIME,
    "adminNote" TEXT,
    "ticketListingId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_ticketListingId_fkey" FOREIGN KEY ("ticketListingId") REFERENCES "TicketListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_buyerEmail_idx" ON "Order"("buyerEmail");
