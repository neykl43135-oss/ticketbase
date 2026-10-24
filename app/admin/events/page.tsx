import { redirect } from "next/navigation";

import { createEvent, updateEvent } from "./actions";
import DeleteEventButton from "./delete-button";
import EventImageField from "@/components/admin/EventImageField";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type EventsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black";

const labelClass = "block text-sm font-medium text-neutral-700";

export default async function AdminEventsPage({
  searchParams,
}: EventsPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [events, params] = await Promise.all([
    prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    searchParams,
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            TicketBase
            <span className="ml-3 text-sm font-normal text-neutral-400">
              Admin
            </span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100"
            >
              Dashboard
            </a>

            <a
              href="/"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-black"
            >
              View website
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
              Content management
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Events
            </h1>

            <p className="mt-3 text-neutral-500">
              Create, edit and manage your TicketBase events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#create-event"
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              + Create event
            </a>

            <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
              <p className="text-sm text-neutral-500">Total events</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {events.length}
              </p>
            </div>
          </div>
        </div>

        {params.created === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Event created successfully.
          </div>
        )}

        {params.updated === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Event updated successfully.
          </div>
        )}

        {params.deleted === "1" && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
            Event deleted successfully.
          </div>
        )}

        {params.error === "invalid" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Some fields are invalid or missing. Check the form and try again.
          </div>
        )}

        {params.error === "has-listings" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            This event cannot be deleted because ticket listings are linked to it.
            Hide the event instead to preserve listings and order history.
          </div>
        )}

        {params.error === "not-found" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-sm"
          >
            This event no longer exists.
          </div>
        )}

        {/* Create event */}
        <section
          id="create-event"
          className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8"
        >
          <div className="mb-7">
            <p className="text-sm text-neutral-400">Add to your catalogue</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Create event
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Enter the event details below and save it to your database.
            </p>
          </div>

          <form action={createEvent} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Event title *
                <input
                  className={inputClass}
                  name="title"
                  placeholder="e.g. Noah Kahan вЂ” Dublin"
                  maxLength={200}
                  required
                />
              </label>

              <label className={labelClass}>
                Category *
                <input
                  className={inputClass}
                  name="category"
                  placeholder="Concert, Sports, Theatre..."
                  maxLength={80}
                  required
                />
              </label>

              <label className={labelClass}>
                Venue *
                <input
                  className={inputClass}
                  name="venue"
                  placeholder="e.g. 3Arena"
                  maxLength={200}
                  required
                />
              </label>

              <label className={labelClass}>
                City *
                <input
                  className={inputClass}
                  name="city"
                  placeholder="e.g. Dublin"
                  maxLength={100}
                  required
                />
              </label>

              <label className={labelClass}>
                Event date *
                <input
                  className={inputClass}
                  name="date"
                  type="date"
                  required
                />
              </label>

              <label className={labelClass}>
                Start time
                <input
                  className={inputClass}
                  name="time"
                  type="time"
                />
              </label>
            </div>

            <EventImageField />

            <label className={labelClass}>
              Full description *
              <textarea
                className={inputClass}
                name="description"
                rows={5}
                maxLength={10000}
                placeholder="Write the full event description..."
                required
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Publication status
                <select
                  className={inputClass}
                  name="status"
                  defaultValue="active"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>

              <label className="flex cursor-pointer items-center gap-3 self-end rounded-lg border border-neutral-200 p-4">
                <input
                  type="checkbox"
                  name="featured"
                  className="size-4 accent-black"
                />
                <span className="text-sm font-medium">
                  Feature on homepage
                </span>
              </label>
              <label className={labelClass}>
                Homepage order (1 = first)
                <input
                  className={inputClass}
                  type="number"
                  name="homepageOrder"
                  min="0"
                  max="9999"
                  step="1"
                  defaultValue={0}
                />
                <span className="text-xs text-neutral-500">Use 0 for automatic date order.</span>
              </label>
            </div>

            <div className="flex justify-end border-t border-neutral-100 pt-5">
              <button
                type="submit"
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Create event
              </button>
            </div>
          </form>
        </section>

        {/* Existing events */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              All events
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Edit an event below or remove it if it is no longer needed.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">No events yet</h3>

              <p className="mt-2 text-sm text-neutral-500">
                Create your first event using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center md:px-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                          {event.category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            event.status === "active"
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {event.status === "active" ? "Active" : "Hidden"}
                        </span>

                        {event.featured && (
                          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-xl font-semibold">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {event.venue}, {event.city}
                      </p>
                    </div>

                    <DeleteEventButton
                      id={event.id}
                      title={event.title}
                    />
                  </div>

                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium hover:bg-neutral-50 md:px-7">
                      <span>Edit event details</span>

                      <span className="text-neutral-400 transition-transform group-open:rotate-180">
                        в†“
                      </span>
                    </summary>

                    <div className="border-t border-neutral-100 p-5 md:p-7">
                      <form action={updateEvent} className="space-y-6">
                        <input
                          type="hidden"
                          name="id"
                          value={event.id}
                        />

                        <div className="grid gap-5 md:grid-cols-2">
                          <label className={labelClass}>
                            Event title *
                            <input
                              className={inputClass}
                              name="title"
                              defaultValue={event.title}
                              maxLength={200}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Category *
                            <input
                              className={inputClass}
                              name="category"
                              defaultValue={event.category}
                              maxLength={80}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Venue *
                            <input
                              className={inputClass}
                              name="venue"
                              defaultValue={event.venue}
                              maxLength={200}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            City *
                            <input
                              className={inputClass}
                              name="city"
                              defaultValue={event.city}
                              maxLength={100}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Event date *
                            <input
                              className={inputClass}
                              name="date"
                              type="date"
                              defaultValue={event.date
                                .toISOString()
                                .slice(0, 10)}
                              required
                            />
                          </label>

                          <label className={labelClass}>
                            Start time
                            <input
                              className={inputClass}
                              name="time"
                              type="time"
                              defaultValue={event.time ?? ""}
                            />
                          </label>
                        </div>

                        <EventImageField initialValue={event.image ?? ""} />

                        <label className={labelClass}>
                          Full description *
                          <textarea
                            className={inputClass}
                            name="description"
                            defaultValue={event.description}
                            rows={5}
                            maxLength={10000}
                            required
                          />
                        </label>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <label className={labelClass}>
                            Publication status
                            <select
                              className={inputClass}
                              name="status"
                              defaultValue={event.status}
                            >
                              <option value="active">Active</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </label>

                          <label className="flex cursor-pointer items-center gap-3 self-end rounded-lg border border-neutral-200 p-4">
                            <input
                              type="checkbox"
                              name="featured"
                              defaultChecked={event.featured}
                              className="size-4 accent-black"
                            />
                            <span className="text-sm font-medium">
                              Feature on homepage
                            </span>
                          </label>
                          <label className={labelClass}>
                            Homepage order (1 = first)
                            <input
                              className={inputClass}
                              type="number"
                              name="homepageOrder"
                              min="0"
                              max="9999"
                              step="1"
                              defaultValue={event.homepageOrder}
                            />
                            <span className="text-xs text-neutral-500">Use 0 for automatic date order.</span>
                          </label>
                        </div>

                        <div className="flex justify-end border-t border-neutral-100 pt-5">
                          <button
                            type="submit"
                            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          )}
                </section>
      </div>
    </main>
  );
}
