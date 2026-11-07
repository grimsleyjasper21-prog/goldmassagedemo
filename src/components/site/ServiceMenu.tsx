import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CATEGORY_ORDER,
  euro,
  priceLabel,
  servicesByCategory,
  type CategoryId,
  type Service,
} from "@/lib/services";
import { categoryDesc, categoryLabel, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CtaLink } from "./Cta";

export function ServiceMenu() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState<CategoryId>("relax");
  const [openService, setOpenService] = useState<Service | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as CategoryId);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.01, 0.25, 0.5] },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: CategoryId) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <div className="sticky top-[68px] z-30 -mx-5 mb-14 border-y border-border bg-ivory/95 backdrop-blur-md md:top-[76px] md:mx-0">
        <div className="no-scrollbar mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-5 md:px-0">
          {CATEGORY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className={cn(
                "eyebrow relative min-h-14 whitespace-nowrap px-5 transition-colors",
                active === id ? "text-charcoal" : "text-warmgrey",
              )}
            >
              {categoryLabel(t, id)}
              {active === id && (
                <motion.span
                  layoutId="cat-underline"
                  className="absolute inset-x-3 bottom-3 h-px bg-clay"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px]">
        {CATEGORY_ORDER.map((id) => (
          <section
            key={id}
            id={id}
            ref={(el) => {
              sectionRefs.current[id] = el;
            }}
            className="scroll-mt-40 border-t border-border py-14 first:border-t-0 md:py-20"
          >
            <div className="grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16">
              <div className="min-w-0 md:sticky md:top-52 md:self-start">
                {/* Sized so the longest label in any language ("Terapéutico",
                    11 characters) still fits the 22rem column — at 7vw it ran
                    straight over the service list on wide screens. */}
                <h2 className="display overflow-hidden text-[clamp(1.875rem,3vw,2.625rem)] uppercase">
                  {categoryLabel(t, id)}
                </h2>
                <p className="body-copy mt-4 max-w-sm text-sm">{categoryDesc(t, id)}</p>
              </div>

              <ul>
                {servicesByCategory(id).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setOpenService(s)}
                      className="group flex w-full items-baseline gap-4 border-b border-border py-6 text-left transition-colors hover:bg-cream/50"
                    >
                      <span className="flex-1">
                        <span className="block text-lg text-charcoal md:text-xl">
                          {s.name[lang]}
                        </span>
                        {s.price.kind === "duration" && (
                          <span className="mt-1 block text-xs text-warmgrey">
                            {s.price.options
                              .map((o) => `${o.minutes} ${t.services.minutes}`)
                              .join(" · ")}
                          </span>
                        )}
                        {s.price.kind === "range" && (
                          <span className="mt-1 block text-xs text-warmgrey">
                            {t.services.priceNote}
                          </span>
                        )}
                      </span>
                      <span className="display shrink-0 text-2xl text-charcoal md:text-3xl">
                        {priceLabel(s.price)}
                      </span>
                      <span className="eyebrow hidden shrink-0 text-warmgrey transition-colors group-hover:text-clay md:block">
                        {t.services.book}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-14 max-w-[1600px] text-sm italic text-warmgrey">
        {t.services.couples}
      </p>

      <AnimatePresence>
        {openService && <ServicePanel service={openService} onClose={() => setOpenService(null)} />}
      </AnimatePresence>
    </>
  );
}

function ServicePanel({ service, onClose }: { service: Service; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [minutes, setMinutes] = useState<number | null>(
    service.price.kind === "duration" ? service.price.options[1]!.minutes : null,
  );

  const selected =
    service.price.kind === "duration"
      ? service.price.options.find((o) => o.minutes === minutes)
      : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.button
        type="button"
        aria-label={t.nav.close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-full w-full max-w-md flex-col bg-ivory px-6 py-6 md:px-10 md:py-10"
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow text-warmgrey">{t.services.detailsTitle}</span>
          <button type="button" onClick={onClose} className="eyebrow min-h-11 px-2 text-charcoal">
            {t.nav.close}
          </button>
        </div>

        <h3 className="display mt-12 text-[clamp(2.5rem,9vw,3.75rem)] text-charcoal">
          {service.name[lang]}
        </h3>
        <p className="eyebrow mt-4 text-warmgrey">{categoryLabel(t, service.category)}</p>

        {service.price.kind === "duration" ? (
          <div className="mt-10">
            <p className="eyebrow text-warmgrey">{t.services.chooseDuration}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {service.price.options.map((o) => (
                <button
                  key={o.minutes}
                  type="button"
                  onClick={() => setMinutes(o.minutes)}
                  className={cn(
                    "flex min-h-14 items-center justify-between border px-4 text-sm transition-colors",
                    minutes === o.minutes
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-border text-charcoal hover:border-charcoal",
                  )}
                >
                  <span>
                    {o.minutes} {t.services.minutes}
                  </span>
                  <span>{euro(o.amount)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-10 text-sm text-warmgrey">{t.services.noDuration}</p>
        )}

        <div className="mt-10 flex items-end justify-between border-t border-border pt-6">
          <span className="eyebrow text-warmgrey">{t.book.price}</span>
          <span className="display text-5xl text-charcoal">
            {selected ? euro(selected.amount) : priceLabel(service.price)}
          </span>
        </div>
        {service.price.kind === "range" && (
          <p className="mt-3 text-xs leading-relaxed text-warmgrey">{t.services.priceNote}</p>
        )}

        <div className="mt-auto pt-10">
          <CtaLink
            to="/book"
            className="w-full"
            search={{ service: service.id, minutes: minutes ?? undefined }}
          >
            {t.services.bookThis}
          </CtaLink>
        </div>
      </motion.aside>
    </div>
  );
}
