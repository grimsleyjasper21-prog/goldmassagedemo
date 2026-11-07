/**
 * Google Calendar integration — SERVER ONLY.
 *
 * The calendar is the booking store: every request becomes a real calendar
 * event, and confirming or declining updates that same event. That keeps one
 * source of truth and one credential.
 *
 * Auth is a Google service account (no OAuth consent flow). The studio shares
 * its calendar with the service account's address, granting "Make changes to
 * events".
 *
 * Easiest setup — ONE variable, the whole downloaded key file pasted in:
 *
 *   GOOGLE_SERVICE_ACCOUNT_JSON   the entire service-account JSON
 *
 * Or the two fields separately, if you prefer:
 *
 *   GOOGLE_SA_EMAIL        client_email from that JSON
 *   GOOGLE_SA_PRIVATE_KEY  private_key from it (\n escapes are fine)
 *
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

export type ConfigSource = "json" | "fields" | null;

/**
 * Reads credentials from either the whole-JSON variable or the two separate
 * fields. Returns null when neither is usable, and never throws — a malformed
 * JSON blob is reported by `configProblem()` rather than crashing a request.
 */
function config() {
  const blob = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"]?.trim();
  // Defaults to the studio owner's own calendar; override per deployment.
  const calendarId = process.env["GOOGLE_CALENDAR_ID"] ?? DEFAULT_CALENDAR_ID;

  if (blob) {
    try {
      const parsed = JSON.parse(blob) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return {
          email: parsed.client_email,
          key: parsed.private_key.replace(/\\n/g, "\n"),
          calendarId,
          source: "json" as const,
        };
      }
    } catch {
      /* reported by configProblem() */
    }
  }

  const email = process.env["GOOGLE_SA_EMAIL"];
  const key = process.env["GOOGLE_SA_PRIVATE_KEY"];
  if (email && key) {
    return { email, key: key.replace(/\\n/g, "\n"), calendarId, source: "fields" as const };
  }
  return null;
}

/** A human-readable reason why the credentials are not usable, or null. */
export function configProblem(): string | null {
  const blob = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"]?.trim();
  if (blob) {
    let parsed: { client_email?: string; private_key?: string };
    try {
      parsed = JSON.parse(blob) as typeof parsed;
    } catch {
      return "GOOGLE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the whole key file, including the outer { }.";
    }
    if (!parsed.client_email) return "The JSON has no client_email field.";
    if (!parsed.private_key) return "The JSON has no private_key field.";
    return null;
  }
  const email = process.env["GOOGLE_SA_EMAIL"];
  const key = process.env["GOOGLE_SA_PRIVATE_KEY"];
  if (!email && !key) {
    return "No credentials set. Add GOOGLE_SERVICE_ACCOUNT_JSON (the whole key file) in the Vercel environment variables.";
  }
  if (!email) return "GOOGLE_SA_PRIVATE_KEY is set but GOOGLE_SA_EMAIL is missing.";
  if (!key) return "GOOGLE_SA_EMAIL is set but GOOGLE_SA_PRIVATE_KEY is missing.";
  if (!key.includes("BEGIN PRIVATE KEY")) {
    return "GOOGLE_SA_PRIVATE_KEY does not look like a key — it must include the -----BEGIN PRIVATE KEY----- line.";
  }
  return null;
}

/** Which calendar the credentials point at, for the diagnostics panel. */
export function targetCalendarId() {
  return process.env["GOOGLE_CALENDAR_ID"] ?? DEFAULT_CALENDAR_ID;
}

/** The service account address the calendar must be shared with. */
export function serviceAccountEmail() {
  return config()?.email ?? null;
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

/**
 * Local wall-clock time in Madrid -> RFC3339 with the correct UTC offset.
 *
 * The offset is read twice: once at the naive instant, then again at the
 * instant that offset implies. Without the second read, the hour that repeats
 * when summer time ends resolves to the wrong side of the change.
 */
function rfc3339(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  const offsetAt = (ms: number) => {
    const asZone = new Date(new Date(ms).toLocaleString("en-US", { timeZone: BUSINESS.timezone }));
    const asUtc = new Date(new Date(ms).toLocaleString("en-US", { timeZone: "UTC" }));
    return Math.round((asZone.getTime() - asUtc.getTime()) / 60000);
  };

  const guess = Date.UTC(y!, m! - 1, d!, hh!, mm!);
  const first = offsetAt(guess);
  const second = offsetAt(guess - first * 60000);
  const offsetMin = second;

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


export type Diagnosis = {
  ok: boolean;
  /** Short status for the dashboard badge. */
  headline: string;
  /** What to do about it, in plain language. */
  detail: string;
  serviceAccount: string | null;
  calendarId: string;
  /** Google's own error text, when there was one. */
  raw?: string;
};

/**
 * End-to-end check of the Google connection, run from the dashboard.
 *
 * Tests the two things that actually go wrong, in order: whether the
 * credentials authenticate at all, and whether the service account can
 * actually see the target calendar (i.e. whether it was shared with it —
 * the single most common mistake).
 */
export async function diagnose(): Promise<Diagnosis> {
  const calendarId = targetCalendarId();
  const problem = configProblem();
  if (problem) {
    return {
      ok: false,
      headline: "Credenciales no configuradas",
      detail: problem,
      serviceAccount: null,
      calendarId,
    };
  }

  const cfg = config()!;

  let token: string;
  try {
    token = await accessToken();
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    let detail =
      "Google rechazó las credenciales. Revisa que has pegado el archivo JSON completo y sin recortar.";
    if (raw.includes("account not found")) {
      detail =
        "Google no encuentra esa cuenta de servicio. Comprueba el client_email, y que la Google Calendar API está activada en el proyecto.";
    } else if (raw.includes("Invalid JWT Signature")) {
      detail =
        "La clave privada no corresponde a esa cuenta de servicio. Vuelve a descargar el JSON y pégalo entero.";
    } else if (raw.includes("invalid_grant")) {
      detail =
        "Google rechazó la clave. Suele ser un private_key mal pegado: tiene que incluir las líneas BEGIN y END.";
    }
    return {
      ok: false,
      headline: "Las credenciales no autentican",
      detail,
      serviceAccount: cfg.email,
      calendarId,
      raw,
    };
  }

  // Authenticated. Can it actually reach the calendar?
  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const raw = await res.text();
    const detail =
      res.status === 404
        ? `La cuenta de servicio autentica pero no ve el calendario "${calendarId}". Abre Google Calendar, Configuración, ese calendario, "Compartir con determinadas personas", añade ${cfg.email} y dale "Hacer cambios en los eventos".`
        : `Google respondió ${res.status} al leer el calendario.`;
    return {
      ok: false,
      headline: "Autentica, pero no ve el calendario",
      detail,
      serviceAccount: cfg.email,
      calendarId,
      raw: raw.slice(0, 400),
    };
  }

  return {
    ok: true,
    headline: "Conectado",
    detail: `Las citas confirmadas se escribirán en "${calendarId}".`,
    serviceAccount: cfg.email,
    calendarId,
  };
}
