import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { CtaAnchor, CtaLink } from "@/components/site/Cta";
import { LocationSection } from "@/components/site/LocationSection";
import { useI18n } from "@/lib/i18n";
import { BUSINESS, whatsappUrl } from "@/lib/business";
import { CATEGORY_ORDER, type CategoryId } from "@/lib/services";
import heroImg from "@/assets/hero.jpg";
import massageImg from "@/assets/massage.jpg";
import bookingImg from "@/assets/booking.jpg";
import silkImg from "@/assets/waxing.jpg";
import studioImg from "@/assets/studio.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Massage · Chiropractic & massage in S'Arenal, Mallorca" },
      {
        name: "description",
        content:
          "Professional chiropractic and massage studio in S'Arenal, Playa de Palma. By appointment only. Book online, confirmation by WhatsApp.",
      },
      { property: "og:title", content: "Gold Massage · Chiropractic & massage · S'Arenal, Mallorca" },
      {
        property: "og:description",
        content:
          "Chiropractic, deep tissue, relaxation and sports massage in S'Arenal, Mallorca. Book online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const CATEGORY_IMAGES: Record<CategoryId, string> = {
  quiro: massageImg,
  relax: heroImg,
  deporte: bookingImg,
  ritual: studioImg,
};

function Home() {
  const { t } = useI18n();

  // Only information supplied by the business is published here. No address and
  // no opening hours are asserted, because neither has been confirmed yet.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: BUSINESS.name,
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
      <TimeSequence />
      <PressureScene />
      <RecoveryScene />
      <MuscleScene />
      <LightScene />
      <CategoryScroll />
      <ServicesPortal />
      <Gallery />
      <StudioNote />
      <AskBlock />
      <LocationSection />
      <FinalScene />
      <span className="sr-only">
        {t.hero.eyebrow} — {BUSINESS.city}, {BUSINESS.region}
      </span>
    </>
  );
}

/* ---------------------------------------------------------------- HERO */

function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.42]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const imgOpacity = useTransform(scrollYProgress, [0.75, 1], [1, 0.25]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 2.6]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const titleOpacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);
  const supportOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const supportY = useTransform(scrollYProgress, [0, 0.28], [0, -40]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 grain h-screen overflow-hidden bg-charcoal">
        <motion.img
          src={heroImg}
          alt="Massage table dressed in linen in warm Mediterranean light"
          style={{ scale: imgScale, y: imgY, opacity: imgOpacity }}
          width={1600}
          height={1920}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/70" />

        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center text-ivory">
          <motion.p
            style={{ opacity: supportOpacity, y: supportY }}
            className="eyebrow text-ivory/80"
          >
            {t.hero.eyebrow}
          </motion.p>

          <motion.h1
            style={{ scale: titleScale, y: titleY, opacity: titleOpacity }}
            className="display mt-6 text-[clamp(3.25rem,15vw,10.5rem)] uppercase leading-[0.82]"
          >
            Gold
            <br />
            Massage
          </motion.h1>

          <motion.div
            style={{ opacity: supportOpacity, y: supportY }}
            className="mt-8 flex flex-col items-center"
          >
            <p className="eyebrow text-ivory/70">{t.hero.place}</p>
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

          <motion.span
            style={{ opacity: supportOpacity }}
            className="eyebrow absolute bottom-8 text-[0.6rem] text-ivory/50"
          >
            {t.hero.scroll}
          </motion.span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------- TIME / FOR / YOU. */

function word(progress: MotionValue<number>, start: number, end: number) {
  return {
    opacity: useTransform(progress, [start, start + 0.06, end - 0.06, end], [0, 1, 1, 0]),
    y: useTransform(progress, [start, end], ["18vh", "-18vh"]),
    scale: useTransform(progress, [start, end], [0.94, 1.06]),
  };
}

function TimeSequence() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 0.5, 0.5, 0.15]);

  const w1 = word(scrollYProgress, 0.02, 0.36);
  const w2 = word(scrollYProgress, 0.34, 0.66);
  const w3 = word(scrollYProgress, 0.64, 0.98);
  const copyOpacity = useTransform(scrollYProgress, [0.86, 0.96], [0, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-ivory">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.img
          src={silkImg}
          alt=""
          aria-hidden
          loading="lazy"
          style={{ scale: bgScale, opacity: bgOpacity }}
          className="absolute left-1/2 top-1/2 h-[62vh] w-[46vw] min-w-[300px] -translate-x-1/2 -translate-y-1/2 object-cover"
        />
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.span
            style={w1}
            className="display absolute text-[clamp(3rem,19vw,16rem)] uppercase text-charcoal"
          >
            {t.intro.word1}
          </motion.span>
          <motion.span
            style={w2}
            className="display absolute text-[clamp(3rem,19vw,16rem)] uppercase text-clay"
          >
            {t.intro.word2}
          </motion.span>
          <motion.span
            style={w3}
            className="display absolute text-[clamp(3rem,19vw,16rem)] uppercase text-charcoal"
          >
            {t.intro.word3}
          </motion.span>
        </div>
        <motion.p
          style={{ opacity: copyOpacity }}
          className="body-copy absolute bottom-16 mx-auto max-w-md px-6 text-center"
        >
          {t.intro.body} <span className="text-charcoal">{t.intro.languages}</span>
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ PRESSURE SCENE */

function PressureScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, [0, 1], [1.9, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const overlay = useTransform(scrollYProgress, [0, 1], [0.15, 0.55]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  const s1 = word(scrollYProgress, 0.08, 0.4);
  const s2 = word(scrollYProgress, 0.38, 0.68);
  const s3 = word(scrollYProgress, 0.66, 0.98);

  return (
    <section ref={ref} className="relative h-[280vh] bg-charcoal">
      <div className="sticky top-0 grain h-screen overflow-hidden">
        <motion.img
          src={massageImg}
          alt="Warm treatment oil poured over massage stones in low golden light"
          loading="lazy"
          style={{ scale, y: imgY }}
          width={1600}
          height={1100}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.div style={{ opacity: overlay }} className="absolute inset-0 bg-ink" />

        <motion.p
          style={{ opacity: labelOpacity }}
          className="eyebrow absolute left-5 top-24 text-ivory/70 md:left-10"
        >
          {t.cats.quiro}
        </motion.p>

        <div className="relative flex h-full items-center justify-center">
          <motion.span
            style={s1}
            className="display absolute text-[clamp(3.5rem,17vw,14rem)] uppercase text-ivory"
          >
            {t.scenes.touch}
          </motion.span>
          <motion.span
            style={s2}
            className="display absolute text-[clamp(3.5rem,17vw,14rem)] uppercase text-ivory"
          >
            {t.scenes.pressure}
          </motion.span>
          <motion.span
            style={s3}
            className="display absolute text-[clamp(3.5rem,17vw,14rem)] uppercase text-ivory"
          >
            {t.scenes.relax}
          </motion.span>
        </div>

        <div className="absolute inset-x-5 bottom-10 flex flex-wrap items-end justify-between gap-6 md:inset-x-10">
          <p className="max-w-xs text-sm text-ivory/70">{t.cats.quiroDesc}</p>
          <Link to="/services" hash="quiro" className="eyebrow text-ivory line-hover">
            {t.cats.view}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ RECOVERY SCENE */

function RecoveryScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const inset = useTransform(scrollYProgress, [0, 0.7], [26, 0]);
  const clip = useTransform(inset, (v) => `inset(${v}% ${v * 1.4}% ${v}% ${v * 1.4}%)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1.02]);
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.35, 1], [60, -40]);

  return (
    <section ref={ref} className="relative h-[240vh] bg-cream">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <motion.img
            src={bookingImg}
            alt="Candlelit treatment room with a made-up massage table"
            loading="lazy"
            style={{ scale }}
            width={1600}
            height={1200}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative px-5 text-center mix-blend-difference"
        >
          <h2 className="display text-[clamp(3rem,14vw,11rem)] uppercase text-ivory">
            {t.scenes.glow}
            <br />
            {t.scenes.glowStart}
          </h2>
        </motion.div>
        <div className="absolute inset-x-5 bottom-10 flex flex-wrap items-end justify-between gap-6 md:inset-x-10">
          <p className="eyebrow text-ivory/80">{t.cats.relax}</p>
          <Link to="/services" hash="relax" className="eyebrow text-ivory line-hover">
            {t.cats.view}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- MUSCLE SCENE */

function MuscleScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const imgX = useTransform(scrollYProgress, [0, 1], ["-14%", "10%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const secondX = useTransform(scrollYProgress, [0.35, 1], ["60%", "6%"]);
  const textX = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);

  return (
    <section ref={ref} className="relative h-[240vh] bg-ivory">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.img
          src={studioImg}
          alt="Folded towels, treatment oil and an olive branch in afternoon light"
          loading="lazy"
          style={{ x: imgX, scale: imgScale }}
          width={1600}
          height={1104}
          className="absolute left-0 top-1/2 h-[58vh] w-[72vw] -translate-y-1/2 object-cover"
        />
        <motion.img
          src={heroImg}
          alt=""
          aria-hidden
          loading="lazy"
          style={{ x: secondX }}
          className="absolute right-0 top-[58%] hidden h-[34vh] w-[26vw] object-cover md:block"
        />
        <motion.h2
          style={{ x: textX }}
          className="display relative w-full whitespace-nowrap px-5 text-center text-[clamp(2.5rem,12vw,11rem)] uppercase text-charcoal mix-blend-multiply"
        >
          {t.scenes.detail} {t.scenes.detailMatters}
        </motion.h2>
        <div className="absolute inset-x-5 bottom-10 flex flex-wrap items-end justify-between gap-6 md:inset-x-10">
          <p className="eyebrow text-charcoal">{t.cats.deporte}</p>
          <Link to="/services" hash="deporte" className="eyebrow text-charcoal line-hover">
            {t.cats.view}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- LIGHT SCENE */

function LightScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="grid items-center gap-10 bg-cream px-5 py-28 md:grid-cols-2 md:px-10 md:py-40"
    >
      <div className="h-[60vh] overflow-hidden">
        <motion.img
          src={silkImg}
          alt="Soft ivory silk folds on warm stone"
          loading="lazy"
          style={{ y }}
          width={1408}
          height={1760}
          className="h-[76vh] w-full object-cover"
        />
      </div>
      <div>
        <p className="eyebrow text-clay">{t.cats.ritual}</p>
        <h2 className="display mt-5 text-[clamp(3rem,10vw,7.5rem)] uppercase">
          {t.scenes.clean}
          <br />
          <span className="text-warmgrey">{t.scenes.cleanSmooth}</span>
        </h2>
        <p className="body-copy mt-6 max-w-sm">{t.cats.ritualDesc}</p>
        <div className="mt-8">
          <CtaLink to="/services" variant="outline">
            {t.cats.view}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- HORIZONTAL CATEGORY */

function CategoryScroll() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-76%"]);
  const imgX = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section ref={ref} className="relative h-[320vh] bg-charcoal">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-6 pl-6 md:gap-10 md:pl-10">
          {CATEGORY_ORDER.map((cat, i) => (
            <article
              key={cat}
              className="relative h-[70vh] w-[82vw] shrink-0 overflow-hidden md:w-[46vw]"
              style={{ marginTop: i % 2 === 0 ? 0 : "8vh" }}
            >
              <motion.img
                src={CATEGORY_IMAGES[cat]}
                alt=""
                aria-hidden
                loading="lazy"
                style={{ x: imgX }}
                className="absolute inset-0 h-full w-[110%] object-cover"
              />
              <div className="absolute inset-0 bg-ink/35" />
              <div className="relative flex h-full flex-col justify-end p-6 text-ivory md:p-10">
                <h3 className="display text-[clamp(2.5rem,7vw,5.5rem)] uppercase">{t.cats[cat]}</h3>
                <p className="mt-3 max-w-xs text-sm text-ivory/75">
                  {t.cats[`${cat}Desc` as const]}
                </p>
                <Link
                  to="/services"
                  hash={cat}
                  className="eyebrow mt-6 w-fit text-ivory line-hover"
                >
                  {t.cats.view}
                </Link>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- SERVICES PORTAL */

function ServicesPortal() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 6]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.1, 0.4], [1, 0]);

  return (
    <section ref={ref} className="relative h-[220vh] bg-ivory">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.h2
          style={{ scale, opacity }}
          className="display whitespace-nowrap text-[clamp(3.5rem,15vw,13rem)] uppercase text-charcoal"
        >
          {t.services.title}
        </motion.h2>
        <motion.div style={{ opacity: ctaOpacity }} className="absolute bottom-16">
          <CtaLink to="/services">{t.hero.explore}</CtaLink>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- GALLERY */

function Gallery() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["6%", "-10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-6%", "12%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["10%", "-6%"]);

  return (
    <section ref={ref} className="bg-ivory px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="display text-[clamp(2.75rem,9vw,7rem)] uppercase">
          {t.gallery.title}
          <br />
          <span className="text-warmgrey">{t.gallery.titleTwo}</span>
        </h2>

        <div className="mt-16 grid grid-cols-12 gap-4 md:gap-8">
          <motion.img
            src={studioImg}
            alt="Folded towels and a bowl of treatment oil in warm afternoon light"
            loading="lazy"
            style={{ y: y1 }}
            className="col-span-12 h-[52vh] object-cover md:col-span-7"
          />
          <motion.img
            src={silkImg}
            alt="Ivory silk folds catching low side light"
            loading="lazy"
            style={{ y: y2 }}
            className="col-span-7 mt-10 h-[40vh] object-cover md:col-span-4 md:mt-24 md:h-[56vh]"
          />
          <motion.img
            src={massageImg}
            alt="Treatment oil and warm stones on dark slate"
            loading="lazy"
            style={{ y: y3 }}
            className="col-span-12 h-[46vh] object-cover md:col-span-8 md:col-start-4"
          />
        </div>
        <p className="mt-8 text-xs text-warmgrey">{t.gallery.note}</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- STUDIO NOTE */

function StudioNote() {
  const { t } = useI18n();
  return (
    <section className="border-t border-border bg-cream px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-[1fr_1.2fr]">
        <h2 className="display text-[clamp(2.5rem,7vw,5rem)] uppercase">{t.about.title}</h2>
        <div>
          <p className="text-xl leading-relaxed text-charcoal md:text-2xl">{t.about.body}</p>
          <p className="mt-6 text-sm text-warmgrey">{t.about.langs}</p>
          <p className="mt-6 text-sm italic text-warmgrey">{t.services.couples}</p>
          <div className="mt-10">
            <CtaLink to="/about" variant="outline">
              {t.nav.about}
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- ASK BLOCK */

function AskBlock() {
  const { t } = useI18n();
  return (
    <section className="bg-ivory px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="display text-[clamp(2.75rem,9vw,7rem)] uppercase">
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
      </div>
    </section>
  );
}

/* --------------------------------------------------------- FINAL SCENE */

function FinalScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const bigScale = useTransform(scrollYProgress, [0, 0.55], [1, 3.2]);
  const bigOpacity = useTransform(scrollYProgress, [0, 0.15, 0.5], [0.9, 1, 0]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.5, 0.8], [40, 0]);

  return (
    <section ref={ref} className="relative h-[260vh] bg-charcoal">
      <div className="sticky top-0 grain flex h-screen items-center justify-center overflow-hidden">
        <motion.img
          src={heroImg}
          alt=""
          aria-hidden
          loading="lazy"
          style={{ opacity: imgOpacity }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.h2
          style={{ scale: bigScale, opacity: bigOpacity }}
          className="display absolute whitespace-nowrap text-center text-[clamp(2rem,9vw,7.5rem)] uppercase leading-[0.9] text-ivory"
        >
          Gold
          <br />
          Massage
        </motion.h2>

        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="relative flex flex-col items-center px-5 text-center text-ivory"
        >
          <h3 className="display text-[clamp(3rem,12vw,9rem)] uppercase">
            {t.final.title}
            <br />
            {t.final.titleTwo}
          </h3>
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
        </motion.div>
      </div>
    </section>
  );
}
