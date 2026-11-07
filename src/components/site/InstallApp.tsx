import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type InstallEvent = Event & { prompt: () => Promise<void> };

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type Platform = "ios" | "android" | "desktop";

function detect(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (ios) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/**
 * Install action.
 *
 * Always visible until the app is actually installed. Chrome and Edge get the
 * native prompt; everything else gets the right manual instructions for its
 * platform. It previously hid itself whenever no native prompt was available,
 * which meant the feature was invisible on exactly the devices that need the
 * instructions — iOS Safari included.
 */
export function InstallApp({
  tone = "dark",
  variant = "link",
  className,
}: {
  tone?: "dark" | "light";
  variant?: "link" | "button";
  className?: string;
}) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setPlatform(detect());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      setPanel(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const click = () => {
    if (prompt) {
      void prompt.prompt();
      return;
    }
    setPanel(true);
  };

  const steps =
    platform === "ios"
      ? [t.pwa.iosStep1, t.pwa.iosStep2, t.pwa.iosStep3]
      : [t.pwa.androidStep1, t.pwa.androidStep2, t.pwa.androidStep3];

  return (
    <>
      <button
        type="button"
        onClick={click}
        className={cn(
          variant === "button"
            ? cn(
                "eyebrow inline-flex min-h-[3.25rem] items-center justify-center px-7 py-4 transition-colors",
                tone === "light"
                  ? "bg-ivory text-charcoal hover:bg-cream"
                  : "bg-charcoal text-ivory hover:bg-ink",
              )
            : cn(
                "eyebrow line-hover text-left",
                tone === "light" ? "text-ivory/70" : "text-charcoal/70",
              ),
          className,
        )}
      >
        {t.pwa.install}
      </button>

      {panel && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-sm bg-ivory p-7 text-charcoal">
            <p className="display text-3xl">{t.pwa.iosTitle}</p>
            <p className="mt-3 text-sm text-warmgrey">{t.pwa.addLead}</p>
            <ol className="mt-6 space-y-4 text-sm leading-relaxed text-warmgrey">
              {steps.map((step, i) => (
                <li key={i}>
                  {i + 1} · {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPanel(false)}
              className="eyebrow mt-8 min-h-11 w-full bg-charcoal px-6 py-3 text-ivory"
            >
              {t.pwa.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
