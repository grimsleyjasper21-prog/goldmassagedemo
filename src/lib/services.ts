import type { Lang } from "./i18n";

/**
 * The studio's REAL treatment menu, transcribed from the service board in its
 * own shopfront window (three headings: Relaxing and Energizing, Therapeutic,
 * Aesthetic).
 *
 * Treatment NAMES and CATEGORIES are therefore the studio's own. Durations and
 * prices are NOT published anywhere and remain illustrative placeholders for
 * the demonstration — the footer and the services page both say so. Replace
 * the numbers when the studio supplies its tariff; nothing else changes.
 *
 * Two names on the board are partly obscured in the photograph and are left
 * out rather than guessed: one under Relaxing beginning "Massage in the w…",
 * and the full wording of "Acupressure and trigger…".
 */
export type Price =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; from: number; to: number }
  | { kind: "duration"; options: { minutes: number; amount: number }[] };

export type CategoryId = "relax" | "terapeutico" | "estetico";

export type Service = {
  id: string;
  category: CategoryId;
  name: Record<Lang, string>;
  price: Price;
};

export const CATEGORY_ORDER: CategoryId[] = ["relax", "terapeutico", "estetico"];

const d = (options: { minutes: number; amount: number }[]): Price => ({
  kind: "duration",
  options,
});

export const SERVICES: Service[] = [
  {
    id: "lomi-lomi",
    category: "relax",
    name: { es: "Masaje lomi lomi", en: "Lomi lomi massage", de: "Lomi-Lomi-Massage", sv: "Lomi lomi-massage" },
    price: d([{ minutes: 60, amount: 70 }, { minutes: 90, amount: 95 }]),
  },
  {
    id: "anti-estres",
    category: "relax",
    name: { es: "Masaje antiestrés", en: "Anti-stress massage", de: "Anti-Stress-Massage", sv: "Antistressmassage" },
    price: d([{ minutes: 60, amount: 65 }, { minutes: 90, amount: 90 }]),
  },
  {
    id: "cuatro-manos",
    category: "relax",
    name: { es: "Masaje a cuatro manos", en: "Four hands massage", de: "Vier-Hände-Massage", sv: "Fyrhändig massage" },
    price: d([{ minutes: 60, amount: 110 }, { minutes: 90, amount: 150 }]),
  },
  {
    id: "bambu",
    category: "relax",
    name: { es: "Masaje con bambú", en: "Bamboo massage", de: "Bambus-Massage", sv: "Bambumassage" },
    price: d([{ minutes: 60, amount: 70 }, { minutes: 90, amount: 95 }]),
  },
  {
    id: "aromaterapia",
    category: "relax",
    name: { es: "Masaje con aromaterapia", en: "Massage with aromatherapy", de: "Massage mit Aromatherapie", sv: "Massage med aromaterapi" },
    price: d([{ minutes: 60, amount: 70 }, { minutes: 90, amount: 95 }]),
  },
  {
    id: "reiki",
    category: "relax",
    name: { es: "Reiki", en: "Reiki", de: "Reiki", sv: "Reiki" },
    price: d([{ minutes: 45, amount: 55 }, { minutes: 60, amount: 70 }]),
  },

  {
    id: "tejido-profundo",
    category: "terapeutico",
    name: { es: "Masaje de tejido profundo", en: "Deep tissue massage", de: "Tiefengewebsmassage", sv: "Djupgående massage" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }, { minutes: 90, amount: 100 }]),
  },
  {
    id: "deportivo",
    category: "terapeutico",
    name: { es: "Masaje deportivo", en: "Sport massage", de: "Sportmassage", sv: "Sportmassage" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }, { minutes: 90, amount: 100 }]),
  },
  {
    id: "acupresion",
    category: "terapeutico",
    name: { es: "Acupresión y puntos gatillo", en: "Acupressure and trigger points", de: "Akupressur und Triggerpunkte", sv: "Akupressur och triggerpunkter" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }]),
  },
  {
    id: "vacumterapia",
    category: "terapeutico",
    name: { es: "Vacumterapia", en: "Vacuum therapy", de: "Vakuumtherapie", sv: "Vakuumterapi" },
    price: d([{ minutes: 30, amount: 45 }, { minutes: 45, amount: 60 }]),
  },
  {
    id: "reflexologia",
    category: "terapeutico",
    name: { es: "Reflexología", en: "Reflexology", de: "Reflexzonenmassage", sv: "Reflexologi" },
    price: d([{ minutes: 30, amount: 45 }, { minutes: 45, amount: 55 }]),
  },
  {
    id: "drenaje-linfatico",
    category: "terapeutico",
    name: { es: "Drenaje linfático", en: "Lymphatic drainage", de: "Lymphdrainage", sv: "Lymfdränage" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }]),
  },
  {
    id: "silla-express",
    category: "terapeutico",
    name: { es: "Masaje express en silla", en: "Express chair massage", de: "Express-Stuhlmassage", sv: "Express stolmassage" },
    price: d([{ minutes: 20, amount: 30 }, { minutes: 30, amount: 40 }]),
  },

  {
    id: "anticelulitico",
    category: "estetico",
    name: { es: "Masaje anticelulítico", en: "Anti-cellulite massage", de: "Anti-Cellulite-Massage", sv: "Anticellulitmassage" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }]),
  },
  {
    id: "reductor",
    category: "estetico",
    name: { es: "Masaje reductor", en: "Fat burning massage", de: "Fettverbrennungs-Massage", sv: "Fettförbrännande massage" },
    price: d([{ minutes: 45, amount: 60 }, { minutes: 60, amount: 75 }]),
  },
  {
    id: "maderoterapia",
    category: "estetico",
    name: { es: "Maderoterapia", en: "Wood therapy", de: "Holztherapie", sv: "Träterapi" },
    price: d([{ minutes: 45, amount: 65 }, { minutes: 60, amount: 80 }]),
  },
  {
    id: "rejuvenecedor",
    category: "estetico",
    name: { es: "Masaje rejuvenecedor", en: "Rejuvenation massage", de: "Verjüngungs-Massage", sv: "Föryngrande massage" },
    price: d([{ minutes: 45, amount: 65 }, { minutes: 60, amount: 80 }]),
  },
];

export function servicesByCategory(category: CategoryId) {
  return SERVICES.filter((s) => s.category === category);
}

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id);
}

export function euro(amount: number) {
  return `€${amount}`;
}

export function priceLabel(price: Price) {
  if (price.kind === "fixed") return euro(price.amount);
  if (price.kind === "range") return `${euro(price.from)}–${euro(price.to)}`;
  const first = price.options[0]!;
  const last = price.options[price.options.length - 1]!;
  if (price.options.length === 1) return euro(first.amount);
  return `${euro(first.amount)}–${euro(last.amount)}`;
}

/** How many people one request can cover. */
export const PEOPLE_OPTIONS = [1, 2, 3, 4];

export type BookingStatus = "pending" | "confirmed" | "declined";

/** Booking record shape, shared between the site, the API and the dashboard. */
export type BookingDraft = {
  service_id: string;
  service_name: string;
  duration: number | null;
  people: number;
  price: number | null;
  total: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  customer_name: string;
  customer_phone: string;
  notes: string;
  status: BookingStatus;
};

export function emptyBooking(): BookingDraft {
  return {
    service_id: "",
    service_name: "",
    duration: null,
    people: 1,
    price: null,
    total: null,
    date: null,
    start_time: null,
    end_time: null,
    customer_name: "",
    customer_phone: "",
    notes: "",
    status: "pending",
  };
}

/** Demo availability grid — the real free/busy check happens server-side. */
export const DEMO_SLOTS = [
  "10:00",
  "11:30",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "19:00",
  "20:30",
];

export function addMinutes(time: string, minutes: number | null) {
  if (!minutes) return null;
  const [h = 0, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
