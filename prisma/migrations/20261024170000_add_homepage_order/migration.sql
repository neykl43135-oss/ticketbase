-- Add manual ordering for homepage events.
ALTER TABLE "Event" ADD COLUMN "homepageOrder" INTEGER NOT NULL DEFAULT 0;