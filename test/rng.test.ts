import { describe, expect, it } from "vitest";
import { makeRng, mulberry32, pickN, pickOne, xmur3 } from "../src/lib/rng";

describe("xmur3", () => {
  it("hashes a string to the same numbers every time (pinned values)", () => {
    const next = xmur3("2024-01-01");
    expect([next(), next(), next()]).toEqual([1513489722, 1859882186, 3337117244]);
    expect(xmur3("")()).toBe(167010153);
    expect(xmur3("a")()).toBe(519299066);
  });

  it("gives different seeds for different strings, and the same for equal strings", () => {
    expect(xmur3("2024-01-01")()).toBe(xmur3("2024-01-01")());
    expect(xmur3("2024-01-01")()).not.toBe(xmur3("2024-01-02")());
  });

  it("returns unsigned 32-bit integers", () => {
    const next = xmur3("anything");
    for (let i = 0; i < 100; i++) {
      const n = next();
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(2 ** 32);
    }
  });
});

describe("mulberry32", () => {
  it("produces the known sequence for a seed (pinned values)", () => {
    const next = mulberry32(12345);
    expect(next()).toBeCloseTo(0.9797282677609473, 15);
    expect(next()).toBeCloseTo(0.3067522644996643, 15);
    expect(next()).toBeCloseTo(0.484205421525985, 15);
    expect(next()).toBeCloseTo(0.817934412509203, 15);
  });

  it("stays in [0, 1) and is repeatable", () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("differs between seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("makeRng", () => {
  it("is the string hash fed into the generator (pinned values)", () => {
    const next = makeRng("2024-01-01");
    expect(next()).toBeCloseTo(0.3784003232140094, 15);
    expect(next()).toBeCloseTo(0.3008189757820219, 15);
    expect(next()).toBeCloseTo(0.08298859605565667, 15);
  });

  it("gives independent but identical streams for the same seed", () => {
    const a = makeRng("x");
    const b = makeRng("x");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("pickN", () => {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("picks the known elements for a seed (pinned)", () => {
    expect(pickN(makeRng("seed"), pool, 4)).toEqual([3, 7, 9, 4]);
  });

  it("returns n distinct members of the pool", () => {
    for (let s = 0; s < 50; s++) {
      const got = pickN(makeRng(`s${s}`), pool, 4);
      expect(got).toHaveLength(4);
      expect(new Set(got).size).toBe(4);
      got.forEach((x) => expect(pool).toContain(x));
    }
  });

  it("does not modify the array it is given", () => {
    const copy = [...pool];
    pickN(makeRng("seed"), copy, 4);
    expect(copy).toEqual(pool);
  });

  it("gives back everything (shuffled) when n is larger than the pool", () => {
    const got = pickN(makeRng("seed"), [1, 2, 3], 10);
    expect([...got].sort()).toEqual([1, 2, 3]);
  });

  it("handles n = 0, an empty pool and a single element", () => {
    expect(pickN(makeRng("a"), pool, 0)).toEqual([]);
    expect(pickN(makeRng("a"), [], 3)).toEqual([]);
    expect(pickN(makeRng("a"), ["only"], 3)).toEqual(["only"]);
  });

  it("can reach every element and every position over many seeds", () => {
    const first = new Set<number>();
    for (let s = 0; s < 400; s++) first.add(pickN(makeRng(`k${s}`), pool, 1)[0]);
    expect(first.size).toBe(pool.length);
  });

  it("consumes one random number per swap, so later picks depend on earlier ones", () => {
    const calls: number[] = [];
    pickN(() => (calls.push(0), 0), pool, 4);
    expect(calls).toHaveLength(pool.length - 1);
  });
});

describe("pickOne", () => {
  it("maps the random number onto the index range", () => {
    const pool = ["a", "b", "c", "d"];
    expect(pickOne(() => 0, pool)).toBe("a");
    expect(pickOne(() => 0.24999, pool)).toBe("a");
    expect(pickOne(() => 0.25, pool)).toBe("b");
    expect(pickOne(() => 0.999999, pool)).toBe("d");
  });

  it("covers every element over many seeds", () => {
    const pool = ["a", "b", "c", "d", "e"];
    const seen = new Set<string>();
    for (let s = 0; s < 200; s++) seen.add(pickOne(makeRng(`p${s}`), pool));
    expect(seen.size).toBe(pool.length);
  });
});
