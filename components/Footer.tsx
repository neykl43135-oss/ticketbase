import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Help & FAQ", href: "/help" },
  { label: "Conditions", href: "/conditions" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "mailto:info@ticketbase.org" },
  { label: "How it works", href: "/how-it-works" },
];

const legalLinks = [
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const linkClass =
  "w-fit text-white/75 transition-colors duration-200 hover:text-[#7CA5FF]";

export default function Footer() {
  return (
    <footer className="mt-auto px-4 pb-4 pt-10 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-[1600px] rounded-2xl border border-white/[0.08] bg-[#080E1B] px-6 py-9 text-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10 lg:px-14">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex flex-col items-start">
            <BrandLogo className="h-12 w-auto sm:h-14" />
            <p className="mt-3 max-w-xs text-base leading-6 tracking-wide text-slate-400">
              Your next ticket starts here.
            </p>
          </div>

<nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm sm:max-w-xl sm:grid-cols-3 sm:gap-x-12 sm:gap-y-5"
          >
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-11 w-full space-y-4 text-sm leading-6 text-white/70">
          <p>{String.fromCharCode(169)} 2026 TicketBase. All Rights Reserved.</p>

          <p>Ticket House Ltd, Registered in Citywest, Co. Dublin. CRO: 465530</p>

          <p>
            Use of this website signifies your agreement to our{" "}
            <Link
              href="/terms"
              className="text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#7CA5FF]"
            >
              Terms and Conditions
            </Link>
            . View our{" "}
            <Link
              href="/privacy"
              className="text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#7CA5FF]"
            >
              Privacy Policy
            </Link>.
          </p>

          <p className="max-w-4xl text-white/60">
            Founded 2022, TicketBase is a fan-to-fan ticket resale platform. We believe tickets should be sold for no more than face value and this site is our way of helping like minded people find each other to do that.
          </p>

          <div className="flex w-full flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.10] pt-5">

          </div>
        </div>
      </div>
    </footer>
  );
}


