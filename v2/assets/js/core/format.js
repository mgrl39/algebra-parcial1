/* ============================================================
   Àlgebra · Parcial 1 — Format HTML de matemàtiques
   ============================================================ */
(function (global) {
  'use strict';
  const Frac = global.Frac, F = global.F;

  const VARS = ['x', 'y', 'z', 't', 'u', 'v', 'w'];
  const PARAMS = ['λ', 'μ', 'ν', 'ρ'];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function sgnNum(x) { return x < 0 ? '−' : '+'; }
  function numStr(x) {
    if (typeof x === 'number') {
      if (Math.abs(x) < 1e-9) return '0';
      if (Math.abs(x - Math.round(x)) < 1e-8) return String(Math.round(x)).replace('-', '−');
      if (Math.abs(x) < 0.0005) return '0';
      return x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '').replace('-', '−');
    }
    return String(x);
  }
  function fracStr(x) {
    if (x instanceof Frac) return x.toString().replace('-', '−');
    return numStr(x);
  }
  function fracHTML(x) {
    if (!(x instanceof Frac)) return esc(numStr(x));
    if (x.d === 1) return esc(String(x.n).replace('-', '−'));
    const sign = x.n < 0 ? '−' : '';
    return sign + '<span class="frac"><span>' + Math.abs(x.n) + '</span><span>' + x.d + '</span></span>';
  }
  function fracPlain(x) {
    if (x instanceof Frac) return (x.n < 0 ? '−' : '') + Math.abs(x.n) + (x.d === 1 ? '' : '/' + x.d);
    return numStr(x);
  }
  function absFracHTML(x) { return fracHTML(x instanceof Frac ? x.abs() : Math.abs(x)); }

  function matHTML(rows, opts) {
    opts = opts || {};
    const m = rows.length, n = rows[0].length;
    const cells = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let cls = 'mcell';
        if (opts.augment !== undefined && j >= opts.augment) cls += ' aug';
        if (opts.pivotCols && opts.pivotCols.includes(j)) cls += ' pivot';
        const val = rows[i][j];
        let txt;
        if (val instanceof Frac) txt = fracHTML(val);
        else if (typeof val === 'number') txt = esc(numStr(val));
        else txt = esc(String(val));
        cells.push('<span class="' + cls + '">' + txt + '</span>');
      }
    }
    return '<span class="matrix" style="grid-template-columns:repeat(' + n + ',auto)">' + cells.join('') + '</span>';
  }

  function polyHTML(coeffs, v) {
    v = v || 'x';
    const terms = [];
    const deg = coeffs.length - 1;
    coeffs.forEach((c, idx) => {
      const x = Number(c);
      if (Math.abs(x) < 1e-12) return;
      const power = deg - idx;
      let body = '';
      const abs = Math.abs(x);
      if (power === 0) body = numStr(abs);
      else {
        let cpart = Math.abs(abs - 1) < 1e-12 ? '' : numStr(abs);
        let vpart = power === 1 ? v : v + '<sup>' + power + '</sup>';
        body = cpart + vpart;
      }
      terms.push({ sign: x < 0 ? '−' : '+', body, first: terms.length === 0 });
    });
    if (!terms.length) return '0';
    return terms.map((t, i) => {
      if (i === 0) return (t.sign === '−' ? '−' : '') + t.body;
      return ' ' + t.sign + ' ' + t.body;
    }).join('');
  }

  function complexHTML(z, opts) {
    opts = opts || {};
    let re = z.re, im = z.im;
    const round = x => Math.abs(x - Math.round(x)) < 1e-8 ? Math.round(x) : x;
    re = round(re); im = round(im);
    const rStr = numStr(re), iStr = numStr(Math.abs(im));
    if (Math.abs(im) < 1e-9) return esc(rStr);
    const imPart = (Math.abs(Math.abs(im) - 1) < 1e-9 ? '' : iStr) + 'i';
    if (Math.abs(re) < 1e-9) return esc((im < 0 ? '−' : '') + imPart);
    return esc(rStr + ' ' + (im < 0 ? '−' : '+') + ' ' + imPart);
  }

  function polarHTML(r, theta, opts) {
    opts = opts || {};
    const rn = (Math.abs(r - Math.round(r)) < 1e-8) ? String(Math.round(r)) : numStr(r);
    const th = opts.label || global.Complex.anglePiLabel(theta);
    const thEsc = esc(th);
    const exp = /^[−-]/.test(thEsc) ? 'e<sup>−i' + thEsc.slice(1) + '</sup>' : 'e<sup>i' + thEsc + '</sup>';
    return esc(rn) + ' ' + exp;
  }

  function cplxPolarHTML(z) {
    return polarHTML(z.abs(), z.arg());
  }

  function opHTML(op) {
    if (op.type === 'swap') return 'F<sub>' + (op.i + 1) + '</sub> ↔ F<sub>' + (op.j + 1) + '</sub>';
    if (op.type === 'scale') {
      const k = op.k instanceof Frac ? fracHTML(op.k) : esc(numStr(op.k));
      return 'F<sub>' + (op.i + 1) + '</sub> ← ' + k + ' F<sub>' + (op.i + 1) + '</sub>';
    }
    if (op.type === 'add') {
      const k = op.k instanceof Frac ? op.k : F(op.k);
      const abs = k.abs();
      const coef = abs.isOne() ? '' : fracHTML(abs);
      const sign = k.n < 0 ? '−' : '+';
      return 'F<sub>' + (op.i + 1) + '</sub> ← F<sub>' + (op.i + 1) + '</sub> ' + sign + ' ' + coef + ' F<sub>' + (op.j + 1) + '</sub>';
    }
    return '';
  }

  function systemHTML(A, b, v) {
    v = v || VARS;
    const rows = [];
    for (let i = 0; i < A.length; i++) {
      const parts = [];
      for (let j = 0; j < A[i].length; j++) {
        const c = F(A[i][j]);
        if (c.isZero()) continue;
        const abs = c.abs();
        const coef = abs.isOne() ? '' : fracHTML(abs);
        const name = v[j] || ('x' + (j + 1));
        const term = coef + name;
        if (parts.length === 0) parts.push((c.n < 0 ? '−' : '') + term);
        else parts.push((c.n < 0 ? ' − ' : ' + ') + term);
      }
      if (!parts.length) parts.push('0');
      rows.push(parts.join('') + ' = ' + fracHTML(F(b[i])));
    }
    return '<div class="eqsys">' + rows.map(r => '<div>' + r + '</div>').join('') + '</div>';
  }

  function vectorHTML(vec) {
    return '(' + vec.map(x => fracHTML(F(x))).join(', ') + ')';
  }

  function paramLineHTML(n, particular, basis, v) {
    v = v || VARS;
    const parts = [];
    for (let i = 0; i < n; i++) {
      const base = F(particular[i]);
      let expr = base.isZero() ? '' : fracHTML(base);
      basis.forEach((b, k) => {
        const c = F(b.vector[i]);
        if (c.isZero()) return;
        const abs = c.abs();
        const coef = abs.isOne() ? '' : fracHTML(abs);
        const p = PARAMS[k] || ('t' + (k + 1));
        expr += expr ? ' ' + (c.n < 0 ? '−' : '+') + ' ' + coef + p : (c.n < 0 ? '−' : '') + coef + p;
      });
      if (!expr) expr = '0';
      parts.push('<span class="pvar">' + (v[i] || 'x' + (i + 1)) + '</span> = ' + expr);
    }
    return '<div class="param-line">' + parts.join('&nbsp;&nbsp;·&nbsp;&nbsp;') + '</div>';
  }

  function paramVectorHTML(n, particular, basis, v) {
    v = v || VARS;
    const p = '(' + particular.map(x => fracHTML(F(x))).join(', ') + ')';
    let s = p;
    basis.forEach((b, k) => {
      const pname = PARAMS[k] || ('t' + (k + 1));
      s += ' + ' + pname + '<span class="vec">(' + b.vector.map(x => fracHTML(F(x))).join(', ') + ')</span>';
    });
    return s;
  }

  global.Fmt = {
    esc, numStr, fracStr, fracHTML, fracPlain, absFracHTML,
    matHTML, polyHTML, complexHTML, polarHTML, cplxPolarHTML,
    opHTML, systemHTML, vectorHTML, paramLineHTML, paramVectorHTML,
    VARS, PARAMS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Fmt;
})(typeof window !== 'undefined' ? window : globalThis);
