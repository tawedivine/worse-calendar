// A 40-color professional palette: evenly spaced hues at a single muted
// lightness/saturation, so every swatch reads as "serious" and white text stays
// legible on all of them. A fresh swatch is drawn per render — the same event is
// never reliably the same color twice.
export const PALETTE: string[] = Array.from(
  { length: 40 },
  (_, i) => `hsl(${Math.round(i * (360 / 40))} 33% 40%)`,
)

export function randomSwatch(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

/** First 8 characters, no ellipsis. */
export function clamp8(title: string): string {
  return title.slice(0, 8)
}

/** Stable pseudo-random in [0,1) from an integer seed. */
export function seedRand(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** A day's column gets a fixed, slightly-off width factor — never quite equal, never flickering. */
export function columnGrow(y: number, mo: number, d: number): number {
  return 0.82 + seedRand(y * 372 + mo * 31 + d) * 0.36 // 0.82 .. 1.18
}

/** A weight for event text, reshuffled every render along with the colors. */
export function randomWeight(): number {
  return 400 + Math.floor(Math.random() * 3) * 100 // 400 | 500 | 600
}
