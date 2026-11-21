import { describe, expect, it } from "vitest";
import {
  AUSPICIOUS_HOURS,
  CHORD_PROVERBS,
  CLASH_NEMESES,
  LUCKY_CC_DEVICES,
  LUCKY_FINGERS,
  LUCKY_KEYCAPS,
} from "../src/data/fortune";
import { HISTORY, historyOf } from "../src/data/history";
import { DO, DONT } from "../src/data/yiji";

const pools: Record<string, readonly string[]> = {
  LUCKY_CC_DEVICES,
  LUCKY_FINGERS,
  CLASH_NEMESES,
  AUSPICIOUS_HOURS,
  LUCKY_KEYCAPS,
  CHORD_PROVERBS,
};

describe("fortune pools", () => {
  for (const [name, pool] of Object.entries(pools)) {
    it(`${name}: non-empty, trimmed, no blanks, no duplicates`, () => {
      expect(pool.length).toBeGreaterThan(0);
      pool.forEach((s) => {
        expect(s.trim()).toBe(s);
        expect(s.length).toBeGreaterThan(0);
      });
      expect(new Set(pool).size).toBe(pool.length);
    });
  }

  it("lists the real CharaChorder devices", () => {
    expect(LUCKY_CC_DEVICES).toEqual(
      expect.arrayContaining(["CharaChorder One", "CharaChorder Lite", "CharaChorder X", "CharaChorder Two"]),
    );
  });
});

describe("Do / Don't pools", () => {
  for (const [name, pool] of [["DO", DO], ["DONT", DONT]] as const) {
    it(`${name}: enough entries for four distinct picks, unique names, filled fields`, () => {
      expect(pool.length).toBeGreaterThanOrEqual(4);
      expect(new Set(pool.map((i) => i.name)).size).toBe(pool.length);
      pool.forEach((i) => {
        expect(i.name.trim()).toBe(i.name);
        expect(i.name.length).toBeGreaterThan(0);
        expect(i.desc.trim().length).toBeGreaterThan(0);
      });
    });
  }

  it("never shares a name between Do and Don't (the page would contradict itself)", () => {
    const dont = new Set(DONT.map((i) => i.name));
    DO.forEach((i) => expect(dont.has(i.name)).toBe(false));
  });
});

describe("history data", () => {
  it("is keyed by a real calendar day written MM-DD", () => {
    for (const key of Object.keys(HISTORY)) {
      expect(key).toMatch(/^\d{2}-\d{2}$/);
      const [m, d] = key.split("-").map(Number);
      // 2024 is a leap year, so 02-29 would be accepted too
      const date = new Date(2024, m - 1, d);
      expect(date.getMonth()).toBe(m - 1);
      expect(date.getDate()).toBe(d);
    }
  });

  it("only has events from a plausible year with text", () => {
    for (const events of Object.values(HISTORY)) {
      expect(events.length).toBeGreaterThan(0);
      for (const e of events) {
        expect(Number.isInteger(e.year)).toBe(true);
        expect(e.year).toBeGreaterThan(1800);
        expect(e.year).toBeLessThanOrEqual(new Date().getFullYear());
        expect(e.text.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("holds the eight verified days", () => {
    expect(Object.keys(HISTORY).sort()).toEqual([
      "01-01", "04-08", "05-12", "06-23", "07-31", "08-27", "11-22", "12-09",
    ]);
  });
});

describe("historyOf", () => {
  it("finds the entry for a day, padding single digits", () => {
    expect(historyOf(1, 1)).toEqual(HISTORY["01-01"]);
    expect(historyOf(4, 8)).toEqual(HISTORY["04-08"]);
    expect(historyOf(12, 9)[0].year).toBe(1968);
  });

  it("does not mix up month and day", () => {
    // 12-09 exists, 09-12 does not
    expect(historyOf(9, 12)).toEqual([]);
  });

  it("returns an empty list for a day without a verified entry", () => {
    expect(historyOf(2, 29)).toEqual([]);
    expect(historyOf(3, 3)).toEqual([]);
  });

  it("sorts oldest first without touching the stored list", () => {
    const original = HISTORY["01-01"];
    HISTORY["01-01"] = [
      { year: 2010, text: "newer event here" },
      { year: 1990, text: "older event here" },
    ];
    try {
      expect(historyOf(1, 1).map((e) => e.year)).toEqual([1990, 2010]);
      expect(HISTORY["01-01"].map((e) => e.year)).toEqual([2010, 1990]);
    } finally {
      HISTORY["01-01"] = original;
    }
  });
});
