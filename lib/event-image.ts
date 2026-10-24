export function getEventImage(title: string, image?: string | null): string | null {
  const name = title.toLowerCase();

  if (name.includes("manic street preachers")) {
    if (name.includes("22 october") || name.includes("22 oct")) {
      return "/images/events/manic-street-preachers-2026-10-22.jpg";
    }
    return "/images/events/manic-street-preachers-2026.jpg";
  }

  if (name.includes("brandon flowers")) return "/images/events/brandon-flowers-2026.jpg";
  if (name.includes("coronas")) return "/images/events/the-coronas-2026.jpg";
  if (name.includes("strokes")) return "/images/events/the-strokes-2026.jpg";
  if (name.includes("ireland v south africa") || name.includes("springboks")) {
    return "/images/events/ireland-v-south-africa-2026.jpg";
  }
  if (name.includes("2manydjs")) return "/images/events/2manydjs-2026.jpg";
  if (name.includes("macklemore")) return "/images/events/macklemore-2026.jpg";
  if (name.includes("panchiko")) return "/images/events/panchiko-2026.jpg";
  if (name.includes("stevie wonder")) return "/images/events/stevie-wonder-2026.jpg";
  if (name.includes("jungle")) return "/images/events/jungle-2026.jpg";
  if (name.includes("aaron rowe")) return "/images/events/aaron-rowe-2026.jpg";
  if (name.includes("damien dempsey")) return "/images/events/damien-dempsey-2026.jpg";

  return image?.trim() || null;
}