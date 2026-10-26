/* ============================================================
   Àlgebra · Parcial 1 — Nombres complexos
   ============================================================ */
(function (global) {
  'use strict';

  const PI = Math.PI;
  const TAU = 2 * Math.PI;

  // ---------- angles ----------
  const PRIVILEGED = [
    { theta: 0,          label: '0' },
    { theta: PI / 2,     label: 'π/2' },
    { theta: PI,         label: 'π' },
    { theta: -PI / 2,    label: '−π/2' },
    { theta: PI / 4,     label: 'π/4' },
    { theta: 3 * PI / 4, label: '3π/4' },
    { theta: -3 * PI / 4,label: '−3π/4' },
    { theta: -PI / 4,    label: '−π/4' },
    { theta: PI / 6,     label: 'π/6' },
    { theta: 5 * PI / 6, label: '5π/6' },
    { theta: -5 * PI / 6,label: '−5π/6' },
    { theta: -PI / 6,    label: '−π/6' },
    { theta: PI / 3,     label: 'π/3' },
    { theta: 2 * PI / 3, label: '2π/3' },
    { theta: -2 * PI / 3,label: '−2π/3' },
    { theta: -PI / 3,    label: '−π/3' }
  ];

  function normAngle(t) {
    t = t % TAU;
    if (t < 0) t += TAU;
    return t;
  }

  function angleLabel(theta) {
    const n = normAngle(theta);
    for (const p of PRIVILEGED) {
      const q = normAngle(p.theta);
      if (Math.abs(n - q) < 1e-9) return p.label;
    }
    const deg = n * 180 / PI;
    return deg.toFixed(2).replace(/\.?0+$/, '') + '°';
  }

  // Exact-looking labels for the 16 privileged angles (for cartesian output).
  function piFraction(k, den) {
    if (k === 0) return '0';
    const g = (a, b) => b ? g(b, a % b) : a;
    const d = g(Math.abs(k), den);
    const num = k / d, den2 = den / d;
    const numLabel = num === 1 ? '' : num === -1 ? '−' : String(num).replace('-', '−');
    if (den2 === 1) return numLabel + 'π';
    return numLabel + 'π/' + den2;
  }

  function anglePiLabel(theta) {
    // returns a label using multiples of π/12 when possible, else degrees
    const n = normAngle(theta);
    for (let k = 0; k < 24; k++) {
      if (Math.abs(n - k * PI / 12) < 1e-8) return piFraction(k, 12);
    }
    return angleLabel(theta);
  }

  function anglePiLabelSigned(theta) {
    // like anglePiLabel, but prefers the (−π, π] representative
    let n = theta % TAU;
    if (n <= -PI) n += TAU;
    if (n > PI) n -= TAU;
    for (let k = -12; k <= 12; k++) {
      if (Math.abs(n - k * PI / 12) < 1e-8) return piFraction(k, 12);
    }
    const deg = n * 180 / PI;
    return deg.toFixed(2).replace(/\.?0+$/, '').replace('-', '−') + '°';
  }

  // ---------- complex number ----------
  class C {
    constructor(re, im) {
      this.re = Number(re) || 0;
      this.im = Number(im) || 0;
    }
    static of(re, im) { return new C(re, im); }
    static zero() { return new C(0, 0); }
    static one() { return new C(1, 0); }
    static i() { return new C(0, 1); }
    add(o) { return new C(this.re + o.re, this.im + o.im); }
    sub(o) { return new C(this.re - o.re, this.im - o.im); }
    mul(o) { return new C(this.re * o.re - this.im * o.im, this.re * o.im + this.im * o.re); }
    div(o) {
      const den = o.re * o.re + o.im * o.im;
      if (den === 0) throw new Error('C: divisió per zero');
      return new C((this.re * o.re + this.im * o.im) / den, (this.im * o.re - this.re * o.im) / den);
    }
    scale(k) { return new C(this.re * k, this.im * k); }
    conj() { return new C(this.re, -this.im); }
    abs2() { return this.re * this.re + this.im * this.im; }
    abs() { return Math.sqrt(this.abs2()); }
    arg() { return Math.atan2(this.im, this.re); }
    argNorm() { return normAngle(this.arg()); }
    pow(n) {
      n = Math.round(n);
      let out = C.one(), base = this;
      if (n < 0) { base = C.one().div(this); n = -n; }
      while (n > 0) {
        if (n & 1) out = out.mul(base);
        base = base.mul(base); n >>= 1;
      }
      return out;
    }
    eq(o, eps) { eps = eps || 1e-9; return Math.abs(this.re - o.re) < eps && Math.abs(this.im - o.im) < eps; }
    isReal(eps) { return Math.abs(this.im) < (eps || 1e-9); }
    isZero(eps) { return this.abs() < (eps || 1e-9); }
    round(eps) {
      eps = eps || 1e-9;
      const r = Math.round(this.re), i = Math.round(this.im);
      if (Math.abs(this.re - r) < eps) this.re = r;
      if (Math.abs(this.im - i) < eps) this.im = i;
      return this;
    }
    toString() {
      if (Math.abs(this.im) < 1e-10) return num(this.re);
      if (Math.abs(this.re) < 1e-10) return (fmtImag(this.im)) + 'i';
      const sign = this.im < 0 ? ' − ' : ' + ';
      return num(this.re) + sign + fmtImag(Math.abs(this.im)) + 'i';
    }
  }

  function num(x) {
    if (Math.abs(x) < 1e-10) return '0';
    if (Math.abs(x - Math.round(x)) < 1e-10) return String(Math.round(x));
    const s = x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
  function fmtImag(x) {
    if (Math.abs(x - 1) < 1e-10) return '';
    if (Math.abs(x + 1) < 1e-10) return '−';
    return num(x);
  }

  // ---------- polar / roots ----------
  function polarParts(z) {
    return { r: z.abs(), theta: z.arg() };
  }

  function polarString(z, thetaLabel) {
    const r = z.abs(), th = thetaLabel || angleLabel(z.arg());
    const rn = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : num(r);
    return rn + ' e^(i' + th + ')';
  }

  function perfectRoot(a, n) {
    // integer n-th root if it exists (a >= 0 integer)
    if (a < 0 || !Number.isInteger(a)) return null;
    const r = Math.round(Math.pow(a, 1 / n));
    for (let k = Math.max(0, r - 2); k <= r + 2; k++) {
      if (Math.pow(k, n) === a) return k;
    }
    return null;
  }

  function nthRoots(z, n) {
    const r = z.abs();
    const th = z.arg();
    const out = [];
    for (let k = 0; k < n; k++) {
      const ang = (th + TAU * k) / n;
      const rr = Math.pow(r, 1 / n);
      out.push({ k, r: rr, theta: ang, value: new C(rr * Math.cos(ang), rr * Math.sin(ang)) });
    }
    return out;
  }

  // Cartesian coordinates from a polar value with a small privileged angle.
  function exactCosSin(theta) {
    const n = normAngle(theta);
    // known exact values for the 16 privileged angles
    const direct = {
      0: [1, 0], [PI / 6]: [Math.sqrt(3) / 2, 0.5], [PI / 4]: [Math.SQRT1_2, Math.SQRT1_2],
      [PI / 3]: [0.5, Math.sqrt(3) / 2], [PI / 2]: [0, 1], [2 * PI / 3]: [-0.5, Math.sqrt(3) / 2],
      [3 * PI / 4]: [-Math.SQRT1_2, Math.SQRT1_2], [5 * PI / 6]: [-Math.sqrt(3) / 2, 0.5],
      [PI]: [-1, 0], [7 * PI / 6]: [-Math.sqrt(3) / 2, -0.5], [5 * PI / 4]: [-Math.SQRT1_2, -Math.SQRT1_2],
      [4 * PI / 3]: [-0.5, -Math.sqrt(3) / 2], [3 * PI / 2]: [0, -1], [5 * PI / 3]: [0.5, -Math.sqrt(3) / 2],
      [7 * PI / 4]: [Math.SQRT1_2, -Math.SQRT1_2], [11 * PI / 6]: [Math.sqrt(3) / 2, -0.5]
    };
    for (const key of Object.keys(direct)) {
      if (Math.abs(n - Number(key)) < 1e-9) return direct[key];
    }
    return [Math.cos(n), Math.sin(n)];
  }

  global.Complex = {
    C, PI, TAU, PRIVILEGED, normAngle, angleLabel, anglePiLabel, anglePiLabelSigned,
    polarParts, polarString, nthRoots, perfectRoot, exactCosSin, num, fmtImag
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Complex;
})(typeof window !== 'undefined' ? window : globalThis);
