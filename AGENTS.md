# Daniel Hamilton Massage — demo site

Converted from a Lovable export; this repository is **not** connected to
Lovable and pushes here do not sync anywhere else.

Before changing anything, read `README.md`: it says which content is
illustrative demo placeholder and which files to edit to replace it.

## Ground rules

- **Research, never invent.** Do not add treatments, prices, durations,
  opening hours, qualifications, credentials, years of experience, awards,
  reviews, ratings or health claims that the business has not supplied.
  Design around missing information instead — that is why there is no street
  address and no asserted opening hours.
- Keep the footer demo notice (`DEMO_DISCLAIMER` in `src/lib/business.ts`)
  exactly as written, in every language.
- Never commit `.env`, API keys or tokens.

## Build

`NITRO_PRESET=vercel npm run build` — Nitro otherwise defaults to the
`cloudflare-module` preset, which will not run on Vercel.
