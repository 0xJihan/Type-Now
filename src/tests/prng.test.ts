import { describe, it, expect } from "vitest";
import { PRNG } from "../domain/prng";

describe("PRNG (Mulberry32)", () => {
  it("produces identical sequences for the same seed", () => {
    const prng1 = new PRNG("test-seed-xyz");
    const prng2 = new PRNG("test-seed-xyz");

    const seq1 = Array.from({ length: 20 }, () => prng1.next());
    const seq2 = Array.from({ length: 20 }, () => prng2.next());

    expect(seq1).toEqual(seq2);
  });

  it("produces different sequences for different seeds", () => {
    const prng1 = new PRNG("seed-alpha");
    const prng2 = new PRNG("seed-beta");

    const seq1 = Array.from({ length: 10 }, () => prng1.next());
    const seq2 = Array.from({ length: 10 }, () => prng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it("produces integers within the specified [min, max] range", () => {
    const prng = new PRNG(12345);
    for (let i = 0; i < 500; i++) {
      const val = prng.nextInt(5, 15);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(15);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});
