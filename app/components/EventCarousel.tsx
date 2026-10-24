"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

function ArrowIcon({ left = false }: { left?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="block h-4 w-4 shrink-0"
    >
      <path
        d={left ? "M19 12H5m7-7-7 7 7 7" : "M5 12h14m-7-7 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EventCarousel({ events }: { events: CarouselEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    scrollLeft: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const velocityRef = useRef(0);
  const lastMoveRef = useRef<{ x: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-event-card]"),
    );
    if (cards.length === 0) return;

    const trackLeft = track.getBoundingClientRect().left;
    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(
        card.getBoundingClientRect().left - trackLeft,
      );
      const closestDistance = Math.abs(
        cards[closestIndex].getBoundingClientRect().left - trackLeft,
      );

      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    const nextIndex = Math.max(
      0,
      Math.min(cards.length - 1, currentIndex + direction),
    );

    cards[nextIndex].scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-[#0B1220] p-8">
        <h3 className="text-lg font-semibold">New events are coming soon</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Check back shortly for upcoming concerts, sports and theatre events.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 max-w-full">
      <div className="mt-2 mb-3">
        <p className="text-xs text-white/40">Explore upcoming events</p>
      </div>

      <div
        ref={trackRef}
        className={`flex w-full min-w-0 max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 ${
          isDragging ? "cursor-grabbing select-none snap-none" : "cursor-grab"
        }`}
        style={{
          scrollbarWidth: "none",
          scrollBehavior: isDragging ? "auto" : "smooth",
        }}
        aria-label="Upcoming events"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          const track = trackRef.current;
          if (!track) return;

          dragRef.current = {
            startX: event.clientX,
            scrollLeft: track.scrollLeft,
            moved: false,
          };
          setIsDragging(true);
        }}
        onMouseMove={(event) => {
          const track = trackRef.current;
          const drag = dragRef.current;
          if (!track || !drag || event.buttons !== 1) return;

          const now = performance.now();
          const delta = event.clientX - drag.startX;
          if (Math.abs(delta) > 4) drag.moved = true;

          if (drag.moved) {
            track.scrollLeft = drag.scrollLeft - delta;

            const previous = lastMoveRef.current;
            if (previous) {
              const elapsed = now - previous.time;
              if (elapsed > 0) {
                const instantVelocity = (previous.x - event.clientX) / elapsed;
                velocityRef.current =
                  velocityRef.current * 0.35 + instantVelocity * 0.65;
              }
            }

            lastMoveRef.current = { x: event.clientX, time: now };
          }
        }}
        onMouseUp={() => {
          const track = trackRef.current;
          const drag = dragRef.current;

          if (drag?.moved) {
            suppressClickRef.current = true;
          }

          if (track && drag?.moved) {
            const velocity = Math.max(
              -2.2,
              Math.min(2.2, velocityRef.current),
            );

            if (Math.abs(velocity) > 0.15) {
              track.scrollBy({
                left: velocity * 180,
                behavior: "smooth",
              });
            }
          }

          dragRef.current = null;
          lastMoveRef.current = null;
          velocityRef.current = 0;
          setIsDragging(false);
        }}
        onMouseLeave={() => {
          const track = trackRef.current;
          const drag = dragRef.current;

          if (drag?.moved) {
            suppressClickRef.current = true;
          }

          if (track && drag?.moved) {
            const velocity = Math.max(
              -2.2,
              Math.min(2.2, velocityRef.current),
            );

            if (Math.abs(velocity) > 0.15) {
              track.scrollBy({
                left: velocity * 180,
                behavior: "smooth",
              });
            }
          }

          dragRef.current = null;
          lastMoveRef.current = null;
          velocityRef.current = 0;
          setIsDragging(false);
        }}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        {events.map((event) => (
          <Link
            href={`/events/${event.slug}`}
            key={event.slug}
            data-event-card
            className="group flex min-w-0 max-w-full flex-[0_0_72%] snap-start flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0B1220] shadow-[0_10px_32px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#3978F6]/40 hover:shadow-[0_16px_38px_rgba(0,0,0,0.3)] sm:flex-[0_0_40%] lg:flex-[0_0_31%] xl:flex-[0_0_24%]"
          >
            <div className="relative aspect-[4/3.5] overflow-hidden bg-[#111827]">
              <Image
                src={event.image}
                alt={event.imageAlt}
                fill
                unoptimized
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 24vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/90 via-transparent to-black/15" />
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#050914]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                {event.category}
              </span>
              <span className="absolute bottom-3 left-3 rounded-full border border-white/25 bg-[#050914]/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                {event.date}
              </span>
              <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition duration-200 group-hover:border-[#3978F6] group-hover:bg-[#3978F6]">
                <ArrowIcon />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="min-h-[2.8rem] text-base font-semibold leading-snug tracking-[-0.03em] text-white transition-colors duration-200 group-hover:text-[#B7CBFF]">
                {event.title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-white/65">
                {event.venue.replace(/ B$/, "")} · {event.city}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs font-medium">
                <span className="text-white/45">TicketBase</span>
                <span className="inline-flex items-center gap-1 text-[#B7CBFF] transition-colors group-hover:text-white">
                  View event <ArrowIcon />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous events"
            className="flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-[#3978F6] hover:bg-[#3978F6]/15"
          >
            <ArrowIcon left />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next events"
            className="flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-[#3978F6] hover:bg-[#3978F6]/15"
          >
            <ArrowIcon />
          </button>
      </div>
    </div>
  );
}

