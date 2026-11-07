import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { adminList, adminSetStatus, type AdminBooking } from "@/lib/bookings.functions";
import { BUSINESS } from "@/lib/business";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Panel · ${BUSINESS.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const KEY = "gold-admin";
const EASE = [0.22, 1, 0.36, 1] as const;

/** wa.me needs digits only; Spanish numbers are stored without a prefix. */
function waNumber(raw: string) {
  const digits = raw.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("34")) return digits;
  return `34${digits}`;
}

function longDate(iso: string) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function confirmMessage(b: AdminBooking) {
  const dur = b.duration ? ` de ${b.duration} minutos` : "";
  const people = b.people > 1 ? ` para ${b.people} personas` : "";
  return `Hola ${b.customer_name}, tu cita en ${BUSINESS.name} está confirmada para el ${longDate(b.date)} a las ${b.start_time}. Has reservado ${b.service_name}${dur}${people}. Estamos en ${BUSINESS.street}, ${BUSINESS.city} — se entra por el portal. ¡Te esperamos!`;
}

function declineMessage(b: AdminBooking) {
  return `Hola ${b.customer_name}, gracias por tu solicitud en ${BUSINESS.name}. Lamentablemente no tenemos disponibilidad el ${longDate(b.date)} a las ${b.start_time}. ¿Te viene bien otro día u otra hora? Dime y lo organizamos.`;
}

function reminderMessage(b: AdminBooking) {
  return `Hola ${b.customer_name}, te recordamos tu cita en ${BUSINESS.name} el ${longDate(b.date)} a las ${b.start_time} (${b.service_name}). Si necesitas cambiarla, avísanos por aquí.`;
}

function waUrl(b: AdminBooking, message: string) {
  return `https://wa.me/${waNumber(b.customer_phone)}?text=${encodeURIComponent(message)}`;
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminList({ data: { password: pw } });
      setBookings(res.bookings);
      setConfigured(res.configured);
      setAuthed(true);
      window.sessionStorage.setItem(KEY, pw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg.includes("UNAUTHORISED") ? "Contraseña incorrecta." : msg);
      setAuthed(false);
      window.sessionStorage.removeItem(KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(KEY);
    if (stored) {
      setPassword(stored);
      void load(stored);
    }
  }, [load]);

  const act = async (b: AdminBooking, status: "confirmed" | "declined") => {
    setBusyId(b.id);
    setError(null);
    try {
      const res = await adminSetStatus({ data: { password, id: b.id, status } });
      if (!res.ok) {
        setError(
          res.reason === "conflict"
            ? "Esa hora ya está ocupada en el calendario. Revisa antes de confirmar."
            : res.reason,
        );
      } else {
        setBookings((list) => list.map((x) => (x.id === b.id ? res.booking : x)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusyId(null);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const pending = useMemo(() => bookings.filter((b) => b.status === "pending"), [bookings]);
  const upcoming = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" && b.date >= today),
    [bookings, today],
  );
  const handled = useMemo(() => bookings.filter((b) => b.status === "declined"), [bookings]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void load(password);
          }}
        >
          <p className="display text-3xl text-charcoal">{BUSINESS.wordmark}</p>
          <p className="eyebrow mt-2 text-warmgrey">Panel de reservas</p>
          <label className="mt-10 block">
            <span className="eyebrow text-warmgrey">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="mt-2 min-h-14 w-full border border-input bg-transparent px-4 text-base text-charcoal outline-none transition-colors focus:border-charcoal"
            />
          </label>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="eyebrow mt-6 min-h-14 w-full bg-charcoal px-6 text-ivory transition-colors hover:bg-ink disabled:opacity-40"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory px-5 pb-24 pt-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="display text-3xl text-charcoal md:text-4xl">{BUSINESS.wordmark}</p>
            <p className="eyebrow mt-2 text-warmgrey">Panel de reservas</p>
          </div>
          <button
            type="button"
            onClick={() => void load(password)}
            disabled={loading}
            className="eyebrow border border-border px-5 py-3 text-charcoal transition-colors hover:border-charcoal disabled:opacity-40"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {!configured && (
          <p className="mt-6 border border-clay/40 bg-cream px-5 py-4 text-sm leading-relaxed text-charcoal">
            El calendario de Google todavía no está conectado en este despliegue, así que no hay
            reservas que mostrar. Añade <code>GOOGLE_SA_EMAIL</code>, <code>GOOGLE_SA_PRIVATE_KEY</code>{" "}
            y <code>GOOGLE_CALENDAR_ID</code> en las variables de entorno.
          </p>
        )}

        {error && (
          <p className="mt-6 border border-destructive/40 px-5 py-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <Section title="Pendientes" count={pending.length}>
          {pending.length === 0 && <Empty>No hay solicitudes pendientes.</Empty>}
          <AnimatePresence initial={false}>
            {pending.map((b) => (
              <Card key={b.id} b={b}>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Action
                    onClick={() => void act(b, "confirmed")}
                    disabled={busyId === b.id}
                    tone="solid"
                  >
                    {busyId === b.id ? "..." : "CONFIRMAR"}
                  </Action>
                  <Action
                    onClick={() => void act(b, "declined")}
                    disabled={busyId === b.id}
                    tone="outline"
                  >
                    RECHAZAR
                  </Action>
                  <Wa href={waUrl(b, confirmMessage(b))}>Confirmación por WhatsApp</Wa>
                </div>
              </Card>
            ))}
          </AnimatePresence>
        </Section>

        <Section title="Próximas citas" count={upcoming.length}>
          {upcoming.length === 0 && <Empty>No hay citas confirmadas próximamente.</Empty>}
          {upcoming.map((b) => (
            <Card key={b.id} b={b}>
              <div className="mt-6 flex flex-wrap gap-2">
                <Wa href={waUrl(b, reminderMessage(b))}>Recordatorio por WhatsApp</Wa>
                <Action
                  onClick={() => void act(b, "declined")}
                  disabled={busyId === b.id}
                  tone="outline"
                >
                  CANCELAR
                </Action>
              </div>
            </Card>
          ))}
        </Section>

        {handled.length > 0 && (
          <Section title="Rechazadas" count={handled.length}>
            {handled.map((b) => (
              <Card key={b.id} b={b}>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Wa href={waUrl(b, declineMessage(b))}>Proponer otra hora</Wa>
                </div>
              </Card>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-3">
        <h2 className="display text-2xl text-charcoal md:text-3xl">{title}</h2>
        <span className="eyebrow text-warmgrey">{count}</span>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-warmgrey">{children}</p>;
}

function Card({ b, children }: { b: AdminBooking; children: React.ReactNode }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="border border-border bg-cream/50 px-5 py-5 md:px-7 md:py-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg text-charcoal md:text-xl">{b.customer_name}</p>
        <span className="eyebrow text-warmgrey">{b.ref}</span>
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <Row k="Tratamiento" v={b.service_name} />
        <Row k="Duración" v={b.duration ? `${b.duration} min` : "—"} />
        <Row k="Día" v={longDate(b.date)} />
        <Row k="Hora" v={`${b.start_time}–${b.end_time}`} />
        <Row k="Personas" v={String(b.people)} />
        <Row k="Teléfono" v={b.customer_phone} />
        {b.total !== null && <Row k="Total" v={`€${b.total}`} />}
        {b.notes && <Row k="Notas" v={b.notes} />}
      </dl>
      {children}
    </motion.article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-1">
      <dt className="eyebrow text-warmgrey">{k}</dt>
      <dd className="text-right text-charcoal">{v}</dd>
    </div>
  );
}

function Action({
  onClick,
  disabled,
  tone,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  tone: "solid" | "outline";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "eyebrow min-h-12 px-5 transition-colors disabled:opacity-40",
        tone === "solid"
          ? "bg-charcoal text-ivory hover:bg-ink"
          : "border border-border text-charcoal hover:border-charcoal",
      )}
    >
      {children}
    </button>
  );
}

function Wa({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="eyebrow min-h-12 border border-clay/50 px-5 py-3 text-clay transition-colors hover:bg-clay hover:text-ivory"
    >
      {children}
    </a>
  );
}
