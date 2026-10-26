/* ============================================================
   Àlgebra · Parcial 1 — Aleatorietat reproducible
   ============================================================ */
(function (global) {
  'use strict';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class RNG {
    constructor(seed) {
      this.seed = (seed === undefined || seed === null)
        ? (Math.floor(Math.random() * 2 ** 32) >>> 0)
        : (seed >>> 0);
      this._r = mulberry32(this.seed);
    }
    next() { return this._r(); }
    int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
    pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    chance(p) { return this.next() < p; }
    sign() { return this.chance(0.5) ? 1 : -1; }
    nonZero(a, b) { let x = 0; while (x === 0) x = this.int(a, b); return x; }
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    sample(arr, k) { return this.shuffle(arr).slice(0, k); }
  }

  global.Rand = { RNG, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Rand;
})(typeof window !== 'undefined' ? window : globalThis);
