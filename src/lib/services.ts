import type { Lang } from "./i18n";

/**
 * ILLUSTRATIVE DEMO MENU.
 *
 * The treatment TYPES reflect what the studio's public directory listing
 * describes (chiropractic work, relaxation massage, treatments for two).
 * The durations and prices are placeholder content for the demonstration —
 * they are NOT confirmed information from the business. Replace this array
 * with the real menu when it is supplied; nothing else needs to change.
 */
export type Price =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; from: number; to: number }
  | { kind: "duration"; options: { minutes: number; amount: number }[] };

export type CategoryId = "quiro" | "relax" | "deporte" | "ritual";

export type Service = {
  id: string;
  category: CategoryId;
  name: Record<Lang, string>;
  price: Price;
};

export const CATEGORY_ORDER: CategoryId[] = ["quiro", "relax", "deporte", "ritual"];

const d = (options: { minutes: number; amount: number }[]): Price => ({
  kind: "duration",
  options,
});

export const SERVICES: Service[] = [
  {
    id: "quiropractica",
    category: "quiro",
    name: {
      es: "Sesión quiropráctica",
      en: "Chiropractic session",
      de: "Chiropraktik-Sitzung",
      sv: "Kiropraktisk behandling",
    },
    price: d([
      { minutes: 30, amount: 45 },
      { minutes: 45, amount: 60 },
    ]),
  },
  {
    id: "descontracturante",
    category: "quiro",
    name: {
      es: "Masaje descontracturante",
      en: "Deep tissue massage",
      de: "Verspannungsmassage",
      sv: "Djupgående massage",
    },
    price: d([
      { minutes: 45, amount: 55 },
      { minutes: 60, amount: 70 },
      { minutes: 90, amount: 95 },
    ]),
  },
  {
    id: "espalda-cuello",
    category: "quiro",
    name: {
      es: "Espalda, cuello y hombros",
      en: "Back, neck and shoulders",
      de: "Rücken, Nacken und Schultern",
      sv: "Rygg, nacke och axlar",
    },
    price: d([
      { minutes: 30, amount: 40 },
      { minutes: 45, amount: 55 },
    ]),
  },

  {
    id: "relajante",
    category: "relax",
    name: {
      es: "Masaje relajante",
      en: "Relaxing massage",
      de: "Entspannungsmassage",
      sv: "Avslappnande massage",
    },
    price: d([
      { minutes: 60, amount: 65 },
      { minutes: 90, amount: 90 },
    ]),
  },
  {
    id: "aromaterapia",
    category: "relax",
    name: {
      es: "Masaje con aromaterapia",
      en: "Aromatherapy massage",
      de: "Aromatherapie-Massage",
      sv: "Aromaterapimassage",
    },
    price: d([
      { minutes: 60, amount: 70 },
      { minutes: 90, amount: 95 },
    ]),
  },
  {
    id: "piedras",
    category: "relax",
    name: {
      es: "Masaje con piedras calientes",
      en: "Hot stone massage",
      de: "Hot-Stone-Massage",
      sv: "Varm stenmassage",
    },
    price: d([{ minutes: 75, amount: 85 }]),
  },
  {
    id: "craneofacial",
    category: "relax",
    name: {
      es: "Craneofacial y cervical",
      en: "Head, face and neck",
      de: "Kopf, Gesicht und Nacken",
      sv: "Huvud, ansikte och nacke",
    },
    price: d([
      { minutes: 30, amount: 40 },
      { minutes: 45, amount: 50 },
    ]),
  },

  {
    id: "deportivo",
    category: "deporte",
    name: {
      es: "Masaje deportivo",
      en: "Sports massage",
      de: "Sportmassage",
      sv: "Sportmassage",
    },
    price: d([
      { minutes: 45, amount: 55 },
      { minutes: 60, amount: 70 },
      { minutes: 90, amount: 95 },
    ]),
  },
  {
    id: "estiramientos",
    category: "deporte",
    name: {
      es: "Masaje con estiramientos",
      en: "Massage with assisted stretching",
      de: "Massage mit Dehnung",
      sv: "Massage med stretching",
    },
    price: d([
      { minutes: 60, amount: 70 },
      { minutes: 90, amount: 95 },
    ]),
  },
  {
    id: "piernas",
    category: "deporte",
    name: {
      es: "Piernas cansadas",
      en: "Tired legs",
      de: "Müde Beine",
      sv: "Trötta ben",
    },
    price: d([
      { minutes: 45, amount: 55 },
      { minutes: 60, amount: 70 },
    ]),
  },

  {
    id: "ritual-cuerpo",
    category: "ritual",
    name: {
      es: "Ritual completo de cuerpo",
      en: "Full body ritual",
      de: "Ganzkörper-Ritual",
      sv: "Helkroppsritual",
    },
    price: d([
      { minutes: 90, amount: 110 },
      { minutes: 120, amount: 140 },
    ]),
  },
  {
    id: "reset",
    category: "ritual",
    name: {
      es: "Sesión reset",
      en: "Reset session",
      de: "Reset-Session",
      sv: "Reset-session",
    },
    price: d([
      { minutes: 60, amount: 70 },
      { minutes: 90, amount: 95 },
    ]),
  },
  {
    id: "express",
    category: "ritual",
    name: {
      es: "Sesión express",
      en: "Express session",
      de: "Express-Session",
      sv: "Expressbehandling",
    },
    price: d([{ minutes: 30, amount: 40 }]),
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
