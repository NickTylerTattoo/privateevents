# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**NTT Private Events — "Something Permanent"**: a single-page marketing/lead-capture
site for Nick Tyler Tattoo's private tattoo events (weddings, bachelorettes, showers)
across Long Island, the Hamptons, and NYC.

It is a **static site with no build step, no package manager, and no tests**. There is
no `package.json`, no bundler, no CI. What is in the repo is exactly what ships.

Live at `https://nicktylertattoo.github.io/privateevents/` — GitHub Pages serves the
repo root directly (hence the empty `.nojekyll` at the root, which stops Jekyll from
swallowing paths). Pushing to the default branch deploys.

## Layout

```
index.html                  the entire page — all markup, meta, tracking, embeds
css/style.css               all styles (single file, CSS custom properties, no preprocessor)
js/main.js                  all behavior — content data + scroll choreography
js/vendor/                  pinned, minified third-party libs (gsap, ScrollTrigger, lenis)
assets/seq/orbit/           161 JPEG frames + manifest.json — the scroll-scrubbed hero
assets/video/               macro.mp4, assembly.mp4, atmosphere.mp4 (+ orbit-4k-master.mp4 source)
assets/events/              the three package tier photos
assets/hero-poster.jpg      hero fallback + OG/Twitter share image
.nojekyll                   required for GitHub Pages
```

`assets/flash/`, `assets/logo.png`, and `assets/hero-master-2k.png` are **not referenced
by the shipping page** — they are leftovers/source material. Don't wire them in unless
asked. Likewise `assets/video/orbit-4k-master.mp4` is the *source* the frame sequence was
extracted from, not something the page loads.

The CSS also carries an unused `.modal`/`.drop__pills`/`.pill` block from an earlier
gallery design. Leave it unless you're explicitly cleaning up.

## Page structure

Numbered sections, in scroll order. The numbers appear in the copy (`.index`) and the
HTML comments — keep them in sync if sections are added or reordered.

| # | Section | id | Notes |
|---|---------|-----|-------|
| 000 | Hero | `#hero` | 340vh tall, sticky stage, canvas scrubbed by scroll |
| — | Marquee | `.marquee` | infinite ticker, duplicated in JS for a seamless `-50%` loop |
| 001 | Proof | `#proof` | Google reviews, rendered from `REVIEWS` |
| 002 | The work | `#film` | sticky `macro.mp4` + scroll-timed text |
| 003 | The Packages | `#drop` | three tiers, rendered from `TIERS` |
| 004 | The setup | `#assembly` | sticky `assembly.mp4`, plays once and holds final frame |
| — | Check your date | `#custom` | GoHighLevel form iframe (the conversion point) |
| 005 | FAQ | `#faq` | accordion, rendered from `FAQ` |
| 006 | Finale | `#finale` | ambient `atmosphere.mp4` + closing CTA |

## Where the content lives

All customer-facing copy that isn't in `index.html` is in three arrays at the top of
`js/main.js`:

- `TIERS` — package names, specs, prices, photos. **Pricing is locked (2026-07-14).**
- `REVIEWS` — verbatim Google reviews. Don't paraphrase or invent these.
- `FAQ` — question/answer pairs.

Prices and policies are repeated in several places: the `TIERS` array, the FAQ "What does
it cost?" answer, and the add-on lines in `index.html` (`.drop__addons`). **A pricing
change must be made in all three or the page contradicts itself.** Same for the
Suffolk County 3-week permit lead time (`#custom` note + FAQ "Where do you travel?").

## Key mechanisms

**Hero orbit (`js/main.js`, the `orbit` IIFE).** The hero is a `<canvas>` that scrubs a
161-frame JPEG sequence against scroll position. `assets/seq/orbit/manifest.json`
(`{"count":161,"fps":16,"width":1600}`) drives it. Frames load in a **sparse-then-fill**
order (`stride = 6`) with at most 8 requests in flight, and `img.decode()` is awaited
before drawing so scrubbing never hits a synchronous JPEG decode. `draw()` cover-fits and
walks *backwards* to the nearest loaded frame, so a partially-loaded sequence still looks
right. `assets/hero-poster.jpg` paints immediately as the fallback. If you regenerate the
sequence, rewrite `manifest.json` to match and keep the `f-###.jpg` 3-digit,
**1-indexed** naming (`f-001.jpg` … `f-161.jpg`); the code maps frame index `i` to
`f-{pad(i+1)}.jpg`.

**Scroll stack.** Lenis (smooth scroll) drives GSAP's ticker, which drives ScrollTrigger.
Vendor scripts load classically before `main.js` — `gsap`, `ScrollTrigger`, and `Lenis`
are globals, not modules. Anchor links are intercepted and routed through
`lenis.scrollTo`.

**ScrollTrigger.refresh() is load-bearing.** Anything that changes document height after
first paint must call it, or every trigger below the change keeps stale pixel positions
and silently never fires. Already done after the tiers render and after each FAQ
accordion transition. If you add dynamically-sized content, do the same.

**Hero pinning depends on `overflow-x: clip`.** `html` and `body` use `overflow-x:clip`,
**not** `hidden` — `hidden` creates a scroll container and breaks `position:sticky` on the
hero stage. This has regressed before (see commits "Fix mobile horizontal overflow" and
"Restore hero pinning"). Don't change it to `hidden`.

**Videos** are `muted playsinline`, `preload="metadata"`, and played/paused by an
IntersectionObserver. `assembly.mp4` is deliberately **not** `loop` — the observer checks
`video.ended` so it holds its final frame instead of restarting.

**`?still` mode.** Appending `?still` to the URL freezes everything for screenshots:
`document.body` gets `.still`, animations are disabled in CSS, videos don't preload, and
the hero renders a static state. `?still&stage=2` renders the mid-scrub second hero
stage. `window.__NT = { orbit, STILL, lenis }` is exposed as a debug hook for automated
verification. Use these when you need to visually check a change.

**The inquiry form** is a GoHighLevel iframe (`link.inkedin.tools`). Two things wrap it,
both intentional:
1. An inline listener in `index.html` that reads `[iFrameSizer]` `postMessage` heights and
   sizes the iframe itself, because the stock `form_embed.js` attaches its listener too
   late for a cached iframe and the form never reveals. There's a 4s fixed-height
   fallback. `form_embed.js` still loads as the message host.
2. A small script that forwards `location.search` (utm_*, fbclid, gclid) onto the iframe
   `src` for ad attribution.

Don't "simplify" either one away — both fix real, previously-shipped bugs.

**Meta Pixel** (`598145411993915`) fires `PageView` in `<head>`.

## Conventions

- **Cache busting is manual.** Asset URLs carry query versions: `css/style.css?v=6`,
  `js/main.js?v=4`, `assets/events/tier-party.jpg?v=2`. **Bump the version whenever you
  change the corresponding file** — GitHub Pages caching is aggressive and stale CSS/JS is
  the most common "my change didn't deploy" symptom.
- **Design tokens** are CSS custom properties on `:root` (`--ink`, `--bone`, `--gold`,
  `--steel`, `--surface`, `--char`, `--hair`, plus `--grotesk`/`--mono`/`--serif`). Use
  them; don't hardcode hexes. The palette is dark ink + bone + gold, type is Instrument
  Serif (display, italic for gold accents) and DM Sans (everything else).
- **Class naming** is loose BEM-ish: `block__element`, `block--modifier`
  (`.hero__text--2`, `.plate__title`, `.film--assembly`).
- **JS style**: one IIFE per concern inside a top-level IIFE, `'use strict'`, `$`/`$$`
  helpers, no framework, no modules, no dependencies beyond the three pinned vendor libs.
- **Comments explain *why***, especially where code guards a specific browser behavior
  (decode-before-draw, `overflow-x:clip`, the ScrollTrigger refreshes, the iframe sizer).
  Match that density — don't strip these when editing nearby code.
- **Responsive** breakpoint is a single `@media (max-width:720px)` block at the end of
  `style.css`: nav links hide, hero drops to 280vh, films to 240vh. Test mobile width
  after any hero/film height change.
- **Accessibility**: decorative SVGs and overlays are `aria-hidden`, the hero title
  carries an `aria-label`, and `prefers-reduced-motion` disables the sparkle and sheen
  animations. Keep that up.
- **Commit messages** are short, imperative, and describe the *user-visible* change
  ("Swap Party Block and Main Event photos: group shot on the bigger tier"). Follow suit.

## Working here

- Preview with any static server from the repo root, e.g. `python3 -m http.server 8000`,
  then open `http://localhost:8000/`. Opening `index.html` over `file://` breaks the
  `fetch()` of the orbit manifest.
- There is nothing to install, build, lint, or test. Verification is visual — load the
  page, scroll the whole thing, and check the hero scrub, the three film sections, the
  FAQ accordion, and mobile width. `?still` and `?still&stage=2` give deterministic
  screenshots.
- **Assets are large** (~34MB video, ~10MB frame sequence). Don't add more heavy media
  casually, and don't re-encode or move existing media without being asked.
- Business facts (prices, hours, tattoo counts, travel area, permit lead times, review
  text, phone number) are real and locked. **Never invent or "improve" them** — if
  something needs to change, it comes from the user.
