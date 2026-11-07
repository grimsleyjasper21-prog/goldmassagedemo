import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { BookingFlow } from "@/components/site/BookingFlow";
import { useI18n } from "@/lib/i18n";
import bookingImg from "@/assets/booking.jpg";

type BookSearch = { service?: string | undefined; minutes?: number | undefined };

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    service: typeof search["service"] === "string" ? (search["service"] as string) : undefined,
    minutes: search["minutes"] ? Number(search["minutes"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book an appointment · Gold Massage, S'Arenal" },
      {
        name: "description",
        content:
          "Book at Gold Massage in S'Arenal: choose the treatment, duration, how many people, and your day and time.",
      },
      { property: "og:title", content: "Book an appointment · Gold Massage" },
      {
        property: "og:description",
        content: "Choose your treatment, duration, day and time. Confirmed by WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { t } = useI18n();
  const { service, minutes } = Route.useSearch();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-28%"]);

  return (
    <>
      <div ref={heroRef} className="relative h-[80vh] overflow-hidden bg-charcoal md:h-screen">
        <motion.img
          src={bookingImg}
          alt=""
          style={{ scale, filter }}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          width={1600}
          height={1200}
        />
        <motion.div
          style={{ y }}
          className="relative flex h-full flex-col justify-end px-5 pb-16 text-ivory md:px-10 md:pb-24"
        >
          <h1 className="display text-[clamp(3.25rem,12vw,10rem)] uppercase">
            {t.book.title}
            <br />
            <span className="text-ivory/60">{t.book.titleTwo}</span>
          </h1>
          <p className="eyebrow mt-6 text-ivory/70">{t.book.lead}</p>
        </motion.div>
      </div>

      <div className="bg-ivory px-5 py-24 pb-40 md:px-10 md:py-32">
        <BookingFlow
          initialServiceId={service ?? undefined}
          initialMinutes={minutes ?? undefined}
        />
      </div>
    </>
  );
}
