import { createFileRoute } from "@tanstack/react-router";
import { CtaLink } from "@/components/site/Cta";
import { categoryDesc, categoryLabel, useI18n } from "@/lib/i18n";
import { BUSINESS } from "@/lib/business";
import { CATEGORY_ORDER } from "@/lib/services";
import storefrontImg from "@/assets/storefront.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The studio · Gold Massage, S'Arenal" },
      {
        name: "description",
        content:
          "Gold Massage is a professional chiromassage and wellness studio in S'Arenal, Mallorca. By appointment only.",
      },
      { property: "og:title", content: "The studio · Gold Massage, S'Arenal" },
      {
        property: "og:description",
        content: "Independent massage and wellness service in Mallorca. Book online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="pb-32 pt-28 md:pt-36">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-5 md:grid-cols-2 md:gap-20 md:px-10">
        <div>
          <p className="eyebrow text-clay">
            {BUSINESS.city} · {BUSINESS.region}
          </p>
          <h1 className="display mt-4 text-[clamp(3rem,10vw,7rem)] uppercase">{t.about.title}</h1>
          <p className="body-copy mt-8 max-w-md text-lg">{t.about.body}</p>
          <p className="mt-6 text-sm text-warmgrey">{t.about.langs}</p>
          <ul className="mt-10 grid gap-2 text-sm text-charcoal">
            {CATEGORY_ORDER.map((id) => (
              <li key={id} className="flex justify-between gap-6 border-b border-border py-2">
                <span className="shrink-0">{categoryLabel(t, id)}</span>
                <span className="text-right text-warmgrey">{categoryDesc(t, id)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm italic text-warmgrey">{t.services.couples}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <CtaLink to="/book">{t.hero.book}</CtaLink>
            <CtaLink to="/services" variant="outline">
              {t.hero.explore}
            </CtaLink>
          </div>
        </div>

        <img
          src={storefrontImg}
          alt="The Gold Massage studio front on Carrer de Cannes, S'Arenal"
          loading="lazy"
          width={1600}
          height={1104}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
