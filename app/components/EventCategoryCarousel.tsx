"use client";

import { useMemo, useState } from "react";
import EventCarousel from "@/app/components/EventCarousel";

type CarouselEvent = {
  slug: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  category: string;
  image: string;
  imageAlt: string;
};

const categories = ["Concerts", "Sports", "Theatre", "Festivals"];

function matchesCategory(event: CarouselEvent, category: string) {
  const value = `${event.category} ${event.title} ${event.venue}`.toLowerCase();

  switch (category) {
    case "Concerts":
      return /concert|music|rock|electronic|festival|singer|band|live/.test(value);
    case "Sports":
      return /sport|rugby|football|soccer|gaa|match|vs|versus|stadium/.test(value);
    case "Theatre":
      return /theatre|theater|musical|play|opera|ballet/.test(value);
    case "Festivals":
      return /festival/.test(value);
    default:
      return true;
  }
}

export default function EventCategoryCarousel({
  events,
}: {
  events: CarouselEvent[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!activeCategory) return events;
    return events.filter((event) => matchesCategory(event, activeCategory));
  }, [events, activeCategory]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveCategory(active ? null : category)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200 ${
                active
                  ? "border-[#3978F6] bg-[#3978F6]/20 text-white"
                  : "border-white/[0.12] bg-white/[0.035] text-white/75 hover:border-[#3978F6]/70 hover:bg-[#3978F6]/15 hover:text-white"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredEvents.length > 0 ? (
        <EventCarousel events={filteredEvents} />
      ) : (
        <div className="rounded-[20px] border border-white/[0.08] bg-[#0B1220] p-8">
          <h3 className="text-lg font-semibold">No matching events yet</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Try another category or select the active category again to show all events.
          </p>
        </div>
      )}
    </>
  );
}