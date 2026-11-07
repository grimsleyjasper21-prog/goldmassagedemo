# Gold Massage — demonstration site & booking system

A demonstration website and booking system for **Gold Massage**, a
chiropractic and massage studio in S'Arenal, Mallorca. Built by GRIMHART.

TanStack Start · React 19 · Tailwind v4 · `motion/react` · Google Calendar.

---

## What is real and what is placeholder

**Researched and real**
- Business name, address (Carrer de Cannes 27, Local 3, 07600 S'Arenal)
- Appointment-only booking policy, and that entry is through the portal
- The booking flow, availability check, dashboard and WhatsApp hand-off

**Placeholder — replace before this goes live**
- Treatments, durations and prices (`src/lib/services.ts`). The treatment
  *types* follow the studio's public listing; the numbers are illustrative.
- All photography (`src/assets/`). These are stock interiors, not the
  studio's premises. The footer says so in every language.
- The WhatsApp number in `src/lib/business.ts` is GRIMHART's demo number, so
  the hand-off works during the presentation.

**Deliberately absent**
- No telephone number: public listings carry two conflicting numbers for this
  address. Confirm with the studio, then add it to `src/lib/business.ts`.
- No opening hours: none are published anywhere, so none are asserted.
- No reviews or ratings.

## Environment variables

Copy `.env.example`. All four are set in Vercel → Settings → Environment Variables.

| Variable | What it is |
|---|---|
| `GOOGLE_SA_EMAIL` | `client_email` from the service account JSON |
| `GOOGLE_SA_PRIVATE_KEY` | `private_key` from the same JSON (keep the `\n` escapes) |
| `GOOGLE_CALENDAR_ID` | the calendar's address, e.g. `you@gmail.com` |
| `ADMIN_PASSWORD` | password for `/admin` |

Without them the site still runs: the booking flow works and hands over on
WhatsApp, but no calendar events are written and `/admin` says so plainly.

## Google Calendar setup

1. console.cloud.google.com → new project
2. APIs & Services → Library → enable **Google Calendar API**
3. Credentials → Create credentials → **Service account**
4. The service account → Keys → Add key → **JSON**
5. calendar.google.com → Settings → your calendar → **Share with specific
   people** → add the `client_email` → **Make changes to events**

A service account is used instead of OAuth: no consent screen, no refresh
tokens, and the studio can later swap in their own calendar by re-sharing.

## How bookings are stored

The calendar **is** the store — one source of truth, one credential.

- A request creates a real event titled `PENDIENTE · treatment · name`, marked
  *free* so it does not block other slots. Customer details live in the
  event's private extended properties.
- Confirming re-checks availability, then flips the event to
  `CONFIRMADA ·…` and marks it *busy*.
- Declining flips it to `RECHAZADA ·…` and leaves it free.
- `/admin` lists events tagged `goldMassageBooking`, so the owner's private
  entries are never read.

The time step calls `freeBusy` for the chosen day and only offers slots that
are genuinely free, in `Europe/Madrid`.

## Routes

| Route | |
|---|---|
| `/` | home |
| `/services` | treatment menu |
| `/about` | the studio |
| `/location` | contact, map, availability |
| `/book` | booking flow |
| `/admin` | owner dashboard (password, `noindex`) |

## Languages

English, Español, Deutsch, Svenska — full dictionaries in `src/lib/i18n.tsx`.
The choice persists in `localStorage` and covers the whole booking journey.
The dashboard is Spanish only.

## Develop & build

```sh
npm install
npm run dev
NITRO_PRESET=vercel npm run build
```

Nitro defaults to the `cloudflare-module` preset, so **`NITRO_PRESET=vercel`
is required** for Vercel; output lands in `.vercel/output`.
