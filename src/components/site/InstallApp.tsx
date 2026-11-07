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

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return ios && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

/**
 * Subtle install action. Uses the native Android/Chrome prompt when available
 * and a minimal instruction panel on iOS, where no automatic prompt exists.
 */
export function InstallApp({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIosSafari());
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
  if (!prompt && !ios) return null;

  const click = () => {
    if (prompt) {
      void prompt.prompt();
      return;
    }
    setPanel(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={click}
        className={cn(
          "eyebrow line-hover text-left",
          tone === "light" ? "text-ivory/70" : "text-charcoal/70",
          className,
        )}
      >
        {t.pwa.install}
      </button>

      {panel && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-sm bg-ivory p-7 text-charcoal">
            <p className="display text-3xl">{t.pwa.iosTitle}</p>
            <ol className="mt-6 space-y-4 text-sm leading-relaxed text-warmgrey">
              <li>1 · {t.pwa.iosStep1}</li>
              <li>2 · {t.pwa.iosStep2}</li>
              <li>3 · {t.pwa.iosStep3}</li>
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
