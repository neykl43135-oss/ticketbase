"use client";

import { useState } from "react";

type EventImageFieldProps = {
  initialValue?: string;
};

export default function EventImageField({
  initialValue = "",
}: EventImageFieldProps) {
  const [imageUrl, setImageUrl] = useState(initialValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Image upload failed.");
      }

      setImageUrl(result.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">
        Event image
        <input
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black"
          type="text"
          name="image"
          value={imageUrl}
          maxLength={1000}
          placeholder="Image URL or upload a file below"
          onChange={(event) => setImageUrl(event.target.value)}
        />
      </label>

      <div className="mt-3">
        <label className="block text-sm font-medium text-neutral-700">
          Choose image from your computer
          <input
            className="mt-2 block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:font-medium hover:file:bg-neutral-200"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          JPEG, PNG or WebP. Maximum size: 5 MB.
        </p>
      </div>

      {uploading && (
        <p className="mt-3 text-sm text-neutral-500">
          Uploading image...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {imageUrl && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">
            Image preview
          </p>
          <img
            src={imageUrl}
            alt="Event image preview"
            className="max-h-56 max-w-full rounded-xl border border-neutral-200 object-contain"
          />
        </div>
      )}
    </div>
  );
}
