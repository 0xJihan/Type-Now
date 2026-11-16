/**
 * Mulberry32 32-bit seedable pseudorandom number generator.
 * Fast, deterministic, and uniformly distributed.
 */
export class PRNG {
  private state: number;

  constructor(seed?: number | string) {
    if (typeof seed === "string") {
      this.state = PRNG.hashString(seed);
    } else if (typeof seed === "number") {
      this.state = seed >>> 0;
    } else {
      this.state = Math.floor(Math.random() * 0xffffffff) >>> 0;
    }
  }

  private static hashString(str: string): number {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  /**
   * Returns a float in [0, 1).
   */
  public next(): number {
    let z = (this.state += 0x6d2b79f5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer in [min, max] inclusive.
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
