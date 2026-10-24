-- CreateTable
CREATE TABLE "Buyer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
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
    "paymentInstructions" TEXT NOT NULL DEFAULT '',
    "paymentSubmittedAt" DATETIME,
    "paymentConfirmedAt" DATETIME,
    "expiresAt" DATETIME,
    "adminNote" TEXT,
    "buyerId" INTEGER,
    "ticketListingId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_ticketListingId_fkey" FOREIGN KEY ("ticketListingId") REFERENCES "TicketListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("adminNote", "buyerEmail", "buyerFeeCents", "createdAt", "currency", "expiresAt", "id", "orderNumber", "paymentConfirmedAt", "paymentInstructions", "paymentMethod", "paymentSubmittedAt", "pricePerTicketCents", "quantity", "status", "subtotalCents", "ticketListingId", "totalCents", "updatedAt") SELECT "adminNote", "buyerEmail", "buyerFeeCents", "createdAt", "currency", "expiresAt", "id", "orderNumber", "paymentConfirmedAt", "paymentInstructions", "paymentMethod", "paymentSubmittedAt", "pricePerTicketCents", "quantity", "status", "subtotalCents", "ticketListingId", "totalCents", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Order_buyerEmail_idx" ON "Order"("buyerEmail");
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");
