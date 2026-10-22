# Design system — Phase 03

Implemented landing: Hero, About (including How it works), Features and a compact
footer. It is marketing presentation for a product under development; destinations
remain honest shells until Phase 04. No testimonials, awards or vendor claims.

## Tokens and layout

- Background #000000; About #101010; feature cards #212121.
- Main text #E1E0CC; primary #DEDBC8; secondary #a5a59d/#b5b5ae for readable contrast.
- Almarai 300/400/700/800 via Google Fonts; Instrument Serif italic accents.
  System/Georgia fallbacks remain usable if fonts fail. Serif selector overrides
  the universal Almarai declaration for descendants.
- Hero inset 16px mobile /24px desktop, 24–32px rounded container, content-safe
  minimum viewport height, dominant Jashn wordmark with decorative final asterisk.
- Desktop hanging black navigation pill; collapsible mobile menu with aria-expanded,
  semantic links, Escape close and focus return. Focus outlines and skip link.
- About max width 1152px; feature grid max 1440px, 1/2/4 columns by viewport.
  Content determines height; no clipped fixed-height text.

## Components

- landing/Landing.tsx: sections, navigation, feature cards, CTAs.
- landing/Animation.tsx: WordsPullUp, WordsPullUpMultiStyle and AnimatedLetter.
  Coherent screen-reader text replaces decorative spans. Readable base copy stays
  visible below scroll-linked highlights; reduced motion shows full static text.
- landing/AmbientVideo.tsx: video loading policy, lazy feature video, pause/play,
  static CSS scene and failed-media state. Pausing returns to the static scene.
- landing/media-policy.ts: no automatic source for reduced motion (including unknown
  preference), save-data, offscreen feature video, paused state or failed media.
  Explicit Play opts into loading; a failed video stays on the static scene.
- landing/media.ts: exact five user-supplied remote reference URLs, centralized.
- index.css: responsive composition, two decorative SVG noise layers, media fallback.

## Asset review

Both videos played in the browser; all three icon images loaded at natural width
1280. Hero shows a stylized elevated landscape with a person/laptop, feature video
shows an astronaut among flowers; icons are sculptural figures. These fit the
supplied cinematic reference, but are not represented as real event footage.
Asset ownership/licensing is NOT verified. Resolve permission or replace with
approved assets before public release. No substitute remote URLs were invented.
CSS fallback is local/procedural; icon load failure uses bundled lucide icons.
Remote failure does not remove headings, links or planning navigation.

## Verification

Screenshots in docs/evidence/phase-03-{360,768,1440,1920}.png. All four widths
were visually inspected; document width did not exceed viewport width. Wordmark,
nav and cards fit; mobile stacks content. Pause/play, mobile menu/Escape, feature
and How-it-works anchors, primary CTA and all three sample query destinations
were exercised. Samples remain placeholders, not complete sample plans.

16 automated tests pass, including media policy combinations for reduced motion,
save-data, paused/failed/offscreen state and explicit opt-in. Browser-level OS
reduced-motion/save-data emulation and injected network failure were not available
through the selected browser API; those paths were checked through policy tests
and source review. Static fallback was visually inspected through pause behavior.
Build/typecheck/lint passed. Asset permissions remain a release limitation.

## Phase 04 workspace

Calmer dark/cream workspace with a persistent desktop sidebar and wrapping mobile
navigation. Six section links use URL query state and aria-current; native form
controls have explicit labels, hints and field errors, with focus on first invalid
input. Three steps separate essentials, optional preferences and explicit review.
Budget rows avoid a wide table; cards and form columns collapse on small screens.
No new media, packages or automatic motion were added. See phase-04 screenshots.
