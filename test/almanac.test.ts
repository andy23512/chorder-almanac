import { describe, expect, it } from "vitest";
import { buildAlmanac, toIso } from "../src/lib/almanac";
import {
  AUSPICIOUS_HOURS,
  CHORD_PROVERBS,
  CLASH_NEMESES,
  LUCKY_CC_DEVICES,
  LUCKY_FINGERS,
  LUCKY_KEYCAPS,
} from "../src/data/fortune";
import { DO, DONT } from "../src/data/yiji";

describe("toIso", () => {
  it("writes YYYY-MM-DD with zero padding", () => {
    expect(toIso(new Date(2024, 0, 5))).toBe("2024-01-05");
    expect(toIso(new Date(2024, 11, 31))).toBe("2024-12-31");
    expect(toIso(new Date(2024, 8, 9))).toBe("2024-09-09");
  });

  it("uses the local calendar day, not UTC", () => {
    expect(toIso(new Date(2024, 5, 15, 23, 59, 59))).toBe("2024-06-15");
    expect(toIso(new Date(2024, 5, 15, 0, 0, 0))).toBe("2024-06-15");
  });

  it("handles a leap day", () => {
    expect(toIso(new Date(2024, 1, 29))).toBe("2024-02-29");
  });
});

describe("buildAlmanac", () => {
  const day = new Date(2024, 0, 1);

  it("is the same page for the same day, whatever the time of day", () => {
    const a = buildAlmanac(new Date(2024, 0, 1, 0, 0));
    const b = buildAlmanac(new Date(2024, 0, 1, 23, 59));
    expect(b.doItems).toEqual(a.doItems);
    expect(b.dontItems).toEqual(a.dontItems);
    expect(b.fortune).toEqual(a.fortune);
  });

  it("is a different page for a different day", () => {
    const a = buildAlmanac(new Date(2024, 0, 1));
    const b = buildAlmanac(new Date(2024, 0, 2));
    expect(b.fortune).not.toEqual(a.fortune);
  });

  it("reports the date, ISO string and labels", () => {
    const a = buildAlmanac(day);
    expect(a.date).toBe(day);
    expect(a.isoDate).toBe("2024-01-01");
    expect(a.weekdayLabel).toBe("Monday");
    expect(a.monthLabel).toBe("January");
  });

  it("names every weekday and month correctly", () => {
    const weekdays = [];
    for (let d = 7; d <= 13; d++) weekdays.push(buildAlmanac(new Date(2024, 0, d)).weekdayLabel);
    expect(weekdays).toEqual(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    const months = [];
    for (let m = 0; m < 12; m++) months.push(buildAlmanac(new Date(2024, m, 10)).monthLabel);
    expect(months).toEqual([
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]);
  });

  it("draws four distinct Do and four distinct Don't items from the pools", () => {
    for (let i = 0; i < 60; i++) {
      const a = buildAlmanac(new Date(2024, 0, 1 + i));
      expect(a.doItems).toHaveLength(4);
      expect(a.dontItems).toHaveLength(4);
      expect(new Set(a.doItems.map((x) => x.name)).size).toBe(4);
      expect(new Set(a.dontItems.map((x) => x.name)).size).toBe(4);
      a.doItems.forEach((x) => expect(DO).toContain(x));
      a.dontItems.forEach((x) => expect(DONT).toContain(x));
    }
  });

  it("pins one whole day, so a change to the seed or the draw order shows up", () => {
    const a = buildAlmanac(day);
    expect(a.doItems.map((x) => x.name)).toMatchInlineSnapshot(`
      [
        "Forge a custom chord",
        "Warm up your hands",
        "Clean the switches",
        "Drill new chords",
      ]
    `);
    expect(a.dontItems.map((x) => x.name)).toMatchInlineSnapshot(`
      [
        "Flash before a deadline",
        "Chase WPM over accuracy",
        "Force a chord that won’t fire",
        "Two boards, one week",
      ]
    `);
    expect(a.fortune).toMatchInlineSnapshot(`
      {
        "auspiciousHour": "Evening 17–19 (the closing sprint)",
        "clashNemesis": "Autocorrect",
        "luckyDevice": "CharaChorder Two",
        "luckyFinger": "Right middle",
        "luckyKeycap": "Gruvbox amber",
        "luckyNumber": 83,
        "proverb": "A cluttered chord library is a slow one. Prune with courage.",
      }
    `);
  });

  it("takes every fortune field from its own pool, and the number from 0 to 99", () => {
    for (let i = 0; i < 120; i++) {
      const { fortune: f } = buildAlmanac(new Date(2024, 0, 1 + i));
      expect(LUCKY_CC_DEVICES).toContain(f.luckyDevice);
      expect(LUCKY_FINGERS).toContain(f.luckyFinger);
      expect(LUCKY_KEYCAPS).toContain(f.luckyKeycap);
      expect(CLASH_NEMESES).toContain(f.clashNemesis);
      expect(AUSPICIOUS_HOURS).toContain(f.auspiciousHour);
      expect(CHORD_PROVERBS).toContain(f.proverb);
      expect(Number.isInteger(f.luckyNumber)).toBe(true);
      expect(f.luckyNumber).toBeGreaterThanOrEqual(0);
      expect(f.luckyNumber).toBeLessThan(100);
    }
  });

  it("uses a good spread of each pool over a year (no field stuck on one value)", () => {
    const seen = { dev: new Set<string>(), num: new Set<number>(), pro: new Set<string>() };
    for (let i = 0; i < 366; i++) {
      const { fortune: f } = buildAlmanac(new Date(2024, 0, 1 + i));
      seen.dev.add(f.luckyDevice);
      seen.num.add(f.luckyNumber);
      seen.pro.add(f.proverb);
    }
    expect(seen.dev.size).toBe(LUCKY_CC_DEVICES.length);
    expect(seen.pro.size).toBe(CHORD_PROVERBS.length);
    expect(seen.num.size).toBeGreaterThan(50);
  });

  it("can reach both ends of the lucky number range (0 and 99) over a few years", () => {
    const numbers = new Set<number>();
    for (let i = 0; i < 3 * 366; i++) numbers.add(buildAlmanac(new Date(2023, 0, 1 + i)).fortune.luckyNumber);
    expect(Math.min(...numbers)).toBe(0);
    expect(Math.max(...numbers)).toBe(99);
  });

  it("attaches the verified history for the day, and nothing otherwise", () => {
    expect(buildAlmanac(new Date(2024, 0, 1)).history.map((e) => e.year)).toEqual([2006]);
    expect(buildAlmanac(new Date(2024, 11, 9)).history.map((e) => e.year)).toEqual([1968]);
    expect(buildAlmanac(new Date(2024, 2, 3)).history).toEqual([]);
  });

  it("looks the history up by month then day, with months counted from 1", () => {
    // 08-27 (Sholes' QWERTY patent) must not come up on 27 September or 8 February
    expect(buildAlmanac(new Date(2024, 7, 27)).history).toHaveLength(1);
    expect(buildAlmanac(new Date(2024, 8, 27)).history).toEqual([]);
    expect(buildAlmanac(new Date(2024, 1, 8)).history).toEqual([]);
  });
});
