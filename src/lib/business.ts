/**
 * Central business configuration — the single source of truth for the site.
 *
 * SOURCING NOTE. Only researched information is stored here.
 *  - Name, address and the appointment-only booking policy come from the
 *    business's public directory listings.
 *  - Opening hours are NOT published anywhere public, so none are asserted.
 *  - Public listings carry TWO conflicting phone numbers for this address
 *    (+34 747 44 34 77 and +34 971 71 87 14). Neither is published on the
 *    site. `whatsapp` below is GRIMHART's own demo number so the booking
 *    hand-off works live during the presentation; swap it for the number the
 *    business confirms.
 */
export const BUSINESS = {
  name: "Gold Massage",
  legalName: "Gold Massage — Professional Studio",
  wordmark: "GOLD MASSAGE",
  street: "Carrer de Cannes 27, Local 3",
  postal: "07600",
  city: "S'Arenal",
  region: "Mallorca",
  area: "Illes Balears",
  country: "ES",
  timezone: "Europe/Madrid",

  /** Demo hand-off number. Replace with the studio's confirmed number. */
  whatsapp: "34613788381",

  mapsQuery:
    "Carrer+de+Cannes+27,+Local+3,+07600+S'Arenal,+Mallorca",
} as const;

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS.mapsQuery}`;
export const mapEmbedUrl = `https://www.google.com/maps?q=${BUSINESS.mapsQuery}&output=embed`;

/**
 * Demo notice shown in the footer. Fixed wording, shown in every language on
 * purpose, so it cannot drift between translations.
 */
export const DEMO_DISCLAIMER =
  "Web de demostración preparada por GRIMHART. Los tratamientos, precios, duraciones e imágenes son orientativos y no corresponden todavía a la información ni a las instalaciones definitivas del negocio.";

export function whatsappUrl(message: string) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
