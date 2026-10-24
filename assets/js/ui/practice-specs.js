/* ============================================================
   Àlgebra · Parcial 1 — Camps de resposta de cada exercici
   Converteix un exercici (generat o real) en un full de
   respostes per a Practice.render().
   ============================================================ */
(function (global) {
  'use strict';
  const Mat = global.Mat, F = global.F, Fmt = global.Fmt;
  const m = s => `<span class="math">${s}</span>`;
  const LETTERS = 'abcdefgh';
  const YES_NO = [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }];

  function cplx(z) { return { re: z.re, im: z.im }; }
  function evalPoly(coeffs, z) {
    let re = 0, im = 0;
    for (const c of coeffs) { const nr = re * z.re - im * z.im + c, ni = re * z.im + im * z.re; re = nr; im = ni; }
    return { re, im };
  }

  /* ---------- polinomi de grau 3 amb una arrel complexa ---------- */
  function polyParts(d) {
    const [c3, c2] = d.coeffs;
    const z = { re: d.re, im: d.im };
    const z2 = { re: z.re * z.re - z.im * z.im, im: 2 * z.re * z.im };
    const z3 = { re: z2.re * z.re - z2.im * z.im, im: z2.re * z.im + z2.im * z.re };
    const r3 = -c2 / c3 - 2 * z.re;
    const defs = {
      check: {
        title: 'Comprova que z és arrel',
        fields: [
          { type: 'cplx', label: m('z<sup>2</sup> ='), answer: z2, placeholder: 'a+bi' },
          { type: 'cplx', label: m('z<sup>3</sup> ='), answer: z3, placeholder: 'a+bi' },
          { type: 'cplx', label: m('p(z) ='), answer: { re: 0, im: 0 } }
        ]
      },
      others: {
        title: 'Les altres arrels',
        fields: [{ type: 'roots', label: 'Les altres dues arrels:', answers: [{ re: z.re, im: -z.im }, { re: r3, im: 0 }] }]
      },
      draw: d.drawPowers
        ? {
          title: 'Punts que cal dibuixar',
          fields: [
            { type: 'cplx', label: m('z<sup>2</sup> ='), answer: z2 },
            { type: 'cplx', label: m('z<sup>3</sup> ='), answer: z3 }
          ]
        }
        : { title: 'Dibuix al pla complex', self: true, selfNote: 'és un dibuix' },
      real: {
        title: 'Factorització a R[x]',
        fields: [{ type: 'poly', mode: 'R', label: m('p(x) ='), coeffs: d.coeffs, placeholder: 'p. ex. (2x+1)(x^2-4x+5)' }]
      }
    };
    return d.order.map(k => defs[k]);
  }

  /* ---------- matrius i sistemes ---------- */
  function gauss(A) {
    const I = Mat.identity(A.length);
    const R = Mat.rrefSteps(A.map((r, i) => r.concat(I[i])));
    const n = A[0].length;
    const J = R.J.map(r => r.slice(0, n));
    return { J, P: R.J.map(r => r.slice(n)), rank: R.pivots.filter(c => c < n).length };
  }

  function queryAnswer(sol, k, value) {
    if (sol.basis.some(b => !F(b.vector[k]).isZero())) return 'si';
    return F(sol.particular[k]).eq(F(value)) ? 'si' : 'no';
  }

  function systemFields(sys) {
    const vars = sys.vars || Fmt.VARS;
    const M = sys.M;
    const n = M[0].length;
    const g = gauss(M);
    const dof = n - g.rank;
    if (sys.type === 'param') {
      const y0 = Mat.mulVec(g.P, sys.c0), y1 = Mat.mulVec(g.P, sys.c1);
      let special = null, never = false;
      g.J.forEach((row, i) => {
        if (!row.every(x => F(x).isZero())) return;
        if (!y1[i].isZero()) special = y0[i].neg().div(y1[i]);
        else if (!y0[i].isZero()) never = true;
      });
      const s = sys.pname;
      const fields = [];
      if (special) {
        fields.push({ type: 'num', label: `Valor de ${m(s)} per al qual el sistema és compatible: ${m(s + ' =')}`, answer: special });
      } else {
        fields.push({
          type: 'choice', label: `Per a quins valors de ${m(s)} és compatible?`,
          options: [{ v: 'tots', label: 'Per a tots' }, { v: 'un', label: 'Només per a un valor' }, { v: 'cap', label: 'Per a cap' }],
          answer: never ? 'cap' : 'tots'
        });
      }
      fields.push({ type: 'num', label: 'Graus de llibertat (quan és compatible):', answer: dof });
      const sv = special || F(0);
      const c = sys.c0.map((v, i) => F(v).add(F(sys.c1[i]).mul(sv)));
      fields.push({
        type: 'vector', n, M, c,
        label: `Una solució particular ${special ? 'en aquest cas' : 'per a ' + m(s + ' = 0')}: ${m('(' + vars.slice(0, n).join(', ') + ') =')}`
      });
      return fields;
    }
    const y = Mat.mulVec(g.P, sys.c);
    const sol = Mat.solveRREF(g.J, y);
    const fields = [
      { type: 'num', label: 'Graus de llibertat (dimensió de la varietat):', answer: dof },
      { type: 'vector', n, M, c: sys.c, label: `Una solució qualsevol: ${m('(' + vars.slice(0, n).join(', ') + ') =')}` }
    ];
    (sys.queries || []).forEach(q => {
      fields.push({
        type: 'choice', label: `Hi ha alguna solució amb ${m(q.v + ' = ' + Fmt.fracHTML(F(q.value)))}?`,
        options: YES_NO, answer: queryAnswer(sol, vars.indexOf(q.v), q.value)
      });
    });
    return fields;
  }

  function matrixParts(d) {
    const A = d.A;
    const g = gauss(A);
    const rows = A.length, cols = A[0].length;
    const jField = { type: 'matrix', rows, cols, answer: g.J, label: m('J =') };
    const rankField = { type: 'num', label: m('rang(A) ='), answer: g.rank };
    const pField = { type: 'matrix', key: 'P', rows, cols: rows, A, J: g.J, label: m('P =') };
    const detField = { type: 'det', of: 'P', answer: Mat.det(g.P), label: m('det(P) =') };
    if (d.layout === '2017') {
      return [
        { title: 'Forma de Gauss-Jordan, P i rang', fields: [Object.assign({}, jField, { label: m('A′ =') }), rankField, pField] },
        { title: 'Determinants', fields: [{ type: 'num', label: m('det(A) ='), answer: Mat.det(A) }, detField] },
        { title: 'Discussió del sistema', fields: systemFields(d.system) }
      ];
    }
    const parts = [
      { title: 'Matriu de Gauss-Jordan i rang', fields: [jField, rankField] },
      { title: 'Matriu P amb PA = J', fields: d.detP ? [pField, detField] : [pField] }
    ];
    if (d.rowComb) {
      parts.push({
        title: `Fila ${d.rowComb} de J com a combinació de files d'A`,
        fields: [{ type: 'rowcomb', A, target: g.J[d.rowComb - 1], label: m('f<sub>' + d.rowComb + '</sub>(J) =') }]
      });
    }
    parts.push({ title: d.system.type === 'param' ? 'Discussió del sistema' : 'Resolució del sistema', fields: systemFields(d.system) });
    return parts;
  }

  /* ---------- muntatge ---------- */
  function build(desc, solutionHTML, opts) {
    opts = opts || {};
    let parts;
    if (desc.kind === 'poly') parts = polyParts(desc);
    else if (desc.kind === 'matrix') parts = matrixParts(desc);
    else parts = desc.parts;
    const sols = global.Practice.splitSolution(solutionHTML || '', parts.length);
    const plot = opts.plot ? (Array.isArray(opts.plot) ? { points: opts.plot } : opts.plot) : null;
    let plotPart = opts.plotPart;
    if (plotPart === undefined) plotPart = desc.kind === 'poly' ? desc.order.indexOf('draw') : 1;
    return {
      title: opts.title,
      exam: !!opts.exam,
      plot,
      plotPart,
      parts: parts.map((p, i) => Object.assign({ label: '(' + LETTERS[i] + ')', solutionHTML: sols[i] }, p))
    };
  }

  /* ---------- exercicis del generador ---------- */
  function fromGenerated(ex, opts) {
    const d = ex.data || {};
    opts = Object.assign({ plot: ex.plot }, opts);
    if (ex.topic === 'polinomis') {
      const z = ex.poly.z;
      return build({
        kind: 'poly', coeffs: ex.poly.coeffs, re: z.re, im: z.im,
        drawPowers: ex.poly.wantsPowers, order: ['check', 'others', 'draw', 'real']
      }, ex.solutionHTML, opts);
    }
    if (ex.topic === 'matrius') {
      let system;
      if (d.paramData) {
        const k = d.paramData.k;
        system = {
          type: 'param', M: d.A, pname: 'b',
          c0: d.paramData.c0.map((v, i) => (i === k ? 0 : v)),
          c1: d.A.map((_, i) => (i === k ? 1 : 0))
        };
      } else {
        system = { type: 'numeric', M: d.A, c: d.c, queries: d.query ? [{ v: d.query.variable, value: d.query.value }] : [] };
      }
      return build({ kind: 'matrix', A: d.A, detP: true, rowComb: d.rowIndex + 1, system }, ex.solutionHTML, opts);
    }
    if (ex.topic === 'complexos') {
      opts.plotPart = d.mode === 'polar' ? 2 : 0;
      return build({ kind: 'custom', parts: complexParts(ex) }, ex.solutionHTML, opts);
    }
    return null;
  }

  function complexParts(ex) {
    const d = ex.data;
    if (d.mode === 'polar') {
      const pw = d.power;
      const ang = Math.atan2(pw.im, pw.re);
      const isReal = Math.abs(pw.im) < 1e-6 * Math.max(1, Math.hypot(pw.re, pw.im));
      return [
        { title: 'Mòdul i argument', fields: [
          { type: 'num', label: m('|z| ='), answer: Math.hypot(d.z.re, d.z.im), placeholder: 'p. ex. 2√2' },
          { type: 'angle', label: m('arg(z) ='), answer: Math.atan2(d.z.im, d.z.re), placeholder: 'p. ex. 3pi/4' }
        ] },
        { title: 'Forma exponencial', fields: [
          { type: 'cplx', label: m('z ='), answer: cplx(d.z), placeholder: 'p. ex. 2e^(iπ/3)' }
        ] },
        { title: `Potència z<sup>${d.n}</sup>`, fields: [
          { type: 'num', label: m(`|z<sup>${d.n}</sup>| =`), answer: Math.hypot(pw.re, pw.im) },
          { type: 'angle', label: m(`arg(z<sup>${d.n}</sup>) =`), answer: ang },
          { type: 'choice', label: 'És…', options: [{ v: 'pos', label: 'real positiu' }, { v: 'neg', label: 'real negatiu' }, { v: 'no', label: 'no real' }],
            answer: !isReal ? 'no' : pw.re > 0 ? 'pos' : 'neg' }
        ] }
      ];
    }
    if (d.mode === 'roots') {
      const coeffs = [1].concat(Array(d.n - 1).fill(0)).concat([-d.c]);
      return [
        { title: 'Arrels', fields: [{ type: 'roots', label: `Les ${d.n} solucions:`, answers: d.roots.map(cplx), placeholder: '' }] },
        { title: 'Factorització a C[x]', fields: [{ type: 'poly', mode: 'C', label: m('p(x) ='), coeffs }] },
        { title: 'Factorització a R[x]', fields: [{ type: 'poly', mode: 'R', label: m('p(x) ='), coeffs }] }
      ];
    }
    return [
      { title: 'Suma i producte', fields: [
        { type: 'cplx', label: m('z + w ='), answer: cplx(d.sum) },
        { type: 'cplx', label: m('z·w ='), answer: cplx(d.prod) }
      ] },
      { title: 'Quocient', fields: [{ type: 'cplx', label: m('z/w ='), answer: cplx(d.quot) }] },
      { title: 'Mòdul, argument i conjugat', fields: [
        { type: 'num', label: m('|z| ='), answer: Math.hypot(d.z.re, d.z.im) },
        { type: 'angle', label: m('arg(z) ='), answer: Math.atan2(d.z.im, d.z.re) },
        { type: 'cplx', label: m('z̄ ='), answer: { re: d.z.re, im: -d.z.im } }
      ] }
    ];
  }

  global.PracticeSpecs = { build, fromGenerated, evalPoly };
})(typeof window !== 'undefined' ? window : globalThis);
