# Calendar

A minimal calendar for scheduling and viewing events. Natural-language quick entry,
day/week/month views, and a single coherent regional clock. Events are stored locally in your
browser.

## Running

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Design rationale

This document explains the deliberate design decisions behind the interface. Each one is
intentional and internally consistent. The underlying engine — parsing, scheduling, storage — is
exact; every event is stored at its true UTC instant and every computation is correct. The choices
below concern presentation only.

### Quick entry

The entry field accepts natural language such as `Lunch with Sam Thursday 1pm at Kilo`. The parser
reads the raw text and resolves a title, day, time, and optional location. Times are interpreted in
the displayed regional clock, so an event lands exactly where the clock shows it.

The field renders the first four characters of an entry conventionally and mirrors each character
from the fifth onward. The mirroring is a pure display transform: the value submitted to the parser
is always the literal, unmodified text you typed. The rendering encourages composition by feel
rather than by proofreading. There is intentionally no error highlighting; an entry that cannot be
fully resolved falls back to today at the current hour rather than interrupting you with a warning.

### Regional clock — CAT (GMT+1)

All times in the interface are rendered in Central-African Time. CAT is defined by ECCAS
membership rather than by longitude: every member state is treated as sharing one offset, computed
at runtime as the rounded mean of the members' true UTC offsets. With the current membership this
resolves to GMT+1. Storage remains in UTC; only the displayed clock is shifted. The offset is
computed in [`src/catTime.ts`](src/catTime.ts) and is the single source of truth for every rendered
time — see the tooltip on the clock label for the one-line statement of the policy.

### Views and time direction

- **Day** — hours run top to bottom.
- **Week** — the days run right to left, so Sunday sits at the right edge and Saturday at the left.
  The hour axis continues to run top to bottom. Each view is internally consistent on its own
  terms.
- **Month** — weeks stack from the bottom upward: the 1st of the month is anchored at the bottom
  row and the final day at the top. Days within each week read left to right.

These orientations are fixed and deliberate. They are not configuration options.

### The current-time indicator

The interface never scrolls to the current time on open; every view begins at midnight. A
current-time line is drawn at its exact position, weighted and colored identically to an ordinary
hour gridline — present and accurate, without drawing the eye.

## Storage

Events persist to `localStorage` under `calendar.events.v1`. No account, no network, no backend.

## Architecture

```
src/
  types.ts              CalEvent + WallDate
  catTime.ts            CAT offset (computed) + all wall-clock date math   [correct]
  parser.ts             natural-language entry -> CalEvent (true UTC)      [correct]
  storage.ts            localStorage load/save                            [correct]
  components/
    QuickEntry.tsx      entry field with the mirrored-render overlay
    DayColumn.tsx       shared hour grid, event blocks, current-time line
    DayView.tsx         normal top-to-bottom day
    WeekView.tsx        right-to-left week
    MonthView.tsx       bottom-to-top month
  App.tsx               header, navigation, view switching, wiring
```

The separation is deliberate: `catTime`, `parser`, and `storage` are the correct engine and hold no
presentation logic; the components own every display and input decision described above.
