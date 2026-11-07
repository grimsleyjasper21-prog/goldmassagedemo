/**
 * Central business configuration — the single source of truth for the site.
 *
 * SOURCING NOTE. Only researched information is stored here.
 *  - Name, descriptor and address come from the studio's own shopfront
 *    signage ("GOLD MASSAGE — Chiromassage & Wellness Studio") and its
 *    public directory listings.
 *  - The phone number is the one printed on the studio's own window under
 *    "citas y consultas". A directory listed a second, different number;
 *    the signage is treated as authoritative.
 *  - Opening hours are NOT published anywhere, so none are asserted.
 *  - `whatsapp` is GRIMHART's demo number so the booking hand-off works
 *    live during the presentation. Swap it for the studio's own before
 *    this goes to real customers.
 */
export const BUSINESS = {
  name: "Gold Massage",
  legalName: "Gold Massage — Chiromassage & Wellness Studio",
  wordmark: "GOLD MASSAGE",
  street: "Carrer de Cannes 27, Local 3",
  postal: "07600",
  city: "S'Arenal",
  region: "Mallorca",
  area: "Illes Balears",
  country: "ES",
  timezone: "Europe/Madrid",

  /** From the studio's own shopfront window. */
  phoneDisplay: "+34 747 44 34 77",
  phoneDial: "+34747443477",

  /** Demo hand-off number. Replace with the studio's own before go-live. */
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
  "Web de demostración preparada por GRIMHART. Las fotografías y los tratamientos son reales; las duraciones y los precios son orientativos y se ajustarán a las tarifas definitivas del estudio.";

export function whatsappUrl(message: string) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
