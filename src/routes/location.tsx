import { createFileRoute } from "@tanstack/react-router";
import { LocationSection } from "@/components/site/LocationSection";
import { useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Contact · Gold Massage, S'Arenal" },
      {
        name: "description",
        content:
          "Gold Massage, Carrer de Cannes 27, Local 3, S'Arenal. By appointment only — message on WhatsApp or book online.",
      },
      { property: "og:title", content: "Contact · Gold Massage, S'Arenal" },
      {
        property: "og:description",
        content: "Massage and wellness in Mallorca, by appointment. Call or message on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  const { t } = useI18n();
  return (
    <div className="pb-24 pt-28 md:pt-36">
      <header className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow text-clay">
          {BUSINESS.city} · {BUSINESS.region}
        </p>
        <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)] uppercase">{t.nav.location}</h1>
      </header>
      <LocationSection />
    </div>
  );
}
