// A tiny seeded random source so a staged scene (and a ?seed= replay) always
// deals the same orders in the same order. The live game seeds itself from the clock.

export function makeRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}

/** A seed from the page's query string (?seed=N), or from the clock when absent. */
export function seedFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const parsed = raw === null ? NaN : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : (Date.now() % 2147483647);
}
