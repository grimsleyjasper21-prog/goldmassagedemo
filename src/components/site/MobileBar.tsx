import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { BUSINESS, whatsappUrl } from "@/lib/business";

export function MobileBar() {
  const { t } = useI18n();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ivory/95 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-stretch">
        <Link
          to="/book"
          className="eyebrow flex min-h-14 items-center justify-center bg-charcoal text-ivory"
        >
          {t.nav.book}
        </Link>
        <Link
          to="/services"
          className="eyebrow flex min-h-14 items-center justify-center border-l border-border px-4 text-charcoal"
        >
          {t.nav.services}
        </Link>
        <a
          href={`tel:${BUSINESS.phoneDial}`}
          aria-label={`${t.location.call} ${BUSINESS.phoneDisplay}`}
          className="flex min-h-14 w-14 items-center justify-center border-l border-border text-charcoal"
        >
          <Phone className="size-4" strokeWidth={1.5} />
        </a>
        <a
          href={whatsappUrl(t.location.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="flex min-h-14 w-14 items-center justify-center border-l border-border text-charcoal"
        >
          <MessageCircle className="size-4" strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}
