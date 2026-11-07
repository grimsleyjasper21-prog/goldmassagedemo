import { BUSINESS, directionsUrl, mapEmbedUrl, whatsappUrl } from "@/lib/business";
import { useI18n } from "@/lib/i18n";
import { CtaAnchor } from "./Cta";

/**
 * Contact block.
 *
 * The address and the appointment-only policy are researched facts. No
 * telephone number is shown: public listings carry two conflicting numbers
 * for this address, so contact runs through WhatsApp until the studio
 * confirms which is current. No opening hours are asserted either — none are
 * published anywhere.
 */
export function LocationSection() {
  const { t } = useI18n();
  return (
    <section className="border-t border-border bg-ivory px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1600px] gap-14 md:grid-cols-2 md:gap-20">
        <div>
          <h2 className="display text-[clamp(2.75rem,8vw,6rem)] uppercase">
            {t.location.title}
            <br />
            <span className="text-warmgrey">{t.location.titleTwo}</span>
          </h2>

          <address className="mt-10 not-italic text-lg leading-relaxed text-charcoal">
            {BUSINESS.street}
            <br />
            {BUSINESS.postal} {BUSINESS.city}
            <br />
            {BUSINESS.region}
          </address>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-warmgrey">
            {t.location.accessNote}
          </p>

          <div className="mt-8 border-t border-border pt-6">
            <p className="eyebrow text-clay">{t.location.openEvery}</p>
            <p className="display mt-2 text-4xl">{t.location.byAppointment}</p>
            <ul className="mt-6 grid gap-1 text-sm text-warmgrey sm:grid-cols-2">
              {t.location.days.map((d) => (
                <li key={d} className="flex justify-between gap-4 border-b border-border/60 py-1">
                  <span>{d}</span>
                  <span>{t.location.byAppointment}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 max-w-sm text-xs leading-relaxed text-warmgrey">
              {t.location.availabilityNote}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <CtaAnchor href={whatsappUrl(t.location.whatsappMessage)} variant="solid">
              {t.location.whatsapp}
            </CtaAnchor>
            <CtaAnchor href={directionsUrl} variant="outline">
              {t.location.directions}
            </CtaAnchor>
          </div>
        </div>

        <div className="h-[420px] w-full overflow-hidden bg-cream md:h-full md:min-h-[540px]">
          <iframe
            title={`${BUSINESS.name} — ${BUSINESS.city}`}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full grayscale-[0.35] contrast-[1.05]"
          />
        </div>
      </div>
    </section>
  );
}
