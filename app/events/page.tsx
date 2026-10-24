import { prisma } from "@/lib/prisma";
import EventsCatalogue, { type CatalogueEvent } from "./EventsCatalogue";
import { getBuyerSession } from "@/lib/buyer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const buyerSession = await getBuyerSession();
  const databaseEvents = await prisma.event.findMany({
    where: {
      status: "active",
      date: { gte: new Date() },
    },
    orderBy: [{ date: "asc" }, { title: "asc" }],
    include: {
      ticketListings: {
        where: {
          status: "active",
          quantityAvailable: { gt: 0 },
          seller: { status: "active" },
        },
        select: { pricePerTicketCents: true },
      },
    },
  });

  const events: CatalogueEvent[] = databaseEvents.map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    category: event.category,
    venue: event.venue,
    city: event.city,
    date: event.date,
    time: event.time,
    description: event.description,
    image: event.image,
    featured: event.featured,
    minPriceCents:
      event.ticketListings.length > 0
        ? Math.min(...event.ticketListings.map((listing) => listing.pricePerTicketCents))
        : null,
  }));

  return <EventsCatalogue events={events} isBuyerAuthenticated={Boolean(buyerSession)} />;
}
