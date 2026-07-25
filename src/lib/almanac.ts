// Turn a date into a full "Chorder's Almanac" page.
import { makeRng, pickN, pickOne } from './rng'
import { DO, DONT, type YiJiItem } from '../data/yiji'
import {
  LUCKY_LAYOUTS,
  LUCKY_FINGERS,
  CLASH_NEMESES,
  AUSPICIOUS_HOURS,
  LUCKY_KEYCAPS,
  CHORD_PROVERBS,
} from '../data/fortune'
import { historyOf, type HistoryEvent } from '../data/history'

export interface Fortune {
  luckyLayout: string
  luckyFinger: string
  luckyKeycap: string
  luckyNumber: number
  clashNemesis: string
  auspiciousHour: string
  proverb: string
}

export interface AlmanacDay {
  date: Date
  isoDate: string // YYYY-MM-DD
  weekdayLabel: string
  monthLabel: string
  doItems: YiJiItem[]
  dontItems: YiJiItem[]
  fortune: Fortune
  history: HistoryEvent[]
}

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildAlmanac(date: Date): AlmanacDay {
  const iso = toIso(date)
  // Seed the RNG with the date string → the same day always yields the same page.
  const rng = makeRng(iso)

  const doItems = pickN(rng, DO, 4)
  const dontItems = pickN(rng, DONT, 4)

  const fortune: Fortune = {
    luckyLayout: pickOne(rng, LUCKY_LAYOUTS),
    luckyFinger: pickOne(rng, LUCKY_FINGERS),
    luckyKeycap: pickOne(rng, LUCKY_KEYCAPS),
    luckyNumber: Math.floor(rng() * 100),
    clashNemesis: pickOne(rng, CLASH_NEMESES),
    auspiciousHour: pickOne(rng, AUSPICIOUS_HOURS),
    proverb: pickOne(rng, CHORD_PROVERBS),
  }

  return {
    date,
    isoDate: iso,
    weekdayLabel: WEEKDAYS[date.getDay()],
    monthLabel: MONTHS[date.getMonth()],
    doItems,
    dontItems,
    fortune,
    history: historyOf(date.getMonth() + 1, date.getDate()),
  }
}
