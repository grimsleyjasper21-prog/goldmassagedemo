import { createFileRoute } from "@tanstack/react-router";
import { ServiceMenu } from "@/components/site/ServiceMenu";
import { CtaLink } from "@/components/site/Cta";
import { useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Treatments & prices · Gold Massage, S'Arenal" },
      {
        name: "description",
        content:
          "Treatment menu at Gold Massage, S'Arenal: relaxing, therapeutic and aesthetic treatments — lomi lomi, deep tissue, sport, lymphatic drainage, wood therapy and more, with indicative durations and prices.",
      },
      { property: "og:title", content: "Treatments & prices · Gold Massage, S'Arenal" },
      {
        property: "og:description",
        content:
          "Relaxing, therapeutic and aesthetic treatments in S'Arenal — the full menu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();
  return (
    <div className="overflow-x-clip px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <header className="mx-auto max-w-[1600px] pb-12">
        <p className="eyebrow text-clay">
          {BUSINESS.city} · {BUSINESS.region}
        </p>
        <h1 className="display mt-4 text-[clamp(3rem,12vw,10rem)] uppercase">{t.services.title}</h1>
        <p className="body-copy mt-6 max-w-lg">{t.services.lead}</p>
      </header>

      <ServiceMenu />

      <div className="mx-auto mt-20 flex max-w-[1600px] flex-wrap gap-3">
        <CtaLink to="/book">{t.hero.book}</CtaLink>
      </div>
    </div>
  );
}
