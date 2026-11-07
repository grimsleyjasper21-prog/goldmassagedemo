import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LanguageSelect } from "./LanguageSelect";
import { InstallApp } from "./InstallApp";
import { useI18n } from "@/lib/i18n";
import { BUSINESS, whatsappUrl } from "@/lib/business";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Routes whose first screen is a full-bleed dark image: the header has to
  // stay in its light treatment until the page scrolls under it.
  const overHero = pathname === "/" || pathname === "/book";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const light = overHero && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-700",
          scrolled ? "bg-ivory/92 backdrop-blur-md border-b border-border" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <Link
            to="/"
            className={cn(
              "display text-xl leading-none tracking-[0.02em] transition-colors duration-500 md:text-[1.5rem]",
              light ? "text-ivory" : "text-charcoal",
            )}
          >
            {BUSINESS.wordmark}
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {[
              { to: "/services", label: t.nav.services },
              { to: "/about", label: t.nav.about },
              { to: "/location", label: t.nav.location },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "eyebrow line-hover transition-colors duration-500",
                  light ? "text-ivory/90" : "text-charcoal",
                )}
              >
                {item.label}
              </Link>
            ))}
            <LanguageSelect tone={light ? "light" : "dark"} />
            <InstallApp tone={light ? "light" : "dark"} />
            <Link
              to="/book"
              className={cn(
                "eyebrow px-6 py-3 transition-colors duration-500",
                light
                  ? "bg-ivory text-charcoal hover:bg-cream"
                  : "bg-charcoal text-ivory hover:bg-ink",
              )}
            >
              {t.nav.book}
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <LanguageSelect tone={light ? "light" : "dark"} />
            <button
              type="button"
              onClick={() => setMenu(true)}
              className={cn("eyebrow min-h-11 px-3", light ? "text-ivory" : "text-charcoal")}
            >
              {t.nav.menu}
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-charcoal px-6 py-6 text-ivory md:hidden">
          <div className="flex items-center justify-between">
            <span className="display text-2xl">{BUSINESS.wordmark}</span>
            <button type="button" onClick={() => setMenu(false)} className="eyebrow min-h-11 px-2">
              {t.nav.close}
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-6">
            {[
              { to: "/services", label: t.nav.services },
              { to: "/about", label: t.nav.about },
              { to: "/location", label: t.nav.location },
              { to: "/book", label: t.nav.book },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="display text-5xl text-ivory">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-ivory/15 pt-6">
            <InstallApp variant="button" tone="light" className="w-full" />
            <a
              href={whatsappUrl(t.location.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="eyebrow py-2 text-ivory/80"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
