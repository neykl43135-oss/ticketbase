"use client";

import { deleteEvent } from "./actions";

type DeleteEventButtonProps = {
  id: number;
  title: string;
};

export default function DeleteEventButton({
  id,
  title,
}: DeleteEventButtonProps) {
  return (
    <form
      action={deleteEvent}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete "${title}"? This action cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}