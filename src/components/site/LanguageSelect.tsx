import { useEffect, useRef, useState } from "react";
import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSelect({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "eyebrow flex min-h-11 items-center gap-2 px-2",
          tone === "light" ? "text-ivory" : "text-charcoal",
        )}
      >
        {lang.toUpperCase()}
        <span
          className={cn("text-[0.6rem] transition-transform duration-300", open && "rotate-180")}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 border border-border bg-ivory py-2 shadow-[0_18px_60px_-24px_rgba(0,0,0,0.35)]"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm text-charcoal transition-colors hover:bg-cream",
                  l.code === lang && "text-clay",
                )}
              >
                {l.label}
                <span className="eyebrow text-[0.6rem] text-warmgrey">{l.code.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
