/* ============================================================
   Àlgebra · Parcial 1 — Lectura de respostes de l'estudiant
   Analitza expressions com «2/3», «−1+2i», «√2», «3pi/4»,
   «2e^(iπ/6)» o «(3x−2)(x²+2x+5)» i les avalua a C.
   ============================================================ */
(function (global) {
  'use strict';

  // ---------- aritmètica complexa mínima ----------
  const cx = (re, im) => ({ re, im: im || 0 });
  const add = (a, b) => cx(a.re + b.re, a.im + b.im);
  const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  function div(a, b) {
    const d = b.re * b.re + b.im * b.im;
    if (d === 0) throw new ExprError('Divisió per zero');
    return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  }
  const abs = a => Math.hypot(a.re, a.im);
  function cexp(a) { const r = Math.exp(a.re); return cx(r * Math.cos(a.im), r * Math.sin(a.im)); }
  function clog(a) { return cx(Math.log(abs(a)), Math.atan2(a.im, a.re)); }
  function cpow(a, b) {
    if (Math.abs(b.im) < 1e-12 && Number.isInteger(b.re) && Math.abs(b.re) <= 64) {
      let n = b.re, r = cx(1, 0), base = a;
      if (n < 0) { base = div(cx(1, 0), a); n = -n; }
      for (let k = 0; k < n; k++) r = mul(r, base);
      return r;
    }
    if (abs(a) === 0) return cx(0, 0);
    return cexp(mul(b, clog(a)));
  }
  function csqrt(a) {
    if (Math.abs(a.im) < 1e-15 && a.re >= 0) return cx(Math.sqrt(a.re), 0);
    return cpow(a, cx(0.5, 0));
  }

  class ExprError extends Error {}

  // ---------- normalització ----------
  const SUPS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  function normalize(src, opts) {
    let s = String(src || '').trim();
    s = s.replace(/[−–—]/g, '-').replace(/[·×∙⋅]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, m => '^(' + m.split('').map(c => SUPS[c]).join('') + ')');
    s = s.replace(/[\[{]/g, '(').replace(/[\]}]/g, ')');
    if (!opts || !opts.keepComma) s = s.replace(/(\d),(\d)/g, '$1.$2');
    return s;
  }

  // ---------- tokens ----------
  const FUNCS = ['sqrt', 'arrel', 'cos', 'sin', 'exp'];
  function tokenize(s, names) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const txt = s.slice(i, j);
        if ((txt.match(/\./g) || []).length > 1 || txt === '.') throw new ExprError('Nombre mal escrit: ' + txt);
        out.push({ t: 'num', v: Number(txt) });
        i = j; continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        const rest = s.slice(i).toLowerCase();
        const word = FUNCS.concat(['pi']).concat(names).filter(w => w.length > 1).sort((a, b) => b.length - a.length)
          .find(w => rest.startsWith(w));
        if (word) { out.push(FUNCS.includes(word) ? { t: 'fn', v: word } : { t: 'id', v: word }); i += word.length; continue; }
        const c = ch === 'X' ? 'x' : ch;
        if (!['x', 'i', 'e'].includes(c) && !names.includes(c)) throw new ExprError('Símbol desconegut: «' + ch + '»');
        out.push({ t: 'id', v: c });
        i++; continue;
      }
      if ('+-*/^()°√'.includes(ch)) { out.push({ t: ch }); i++; continue; }
      throw new ExprError('Caràcter no vàlid: «' + ch + '»');
    }
    return out;
  }

  // ---------- anàlisi sintàctica ----------
  function parse(src, opts) {
    opts = opts || {};
    const names = Object.keys(opts.env || {});
    const toks = tokenize(normalize(src, opts), names);
    if (!toks.length) throw new ExprError('Resposta buida');
    let p = 0;
    const peek = () => toks[p];
    const take = t => {
      if (!toks[p] || toks[p].t !== t) throw new ExprError(t === ')' ? 'Falta tancar un parèntesi' : 'Expressió incompleta');
      return toks[p++];
    };
    const startsPrimary = tk => tk && (tk.t === 'num' || tk.t === 'id' || tk.t === 'fn' || tk.t === '(' || tk.t === '√');

    function expr() {
      let a = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        const op = toks[p++].t;
        a = { t: 'bin', op, a, b: term() };
      }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === '*' || tk.t === '/')) { p++; a = { t: 'bin', op: tk.t, a, b: unary() }; }
        else if (startsPrimary(tk)) a = { t: 'bin', op: '*', a, b: power() };
        else break;
      }
      return a;
    }
    function unary() {
      const tk = peek();
      if (tk && tk.t === '-') { p++; return { t: 'neg', a: unary() }; }
      if (tk && tk.t === '+') { p++; return unary(); }
      return power();
    }
    function power() {
      const base = postfix();
      if (peek() && peek().t === '^') { p++; return { t: 'bin', op: '^', a: base, b: unary() }; }
      return base;
    }
    function postfix() {
      let a = primary();
      while (peek() && peek().t === '°') { p++; a = { t: 'bin', op: '*', a, b: { t: 'num', v: cx(Math.PI / 180, 0) } }; }
      return a;
    }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new ExprError('Expressió incompleta');
      if (tk.t === 'num') return { t: 'num', v: cx(tk.v, 0) };
      if (tk.t === 'id') return { t: 'id', v: tk.v };
      if (tk.t === '(') { const e = expr(); take(')'); return e; }
      if (tk.t === '√') {
        const nx = peek();
        if (nx && nx.t === '(') return { t: 'fn', v: 'sqrt', a: primary() };
        return { t: 'fn', v: 'sqrt', a: postfix() };
      }
      if (tk.t === 'fn') {
        if (peek() && peek().t === '(') { p++; const e = expr(); take(')'); return { t: 'fn', v: tk.v, a: e }; }
        return { t: 'fn', v: tk.v, a: postfix() };
      }
      throw new ExprError('Símbol inesperat: «' + tk.t + '»');
    }

    const ast = expr();
    if (p < toks.length) throw new ExprError(toks[p].t === ')' ? 'Sobra un parèntesi' : 'No s\'entén l\'expressió');
    return ast;
  }

  function evaluate(ast, env) {
    env = env || {};
    switch (ast.t) {
      case 'num': return ast.v;
      case 'neg': return mul(cx(-1, 0), evaluate(ast.a, env));
      case 'id': {
        if (ast.v === 'pi') return cx(Math.PI, 0);
        if (ast.v === 'i') return cx(0, 1);
        if (ast.v === 'e') return cx(Math.E, 0);
        if (ast.v in env) { const v = env[ast.v]; return typeof v === 'number' ? cx(v, 0) : v; }
        if (ast.v === 'x') throw new ExprError('Aquí no hi ha d\'aparèixer la x');
        throw new ExprError('Símbol desconegut: «' + ast.v + '»');
      }
      case 'fn': {
        const a = evaluate(ast.a, env);
        if (ast.v === 'sqrt' || ast.v === 'arrel') return csqrt(a);
        if (ast.v === 'exp') return cexp(a);
        if (ast.v === 'cos') return cx(Math.cos(a.re), 0);
        if (ast.v === 'sin') return cx(Math.sin(a.re), 0);
        break;
      }
      case 'bin': {
        const a = evaluate(ast.a, env), b = evaluate(ast.b, env);
        if (ast.op === '+') return add(a, b);
        if (ast.op === '-') return sub(a, b);
        if (ast.op === '*') return mul(a, b);
        if (ast.op === '/') return div(a, b);
        if (ast.op === '^') return cpow(a, b);
      }
    }
    throw new ExprError('Expressió no vàlida');
  }

  function usesX(ast) {
    if (ast.t === 'id') return ast.v === 'x';
    return ['a', 'b'].some(k => ast[k] && typeof ast[k] === 'object' && usesX(ast[k]));
  }

  // Valor numèric (complex) d'una resposta sense x.
  function value(src, opts) {
    const ast = parse(src, opts);
    if (usesX(ast)) throw new ExprError('Aquí no hi ha d\'aparèixer la x');
    const v = evaluate(ast, (opts && opts.env) || {});
    if (!Number.isFinite(v.re) || !Number.isFinite(v.im)) throw new ExprError('El resultat no és finit');
    return v;
  }

  function close(a, b, tol) {
    tol = tol || 1e-6;
    return abs(sub(a, b)) <= tol * Math.max(1, abs(b));
  }

  // ---------- polinomis ----------
  // Factors d'un producte: (x−1)(x+2)^2 → [{ast: x−1, mult: 1}, {ast: x+2, mult: 2}]
  function factors(ast) {
    if (ast.t === 'bin' && ast.op === '*') return factors(ast.a).concat(factors(ast.b));
    if (ast.t === 'neg') return [{ ast: { t: 'num', v: cx(-1, 0) }, mult: 1 }].concat(factors(ast.a));
    if (ast.t === 'bin' && ast.op === '^' && !usesX(ast.b)) {
      const e = evaluate(ast.b);
      if (Math.abs(e.im) < 1e-12 && Number.isInteger(e.re) && e.re > 0) {
        return factors(ast.a).map(f => ({ ast: f.ast, mult: f.mult * e.re }));
      }
    }
    return [{ ast, mult: 1 }];
  }

  // Coeficients (de grau 0 a 6) d'una expressió polinòmica en x, per interpolació.
  function coefficients(ast, env) {
    const N = 7;
    const xs = Array.from({ length: N }, (_, k) => k - 3);
    const ys = xs.map(x => evaluate(ast, Object.assign({}, env, { x: cx(x, 0) })));
    // diferències dividides de Newton
    const d = ys.slice();
    for (let j = 1; j < N; j++) {
      for (let k = N - 1; k >= j; k--) d[k] = div(sub(d[k], d[k - 1]), cx(xs[k] - xs[k - j], 0));
    }
    // expansió a la base de monomis
    let poly = [cx(0, 0)];
    for (let k = N - 1; k >= 0; k--) {
      const next = Array.from({ length: poly.length + 1 }, () => cx(0, 0));
      poly.forEach((c, j) => {
        next[j + 1] = add(next[j + 1], c);
        next[j] = sub(next[j], mul(c, cx(xs[k], 0)));
      });
      next[0] = add(next[0], d[k]);
      poly = next;
    }
    poly = poly.slice(0, N);
    const scale = Math.max(1, ...poly.map(abs));
    poly = poly.map(c => cx(Math.abs(c.re) < 1e-9 * scale ? 0 : c.re, Math.abs(c.im) < 1e-9 * scale ? 0 : c.im));
    // comprovem que realment és un polinomi
    const probe = cx(4.5, 0.75);
    const direct = evaluate(ast, Object.assign({}, env, { x: probe }));
    let horner = cx(0, 0);
    for (let k = poly.length - 1; k >= 0; k--) horner = add(mul(horner, probe), poly[k]);
    if (!close(direct, horner, 1e-5)) return null;
    let deg = poly.length - 1;
    while (deg > 0 && abs(poly[deg]) === 0) deg--;
    return { coeffs: poly.slice(0, deg + 1), degree: deg };
  }

  global.Expr = { parse, evaluate, value, close, factors, coefficients, usesX, ExprError, cx, add, sub, mul, div, abs };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Expr;
})(typeof window !== 'undefined' ? window : globalThis);
