import { createServerFn } from "@tanstack/react-start";
import { DEMO_SLOTS, addMinutes, type BookingStatus } from "./services";

/**
 * Server functions for the booking system.
 *
 * Everything that touches Google credentials is dynamically imported inside a
 * handler so the calendar module never reaches the client bundle.
 */

export type AvailabilityResult = {
  configured: boolean;
  slots: string[];
  /** Set when the calendar is wired up but the lookup failed. */
  error?: string;
};

export type RequestResult =
  | { ok: true; ref: string; eventId: string | null; calendarLinked: boolean }
  | { ok: false; reason: "conflict" | "error"; message?: string };

export type AdminBooking = {
  id: string;
  ref: string;
  status: BookingStatus;
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

function newRef() {
  return `GM-${Math.floor(Date.now() / 1000)}`;
}

/**
 * Fallback store, used ONLY when Google Calendar is not configured.
 *
 * These are real requests from real submissions — nothing is fabricated —
 * but they live in the server instance's memory, so they do not survive a
 * cold start and are not shared between instances. The dashboard says so
 * plainly whenever this store is in use. Configure the Google credentials
 * and the calendar becomes the store instead.
 */
const memoryStore = new Map<string, AdminBooking>();

function requireAdmin(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) throw new Error("ADMIN_PASSWORD is not set on this deployment.");
  if (password !== expected) throw new Error("UNAUTHORISED");
}

/** Free slots for one day, checked against the studio's real diary. */
export const getAvailability = createServerFn({ method: "GET" })
  .validator((input: { date: string; minutes: number }) => input)
  .handler(async ({ data }): Promise<AvailabilityResult> => {
    const cal = await import("./calendar.server");
    if (!cal.isCalendarConfigured()) {
      return { configured: false, slots: DEMO_SLOTS };
    }
    try {
      const busy = await cal.busyIntervals(data.date);
      const today = new Date().toISOString().slice(0, 10);
      const nowHm = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
      });
      const slots = DEMO_SLOTS.filter((slot) => {
        if (data.date === today && slot <= nowHm) return false;
        return !cal.overlaps(data.date, slot, data.minutes, busy);
      });
      return { configured: true, slots };
    } catch (err) {
      return {
        configured: true,
        slots: [],
        error: err instanceof Error ? err.message : "Availability lookup failed.",
      };
    }
  });

/** Creates the pending request. Never reports success unless it was stored. */
export const requestBooking = createServerFn({ method: "POST" })
  .validator(
    (input: {
      service_id: string;
      service_name: string;
      duration: number | null;
      people: number;
      total: number | null;
      date: string;
      start_time: string;
      customer_name: string;
      customer_phone: string;
      notes: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<RequestResult> => {
    const ref = newRef();
    const minutes = data.duration ?? 60;
    const end_time = addMinutes(data.start_time, minutes)!;

    const cal = await import("./calendar.server");
    if (!cal.isCalendarConfigured()) {
      // No calendar on this deployment. Keep the request so the owner
      // dashboard still receives it, and report calendarLinked: false so
      // nothing claims a diary entry that does not exist.
      memoryStore.set(ref, {
        id: ref,
        ref,
        status: "pending",
        service_name: data.service_name,
        duration: data.duration,
        people: data.people,
        total: data.total,
        date: data.date,
        start_time: data.start_time,
        end_time,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        notes: data.notes,
      });
      return { ok: true, ref, eventId: null, calendarLinked: false };
    }

    try {
      const busy = await cal.busyIntervals(data.date);
      if (cal.overlaps(data.date, data.start_time, minutes, busy)) {
        return { ok: false, reason: "conflict" };
      }
      const eventId = await cal.createPendingEvent({
        ref,
        service_id: data.service_id,
        service_name: data.service_name,
        duration: data.duration,
        people: data.people,
        total: data.total,
        date: data.date,
        start_time: data.start_time,
        end_time,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        notes: data.notes,
      });
      return { ok: true, ref, eventId, calendarLinked: true };
    } catch (err) {
      return {
        ok: false,
        reason: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });

export const adminList = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => input)
  .handler(async ({ data }): Promise<{ configured: boolean; bookings: AdminBooking[] }> => {
    requireAdmin(data.password);
    const cal = await import("./calendar.server");
    if (!cal.isCalendarConfigured()) {
      const bookings = [...memoryStore.values()].sort((a, b) =>
        `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`),
      );
      return { configured: false, bookings };
    }
    const bookings = await cal.listBookings();
    return { configured: true, bookings };
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .validator((input: { password: string; id: string; status: BookingStatus }) => input)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; booking: AdminBooking } | { ok: false; reason: string }> => {
      requireAdmin(data.password);
      const cal = await import("./calendar.server");
      if (!cal.isCalendarConfigured()) {
        const existing = memoryStore.get(data.id);
        if (!existing) return { ok: false, reason: "That request is no longer in memory." };
        const updated = { ...existing, status: data.status };
        memoryStore.set(data.id, updated);
        return { ok: true, booking: updated };
      }
      try {
        const booking = await cal.setStatus(data.id, data.status);
        return { ok: true, booking };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { ok: false, reason: message === "CONFLICT" ? "conflict" : message };
      }
    },
  );
