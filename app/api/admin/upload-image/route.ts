import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function isAllowedImage(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
  }

  if (mimeType === "image/webp") {
    return buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
  }

  return false;
}

async function uploadImage(buffer: Buffer): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "ticketbase/events",
        resource_type: "image",
        public_id: randomUUID(),
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary returned no image URL"));
          return;
        }

        resolve(result.secure_url);
      },
    ).end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > MAX_FILE_SIZE + 100_000) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller" },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (
      !file ||
      typeof file === "string" ||
      typeof file.arrayBuffer !== "function"
    ) {
      return NextResponse.json(
        { error: "Choose an image file" },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 5 MB" },
        { status: 413 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are supported" },
        { status: 415 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isAllowedImage(buffer, file.type)) {
      return NextResponse.json(
        { error: "The file contents do not match a supported image type" },
        { status: 415 },
      );
    }
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Image storage is not configured" },
        { status: 503 },
      );
    }

    const url = await uploadImage(buffer);

    return NextResponse.json({ url });
  } catch (error) {
    if (error && typeof error === "object") {
      const details = error as {
        message?: string;
        http_code?: number;
        name?: string;
        error?: { message?: string; http_code?: number };
      };

      console.error("Admin image upload failed:", {
        name: details.name,
        message: details.message,
        http_code: details.http_code ?? details.error?.http_code,
        providerMessage: details.error?.message,
      });
    } else {
      console.error("Admin image upload failed: Unknown error");
    }

    return NextResponse.json(
      { error: "Image upload failed. Check server configuration and try again." },
      { status: 500 },
    );
  }
}
