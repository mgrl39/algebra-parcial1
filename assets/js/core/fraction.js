/* ============================================================
   Àlgebra · Parcial 1 — Aritmètica exacta de fraccions
   ============================================================ */
(function (global) {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }

  class Frac {
    constructor(n, d) {
      if (n instanceof Frac) { this.n = n.n; this.d = n.d; return; }
      if (d === undefined) d = 1;
      if (!Number.isFinite(n) || !Number.isFinite(d)) throw new Error('Frac: valor no finit');
      if (!Number.isInteger(n) || !Number.isInteger(d)) {
        // accept decimal input gracefully (limited precision)
        const prec = 1e9;
        n = Math.round(n * prec); d = Math.round(d * prec);
      }
      if (d === 0) throw new Error('Frac: denominador zero');
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d);
      this.n = n / g; this.d = d / g;
    }
    static of(n, d) { return new Frac(n, d); }
    static zero() { return new Frac(0, 1); }
    static one() { return new Frac(1, 1); }
    add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { o = Frac.of(o); if (o.n === 0) throw new Error('Frac: divisió per zero'); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    inv() { if (this.n === 0) throw new Error('Frac: invers de zero'); return new Frac(this.d, this.n); }
    pow(k) {
      k = Math.round(k);
      if (k === 0) return Frac.one();
      if (k < 0) return this.inv().pow(-k);
      return new Frac(Math.pow(this.n, k), Math.pow(this.d, k));
    }
    isZero() { return this.n === 0; }
    isOne() { return this.n === 1 && this.d === 1; }
    isInt() { return this.d === 1; }
    eq(o) { o = Frac.of(o); return this.n === o.n && this.d === o.d; }
    cmp(o) { o = Frac.of(o); return this.n * o.d - o.n * this.d; }
    abs() { return new Frac(Math.abs(this.n), this.d); }
    toNumber() { return this.n / this.d; }
    toJSON() { return this.toString(); }
    toString() { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; }
  }

  // Helper constructors/converters
  function F(x, d) { return x instanceof Frac ? x : new Frac(x, d); }
  function isFrac(x) { return x instanceof Frac; }

  global.Frac = Frac;
  global.F = F;
  global.isFrac = isFrac;
  global.fracGcd = gcd;
  if (typeof module !== 'undefined' && module.exports) module.exports = { Frac, F, gcd };
})(typeof window !== 'undefined' ? window : globalThis);
