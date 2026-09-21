# BrandPunk

> Upload your logo. Add your business. Get your entire brand pack.

An AI corporate identity studio: give it a website URL, a logo, and a
handful of business details, and it produces a complete branded
stationery / corporate pack — the kind of thing a design agency would
normally take days to assemble.

## What's here

This is the first slice of the product: the intake flow.

- `/` — Step 1: enter your website URL, upload a logo, and fill in
  business details (name, tagline, ABN, contact info, socials, key staff).
- `/analyzing` — a short "brand intelligence" loading screen.
- `/brand` — Step 2: a brand board confirming the colours, typography,
  and style tags picked up from your details.

The colour/typography extraction on `/brand` is currently a **deterministic
placeholder** (`src/lib/analyzeBrand.ts`) — it picks a plausible palette and
font pairing from the business name/URL so the confirm-brand screen has
real data to react to. Wiring this up to real website scraping and logo
analysis, then generating the three full brand-pack concepts (business
cards, letterheads, invoices, social kits, etc.), is the next milestone.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4.
