import { Link } from "@tanstack/react-router";
import { LanguageSelect } from "./LanguageSelect";
import { InstallApp } from "./InstallApp";
import { useI18n } from "@/lib/i18n";
import { BUSINESS, DEMO_DISCLAIMER, directionsUrl, whatsappUrl } from "@/lib/business";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-charcoal px-5 pb-28 pt-20 text-ivory md:px-10 md:pb-16">
      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display text-4xl md:text-5xl">{BUSINESS.wordmark}</p>
          <p className="eyebrow mt-3 text-ivory/50">{t.hero.eyebrow}</p>
        </div>

        <address className="not-italic text-sm leading-relaxed text-ivory/70">
          {BUSINESS.street}
          <br />
          {BUSINESS.postal} {BUSINESS.city}
          <br />
          {BUSINESS.region}
          <br />
          <span className="mt-4 block text-ivory/50">{t.location.byAppointment}</span>
        </address>

        <div className="flex flex-col items-start gap-3">
          <Link to="/services" className="text-sm text-ivory/70 line-hover">
            {t.footer.services}
          </Link>
          <Link to="/book" className="text-sm text-ivory/70 line-hover">
            {t.footer.book}
          </Link>
          <a
            href={whatsappUrl(t.location.whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ivory/70 line-hover"
          >
            {t.footer.whatsapp}
          </a>
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="text-sm text-ivory/70 line-hover">
            {t.footer.directions}
          </a>
          <InstallApp tone="light" />
          <div className="mt-2 -ml-2">
            <LanguageSelect tone="light" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-[1600px] border-t border-ivory/10 pt-6">
        <p className="max-w-2xl text-xs leading-relaxed text-ivory/40">{DEMO_DISCLAIMER}</p>
        <p className="mt-4 text-xs text-ivory/30">
          © {new Date().getFullYear()} {BUSINESS.name}
        </p>
      </div>
    </footer>
  );
}
