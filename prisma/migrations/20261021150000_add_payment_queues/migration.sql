ALTER TABLE "PaymentSettings" ADD COLUMN "revolutInstruction1" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "revolutInstruction2" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "revolutInstruction3" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "revolutInstruction4" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "revolutInstruction5" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "revolutNextIndex" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "PaymentSettings" ADD COLUMN "paypalInstruction1" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "paypalInstruction2" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "paypalInstruction3" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "paypalInstruction4" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "paypalInstruction5" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentSettings" ADD COLUMN "paypalNextIndex" INTEGER NOT NULL DEFAULT 0;

UPDATE "PaymentSettings"
SET "revolutInstruction1" = "revolutInstructions",
    "paypalInstruction1" = "paypalInstructions";
