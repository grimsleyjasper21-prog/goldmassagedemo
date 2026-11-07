import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CATEGORY_ORDER,
  DEMO_SLOTS,
  PEOPLE_OPTIONS,
  addMinutes,
  emptyBooking,
  euro,
  getService,
  priceLabel,
  servicesByCategory,
  type BookingDraft,
  type Service,
} from "@/lib/services";
import { categoryLabel, useI18n, type Lang } from "@/lib/i18n";
import { BUSINESS, directionsUrl, whatsappUrl } from "@/lib/business";
import { cn } from "@/lib/utils";
import { getAvailability, requestBooking } from "@/lib/bookings.functions";
import { CtaAnchor, CtaButton } from "./Cta";
import { InstallApp } from "./InstallApp";

type Step = "service" | "duration" | "people" | "date" | "time" | "details" | "summary" | "done";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookingFlow({
  initialServiceId,
  initialMinutes,
}: {
  initialServiceId?: string | undefined;
  initialMinutes?: number | undefined;
}) {
  const { t, lang } = useI18n();
  const initialService = initialServiceId ? getService(initialServiceId) : undefined;

  const [service, setService] = useState<Service | undefined>(initialService);
  const [minutes, setMinutes] = useState<number | null>(
    initialService?.price.kind === "duration"
      ? (initialMinutes ?? initialService.price.options[0]!.minutes)
      : null,
  );
  const [people, setPeople] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState({ name: "", phone: "", notes: "" });
  const [error, setError] = useState<"required" | "phone" | null>(null);
  const [step, setStep] = useState<Step>(initialService ? "people" : "service");
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Every session in the menu is booked by length, so the duration step is
  // counted from the start and the total never changes mid-flow.
  const needsDuration = service ? service.price.kind === "duration" : true;

  const price = useMemo(() => {
    if (!service) return null;
    if (service.price.kind === "fixed") return service.price.amount;
    if (service.price.kind === "duration")
      return service.price.options.find((o) => o.minutes === minutes)?.amount ?? null;
    return null;
  }, [service, minutes]);

  const total = price !== null ? price * people : null;

  const steps: Step[] = needsDuration
    ? ["service", "duration", "people", "date", "time", "details", "summary"]
    : ["service", "people", "date", "time", "details", "summary"];
  const stepIndex = Math.max(0, steps.indexOf(step));

  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Move to a step and keep its question in view: if the panel has scrolled up
   * under the fixed header, bring its top back just below it — otherwise leave
   * the page exactly where the visitor left it.
   */
  const go = (next: Step) => {
    if (next === "summary" && !bookingId) setBookingId(newBookingId());
    setStep(next);
    const el = rootRef.current;
    if (!el) return;
    const headroom = 112;
    const top = el.getBoundingClientRect().top;
    if (top < headroom) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + top - headroom),
        behavior: "smooth",
      });
    }
  };

  const chooseService = (s: Service) => {
    setService(s);
    setMinutes(s.price.kind === "duration" ? s.price.options[0]!.minutes : null);
    go(s.price.kind === "duration" ? "duration" : "people");
  };

  // Real free/busy lookup against the studio's diary, run when the visitor
  // reaches the time step. Falls back to the standard grid if the deployment
  // has no calendar wired up.
  useEffect(() => {
    if (step !== "time" || !date) return;
    let cancelled = false;
    setSlotsLoading(true);
    getAvailability({ data: { date, minutes: minutes ?? 60 } })
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots(DEMO_SLOTS);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, date, minutes]);

  const peopleLabel = (n: number) => `${n} ${n === 1 ? t.book.person : t.book.people}`;

  const requestMessage = (draft: BookingDraft, ref: string) =>
    [
      t.book.whatsappIntro,
      "",
      `${t.book.labelService}: ${draft.service_name}`,
      draft.duration ? `${t.book.labelDuration}: ${draft.duration} ${t.services.minutes}` : null,
      `${t.book.labelPeople}: ${peopleLabel(draft.people)}`,
      draft.date ? `${t.book.labelDate}: ${formatDate(draft.date, lang)}` : null,
      draft.start_time ? `${t.book.labelTime}: ${draft.start_time}` : null,
      `${t.book.name}: ${draft.customer_name}`,
      draft.notes ? `${t.book.notesShort}: ${draft.notes}` : null,
      `${t.book.reference}: ${ref}`,
    ]
      .filter(Boolean)
      .join("\n");

  const confirm = async () => {
    if (!service || !date || !time || sending) return;
    const ref = bookingId ?? newBookingId();
    if (!bookingId) setBookingId(ref);
    // Session length when one has been chosen, otherwise a 60-minute block for
    // the diary only — never shown to the client.
    const calendarMinutes = minutes ?? 60;
    const draft: BookingDraft = {
      ...emptyBooking(),
      service_id: service.id,
      service_name: service.name[lang],
      duration: minutes,
      people,
      price,
      total,
      date,
      start_time: time,
      end_time: addMinutes(time, calendarMinutes),
      customer_name: details.name,
      customer_phone: details.phone,
      notes: details.notes,
      status: "pending",
    };

    setSending(true);
    setSendError(null);
    try {
      const res = await requestBooking({
        data: {
          service_id: draft.service_id,
          service_name: draft.service_name,
          duration: draft.duration,
          people: draft.people,
          total: draft.total,
          date: draft.date!,
          start_time: draft.start_time!,
          customer_name: draft.customer_name,
          customer_phone: draft.customer_phone,
          notes: draft.notes,
        },
      });
      setSending(false);
      if (!res.ok) {
        setSendError(res.reason === "conflict" ? t.book.noSlots : t.book.sendError);
        if (res.reason === "conflict") setSlots(null);
        return;
      }
      setBookingId(res.ref);
      setBooking(draft);
      go("done");
    } catch (err) {
      console.error("booking submit failed", err);
      setSending(false);
      setSendError(t.book.sendError);
    }
  };

  const reset = () => {
    setService(undefined);
    setMinutes(null);
    setPeople(1);
    setDate(null);
    setTime(null);
    setDetails({ name: "", phone: "", notes: "" });
    setBooking(null);
    setBookingId(null);
    setSendError(null);
    setSlots(null);
    setError(null);
    go("service");
  };

  /** Chips of everything chosen so far — also the way back to any step. */
  const chips: { key: Step; label: string }[] = [];
  if (service) chips.push({ key: "service", label: service.name[lang] });
  if (minutes) chips.push({ key: "duration", label: `${minutes} ${t.services.minutes}` });
  if (step !== "service" && (needsDuration ? step !== "duration" : true) && step !== "people")
    chips.push({ key: "people", label: peopleLabel(people) });
  if (date) chips.push({ key: "date", label: formatDateShort(date, lang) });
  if (time) chips.push({ key: "time", label: time });

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-3xl scroll-mt-28">
      {step !== "done" && (
        <div className="mb-10 md:mb-12">
          <div className="flex items-center gap-4">
            <span className="eyebrow text-warmgrey">
              {t.book.step} {stepIndex + 1} {t.book.of} {steps.length}
            </span>
            <span className="relative h-px flex-1 bg-border">
              <motion.span
                className="absolute inset-y-0 left-0 block bg-clay"
                initial={false}
                animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </span>
            <span className="eyebrow hidden text-charcoal sm:block">{stepTitle(t, step)}</span>
          </div>

          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-5">
                  {chips.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => go(c.key)}
                      className="eyebrow border border-border px-3 py-2 text-[0.6rem] text-warmgrey transition-colors hover:border-charcoal hover:text-charcoal"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {step === "service" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qService}</h2>
              <div className="mt-10 space-y-10">
                {CATEGORY_ORDER.map((cat) => (
                  <div key={cat}>
                    <p className="eyebrow text-clay">{categoryLabel(t, cat)}</p>
                    <ul className="mt-3">
                      {servicesByCategory(cat).map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => chooseService(s)}
                            className="group flex w-full items-baseline justify-between gap-4 border-b border-border py-4 text-left transition-colors hover:bg-cream/60"
                          >
                            <span className="text-base text-charcoal md:text-lg">
                              {s.name[lang]}
                            </span>
                            <span className="shrink-0 text-sm text-warmgrey transition-colors group-hover:text-clay">
                              {priceLabel(s.price)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === "duration" && service?.price.kind === "duration" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qDuration}</h2>
              <p className="eyebrow mt-4 text-warmgrey">{service.name[lang]}</p>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {service.price.options.map((o) => (
                  <Choice
                    key={o.minutes}
                    selected={minutes === o.minutes}
                    onClick={() => {
                      setMinutes(o.minutes);
                      go("people");
                    }}
                  >
                    <span>
                      {o.minutes} {t.services.minutes}
                    </span>
                    <span className="display text-2xl">{euro(o.amount)}</span>
                  </Choice>
                ))}
              </div>
              <Nav onBack={() => go("service")} t={t} />
            </section>
          )}

          {step === "people" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qPeople}</h2>
              <p className="mt-4 text-xs text-warmgrey">{t.book.peopleNote}</p>
              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PEOPLE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setPeople(n);
                      go("date");
                    }}
                    className={cn(
                      "flex min-h-28 flex-col items-center justify-center gap-1 border transition-colors",
                      people === n
                        ? "border-charcoal bg-charcoal text-ivory"
                        : "border-border text-charcoal hover:border-charcoal",
                    )}
                  >
                    <span className="display text-4xl leading-none md:text-5xl">{n}</span>
                    <span className="eyebrow text-[0.55rem] opacity-70">
                      {n === 1 ? t.book.person : t.book.people}
                    </span>
                  </button>
                ))}
              </div>
              {price !== null && people > 1 && (
                <p className="mt-6 text-sm text-warmgrey">
                  {t.book.perPerson} {euro(price)} · {t.book.total}{" "}
                  <span className="text-charcoal">{euro(price * people)}</span>
                </p>
              )}
              <Nav onBack={() => go(needsDuration ? "duration" : "service")} t={t} />
            </section>
          )}

          {step === "date" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qDate}</h2>
              <p className="mt-4 text-xs text-warmgrey">{t.book.demoNote}</p>
              <MonthCalendar
                value={date}
                onChange={(d) => {
                  setDate(d);
                  go("time");
                }}
              />
              <Nav onBack={() => go("people")} t={t} />
            </section>
          )}

          {step === "time" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qTime}</h2>
              <p className="mt-4 text-xs text-warmgrey">{t.book.demoNote}</p>
              {slotsLoading && (
                <p className="mt-8 text-sm text-warmgrey">{t.book.loadingSlots}</p>
              )}
              {!slotsLoading && slots?.length === 0 && (
                <p className="mt-8 text-sm text-charcoal">{t.book.noSlots}</p>
              )}
              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(slotsLoading ? [] : (slots ?? DEMO_SLOTS)).map((slot) => {
                  const end = addMinutes(slot, minutes);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTime(slot);
                        go("details");
                      }}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center gap-0.5 border text-base transition-colors",
                        time === slot
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-border text-charcoal hover:border-charcoal",
                      )}
                    >
                      <span>{slot}</span>
                      {end && <span className="text-[0.65rem] opacity-60">— {end}</span>}
                    </button>
                  );
                })}
              </div>
              <Nav onBack={() => go("date")} t={t} />
            </section>
          )}

          {step === "details" && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qDetails}</h2>
              <div className="mt-8 space-y-5">
                <Field
                  label={t.book.name}
                  value={details.name}
                  onChange={(v) => setDetails({ ...details, name: v })}
                  autoComplete="name"
                />
                <Field
                  label={t.book.phone}
                  value={details.phone}
                  onChange={(v) => setDetails({ ...details, phone: v })}
                  type="tel"
                  autoComplete="tel"
                />
                <label className="block">
                  <span className="eyebrow text-warmgrey">{t.book.notes}</span>
                  <textarea
                    rows={3}
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    className="mt-2 w-full border border-input bg-transparent px-4 py-3 text-base text-charcoal outline-none transition-colors focus:border-charcoal"
                  />
                </label>
              </div>
              {error && (
                <p className="mt-4 text-sm text-destructive">
                  {error === "phone" ? t.book.phoneError : t.book.required}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaButton variant="outline" onClick={() => go("time")}>
                  {t.book.back}
                </CtaButton>
                <CtaButton
                  onClick={() => {
                    if (!details.name.trim() || !details.phone.trim()) {
                      setError("required");
                      return;
                    }
                    if (!isValidPhone(details.phone)) {
                      setError("phone");
                      return;
                    }
                    setError(null);
                    go("summary");
                  }}
                >
                  {t.book.next}
                </CtaButton>
              </div>
            </section>
          )}

          {step === "summary" && service && (
            <section>
              <h2 className="display text-[clamp(2.25rem,6vw,3.75rem)]">{t.book.qSummary}</h2>
              <div className="mt-8 border border-border bg-cream/70 px-6 py-8 md:px-10 md:py-10">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-6">
                  <p className="display text-3xl leading-none">{BUSINESS.wordmark}</p>
                  {bookingId && <p className="eyebrow text-warmgrey">{bookingId}</p>}
                </div>
                <dl className="mt-8 space-y-4 text-sm">
                  <Row label={t.book.treatment} value={service.name[lang]} />
                  {minutes && (
                    <Row label={t.services.duration} value={`${minutes} ${t.services.minutes}`} />
                  )}
                  <Row label={t.book.labelPeople} value={peopleLabel(people)} />
                  <Row label={t.book.date} value={date ? formatDate(date, lang) : "—"} />
                  <Row
                    label={t.book.time}
                    value={time && minutes ? `${time}–${addMinutes(time, minutes)}` : (time ?? "—")}
                  />
                  <Row label={t.book.client} value={details.name} />
                  {people > 1 && price !== null && (
                    <Row label={t.book.perPerson} value={euro(price)} />
                  )}
                </dl>
                <div className="mt-8 flex items-baseline justify-between gap-6 border-t border-border pt-6">
                  <span className="eyebrow text-warmgrey">
                    {people > 1 ? t.book.total : t.book.price}
                  </span>
                  <span className="display text-4xl text-charcoal md:text-5xl">
                    {total !== null ? euro(total) : priceLabel(service.price)}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaButton onClick={confirm} disabled={sending}>
                  {sending ? t.book.sending : t.book.confirm}
                </CtaButton>
                <CtaButton variant="outline" onClick={() => go("details")} disabled={sending}>
                  {t.book.edit}
                </CtaButton>
              </div>
              {sendError && <p className="mt-4 text-sm text-destructive">{sendError}</p>}
            </section>
          )}

          {step === "done" && booking && (
            <section>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="block h-px w-full origin-left bg-clay"
              />
              <h2 className="display mt-8 text-[clamp(2.5rem,8vw,5rem)]">{t.book.done}</h2>
              <p className="body-copy mt-5 max-w-md">{t.book.doneLead}</p>

              <div className="mt-10 border-t border-border pt-8">
                <dl className="space-y-4 text-sm">
                  <Row label={t.book.treatment} value={booking.service_name} />
                  {booking.duration && (
                    <Row
                      label={t.services.duration}
                      value={`${booking.duration} ${t.services.minutes}`}
                    />
                  )}
                  <Row label={t.book.labelPeople} value={peopleLabel(booking.people)} />
                  <Row
                    label={t.book.date}
                    value={booking.date ? formatDate(booking.date, lang) : "—"}
                  />
                  <Row
                    label={t.book.time}
                    value={
                      booking.duration && booking.end_time
                        ? `${booking.start_time}–${booking.end_time}`
                        : (booking.start_time ?? "—")
                    }
                  />
                  <Row label={t.book.client} value={booking.customer_name} />
                  <Row
                    label={booking.people > 1 ? t.book.total : t.book.price}
                    value={booking.total !== null ? euro(booking.total) : "—"}
                  />
                  {bookingId && <Row label={t.book.reference} value={bookingId} />}
                </dl>
              </div>

              <div className="mt-8">
                <InstallApp />
              </div>
              <p className="mt-8 max-w-lg text-xs leading-relaxed text-warmgrey">
                {t.book.doneNote}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaAnchor
                  href={whatsappUrl(requestMessage(booking, bookingId ?? ""))}
                  variant="solid"
                >
                  {t.book.whatsappSend}
                </CtaAnchor>
                <CtaAnchor href={directionsUrl} variant="outline">
                  {t.location.directions}
                </CtaAnchor>
                <CtaButton variant="outline" onClick={reset}>
                  {t.book.newBooking}
                </CtaButton>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function stepTitle(t: { book: Record<string, unknown> }, step: Step) {
  const map: Record<Step, string> = {
    service: "qService",
    duration: "qDuration",
    people: "qPeople",
    date: "qDate",
    time: "qTime",
    details: "qDetails",
    summary: "qSummary",
    done: "done",
  };
  return String(t.book[map[step]] ?? "");
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-16 items-center justify-between border px-5 text-base transition-colors",
        selected
          ? "border-charcoal bg-charcoal text-ivory"
          : "border-border text-charcoal hover:border-charcoal",
      )}
    >
      {children}
    </button>
  );
}

function Nav({ onBack, t }: { onBack: () => void; t: { book: { back: string } } }) {
  return (
    <div className="mt-10">
      <CtaButton variant="outline" onClick={onBack}>
        {t.book.back}
      </CtaButton>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/70 pb-3">
      <dt className="eyebrow text-warmgrey">{label}</dt>
      <dd className="text-right text-base text-charcoal">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-warmgrey">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-14 w-full border border-input bg-transparent px-4 text-base text-charcoal outline-none transition-colors focus:border-charcoal"
      />
    </label>
  );
}

/** Accepts international and Spanish national formats, spaces and dashes. */
export function isValidPhone(raw: string) {
  const v = raw.replace(/[\s().-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(v);
}

function locale(lang: string) {
  return lang === "es" ? "es-ES" : lang === "de" ? "de-DE" : lang === "sv" ? "sv-SE" : "en-GB";
}

function formatDate(iso: string, lang: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(locale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatDateShort(iso: string, lang: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(locale(lang), { weekday: "short", day: "numeric", month: "short" });
}

function MonthCalendar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const { lang } = useI18n();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [offset, setOffset] = useState(0);
  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);

  const firstWeekday = (view.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const loc = locale(lang as Lang);

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1),
    ),
  ];

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: "short" }).slice(0, 2),
  );

  return (
    <div className="mt-8 border border-border p-4 md:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="←"
          className="eyebrow min-h-11 px-3 text-charcoal transition-opacity disabled:opacity-25"
        >
          ←
        </button>
        <span className="display text-2xl text-charcoal">
          {view.toLocaleDateString(loc, { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(3, o + 1))}
          aria-label="→"
          className="eyebrow min-h-11 px-3 text-charcoal"
        >
          →
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="eyebrow py-2 text-[0.55rem] text-warmgrey">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const past = d < today;
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onChange(iso)}
              className={cn(
                "relative flex aspect-square min-h-11 items-center justify-center text-sm transition-colors",
                past && "text-stone",
                !past && !selected && "text-charcoal hover:bg-cream",
                selected && "text-ivory",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="calendar-day"
                  transition={{ duration: 0.4, ease: EASE }}
                  className="absolute inset-0 bg-charcoal"
                />
              )}
              <span className="relative">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Provisional reference shown on the summary; the server issues the final one. */
function newBookingId() {
  return `GM-${Math.floor(Date.now() / 1000)}`;
}

