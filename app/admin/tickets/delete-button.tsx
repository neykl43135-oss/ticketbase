"use client";

import { deleteTicketListing } from "./actions";

type DeleteButtonProps = {
  id: number;
  title: string;
};

export default function DeleteTicketButton({
  id,
  title,
}: DeleteButtonProps) {
  return (
    <form
      action={deleteTicketListing}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete this ticket listing for "${title}"?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete listing
      </button>
    </form>
  );
}