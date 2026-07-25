// On this day in typing history: keyboards, layouts, chording, stenography,
// text input, and CharaChorder itself.
// Keyed by 'MM-DD'. Principle: only include events whose exact date (month, day,
// and year) is verified. A day with no verified entry simply hides the section
// — nothing is fabricated to fill the gap.
export interface HistoryEvent {
  year: number
  text: string
}

export const HISTORY: Record<string, HistoryEvent[]> = {
  '01-01': [
    {
      year: 2006,
      text: 'Shai Coleman releases the Colemak keyboard layout, an ergonomic alternative to QWERTY that keeps most punctuation in place.',
    },
  ],
  '04-08': [
    {
      year: 2021,
      text: 'CharaChorder launches the CharaChorder Lite on Kickstarter — chording in a familiar mechanical-keyboard body.',
    },
  ],
  '05-12': [
    {
      year: 1936,
      text: 'August Dvorak and William Dealey are granted U.S. Patent 2,040,248 for the Dvorak Simplified Keyboard.',
    },
  ],
  '06-23': [
    {
      year: 1868,
      text: 'Christopher Latham Sholes, Samuel Soulé, and Carlos Glidden receive U.S. Patent 79,265 for an early typewriter — the machine that led to the modern keyboard.',
    },
  ],
  '07-31': [
    {
      year: 1961,
      text: 'IBM introduces the Selectric typewriter, replacing typebars with a rotating "typeball" element.',
    },
  ],
  '08-27': [
    {
      year: 1878,
      text: 'Sholes is granted U.S. Patent 207,559, containing the first documented appearance of the QWERTY key arrangement.',
    },
  ],
  '11-22': [
    {
      year: 2022,
      text: 'CharaChorder launches the CharaChorder X on Kickstarter — a dongle that brings chording to an existing keyboard.',
    },
  ],
  '12-09': [
    {
      year: 1968,
      text: 'Douglas Engelbart gives "The Mother of All Demos," showing the mouse, hypertext, and a five-key chorded keyset — an ancestor of modern chording input.',
    },
  ],
}

export function historyOf(month: number, day: number): HistoryEvent[] {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const events = HISTORY[key] ?? []
  return [...events].sort((a, b) => a.year - b.year)
}
