import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CtaAnchor, CtaLink } from "@/components/site/Cta";
import { InstallApp } from "@/components/site/InstallApp";
import { LocationSection } from "@/components/site/LocationSection";
import { categoryDesc, categoryLabel, useI18n } from "@/lib/i18n";
import { BUSINESS, whatsappUrl } from "@/lib/business";
import { CATEGORY_ORDER, type CategoryId } from "@/lib/services";
import roomImg from "@/assets/room.jpg";
import treatmentImg from "@/assets/treatment.jpg";
import teamImg from "@/assets/team.jpg";
import storefrontImg from "@/assets/storefront.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Massage · Chiromassage & wellness in S'Arenal, Mallorca" },
      {
        name: "description",
        content:
          "Professional chiromassage and wellness studio in S'Arenal, Playa de Palma. By appointment only. Book online, confirmation by WhatsApp.",
      },
      {
        property: "og:title",
        content: "Gold Massage · Chiromassage & wellness · S'Arenal, Mallorca",
      },
      {
        property: "og:description",
        content:
          "Lomi lomi, deep tissue, sport, lymphatic drainage and wood therapy in S'Arenal, Mallorca. Book online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const CATEGORY_IMAGES: Record<CategoryId, string> = {
  relax: roomImg,
  terapeutico: treatmentImg,
  estetico: teamImg,
};

/**
 * The one piece of motion left on the page: content settles in as it comes
 * into view, once. No sticky sections, no parallax, no scroll hijacking —
 * the page scrolls at the speed the visitor expects.
 *
 * `motion` honours prefers-reduced-motion for transform and opacity, so a
 * visitor who asks for less motion simply sees the content.
 */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  const { t } = useI18n();

  // Only researched information is published here. Telephone and address come
  // from the studio's own signage; no opening hours are asserted because none
  // are published.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: BUSINESS.name,
    telephone: BUSINESS.phoneDial,
    areaServed: { "@type": "Place", name: `${BUSINESS.city}, ${BUSINESS.region}` },
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      postalCode: BUSINESS.postal,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    availableLanguage: ["es", "en", "de", "sv"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <Intro />
      <Categories />
      <Feature />
      <Gallery />
      <AppBand />
      <AskBlock />
      <LocationSection />
      <FinalCta />
      <span className="sr-only">
        {t.hero.eyebrow} — {BUSINESS.city}, {BUSINESS.region}
      </span>
    </>
  );
}

/* ---------------------------------------------------------------- HERO */

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-charcoal md:h-screen">
      <img
        src={roomImg}
        alt="Treatment room at Gold Massage with two massage tables"
        width={1100}
        height={1100}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/70" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative flex h-full flex-col items-center justify-center px-5 text-center text-ivory"
      >
        <p className="eyebrow text-ivory/80">{t.hero.eyebrow}</p>
        <h1 className="display mt-6 text-[clamp(3.25rem,15vw,10.5rem)] uppercase leading-[0.82]">
          Gold
          <br />
          Massage
        </h1>
        <p className="eyebrow mt-8 text-ivory/70">{t.hero.place}</p>
        <p className="mt-6 max-w-sm text-lg text-ivory/90">{t.hero.tagline}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CtaLink to="/book" variant="light">
            {t.hero.book}
          </CtaLink>
          <CtaLink to="/services" variant="ghostLight">
            {t.hero.explore}
          </CtaLink>
        </div>
      </motion.div>
    </section>
  );
}

/* --------------------------------------------------------------- INTRO */

function Intro() {
  const { t } = useI18n();
  return (
    <section className="bg-ivory px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <Reveal>
          <h2 className="display text-[clamp(2.75rem,9vw,7rem)] uppercase leading-[0.92]">
            {t.intro.word1}
            <br />
            <span className="text-clay">{t.intro.word2}</span>{" "}
            <span className="text-warmgrey">{t.intro.word3}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="self-end">
          <p className="text-xl leading-relaxed text-charcoal md:text-2xl">{t.intro.body}</p>
          <p className="mt-6 text-sm text-warmgrey">{t.intro.languages}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- CATEGORIES */

function Categories() {
  const { t } = useI18n();
  return (
    <section className="border-t border-border bg-cream px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <h2 className="display text-[clamp(2.5rem,7vw,5rem)] uppercase">{t.services.title}</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {CATEGORY_ORDER.map((cat, i) => (
            <Reveal key={cat} delay={i * 0.06}>
              <Link to="/services" hash={cat} className="group block">
                <div className="aspect-[4/3] overflow-hidden bg-ivory">
                  <img
                    src={CATEGORY_IMAGES[cat]}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="display mt-5 text-2xl uppercase text-charcoal md:text-3xl">
                  {categoryLabel(t, cat)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-warmgrey">
                  {categoryDesc(t, cat)}
                </p>
                <span className="eyebrow mt-4 inline-block text-clay line-hover">
                  {t.cats.view}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- FEATURE */

function Feature() {
  const { t } = useI18n();
  return (
    <section className="grid items-center gap-10 bg-ivory px-5 py-24 md:grid-cols-2 md:gap-16 md:px-10 md:py-32">
      <Reveal className="h-[48vh] min-h-[300px] overflow-hidden md:h-[62vh]">
        <img
          src={teamImg}
          alt="The Gold Massage team at the studio"
          loading="lazy"
          width={849}
          height={500}
          className="h-full w-full object-cover"
        />
      </Reveal>
      <Reveal delay={0.08}>
        <p className="eyebrow text-clay">{t.hero.place}</p>
        <h2 className="display mt-5 text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.95]">
          {t.about.title}
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal md:text-xl">
          {t.about.body}
        </p>
        <p className="mt-6 text-sm text-warmgrey">{t.about.langs}</p>
        <p className="mt-4 text-sm italic text-warmgrey">{t.services.couples}</p>
        <div className="mt-8">
          <CtaLink to="/about" variant="outline">
            {t.nav.about}
          </CtaLink>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- GALLERY */

function Gallery() {
  const { t } = useI18n();
  return (
    <section className="border-t border-border bg-ivory px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <h2 className="display text-[clamp(2.5rem,7vw,5rem)] uppercase">
            {t.gallery.title} <span className="text-warmgrey">{t.gallery.titleTwo}</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-12 gap-4 md:gap-6">
          <Reveal className="col-span-12 md:col-span-7">
            <img
              src={treatmentImg}
              alt="A treatment in progress at Gold Massage"
              loading="lazy"
              className="h-[42vh] w-full object-cover md:h-[52vh]"
            />
          </Reveal>
          <Reveal delay={0.06} className="col-span-12 md:col-span-5">
            <img
              src={storefrontImg}
              alt="The Gold Massage studio front on Carrer de Cannes"
              loading="lazy"
              className="h-[42vh] w-full object-cover md:h-[52vh]"
            />
          </Reveal>
          <Reveal delay={0.12} className="col-span-12">
            <img
              src={roomImg}
              alt="Treatment room at Gold Massage"
              loading="lazy"
              className="h-[38vh] w-full object-cover md:h-[46vh]"
            />
          </Reveal>
        </div>
        <p className="mt-8 max-w-xl text-xs leading-relaxed text-warmgrey">{t.gallery.note}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ APP BAND */

function AppBand() {
  const { t } = useI18n();
  return (
    <section className="border-y border-border bg-charcoal px-5 py-20 text-ivory md:px-10 md:py-24">
      <Reveal className="mx-auto flex max-w-[1600px] flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow text-ivory/50">{t.pwa.installed ? "App" : "App"}</p>
          <h2 className="display mt-4 text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95]">
            {t.pwa.addTitle}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/70">{t.pwa.addLead}</p>
        </div>
        <InstallApp variant="button" tone="light" className="shrink-0" />
      </Reveal>
    </section>
  );
}

/* ----------------------------------------------------------- ASK BLOCK */

function AskBlock() {
  const { t } = useI18n();
  return (
    <section className="bg-ivory px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <h2 className="display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.95]">
            {t.reviews.title}
            <br />
            <span className="text-warmgrey">{t.reviews.titleTwo}</span>
          </h2>
          <p className="body-copy mt-8 max-w-md">{t.reviews.body}</p>
          <div className="mt-10">
            <CtaAnchor href={whatsappUrl(t.location.whatsappMessage)} variant="outline">
              {t.reviews.cta}
            </CtaAnchor>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- FINAL CTA */

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-charcoal px-5 py-28 md:px-10 md:py-40">
      <img
        src={roomImg}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <Reveal className="relative mx-auto flex max-w-[1600px] flex-col items-center text-center text-ivory">
        <h2 className="display text-[clamp(2.75rem,10vw,8rem)] uppercase leading-[0.9]">
          {t.final.title}
          <br />
          {t.final.titleTwo}
        </h2>
        <p className="eyebrow mt-8 text-ivory/60">
          {BUSINESS.city} · {BUSINESS.region}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <CtaLink to="/book" variant="light">
            {t.final.book}
          </CtaLink>
          <CtaLink to="/services" variant="ghostLight">
            {t.final.services}
          </CtaLink>
        </div>
      </Reveal>
    </section>
  );
}
