import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import TawkToChat from "@/components/TawkToChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketBase | Buy & sell tickets",
  description: "Discover live events and buy or sell tickets with transparent pricing and a clear 1% buyer fee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isAdminRoute = false;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<Footer />{!isAdminRoute && <TawkToChat />}</body>
    </html>
  );
}
