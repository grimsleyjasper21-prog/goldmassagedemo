/**
 * Google Calendar integration — SERVER ONLY.
 *
 * The calendar is the booking store: every request becomes a real calendar
 * event, and confirming or declining updates that same event. That keeps one
 * source of truth and one credential.
 *
 * Auth is a Google service account (no OAuth consent flow). The studio shares
 * its calendar with the service account's address, granting "Make changes to
 * events". Required environment variables:
 *
 *   GOOGLE_SA_EMAIL        client_email from the service account JSON
 *   GOOGLE_SA_PRIVATE_KEY  private_key from the same JSON (\n escapes are fine)
 *   GOOGLE_CALENDAR_ID     optional — the calendar's address. Defaults to
 *                          DEFAULT_CALENDAR_ID below.
 *
 * Nothing here is ever imported by client code.
 */
import { createSign } from "node:crypto";
import { BUSINESS } from "./business";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";
/** Marks our events so listing never picks up the owner's private entries. */
export const BOOKING_TAG = "goldMassageBooking";
/** Used when GOOGLE_CALENDAR_ID is not set. Swap for the studio's own calendar. */
const DEFAULT_CALENDAR_ID = "grimsleyjasper21@gmail.com";

export class CalendarNotConfigured extends Error {
  constructor() {
    super("Google Calendar is not configured on this deployment.");
    this.name = "CalendarNotConfigured";
  }
}

function config() {
  const email = process.env["GOOGLE_SA_EMAIL"];
  const key = process.env["GOOGLE_SA_PRIVATE_KEY"];
  // Defaults to the studio owner's own calendar; override per deployment.
  const calendarId = process.env["GOOGLE_CALENDAR_ID"] ?? DEFAULT_CALENDAR_ID;
  if (!email || !key || !calendarId) return null;
  return { email, key: key.replace(/\\n/g, "\n"), calendarId };
}

export function isCalendarConfigured() {
  return config() !== null;
}

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const cfg = config();
  if (!cfg) throw new CalendarNotConfigured();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: cfg.email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(cfg.key));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

async function call<T>(path: string, init: RequestInit & { query?: Record<string, string> } = {}) {
  const cfg = config();
  if (!cfg) throw new CalendarNotConfigured();
  const token = await accessToken();
  const url = new URL(`${API}${path}`);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Google Calendar ${init.method ?? "GET"} ${path} failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}

/** Local wall-clock time in Madrid -> RFC3339 with the correct offset. */
function rfc3339(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  // Resolve Madrid's UTC offset for that instant rather than assuming +01:00.
  const guess = Date.UTC(y!, m! - 1, d!, hh!, mm!);
  const asMadrid = new Date(
    new Date(guess).toLocaleString("en-US", { timeZone: BUSINESS.timezone }),
  );
  const asUtc = new Date(new Date(guess).toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMin = Math.round((asMadrid.getTime() - asUtc.getTime()) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const off = `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${y}-${p(m!)}-${p(d!)}T${p(hh!)}:${p(mm!)}:00${off}`;
}

export type CalendarBooking = {
  id: string;
  ref: string;
  status: "pending" | "confirmed" | "declined";
  service_id: string;
  service_name: string;
  duration: number | null;
  people: number;
  total: number | null;
  date: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
};

type GEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  extendedProperties?: { private?: Record<string, string> };
};

const STATUS_PREFIX = {
  pending: "PENDIENTE",
  confirmed: "CONFIRMADA",
  declined: "RECHAZADA",
} as const;

function summaryFor(status: CalendarBooking["status"], b: { service_name: string; customer_name: string; people: number }) {
  const who = b.people > 1 ? `${b.customer_name} (${b.people}p)` : b.customer_name;
  return `${STATUS_PREFIX[status]} · ${b.service_name} · ${who}`;
}

function toBooking(e: GEvent): CalendarBooking | null {
  const p = e.extendedProperties?.private;
  if (!p || p["tag"] !== BOOKING_TAG) return null;
  const startIso = e.start?.dateTime ?? "";
  const endIso = e.end?.dateTime ?? "";
  const hhmm = (iso: string) => (iso ? iso.slice(11, 16) : "");
  return {
    id: e.id,
    ref: p["ref"] ?? e.id,
    status: (p["status"] as CalendarBooking["status"]) ?? "pending",
    service_id: p["service_id"] ?? "",
    service_name: p["service_name"] ?? "",
    duration: p["duration"] ? Number(p["duration"]) : null,
    people: p["people"] ? Number(p["people"]) : 1,
    total: p["total"] ? Number(p["total"]) : null,
    date: startIso.slice(0, 10),
    start_time: hhmm(startIso),
    end_time: hhmm(endIso),
    customer_name: p["customer_name"] ?? "",
    customer_phone: p["customer_phone"] ?? "",
    notes: p["notes"] ?? "",
  };
}

/** Busy intervals for one day, as [startMs, endMs] pairs. */
export async function busyIntervals(date: string): Promise<[number, number][]> {
  const cfg = config();
  if (!cfg) throw new CalendarNotConfigured();
  const body = {
    timeMin: rfc3339(date, "00:00"),
    timeMax: rfc3339(date, "23:59"),
    timeZone: BUSINESS.timezone,
    items: [{ id: cfg.calendarId }],
  };
  const json = await call<{ calendars: Record<string, { busy: { start: string; end: string }[] }> }>(
    "/freeBusy",
    { method: "POST", body: JSON.stringify(body) },
  );
  const busy = json.calendars[cfg.calendarId]?.busy ?? [];
  return busy.map((b) => [Date.parse(b.start), Date.parse(b.end)] as [number, number]);
}

export function overlaps(
  date: string,
  start: string,
  minutes: number,
  busy: [number, number][],
) {
  const s = Date.parse(rfc3339(date, start));
  const e = s + minutes * 60_000;
  return busy.some(([bs, be]) => s < be && e > bs);
}

export async function createPendingEvent(
  b: Omit<CalendarBooking, "id" | "status">,
): Promise<string> {
  const cfg = config()!;
  const event = {
    summary: summaryFor("pending", b),
    description: [
      `Solicitud de cita — ${BUSINESS.name}`,
      `Cliente: ${b.customer_name}`,
      `Teléfono: ${b.customer_phone}`,
      `Personas: ${b.people}`,
      b.total !== null ? `Total orientativo: €${b.total}` : null,
      b.notes ? `Notas: ${b.notes}` : null,
      `Referencia: ${b.ref}`,
      "",
      "Pendiente de confirmar desde el panel /admin.",
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: rfc3339(b.date, b.start_time), timeZone: BUSINESS.timezone },
    end: { dateTime: rfc3339(b.date, b.end_time), timeZone: BUSINESS.timezone },
    // Pending requests must not block other slots.
    transparency: "transparent",
    extendedProperties: {
      private: {
        tag: BOOKING_TAG,
        ref: b.ref,
        status: "pending",
        service_id: b.service_id,
        service_name: b.service_name,
        duration: String(b.duration ?? ""),
        people: String(b.people),
        total: b.total === null ? "" : String(b.total),
        customer_name: b.customer_name,
        customer_phone: b.customer_phone,
        notes: b.notes,
      },
    },
  };
  const created = await call<{ id: string }>(
    `/calendars/${encodeURIComponent(cfg.calendarId)}/events`,
    { method: "POST", body: JSON.stringify(event) },
  );
  return created.id;
}

export async function listBookings(): Promise<CalendarBooking[]> {
  const cfg = config();
  if (!cfg) throw new CalendarNotConfigured();
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const json = await call<{ items: GEvent[] }>(
    `/calendars/${encodeURIComponent(cfg.calendarId)}/events`,
    {
      query: {
        privateExtendedProperty: `tag=${BOOKING_TAG}`,
        timeMin: from,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "100",
      },
    },
  );
  return (json.items ?? []).map(toBooking).filter((b): b is CalendarBooking => b !== null);
}

export async function setStatus(
  eventId: string,
  status: CalendarBooking["status"],
): Promise<CalendarBooking> {
  const cfg = config();
  if (!cfg) throw new CalendarNotConfigured();
  const current = await call<GEvent>(
    `/calendars/${encodeURIComponent(cfg.calendarId)}/events/${encodeURIComponent(eventId)}`,
  );
  const existing = toBooking(current);
  if (!existing) throw new Error("That event is not a Gold Massage booking.");

  if (status === "confirmed") {
    // Re-check availability against everything else before committing.
    const busy = (await busyIntervals(existing.date)).filter(([bs, be]) => {
      const s = Date.parse(rfc3339(existing.date, existing.start_time));
      const e = Date.parse(rfc3339(existing.date, existing.end_time));
      // Ignore this booking's own (transparent) block if it appears.
      return !(bs >= s && be <= e);
    });
    const mins = Math.round(
      (Date.parse(rfc3339(existing.date, existing.end_time)) -
        Date.parse(rfc3339(existing.date, existing.start_time))) /
        60_000,
    );
    if (overlaps(existing.date, existing.start_time, mins, busy)) {
      throw new Error("CONFLICT");
    }
  }

  const patched = await call<GEvent>(
    `/calendars/${encodeURIComponent(cfg.calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        summary: summaryFor(status, existing),
        // Only a confirmed appointment occupies the diary.
        transparency: status === "confirmed" ? "opaque" : "transparent",
        extendedProperties: { private: { ...current.extendedProperties?.private, status } },
      }),
    },
  );
  return toBooking(patched) ?? { ...existing, status };
}
