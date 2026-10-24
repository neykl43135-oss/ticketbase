import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  className = "h-8 w-auto",
  priority = false,
}: BrandLogoProps) {
  return (
    <Link href="/" aria-label="TicketBase home" className="inline-flex shrink-0 items-center">
      <Image
        src="/images/ticketbase-logo-v2.png"
        alt="TicketBase — The Ticket Marketplace"
        width={1411}
        height={345}
        priority={priority}
        className={`${className} object-contain`}
      />
    </Link>
  );
}