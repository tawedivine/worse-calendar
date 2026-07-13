# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project intent

"Anti-Calendar" is a satire/art project: a calendar app that is deliberately, artfully bad. It is
not a product and must never be adapted for real users. The README and all in-app copy are written
straight-faced, as sincere design rationale — **do not** add warnings, "demo mode" banners, or any
UI text that reveals the hostility. The sincerity is the point.

## The core invariant (do not violate)

**The machine is always correct; only the user is blind.** Parsing, scheduling, and storage must
stay exact. Every event is stored at its true UTC instant. Every hostile behavior is a
**display-or-input-rendering transform only** — it degrades the user's ability to *supervise* the
system, never the system itself. Nothing may look broken or error-like; each anti-feature must read
as internally coherent and intentional. Anti-features that decay into learnable skills (e.g.
full-display mirroring, defeated by a phone camera within ~2 weeks) are rejected as failures —
check any new idea against that test.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build (esbuild — does NOT type-check)
npm run preview   # preview the production build
npx tsc --noEmit  # type-check (run this; the build won't catch type errors)
```

There is no test runner configured. Node was installed via winget (`OpenJS.NodeJS.LTS`); npm here
blocks package install-scripts by default, so `esbuild` is allow-listed in `package.json`
(`allowScripts`) — a fresh `npm install` on another machine may need `npm approve-scripts esbuild`
followed by `npm rebuild esbuild`.

## Architecture

Stack: React 18 + Vite + TypeScript + Tailwind v4 (via `@tailwindcss/vite`, so styling is
`@import "tailwindcss"` in `src/index.css` with no separate config). No backend; events persist to
`localStorage` under `calendar.events.v1`.

The hard line in this codebase is **correct engine vs. hostile presentation** — keep them separate:

- **Correct engine (never add presentation logic here):**
  - `src/catTime.ts` — the single source of truth for the displayed clock and all calendar math.
    `CAT_OFFSET_HOURS` is *computed at runtime* as `Math.round(mean(ECCAS member offsets))` (= 1,
    i.e. GMT+1); do not hardcode it. Everything renders in this one offset regardless of the user's
    real zone, while storage stays UTC. Also owns all wall-date arithmetic (`addWallDays`,
    `weekDays`, `monthWeeks`, etc.), which is offset-independent.
  - `src/parser.ts` — natural-language entry → `CalEvent`. Consumes the **raw** string and is
    genuinely correct. Times are interpreted in the CAT clock the user sees (so a typed "1pm" lands
    where the UI shows 1pm — coherent). On failure it silently defaults to today at the current
    hour; no error signal.
  - `src/storage.ts`, `src/types.ts` — localStorage + `CalEvent`/`WallDate` types.

- **Hostile presentation (all anti-features live here):**
  - `src/components/QuickEntry.tsx` — a transparent-text `<input>` (captures the real value, submits
    it verbatim) layered under a monospace overlay of per-character spans; characters at index ≥ 4
    get `transform: scaleX(-1)`. Monospace keeps glyph advances fixed so the input caret stays
    aligned with the mirrored overlay. The mirror is display-only; the parser never sees it.
  - `src/components/WeekView.tsx` — days run **right-to-left** (built by reversing the natural
    Sun..Sat array); hour axis stays top-to-bottom. The axis contradiction is intentional.
  - `src/components/MonthView.tsx` — weeks stack **bottom-to-top** (natural weeks array reversed so
    the week containing the 1st renders at the bottom); days within a row read left-to-right.
  - `src/components/DayColumn.tsx` — shared hour grid used by Day and Week. Renders the
    current-time line at its **accurate** position but styled identically to an ordinary gridline
    (same 1px, same `border-gray-200`) — present, correct, effectively invisible. Views open
    scrolled to midnight; never auto-scroll to now.
  - `src/components/DayView.tsx` — the one normal view (top-to-bottom, correct).
  - `src/App.tsx` — header, nav, view switching. Holds `focus` as a `WallDate` and drives
    prev/next via the wall-date helpers in `catTime`.

Data flow: `App` owns `events` state (loaded from / saved to `storage` via effect). Quick entry →
`parseEntry` → append. Slot click → `window.prompt` → append. Event click → `window.confirm` →
remove. `now` (a `CatParts`) refreshes on a 60s interval for the current-time line.

## Confirmed anti-features (spec)

1. Mirrored quick-entry field (4-character rule) — implemented in `QuickEntry.tsx`.
2. Mirrored/contradictory time directions across views — Week R→L, Month bottom→top.
3. CAT political timezone (`catTime.ts`) — one computed offset for all ECCAS states, GMT+1.
4. Suppressed "now" anchor — accurate but visually indistinguishable from a gridline.

The feature list is **not final** — the user is still brainstorming more anti-features. When adding
one, put the logic-correct part (if any) in the engine and the hostile part in the presentation
layer, and keep the whole thing sincere.
