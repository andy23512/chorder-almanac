# Chorder's Almanac ⚓

A daily almanac for **CharaChorder** users — inspired by the old farmer's almanac.
Check each day's **Do / Don't** for chorders, a lucky **fortune**, and a verified
moment from **typing history**.

Pure front-end, no backend. Whoever opens a given day sees the same Do / Don't and
fortune (generated deterministically from the date).

## Features

- 📅 Browse any date (prev / next / date picker / back to today)
- ✅ **Do / Don't**: seeded by the date, four chorder-flavored entries each per day
- 🔮 **Today's fortune** (just for fun): lucky layout / lucky finger / lucky number /
  today's nemesis / flow hour / lucky keycap, plus a chorder's proverb
- 📜 **On This Day · Typing History**: only events with a verified exact date
  (keyboards, layouts, chording, stenography, and CharaChorder itself). Days
  without a verified entry simply hide the section — nothing is made up.
- 🔗 **Share**: shareable link (`?d=YYYY-MM-DD` opens straight to that day), and
  download the day's sheet as a PNG (front-end only, via html-to-image)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # preview the build
```

## Project structure

```
src/
  App.tsx              # page and layout
  styles.css           # almanac-style theme
  lib/
    rng.ts             # deterministic RNG (xmur3 + mulberry32)
    almanac.ts         # assembles a date into a full almanac page
  data/
    yiji.ts            # the Do / Don't entry pools
    fortune.ts         # fortune pools and chorder proverbs
    history.ts         # on-this-day events (keyed by MM-DD)
```

## Extending it

- **Easiest win — add content**: append entries to `data/yiji.ts`,
  `data/fortune.ts`, or `data/history.ts`. No logic changes needed.
- For `history.ts`, only add events whose exact month + day + year you can verify.

## Honesty note

The Do / Don't and fortune are entertainment — don't schedule your firmware flashes
by them (though "don't flash before a deadline" is genuinely good advice). History
entries are limited to those with a verified date; corrections and additions to
`src/data/history.ts` are welcome.
