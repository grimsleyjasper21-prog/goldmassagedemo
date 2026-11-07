/**
 * Google Apps Script calendar bridge — SERVER ONLY.
 *
 * The simplest way to get bookings into a Google Calendar: a script deployed
 * from the calendar owner's own Google account runs AS them, so there is no
 * service account, no OAuth consent screen and no calendar sharing step.
 *
 * Set one environment variable:
 *
 *   GOOGLE_APPS_SCRIPT_URL   the web-app /exec URL of the deployed script
 *   GOOGLE_APPS_SCRIPT_TOKEN optional shared secret, if the script checks one
 *
 * The script in docs/apps-script.gs supports create, list and status updates.
 * An older create-only script also works: this module degrades to creating
 * the event on request and tracking status locally.
 */
import type { AdminBooking } from "./bookings.functions";

export function appsScriptUrl() {
  return process.env["GOOGLE_APPS_SCRIPT_URL"]?.trim() || null;
}

function token() {
  return process.env["GOOGLE_APPS_SCRIPT_TOKEN"]?.trim() ?? "";
}

async function post(payload: Record<string, string>) {
  const url = appsScriptUrl();
  if (!url) throw new Error("GOOGLE_APPS_SCRIPT_URL is not set.");
  const body = new URLSearchParams({ token: token(), ...payload });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: body.toString(),
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Apps Script responded ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

/** Creates the calendar event. Returns the script's reply, which may be empty. */
export async function createEvent(b: AdminBooking) {
  return post({
    action: "create",
    booking_id: b.ref,
    customer_name: b.customer_name,
    customer_phone: b.customer_phone,
    customer_email: "",
    service: b.service_name,
    people: String(b.people),
    duration_minutes: String(b.duration ?? 60),
    price: b.total === null ? "" : String(b.total),
    date: b.date,
    start_time: b.start_time,
    end_time: b.end_time,
    notes: b.notes,
    status: b.status,
  });
}

/** Updates an event's status, for scripts that support it. */
export async function updateStatus(ref: string, status: AdminBooking["status"]) {
  return post({ action: "status", booking_id: ref, status });
}

/** Round-trip check used by the dashboard's connection test. */
export async function ping() {
  const url = appsScriptUrl();
  if (!url) return { ok: false, detail: "GOOGLE_APPS_SCRIPT_URL is not set." };
  try {
    const reply = await post({ action: "ping" });
    return { ok: true, detail: reply.slice(0, 300) || "(sin respuesta)" };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}
