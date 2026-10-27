/* ============================================================
   Àlgebra · Parcial 1 — Parcials reals d'anys anteriors
   Els enunciats són els originals; les parts de matrius i
   sistemes es calculen amb aritmètica exacta (Mat, Frac).
   ============================================================ */
(function (global) {
  'use strict';
  const Mat = global.Mat, Fmt = global.Fmt, F = global.F, Frac = global.Frac;
  const C = global.Complex.C;
  const SQ3 = Math.sqrt(3), SQ2 = Math.SQRT2;

  const m = s => `<span class="math">${s}</span>`;
  const mc = s => `<p class="math center">${s}</p>`;

  /* ---------- matrius: J, P, rang ---------- */
  function gauss(A) {
    const rows = A.length, cols = A[0].length;
    const I = Mat.identity(rows);
    const aug = A.map((r, i) => r.concat(I[i]));
    const R = Mat.rrefSteps(aug);
    const J = R.J.map(r => r.slice(0, cols));
    const P = R.J.map(r => r.slice(cols));
    const pivots = R.pivots.filter(c => c < cols);
    const steps = Mat.rrefSteps(A).steps;
    return { A, J, P, rank: pivots.length, pivots, steps, detP: Mat.det(P) };
  }

  function stepsHTML(g) {
    return `<details class="steps"><summary>Veure la reducció pas a pas (${g.steps.length} operacions)</summary>
      <div class="steps-body">${g.steps.map(s => `
        <div class="step"><div class="step-op">${Fmt.opHTML(s.op)}</div>${Fmt.matHTML(s.matrix)}</div>`).join('')}
      </div></details>`;
  }

  function gaussSolutionHTML(g, label) {
    return `
      <h4>${label || '(a)'} Matriu de Gauss-Jordan i rang</h4>
      <p>Fem operacions elementals per files fins a la forma reduïda esglaonada:</p>
      ${stepsHTML(g)}
      <p class="answer">${m('J = ' + Fmt.matHTML(g.J, { pivotCols: g.pivots }))}</p>
      <p>${m('rang(A) = ' + g.rank)} (nombre de pivots).</p>`;
  }

  function pSolutionHTML(g, label, withDet) {
    return `
      <h4>${label || '(b)'} Matriu P invertible amb PA = J</h4>
      <p>Apliquem les mateixes operacions a la matriu ampliada ${m('(A | I)')}; quan a l'esquerra queda ${m('J')}, a la dreta queda ${m('P')}:</p>
      <p class="answer">${m('P = ' + Fmt.matHTML(g.P))}</p>
      ${withDet ? `<p>${m('det(P) = ' + Fmt.fracHTML(g.detP))}</p>` : ''}
      <div class="note">${m('P')} no és única: qualsevol seqüència d'operacions que porti ${m('A')} a ${m('J')} dona una ${m('P')} vàlida. Comprova-la sempre fent ${m('P·A')}.</div>`;
  }

  function rowCombHTML(row) {
    const parts = [];
    row.forEach((c, j) => {
      const f = F(c);
      if (f.isZero()) return;
      const abs = f.abs();
      const coef = abs.isOne() ? '' : Fmt.fracHTML(abs);
      const term = coef + 'f<sub>' + (j + 1) + '</sub>(A)';
      if (!parts.length) parts.push((f.n < 0 ? '−' : '') + term);
      else parts.push((f.n < 0 ? ' − ' : ' + ') + term);
    });
    return parts.join('') || '0';
  }

  function cols(A, from, to) { return A.map(r => r.slice(from, to)); }
  function col(A, j) { return A.map(r => r[j]); }

  // Sistema numèric amb coeficients Mc i termes independents c.
  function systemSolutionHTML(Mc, c, opts) {
    opts = opts || {};
    const g = gauss(Mc);
    const y = Mat.mulVec(g.P, c);
    const sol = Mat.solveRREF(g.J, y);
    const n = Mc[0].length;
    const vars = opts.vars || Fmt.VARS;
    let html = opts.augmentedNote
      ? `<p>La matriu ampliada del sistema és exactament ${m('A')}, de manera que ${m('J')} ja és la forma de Gauss-Jordan del sistema ampliat (l'última columna són els termes independents).</p>`
      : `<p>Multipliquem per ${m('P')}: el sistema equivalent és ${m('Jx = Pc')}, amb ${m('Pc = ' + Fmt.vectorHTML(y))}.</p>`;
    if (!sol.compatible) {
      return html + `<p class="answer">El sistema és <strong>incompatible</strong>.</p>`;
    }
    const dim = sol.basis.length;
    html += `
      <p>Les incògnites lliures són ${sol.freeCols.map(j => m(vars[j])).join(', ') || 'cap'}. La solució en forma paramètrica és:</p>
      <p class="answer">${m('(' + vars.slice(0, n).join(', ') + ') = ' + Fmt.paramVectorHTML(n, sol.particular, sol.basis))}</p>
      <p>${m(Fmt.paramLineHTML(n, sol.particular, sol.basis, vars))}</p>
      <p>Sistema <strong>${dim ? 'compatible indeterminat' : 'compatible determinat'}</strong>: ${n} incògnites − rang ${g.rank} = ${m(String(dim))} grau${dim === 1 ? '' : 's'} de llibertat (dimensió de la varietat lineal).</p>`;
    (opts.queries || []).forEach(q => {
      const k = vars.indexOf(q.v);
      const b = sol.basis.findIndex(bb => !F(bb.vector[k]).isZero());
      const val = F(q.value);
      if (b >= 0) {
        const t = val.sub(sol.particular[k]).div(sol.basis[b].vector[k]);
        html += `<p><strong>Sí</strong> hi ha solucions amb ${m(q.v + ' = ' + Fmt.fracHTML(val))}: per exemple prenent ${m(Fmt.PARAMS[b] + ' = ' + Fmt.fracHTML(t))}${dim > 1 ? ' (i la resta de paràmetres 0)' : ''}.</p>`;
      } else if (F(sol.particular[k]).eq(val)) {
        html += `<p><strong>Sí</strong>: ${m(q.v)} val sempre ${m(Fmt.fracHTML(val))}.</p>`;
      } else {
        html += `<p><strong>No</strong> hi ha cap solució amb ${m(q.v + ' = ' + Fmt.fracHTML(val))}: a totes les solucions ${m(q.v + ' = ' + Fmt.fracHTML(F(sol.particular[k])))}.</p>`;
      }
    });
    return html;
  }

  // Termes independents c0 + s·c1 (s = paràmetre).
  function linHTML(a, b, s) {
    a = F(a); b = F(b);
    if (b.isZero()) return Fmt.fracHTML(a);
    const coef = b.abs().isOne() ? '' : Fmt.fracHTML(b.abs());
    if (a.isZero()) return (b.n < 0 ? '−' : '') + coef + s;
    return Fmt.fracHTML(a) + (b.n < 0 ? ' − ' : ' + ') + coef + s;
  }

  function paramSystemHTML(Mc, c0, c1, s, vars) {
    const g = gauss(Mc);
    const y0 = Mat.mulVec(g.P, c0), y1 = Mat.mulVec(g.P, c1);
    const n = Mc[0].length;
    const conds = [];
    g.J.forEach((row, i) => {
      if (row.every(x => F(x).isZero())) conds.push({ i, a: y0[i], b: y1[i] });
    });
    let html = `<p>Multipliquem els termes independents per ${m('P')}:</p>
      <p class="answer">${m('P·c = (' + y0.map((a, i) => linHTML(a, y1[i], s)).join(', ') + ')')}</p>`;
    const always = conds.every(k => k.a.isZero() && k.b.isZero());
    let special = null;
    if (!conds.length || always) {
      html += conds.length
        ? `<p>Les files nul·les de ${m('J')} tenen terme independent ${m('0')} <em>per a qualsevol</em> ${m(s)}: el sistema és <strong>sempre compatible</strong>.</p>`
        : `<p>${m('J')} no té files nul·les: el sistema és sempre compatible.</p>`;
    } else {
      const k = conds.find(q => !q.b.isZero());
      special = k.a.neg().div(k.b);
      html += `<p>La fila ${k.i + 1} de ${m('J')} és nul·la, per tant cal ${m(linHTML(k.a, k.b, s) + ' = 0')}, és a dir ${m(s + ' = ' + Fmt.fracHTML(special))}.</p>
        <ul>
          <li>Si ${m(s + ' ≠ ' + Fmt.fracHTML(special))}: <strong>incompatible</strong> (${m('rang(A) ≠ rang(A|c)')}).</li>
          <li>Si ${m(s + ' = ' + Fmt.fracHTML(special))}: <strong>compatible</strong>.</li>
        </ul>`;
    }
    const dim = n - g.rank;
    const yUse = special ? y0.map((a, i) => a.add(y1[i].mul(special))) : y0;
    const y1Use = special ? y1.map(() => F(0)) : y1;
    const sol = Mat.solveRREF(g.J, yUse);
    const pivotOf = {};
    g.pivots.forEach((cIdx, r) => { pivotOf[cIdx] = r; });
    const exprs = [];
    for (let j = 0; j < n; j++) {
      let e;
      if (j in pivotOf) {
        const r = pivotOf[j];
        const constZero = F(yUse[r]).isZero() && F(y1Use[r]).isZero();
        e = constZero ? '' : linHTML(yUse[r], y1Use[r], s);
        sol.basis.forEach((b, bi) => {
          const v = F(b.vector[j]);
          if (v.isZero()) return;
          const coef = v.abs().isOne() ? '' : Fmt.fracHTML(v.abs());
          e += e ? (v.n < 0 ? ' − ' : ' + ') + coef + Fmt.PARAMS[bi] : (v.n < 0 ? '−' : '') + coef + Fmt.PARAMS[bi];
        });
        if (!e) e = '0';
      } else {
        e = Fmt.PARAMS[sol.basis.findIndex(b => b.free === j)];
      }
      exprs.push('<span class="pvar">' + vars[j] + '</span> = ' + e);
    }
    html += `<p>${dim ? `Té ${m(String(dim))} grau${dim === 1 ? '' : 's'} de llibertat (${n} incògnites − rang ${g.rank}). ` : 'És compatible determinat. '}Les solucions són:</p>
      <p class="answer">${m('<span class="param-line">' + exprs.join('&nbsp;&nbsp;·&nbsp;&nbsp;') + '</span>')}</p>`;
    return html;
  }

  function systemHTMLText(lines) {
    return '<div class="eqsys">' + lines.map(l => '<div>' + l + '</div>').join('') + '</div>';
  }

  /* ---------- polinomis de grau 3 amb arrel a + bi ---------- */
  function cHTML(z) { return Fmt.complexHTML(z); }
  function signed(z) { const s = cHTML(z); return /^[−-]/.test(s) || /[+−]/.test(s.slice(1)) ? '(' + s + ')' : s; }

  function polyExercise(cfg) {
    const [c3, c2, c1, c0] = cfg.coeffs;
    const z = new C(cfg.re, cfg.im);
    const z2 = z.mul(z), z3 = z2.mul(z);
    const zs = cHTML(z);
    const r3 = new Frac(-c2, c3).sub(F(2 * cfg.re));
    const qa = -2 * cfg.re, qb = cfg.re * cfg.re + cfg.im * cfg.im;
    const quad = Fmt.polyHTML([1, qa, qb]);
    const linCoef = r3.d;
    const linFactor = Fmt.polyHTML([r3.d, -r3.n]);
    const k = c3 / linCoef;
    const factorR = (k === 1 ? '' : k) + '(' + linFactor + ')(' + quad + ')';
    const cv = new C(cfg.re, -cfg.im);
    const term = (c, w) => {
      const v = w.scale(c);
      return { v, s: (c < 0 ? '−' : '') + (Math.abs(c) === 1 ? '' : Math.abs(c)) };
    };
    const t3 = term(c3, z3), t2 = term(c2, z2), t1 = term(c1, z);
    const evalLine = [t3, t2, t1].filter(t => t.s !== '0').map(t => signed(t.v)).join(' + ') + ' + ' + signed(new C(c0, 0));
    const poly = Fmt.polyHTML(cfg.coeffs);
    const negHTML = w => '−(' + cHTML(w) + ')';
    const xMinus = w => {
      const re = -w.re, im = -w.im;
      return 'x ' + (re < 0 ? '− ' + Math.abs(re) : '+ ' + re) + (im < 0 ? ' − ' : ' + ') + (Math.abs(im) === 1 ? '' : Math.abs(im)) + 'i';
    };

    const drawPowers = cfg.drawPowers;
    const partsList = cfg.order.map(p => ({
      draw: drawPowers
        ? `Dibuixeu ${m(zs)}, ${m('(' + zs + ')<sup>2</sup>')} i ${m('(' + zs + ')<sup>3</sup>')} en el pla complex.`
        : `Dibuixeu les arrels de ${m('p(x)')} en el pla complex.`,
      check: `Comproveu que ${m(zs)} és una arrel d'aquest polinomi.`,
      others: `Trobeu les altres arrels de ${m('p(x)')}.<br><span class="hint">(Indicació: en un polinomi amb coeficients reals el conjugat d'una arrel també és arrel del polinomi.)</span>`,
      real: `Si es considera ${m('p(x) ∈ R[x]')}, expresseu ${m('p(x)')} com a producte de polinomis irreductibles.`
    }[p]));

    const sol = {
      draw: drawPowers
        ? `<p>Els tres punts són ${m('z = ' + zs)}, ${m('z<sup>2</sup> = ' + cHTML(z2))} i ${m('z<sup>3</sup> = ' + cHTML(z3))} (vegeu el dibuix). Cada potència multiplica el mòdul per ${m('|z| = √' + qb)} i suma ${m('arg(z)')} a l'argument.</p>`
        : `<p>Les arrels són els punts ${m('(' + Fmt.numStr(cfg.re) + ', ' + Fmt.numStr(cfg.im) + ')')}, ${m('(' + Fmt.numStr(cfg.re) + ', ' + Fmt.numStr(-cfg.im) + ')')} i ${m('(' + Fmt.fracPlain(r3) + ', 0)')}: dues simètriques respecte de l'eix real i una sobre l'eix real (vegeu el dibuix).</p>`,
      check: `<p>Calculem les potències: ${m('(' + zs + ')<sup>2</sup> = ' + cHTML(z2))} i ${m('(' + zs + ')<sup>3</sup> = ' + cHTML(z3))}.</p>
        <p>${m('p(' + zs + ') = ' + evalLine + ' = 0')}.</p>
        <p class="answer">Per tant ${m(zs)} és arrel de ${m('p(x)')}.</p>`,
      others: `<p>Com que els coeficients són reals, el conjugat ${m(cHTML(cv))} també és arrel. Per Vieta, la suma de les tres arrels és ${m('−b/a = ' + Fmt.fracHTML(new Frac(-c2, c3)))}:</p>
        <p>${m('(' + zs + ') + (' + cHTML(cv) + ') + r<sub>3</sub> = ' + Fmt.fracHTML(new Frac(-c2, c3)))} ⇒ ${m(Fmt.numStr(2 * cfg.re) + ' + r<sub>3</sub> = ' + Fmt.fracHTML(new Frac(-c2, c3)))} ⇒ ${m('r<sub>3</sub> = ' + Fmt.fracHTML(r3))}.</p>
        <p class="answer">Arrels: ${m(zs)}, ${m(cHTML(cv))} i ${m(Fmt.fracHTML(r3))}.</p>
        <p>A ${m('C[x]')}: ${m('p(x) = ' + (k === 1 ? '' : k) + '(' + linFactor + ')(' + xMinus(z) + ')(' + xMinus(cv) + ')')}.</p>`,
      real: `<p>Ajuntem els dos factors conjugats: ${m('(x − z)(x − z̄) = x<sup>2</sup> − 2Re(z)x + |z|<sup>2</sup> = ' + quad)}. El seu discriminant és negatiu (${m(Fmt.numStr(qa * qa - 4 * qb) + ' &lt; 0')}), per tant és irreductible a ${m('R[x]')}.</p>
        <p class="answer">${m('p(x) = ' + factorR)}</p>`
    };

    return {
      title: 'Polinomi i arrels complexes',
      pts: 4,
      practice: { kind: 'poly', coeffs: cfg.coeffs, re: cfg.re, im: cfg.im, order: cfg.order, drawPowers: !!drawPowers },
      statementHTML: `<p>Considereu el polinomi ${m('p(x) = ' + poly + ' ∈ C[x]')}.</p>
        <ol class="parts">${partsList.map(p => '<li>' + p + '</li>').join('')}</ol>`,
      solutionHTML: cfg.order.map((p, i) => `<h4>(${String.fromCharCode(97 + i)})</h4>` + sol[p]).join(''),
      plot: drawPowers
        ? [{ z, label: 'z', color: 'var(--c1)' }, { z: z2, label: 'z²', color: 'var(--c2)' }, { z: z3, label: 'z³', color: 'var(--c3)' }]
        : [{ z, label: zs, color: 'var(--c1)' }, { z: cv, label: cHTML(cv), color: 'var(--c2)' }, { z: new C(r3.toNumber(), 0), label: Fmt.fracPlain(r3), color: 'var(--c3)' }]
    };
  }

  /* ---------- exercici de matrius “format nou” (2022–2025) ---------- */
  function matrixExercise(cfg) {
    const g = gauss(cfg.A);
    const [mm, nn] = [cfg.A.length, cfg.A[0].length];
    const parts = [
      `Trobeu la matriu de Gauss-Jordan ${m('J')} associada a la matriu ${m('A')} i calculeu el rang de ${m('A')}.`,
      `Trobeu una matriu ${m('P')} invertible tal que ${m('PA = J')}.${cfg.detP ? ' Calculeu el seu determinant.' : ''}`
    ];
    const sols = [gaussSolutionHTML(g, '(a)'), pSolutionHTML(g, '(b)', cfg.detP)];
    if (cfg.rowComb) {
      const r = cfg.rowComb - 1;
      parts.push(`Expresseu la ${['primera', 'segona', 'tercera', 'quarta'][r]} fila de ${m('J')} com a combinació lineal de les files d'${m('A')}.`);
      sols.push(`<h4>(c) Fila ${cfg.rowComb} de J com a combinació de files d'A</h4>
        <p>Com que ${m('PA = J')}, la fila ${cfg.rowComb} de ${m('J')} és la combinació de les files d'${m('A')} amb els coeficients de la fila ${cfg.rowComb} de ${m('P')}:</p>
        <p class="answer">${m('f<sub>' + cfg.rowComb + '</sub>(J) = ' + Fmt.vectorHTML(g.J[r]) + ' = ' + rowCombHTML(g.P[r]))}</p>
        ${g.J[r].every(x => F(x).isZero()) ? `<p>(També és correcte, evidentment, ${m('0·f<sub>1</sub>(A) + … = 0')}, però el que es demana és la combinació que surt de ${m('P')}.)</p>` : ''}`);
    }
    const letter = String.fromCharCode(97 + parts.length);
    parts.push(cfg.systemPrompt);
    sols.push(`<h4>(${letter}) Sistema</h4>` + cfg.systemSolution(g));
    return {
      title: 'Gauss-Jordan, matriu P i sistema',
      pts: 4,
      practice: { kind: 'matrix', A: cfg.A, detP: !!cfg.detP, rowComb: cfg.rowComb, system: cfg.system },
      statementHTML: `<p>Considereu la matriu</p>
        ${mc('A = ' + Fmt.matHTML(cfg.A) + ' ∈ M<sub>' + mm + '×' + nn + '</sub>(R).')}
        <ol class="parts">${parts.map(p => '<li>' + p + '</li>').join('')}</ol>`,
      solutionHTML: sols.join('')
    };
  }

  /* ---------- exercici de matrius “format antic” (2019–2021) ---------- */
  function oldMatrixExercise(cfg) {
    const g = gauss(cfg.A);
    const [mm, nn] = [cfg.A.length, cfg.A[0].length];
    return {
      title: 'Gauss-Jordan, matriu P i sistema',
      pts: 4,
      practice: { kind: 'matrix', A: cfg.A, system: cfg.system },
      statementHTML: `<p>Considereu la matriu</p>
        ${mc('A = ' + Fmt.matHTML(cfg.A) + ' ∈ M<sub>' + mm + '×' + nn + '</sub>(R).')}
        <ol class="parts">
          <li>Trobeu la matriu de Gauss-Jordan ${m('J')} associada a la matriu ${m('A')} i calculeu el rang de ${m('A')}.</li>
          <li>Trobeu una matriu ${m('P')} invertible tal que ${m('PA = J')}.</li>
          <li>${cfg.systemPrompt}</li>
        </ol>`,
      solutionHTML: gaussSolutionHTML(g, '(a)') + pSolutionHTML(g, '(b)', false) +
        '<h4>(c) Sistema</h4>' + cfg.systemSolution(g)
    };
  }

  /* ---------- camps de resposta (vegeu ui/practice.js) ---------- */
  const fld = {
    num: (label, answer) => ({ type: 'num', label: m(label), answer }),
    ang: (label, answer) => ({ type: 'angle', label: m(label), answer, placeholder: 'p. ex. 3pi/4' }),
    cx: (label, re, im) => ({ type: 'cplx', label: m(label), answer: { re, im }, placeholder: 'a+bi' }),
    roots: (label, list) => ({ type: 'roots', label, answers: list.map(([re, im]) => ({ re, im })) }),
    poly: (mode, coeffs, env) => ({ type: 'poly', mode, coeffs, env, label: m('p(x) ='), placeholder: 'producte de factors' })
  };
  const PI = Math.PI;

  function tf(statementHTML, isTrue, explanationHTML) {
    return { statementHTML, isTrue, explanationHTML };
  }

  const mat2 = (a, b, c, d) => Fmt.matHTML([[a, b], [c, d]]);
  const SYS_PROMPT = q => `Expresseu les solucions en forma paramètrica i calculeu la dimensió (graus de llibertat) de la varietat lineal resultant.${q ? ' ' + q : ''}`;

  /* ============================================================
     Exàmens
     ============================================================ */
  const EXAMS = [];

  /* ---------------- 2025/26 ---------------- */
  EXAMS.push({
    id: '2025', course: '2025/26', date: '30 d’octubre de 2025',
    note: 'Hi havia dues versions (1 i 1′). Aquí hi ha la versió 1; la 1′ és el polinomi del parcial de 2023.',
    exercises: [
      polyExercise({ coeffs: [3, 4, 11, -10], re: -1, im: -2, drawPowers: true, order: ['draw', 'check', 'others', 'real'] }),
      (() => {
        const A = [[1, -1, 2, 3], [-1, 2, 1, 5], [3, 1, -2, 1], [3, 2, 1, 9]];
        const g = gauss(A);
        return {
          title: 'Gauss-Jordan, matriu P i sistema amb paràmetre',
          pts: 4,
          practice: { kind: 'matrix', A, system: { type: 'param', M: A, c0: [0, 1, 1, 1], c1: [1, 0, 0, 0], pname: 'b', vars: ['x', 'y', 'z', 'u'] } },
          statementHTML: `<p>Considereu la matriu</p>
            ${mc('A = ' + Fmt.matHTML(A) + ' ∈ M<sub>4×4</sub>(R).')}
            <ol class="parts">
              <li>Trobeu la matriu de Gauss-Jordan ${m('J')} associada a la matriu ${m('A')} i calculeu el rang de ${m('A')}.</li>
              <li>Trobeu una matriu ${m('P')} invertible tal que ${m('PA = J')}.</li>
              <li>Discutiu la compatibilitat (i els graus de llibertat, si fos el cas) del sistema següent en funció del paràmetre ${m('b ∈ R')}.
              ${systemHTMLText(['x − y + 2z + 3u = <span class="param">b</span>', '−x + 2y + z + 5u = 1', '3x + y − 2z + u = 1', '3x + 2y + z + 9u = 1'])}
              <span class="hint">(Indicació: podeu utilitzar els càlculs fets als apartats anteriors.)</span></li>
            </ol>`,
          solutionHTML: gaussSolutionHTML(g, '(a)') + pSolutionHTML(g, '(b)', false) +
            '<h4>(c) Discussió segons b</h4><p>La matriu de coeficients és ' + m('A') + ' i els termes independents són ' + m('c = (b, 1, 1, 1)') + '.</p>' +
            paramSystemHTML(A, [0, 1, 1, 1], [1, 0, 0, 0], 'b', ['x', 'y', 'z', 'u'])
        };
      })()
    ],
    theory: [
      tf(`Per qualsevols nombres complexos ${m('z, w')} tals que ${m('z<sup>2</sup>w<sup>4</sup> = 1')} i ${m('z<sup>8</sup> = 1')} es compleix que ${m('w<sup>8</sup> = 1')}.`, false,
        `<p><strong>FALS.</strong> Si ${m('z<sup>2</sup> = i')} llavors ${m('z<sup>8</sup> = i<sup>4</sup> = 1')} i ${m('w<sup>4</sup> = z<sup>−2</sup> = −i')}, d'on ${m('w<sup>8</sup> = (−i)<sup>2</sup> = −1 ≠ 1')}. Contraexemple concret: ${m('z = e<sup>iπ/4</sup>')}, ${m('w = e<sup>−iπ/8</sup>')}.</p>`),
      tf('Tot polinomi a coeficients reals de grau senar té almenys una arrel real.', true,
        `<p><strong>CERT.</strong> Pel teorema fonamental de l'àlgebra té ${m('n')} arrels complexes. Si els coeficients són reals, les arrels no reals van per parelles (${m('z')} i ${m('z̄')}), així que n'hi ha un nombre parell. Si ${m('n')} és senar, no poden ser totes no reals.</p>`),
      tf('Hi ha infinites matrius de Gauss-Jordan 2 × 2 a coeficients racionals.', true,
        `<p><strong>CERT.</strong> ${m(mat2(1, 'q', 0, 0))} és de Gauss-Jordan per a qualsevol ${m('q ∈ Q')}.</p>`),
      tf(`Per qualsevols matrius ${m('A')} i ${m('B')} de mida 2 × 2 tals que ${m('AB ≠ BA')} es compleix que ${m('A<sup>2</sup>B<sup>2</sup> ≠ (AB)<sup>2</sup>')}.`, false,
        `<p><strong>FALS.</strong> ${m('A = ' + mat2(1, 0, 0, 0))}, ${m('B = ' + mat2(0, 1, 0, 0))}: ${m('AB = B ≠ 0 = BA')}, però ${m('B<sup>2</sup> = 0')} i ${m('(AB)<sup>2</sup> = B<sup>2</sup> = 0')}, així que ${m('A<sup>2</sup>B<sup>2</sup> = 0 = (AB)<sup>2</sup>')}.</p>`)
    ]
  });

  /* ---------------- 2024/25 ---------------- */
  EXAMS.push({
    id: '2024', course: '2024/25', date: '8 de novembre de 2024',
    exercises: [
      polyExercise({ coeffs: [2, 3, 6, -65], re: -2, im: 3, order: ['check', 'others', 'draw', 'real'] }),
      matrixExercise({
        A: [[1, 0, -1, 0], [3, -2, -3, 2], [-1, 1, 1, -1]], detP: true, rowComb: 3,
        system: { type: 'numeric', M: cols([[1, 0, -1, 0], [3, -2, -3, 2], [-1, 1, 1, -1]], 0, 3), c: col([[1, 0, -1, 0], [3, -2, -3, 2], [-1, 1, 1, -1]], 3) },
        systemPrompt: `Resoleu a ${m('R<sup>3</sup>')} el sistema d'equacions lineals següent:
          ${systemHTMLText(['x − z = 0', '3x − 2y − 3z = 2', '−x + y + z = −1'])}${SYS_PROMPT()}`,
        systemSolution: g => systemSolutionHTML(cols(g.A, 0, 3), col(g.A, 3), { augmentedNote: true })
      })
    ],
    theory: [
      tf(`Si ${m('z')} és un nombre complex no nul amb argument igual a ${m('π/3')} llavors ${m('z<sup>6</sup>')} és un nombre real positiu.`, true,
        `<p><strong>CERT.</strong> Si ${m('z = re<sup>iπ/3</sup>')}, per De Moivre ${m('z<sup>6</sup> = r<sup>6</sup>e<sup>i2π</sup> = r<sup>6</sup> &gt; 0')}.</p>`),
      tf(`Si ${m('A = ' + Fmt.matHTML([[1, 1, 1], [1, 1, 1], [1, 1, 1]]))} llavors ${m('A<sup>n</sup> = 3<sup>n−1</sup>A')} per a tot natural ${m('n ≥ 1')}.`, true,
        `<p><strong>CERT.</strong> Cada entrada de ${m('A<sup>2</sup>')} és ${m('1+1+1 = 3')}, així que ${m('A<sup>2</sup> = 3A')}. Per inducció, ${m('A<sup>n+1</sup> = A<sup>n</sup>A = 3<sup>n−1</sup>A<sup>2</sup> = 3<sup>n</sup>A')}.</p>`),
      tf(`Siguin ${m('A')} i ${m('B')} matrius simètriques. Si ${m('AB = BA')} la matriu ${m('AB')} és també simètrica.`, true,
        `<p><strong>CERT.</strong> ${m('(AB)<sup>t</sup> = B<sup>t</sup>A<sup>t</sup> = BA = AB')}.</p>`),
      tf(`Si un sistema d'equacions ${m('A·X = C')} és compatible determinat, llavors la matriu ${m('A')} és quadrada.`, false,
        `<p><strong>FALS.</strong> El sistema ${m('x = 1, &nbsp;y = 1, &nbsp;x + y = 2')} té solució única ${m('(1, 1)')} i la seva matriu és ${m('3 × 2')}. Només cal ${m('rang(A) = rang(A|C) =')} nombre d'incògnites.</p>`)
    ]
  });

  /* ---------------- 2023/24 ---------------- */
  EXAMS.push({
    id: '2023', course: '2023/24', date: '10 de novembre de 2023',
    exercises: [
      polyExercise({ coeffs: [3, -4, 11, 10], re: 1, im: -2, order: ['check', 'others', 'draw', 'real'] }),
      matrixExercise({
        A: [[2, -4, 3, -6], [5, -10, 3, 3], [2, -4, 1, 2]], detP: true, rowComb: 3,
        system: { type: 'numeric', M: cols([[2, -4, 3, -6], [5, -10, 3, 3], [2, -4, 1, 2]], 0, 3), c: col([[2, -4, 3, -6], [5, -10, 3, 3], [2, -4, 1, 2]], 3) },
        systemPrompt: `Resoleu a ${m('R<sup>3</sup>')} el sistema d'equacions lineals següent:
          ${systemHTMLText(['2x − 4y + 3z = −6', '5x − 10y + 3z = 3', '2x − 4y + z = 2'])}${SYS_PROMPT()}`,
        systemSolution: g => systemSolutionHTML(cols(g.A, 0, 3), col(g.A, 3), { augmentedNote: true })
      })
    ],
    theory: [
      tf(`Si ${m('z')} és un nombre complex del primer quadrant llavors ${m('z<sup>2</sup>')} pertany al segon quadrant.`, false,
        `<p><strong>FALS.</strong> L'argument es duplica: si ${m('arg z ∈ (0, π/2)')}, ${m('arg z<sup>2</sup> ∈ (0, π)')}. Per exemple ${m('z = e<sup>iπ/8</sup>')} dona ${m('z<sup>2</sup> = e<sup>iπ/4</sup>')}, al primer quadrant (i ${m('(1+i)<sup>2</sup> = 2i')} cau sobre l'eix).</p>`),
      tf(`Siguin ${m('A')} i ${m('B')} matrius 2 × 2. Si ${m('det(B) ≠ 0')} i ${m('AB = 0')} llavors ${m('A = 0')}.`, true,
        `<p><strong>CERT.</strong> ${m('B')} és invertible: ${m('A = A(BB<sup>−1</sup>) = (AB)B<sup>−1</sup> = 0·B<sup>−1</sup> = 0')}.</p>`),
      tf(`Sigui ${m('A')} una matriu 2 × 3. Suposem que ${m('A')} té forma de Gauss-Jordan i té rang 2. Aleshores ${m('AA<sup>t</sup>')} és la matriu identitat 2 × 2.`, false,
        `<p><strong>FALS.</strong> ${m('A = ' + Fmt.matHTML([[1, 0, 1], [0, 1, 0]]))} és de Gauss-Jordan i de rang 2, però ${m('AA<sup>t</sup> = ' + mat2(2, 0, 0, 1) + ' ≠ I')}.</p>`),
      tf('Hi ha exactament quatre matrius diferents 2 × 2 en forma de Gauss-Jordan.', false,
        `<p><strong>FALS.</strong> N'hi ha infinites: ${m(mat2(1, 'a', 0, 0))} ho és per a tot ${m('a ∈ R')} (a més de ${m(mat2(0, 0, 0, 0))}, ${m(mat2(0, 1, 0, 0))} i ${m('I')}).</p>`)
    ]
  });

  /* ---------------- 2022/23 ---------------- */
  EXAMS.push({
    id: '2022', course: '2022/23', date: '11 de novembre de 2022',
    exercises: [
      polyExercise({ coeffs: [2, -7, 6, 5], re: 2, im: 1, order: ['check', 'others', 'draw', 'real'] }),
      matrixExercise({
        A: [[1, 3, -2, 0, 0], [2, 6, -5, -3, -1], [0, 0, 5, 15, 5], [2, 6, 0, 18, 16]],
        system: { type: 'numeric', M: cols([[1, 3, -2, 0, 0], [2, 6, -5, -3, -1], [0, 0, 5, 15, 5], [2, 6, 0, 18, 16]], 0, 4), c: col([[1, 3, -2, 0, 0], [2, 6, -5, -3, -1], [0, 0, 5, 15, 5], [2, 6, 0, 18, 16]], 4), queries: [{ v: 't', value: 1 }] },
        systemPrompt: `Resoleu a ${m('R<sup>4</sup>')} el sistema d'equacions lineals següent:
          ${systemHTMLText(['x + 3y − 2z = 0', '2x + 6y − 5z − 3t = −1', '5z + 15t = 5', '2x + 6y + 18t = 16'])}${SYS_PROMPT(`Hi ha alguna solució amb ${m('t = 1')}?`)}`,
        systemSolution: g => systemSolutionHTML(cols(g.A, 0, 4), col(g.A, 4), { augmentedNote: true, queries: [{ v: 't', value: 1 }] })
      })
    ],
    theory: [
      tf('El producte d’un nombre complex no nul pel seu conjugat sempre és un nombre real positiu.', true,
        `<p><strong>CERT.</strong> ${m('(a + bi)(a − bi) = a<sup>2</sup> + b<sup>2</sup> = |z|<sup>2</sup> &gt; 0')} si ${m('z ≠ 0')}.</p>`),
      tf(`Si ${m('A')} i ${m('B')} són dues matrius 2 × 2 amb coeficients reals, llavors ${m('AB = BA')}.`, false,
        `<p><strong>FALS.</strong> ${m('A = ' + mat2(1, 0, 0, 0))}, ${m('B = ' + mat2(0, 1, 0, 0))}: ${m('AB = B')} però ${m('BA = 0')}.</p>`),
      tf(`Sigui ${m('A')} una matriu de mida 2 × 2. Suposem que ${m('A')} té forma de Gauss-Jordan i no té cap fila nul·la. Aleshores ${m('A')} és la matriu identitat.`, true,
        `<p><strong>CERT.</strong> Dues files no nul·les ⇒ dos pivots, en columnes diferents i creixents: han de ser les columnes 1 i 2. Els pivots valen 1 i la resta de la columna d'un pivot és 0, per tant ${m('A = I')}.</p>`),
      tf('Si una fila d’una matriu quadrada és combinació lineal de les altres, aleshores el seu determinant és diferent de zero.', false,
        `<p><strong>FALS.</strong> És al revés: en aquest cas el determinant és 0. Ex.: ${m('det ' + mat2(1, 1, 2, 2) + ' = 0')}.</p>`)
    ]
  });

  /* ---------------- 2021/22 ---------------- */
  const z21 = new C(SQ3, 1);
  EXAMS.push({
    id: '2021', course: '2021/22', date: '19 de novembre de 2021',
    exercises: [
      {
        title: 'Complexos: forma polar, arrels i factorització',
        pts: 4,
        practice: { kind: 'custom', parts: [
          { title: 'Mòdul, argument, quocient i potència', fields: [
            fld.num('|z| =', 2), fld.ang('arg(z) =', PI / 6), fld.num('|w| =', 3), fld.ang('arg(w) =', PI / 2),
            fld.cx('w/z =', 3 / 4, 3 * SQ3 / 4), fld.cx('z<sup>12</sup> =', 4096, 0)] },
          { title: 'Solucions de w³ = −64', fields: [fld.roots('Les 3 solucions:', [[2, 2 * SQ3], [-4, 0], [2, -2 * SQ3]])] },
          { title: 'Factorització', fields: [
            Object.assign(fld.poly('C', [1, 0, 0, 64]), { label: m('A C[x]: p(x) =') }),
            Object.assign(fld.poly('R', [1, 0, 0, 64]), { label: m('A R[x]: p(x) =') })] }
        ] },
        statementHTML: `<ol class="parts">
          <li>Donats ${m('z = √3 + i')} i ${m('w = 3i')}, calculeu-ne el mòdul, l'argument, el quocient ${m('w/z')} i ${m('z<sup>12</sup>')}.</li>
          <li>Calculeu tots els nombres complexos ${m('w ∈ C')} tals que ${m('w<sup>3</sup> = −64')}.</li>
          <li>Factoritzeu el polinomi ${m('p(x) = x<sup>3</sup> + 64')} a ${m('C[x]')} i a ${m('R[x]')}.</li>
        </ol>`,
        solutionHTML: `<h4>(a)</h4>
          <p>${m('|z| = √(3 + 1) = 2')}, ${m('arg z = arctan(1/√3) = π/6')} ⇒ ${m('z = 2e<sup>iπ/6</sup>')}.</p>
          <p>${m('|w| = 3')}, ${m('arg w = π/2')} ⇒ ${m('w = 3e<sup>iπ/2</sup>')}.</p>
          <p>${m('w/z = (3/2)e<sup>i(π/2 − π/6)</sup> = (3/2)e<sup>iπ/3</sup> = 3/4 + (3√3/4)i')}.</p>
          <p>${m('z<sup>12</sup> = 2<sup>12</sup>e<sup>i·12π/6</sup> = 4096e<sup>i2π</sup> = 4096')}.</p>
          <h4>(b)</h4>
          <p>${m('−64 = 64e<sup>iπ</sup>')}, així que ${m('w<sub>k</sub> = 4e<sup>i(π + 2πk)/3</sup>')}, ${m('k = 0, 1, 2')}:</p>
          <p class="answer">${m('w<sub>0</sub> = 4e<sup>iπ/3</sup> = 2 + 2√3i')}, ${m('w<sub>1</sub> = 4e<sup>iπ</sup> = −4')}, ${m('w<sub>2</sub> = 4e<sup>i5π/3</sup> = 2 − 2√3i')}.</p>
          <h4>(c)</h4>
          <p>Les arrels de ${m('x<sup>3</sup> + 64')} són les de l'apartat (b):</p>
          <p class="answer">${m('C[x]: (x + 4)(x − 2 − 2√3i)(x − 2 + 2√3i)')}</p>
          <p class="answer">${m('R[x]: (x + 4)(x<sup>2</sup> − 4x + 16)')}</p>
          <p>(${m('x<sup>2</sup> − 4x + 16')} té discriminant ${m('16 − 64 &lt; 0')}: irreductible.)</p>`,
        plot: [
          { z: new C(2, 2 * SQ3), label: 'w₀', color: 'var(--c1)' },
          { z: new C(-4, 0), label: 'w₁', color: 'var(--c2)' },
          { z: new C(2, -2 * SQ3), label: 'w₂', color: 'var(--c3)' }
        ]
      },
      oldMatrixExercise({
        A: [[1, -2, 2, 2, -5, 1], [-3, 6, -4, -9, 3, -1], [-1, 2, -2, -4, -3, 3], [1, -2, 1, 3, -1, 1]],
        system: { type: 'numeric', M: cols([[1, -2, 2, 2, -5, 1], [-3, 6, -4, -9, 3, -1], [-1, 2, -2, -4, -3, 3], [1, -2, 1, 3, -1, 1]], 0, 5), c: col([[1, -2, 2, 2, -5, 1], [-3, 6, -4, -9, 3, -1], [-1, 2, -2, -4, -3, 3], [1, -2, 1, 3, -1, 1]], 5), vars: ['x', 'y', 'z', 't', 'u'], queries: [{ v: 'x', value: 3 }, { v: 'z', value: 2 }] },
        systemPrompt: `Resoleu el sistema d'equacions lineals següent:
          ${systemHTMLText(['x − 2y + 2z + 2t − 5u = 1', '−3x + 6y − 4z − 9t + 3u = −1', '−x + 2y − 2z − 4t − 3u = 3', 'x − 2y + z + 3t − u = 1'])}
          i expresseu les solucions en forma paramètrica. Hi ha alguna solució amb ${m('x = 3')}? I amb ${m('z = 2')}?`,
        systemSolution: g => systemSolutionHTML(cols(g.A, 0, 5), col(g.A, 5), { augmentedNote: true, vars: ['x', 'y', 'z', 't', 'u'], queries: [{ v: 'x', value: 3 }, { v: 'z', value: 2 }] })
      })
    ],
    theory: [
      tf(`Dos nombres complexos ${m('z')} i ${m('z̄')} tenen sempre el mateix mòdul.`, true,
        `<p><strong>CERT.</strong> ${m('|a + bi| = √(a<sup>2</sup> + b<sup>2</sup>) = √(a<sup>2</sup> + (−b)<sup>2</sup>) = |a − bi|')}.</p>`),
      tf(`Si una matriu ${m('P')} té una fila que és combinació lineal de les altres files, aleshores és invertible.`, false,
        `<p><strong>FALS.</strong> ${m(mat2(1, 1, 2, 2))} té la fila 2 = 2·fila 1, determinant 0, i no és invertible.</p>`),
      tf(`Sigui ${m('A ∈ M<sub>2</sub>(R)')} amb ${m('det(A) = −2')}. Llavors ${m('det(3A<sup>−1</sup>) = −6')}.`, false,
        `<p><strong>FALS.</strong> ${m('det(3A<sup>−1</sup>) = 3<sup>2</sup>·det(A)<sup>−1</sup> = 9·(−1/2) = −9/2')}. El 3 surt elevat a 2 perquè multiplica les 2 files.</p>`)
    ]
  });

  /* ---------------- 2020/21 ---------------- */
  EXAMS.push({
    id: '2020', course: '2020/21', date: '27 de novembre de 2020',
    exercises: [
      {
        title: 'Complexos: forma polar, arrels i factorització',
        pts: 4,
        practice: { kind: 'custom', parts: [
          { title: 'Forma polar i potència', fields: [
            fld.num('|z| =', SQ2), fld.ang('arg(z) =', 5 * PI / 4), fld.cx('z<sup>12</sup> =', -64, 0)] },
          { title: 'Solucions de w³ = −8', fields: [fld.roots('Les 3 solucions:', [[1, SQ3], [-2, 0], [1, -SQ3]])] },
          { title: 'Factorització', fields: [
            Object.assign(fld.poly('C', [1, 0, 0, 8]), { label: m('A C[x]: p(x) =') }),
            Object.assign(fld.poly('R', [1, 0, 0, 8]), { label: m('A R[x]: p(x) =') })] }
        ] },
        statementHTML: `<ol class="parts">
          <li>Calculeu la forma polar i cartesiana de ${m('z')} i ${m('z<sup>12</sup>')} per ${m('z = −1 − i')}.</li>
          <li>Calculeu tots els nombres complexos ${m('w ∈ C')} tals que ${m('w<sup>3</sup> = −8')}.</li>
          <li>Factoritzeu el polinomi ${m('p(x) = x<sup>3</sup> + 8')} a ${m('C[x]')} i a ${m('R[x]')}.</li>
        </ol>`,
        solutionHTML: `<h4>(a)</h4>
          <p>${m('|z| = √2')}. És al tercer quadrant: ${m('arg z = π + π/4 = 5π/4')} (o ${m('−3π/4')}). ${m('z = √2e<sup>i5π/4</sup>')}.</p>
          <p>${m('z<sup>12</sup> = (√2)<sup>12</sup>e<sup>i·12·5π/4</sup> = 64e<sup>i15π</sup> = 64e<sup>iπ</sup>')}.</p>
          <p class="answer">${m('z<sup>12</sup> = 64e<sup>iπ</sup> = −64')}</p>
          <h4>(b)</h4>
          <p>${m('−8 = 8e<sup>iπ</sup>')} ⇒ ${m('w<sub>k</sub> = 2e<sup>i(π + 2πk)/3</sup>')}, ${m('k = 0, 1, 2')}:</p>
          <p class="answer">${m('w<sub>0</sub> = 1 + √3i')}, ${m('w<sub>1</sub> = −2')}, ${m('w<sub>2</sub> = 1 − √3i')}.</p>
          <h4>(c)</h4>
          <p class="answer">${m('C[x]: (x + 2)(x − 1 − √3i)(x − 1 + √3i)')}</p>
          <p class="answer">${m('R[x]: (x + 2)(x<sup>2</sup> − 2x + 4)')}</p>`,
        plot: [
          { z: new C(-1, -1), label: 'z', color: 'var(--c4)' },
          { z: new C(1, SQ3), label: 'w₀', color: 'var(--c1)' },
          { z: new C(-2, 0), label: 'w₁', color: 'var(--c2)' },
          { z: new C(1, -SQ3), label: 'w₂', color: 'var(--c3)' }
        ]
      },
      oldMatrixExercise({
        A: [[1, 0, 3, -2, 2], [0, 4, 1, -1, 3], [2, -8, 4, -6, -2]],
        system: { type: 'numeric', M: cols([[1, 0, 3, -2, 2], [0, 4, 1, -1, 3], [2, -8, 4, -6, -2]], 0, 4), c: col([[1, 0, 3, -2, 2], [0, 4, 1, -1, 3], [2, -8, 4, -6, -2]], 4), queries: [{ v: 'x', value: 3 }, { v: 't', value: 2 }] },
        systemPrompt: `Resoleu a ${m('R<sup>4</sup>')} el sistema d'equacions lineals següent:
          ${systemHTMLText(['x + 3z − 2t = 2', '4y + z − t = 3', '2x − 8y + 4z − 6t = −2'])}
          i expresseu les solucions en forma paramètrica. Hi ha alguna solució amb ${m('x = 3')}? I amb ${m('t = 2')}?`,
        systemSolution: g => systemSolutionHTML(cols(g.A, 0, 4), col(g.A, 4), { augmentedNote: true, queries: [{ v: 'x', value: 3 }, { v: 't', value: 2 }] })
      })
    ],
    theory: [
      tf(`Dos nombres complexos ${m('z')} i ${m('z̄')} tenen sempre el mateix argument.`, false,
        `<p><strong>FALS.</strong> ${m('arg z̄ = −arg z')}. Per ${m('z = i')}: ${m('arg i = π/2')} i ${m('arg(−i) = −π/2')}. (Només coincideixen si ${m('z')} és real.)</p>`),
      tf(`Si en una matriu ${m('P')} invertible intercanviem dues files, el resultat és una matriu invertible.`, true,
        `<p><strong>CERT.</strong> Intercanviar dues files canvia el signe del determinant: ${m('det = −det(P) ≠ 0')}.</p>`),
      tf(`Sigui ${m('A ∈ M<sub>2</sub>(R)')} i sigui ${m('B')} la matriu que s'obté multiplicant la primera fila d'${m('A')} per 2 i la segona per 3. Aleshores ${m('det(A) = 6det(B)')}.`, false,
        `<p><strong>FALS.</strong> És al revés: ${m('det(B) = 2·3·det(A) = 6det(A)')}. Amb ${m('A = I')}: ${m('det A = 1')} però ${m('6det B = 36')}.</p>`)
    ]
  });

  /* ---------------- 2019/20 ---------------- */
  const c32 = 3 * SQ2 / 2;
  EXAMS.push({
    id: '2019', course: '2019/20', date: '8 de novembre de 2019',
    exercises: [
      {
        title: 'Complexos: mòdul, invers, arrels i factorització',
        pts: 4,
        practice: { kind: 'custom', parts: [
          { title: 'Mòdul, argument i invers', fields: [
            fld.num('|z| =', 2), fld.ang('arg(z) =', 2 * PI / 3), fld.cx('z<sup>−1</sup> =', -1 / 4, -SQ3 / 4)] },
          { title: 'Solucions de w⁴ = −81', fields: [fld.roots('Les 4 solucions:', [[c32, c32], [-c32, c32], [-c32, -c32], [c32, -c32]])] },
          { title: 'Factorització', fields: [
            Object.assign(fld.poly('C', [1, 0, 0, 0, 81]), { label: m('A C[x]: p(x) =') }),
            Object.assign(fld.poly('R', [1, 0, 0, 0, 81]), { label: m('A R[x]: p(x) =') })] }
        ] },
        statementHTML: `<ol class="parts">
          <li>Calculeu la norma (mòdul), l'argument i l'invers del nombre complex ${m('z = −1 + √3i')}.</li>
          <li>Calculeu tots els nombres complexos ${m('w ∈ C')} tals que ${m('w<sup>4</sup> = −81')}.</li>
          <li>Factoritzeu el polinomi ${m('p(x) = x<sup>4</sup> + 81')} a ${m('C[x]')} i a ${m('R[x]')}.</li>
        </ol>`,
        solutionHTML: `<h4>(a)</h4>
          <p>${m('|z| = √(1 + 3) = 2')}. Segon quadrant: ${m('arg z = π − π/3 = 2π/3')}. ${m('z = 2e<sup>i2π/3</sup>')}.</p>
          <p class="answer">${m('z<sup>−1</sup> = z̄/|z|<sup>2</sup> = (−1 − √3i)/4 = (1/2)e<sup>−i2π/3</sup>')}</p>
          <h4>(b)</h4>
          <p>${m('−81 = 81e<sup>iπ</sup>')} ⇒ ${m('w<sub>k</sub> = 3e<sup>i(π + 2πk)/4</sup>')}, ${m('k = 0, 1, 2, 3')}:</p>
          <p class="answer">${m('3e<sup>iπ/4</sup> = (3√2/2)(1 + i)')}, ${m('3e<sup>i3π/4</sup> = (3√2/2)(−1 + i)')}, ${m('3e<sup>i5π/4</sup> = (3√2/2)(−1 − i)')}, ${m('3e<sup>i7π/4</sup> = (3√2/2)(1 − i)')}.</p>
          <h4>(c)</h4>
          <p>A ${m('C[x]')}: ${m('x<sup>4</sup> + 81 = (x − w<sub>0</sub>)(x − w<sub>1</sub>)(x − w<sub>2</sub>)(x − w<sub>3</sub>)')}.</p>
          <p>A ${m('R[x]')} ajuntem conjugats: ${m('(x − w)(x − w̄) = x<sup>2</sup> − 2Re(w)x + |w|<sup>2</sup>')}:</p>
          <p class="answer">${m('x<sup>4</sup> + 81 = (x<sup>2</sup> − 3√2x + 9)(x<sup>2</sup> + 3√2x + 9)')}</p>
          <p>Comprovació: ${m('(x<sup>2</sup> + 9)<sup>2</sup> − 18x<sup>2</sup> = x<sup>4</sup> + 81')}.</p>`,
        plot: [
          { z: new C(-1, SQ3), label: 'z', color: 'var(--c4)' },
          { z: new C(c32, c32), label: 'w₀', color: 'var(--c1)' },
          { z: new C(-c32, c32), label: 'w₁', color: 'var(--c2)' },
          { z: new C(-c32, -c32), label: 'w₂', color: 'var(--c3)' },
          { z: new C(c32, -c32), label: 'w₃', color: 'var(--c1)' }
        ]
      },
      oldMatrixExercise({
        A: [[-1, 1, 2, 3], [-2, 1, 4, 6], [1, -1, -2, -2]],
        system: { type: 'numeric', M: [[-1, 1, 2, 3], [-2, 1, 4, 6], [1, -1, -2, -2]], c: [0, 0, 0], queries: [{ v: 'x', value: 3 }, { v: 't', value: 4 }] },
        systemPrompt: `Resoleu el sistema homogeni ${m('A·(x, y, z, t)<sup>t</sup> = (0, 0, 0)<sup>t</sup>')} i expresseu les solucions en forma paramètrica. Hi ha alguna solució amb ${m('x = 3')}? I amb ${m('t = 4')}?`,
        systemSolution: g => `<p>En un sistema homogeni els termes independents són 0 i es mantenen 0: les solucions es llegeixen directament de ${m('J')}.</p>` +
          systemSolutionHTML(g.A, [0, 0, 0], { queries: [{ v: 'x', value: 3 }, { v: 't', value: 4 }] })
      })
    ],
    theory: [
      tf(`Siguin ${m('A, B ∈ M<sub>3</sub>(R)')} amb ${m('det(A) = 3')} i ${m('det(B) = 2')}. És cert que ${m('det(2AB<sup>2</sup>A<sup>−1</sup>) = 8')}?`, false,
        `<p><strong>FALS.</strong> ${m('det(2AB<sup>2</sup>A<sup>−1</sup>) = 2<sup>3</sup>·3·2<sup>2</sup>·(1/3) = 32 ≠ 8')}.</p>`),
      tf('Dues matrius 2 × 2 diferents tenen formes de Gauss-Jordan diferents.', false,
        `<p><strong>FALS.</strong> ${m('I')} i ${m('2I')} són diferents i totes dues tenen forma de Gauss-Jordan ${m('I')}.</p>`),
      tf(`Sigui ${m('AX = B')} un sistema amb ${m('A ∈ M<sub>n</sub>(R)')}. Si té solució única, llavors ${m('A')} és invertible.`, true,
        `<p><strong>CERT.</strong> Solució única ⇒ ${m('rang(A) = n')} (cap incògnita lliure). Una matriu quadrada de rang ${m('n')} té ${m('det ≠ 0')}, per tant és invertible.</p>`)
    ]
  });

  /* ---------------- 2017/18 ---------------- */
  const A17 = [[0, 2, 2, 4], [0, 2, 2, 0], [-1, 0, 2, 4], [3, 2, -4, -12]];
  const g17 = gauss(A17);
  const fifth = k => new C(2 * Math.cos(2 * Math.PI * k / 5), 2 * Math.sin(2 * Math.PI * k / 5));
  EXAMS.push({
    id: '2017', course: '2017/18', date: '27 d’octubre de 2017 (versió A)',
    note: 'Format antic: teoria de matrius (2 punts) + dos exercicis de 4 punts.',
    exercises: [
      {
        title: 'Complexos: potència i arrels cinquenes',
        pts: 4,
        practice: { kind: 'custom', parts: [
          { title: 'Forma polar i z¹³', fields: [
            fld.num('|z| =', 2), fld.ang('arg(z) =', 7 * PI / 6), fld.cx('z<sup>13</sup> =', -4096 * SQ3, -4096)] },
          { title: 'Arrels de X⁵ − 32 i factorització a C', fields: [
            fld.roots('Les 5 arrels (p. ex. 2e^(2iπ/5)):', [0, 1, 2, 3, 4].map(k => [fifth(k).re, fifth(k).im])),
            Object.assign(fld.poly('C', [1, 0, 0, 0, 0, -32]), { label: m('A C[X]: p(X) =') })] },
          { title: 'Factorització a R[X]', fields: [
            Object.assign(fld.poly('R', [1, 0, 0, 0, 0, -32], { a: Math.cos(2 * PI / 5), b: Math.cos(4 * PI / 5) }),
              { label: m('p(X) ='), placeholder: 'pots fer servir a i b' })] }
        ] },
        statementHTML: `<ol class="parts">
          <li>Doneu una forma polar de ${m('z')} i de ${m('z<sup>13</sup>')} per a ${m('z = −√3 − i')}. Calculeu la forma cartesiana de ${m('z<sup>13</sup>')}.</li>
          <li>Calculeu les arrels complexes, en forma polar, del polinomi ${m('X<sup>5</sup> − 32')}, i factoritzeu a ${m('C[X]')}.</li>
          <li>Factoritzeu a ${m('R[X]')} el polinomi ${m('X<sup>5</sup> − 32')} (podeu escriure algun coeficient en funció de ${m('a = cos(2π/5)')} i ${m('b = cos(4π/5)')}).</li>
        </ol>`,
        solutionHTML: `<h4>(a)</h4>
          <p>${m('|z| = 2')}, tercer quadrant: ${m('arg z = π + π/6 = 7π/6')}. ${m('z = 2e<sup>i7π/6</sup>')}.</p>
          <p>${m('z<sup>13</sup> = 2<sup>13</sup>e<sup>i·91π/6</sup>')}. Com que ${m('91π/6 = 14π + 7π/6')}: ${m('z<sup>13</sup> = 8192e<sup>i7π/6</sup>')}.</p>
          <p class="answer">${m('z<sup>13</sup> = 8192(−√3/2 − i/2) = −4096√3 − 4096i')}</p>
          <h4>(b)</h4>
          <p>${m('32 = 32e<sup>i0</sup>')} ⇒ ${m('x<sub>k</sub> = 2e<sup>i2πk/5</sup>')}, ${m('k = 0, …, 4')}: ${m('2, 2e<sup>i2π/5</sup>, 2e<sup>i4π/5</sup>, 2e<sup>i6π/5</sup>, 2e<sup>i8π/5</sup>')}.</p>
          <p class="answer">${m('X<sup>5</sup> − 32 = ∏<sub>k=0</sub><sup>4</sup>(X − 2e<sup>i2πk/5</sup>)')}</p>
          <h4>(c)</h4>
          <p>${m('2e<sup>i8π/5</sup>')} és el conjugat de ${m('2e<sup>i2π/5</sup>')} i ${m('2e<sup>i6π/5</sup>')} el de ${m('2e<sup>i4π/5</sup>')}. ${m('(X − 2e<sup>iθ</sup>)(X − 2e<sup>−iθ</sup>) = X<sup>2</sup> − 4cosθ·X + 4')}:</p>
          <p class="answer">${m('X<sup>5</sup> − 32 = (X − 2)(X<sup>2</sup> − 4aX + 4)(X<sup>2</sup> − 4bX + 4)')}</p>`,
        plot: [0, 1, 2, 3, 4].map(k => ({ z: fifth(k), label: 'x' + '₀₁₂₃₄'[k], color: ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c3)', 'var(--c2)'][k] }))
      },
      {
        title: 'Gauss-Jordan, determinants i sistema amb paràmetre',
        pts: 4,
        practice: { kind: 'matrix', layout: '2017', A: A17, system: { type: 'param', M: A17, c0: [1, 0, 0, 0], c1: [0, 3, 1, 0], pname: 's', vars: ['x', 'y', 'z', 't'] } },
        statementHTML: `<p>Considerem la matriu</p>
          ${mc('A = ' + Fmt.matHTML(A17) + ' ∈ M<sub>4</sub>(Q).')}
          <ol class="parts">
            <li>Trobeu la forma normal de Gauss-Jordan ${m('A′')} associada a ${m('A')} i una matriu ${m('P')} invertible on ${m('PA = A′')}. Quin és el rang de ${m('A')}?</li>
            <li>Calculeu el determinant de ${m('A')} i el determinant de ${m('P')}.</li>
            <li>Discutiu en funció de ${m('s')} el sistema lineal ${m('A·(x, y, z, t)<sup>t</sup> = (1, 3s, s, 0)<sup>t</sup>')} i, en els casos que sigui compatible, trobeu-ne la solució en forma paramètrica.</li>
          </ol>`,
        solutionHTML: gaussSolutionHTML(g17, '(a)').replace(/J = /, 'A′ = ') + pSolutionHTML(g17, '(a)', false).replace('PA = J</h4>', 'PA = A′</h4>') +
          `<h4>(b) Determinants</h4>
          <p>${m('rang(A) = 3 &lt; 4')}, per tant ${m('det(A) = 0')}.</p>
          <p class="answer">${m('det(A) = 0')}, &nbsp; ${m('det(P) = ' + Fmt.fracHTML(g17.detP))}</p>
          <p>(El valor de ${m('det(P)')} depèn de la ${m('P')} escollida; el que és segur és que és ${m('≠ 0')}.)</p>
          <h4>(c) Discussió segons s</h4>` +
          paramSystemHTML(A17, [1, 0, 0, 0], [0, 3, 1, 0], 's', ['x', 'y', 'z', 't'])
      }
    ],
    theoryTitle: 'Teoria (2 punts)',
    theoryIntro: `Sigui ${m('A')} una matriu 4 × 4 amb forma normal de Gauss-Jordan ${m('A′ = ' + Fmt.matHTML([[1, 0, 2, 0], [0, 1, 1, 0], [0, 0, 0, 1], [0, 0, 0, 0]]))}.`,
    theory: [
      tf(`Existeix una matriu ${m('B')} 4 × 4 tal que ${m('AB')} tingui determinant diferent de zero?`, false,
        `<p><strong>NO.</strong> ${m('A′')} té una fila nul·la, així que ${m('rang(A) = 3')} i ${m('det(A) = 0')}. Llavors ${m('det(AB) = det(A)det(B) = 0')} per a tota ${m('B')}.</p>`),
      tf(`Pot ser que ${m('A = ' + Fmt.matHTML([[1, 0, 2, 1], [0, 1, 1, 1], [0, 0, 0, 1], [0, 0, 0, 1]]))}?`, true,
        `<p><strong>SÍ.</strong> Fent ${m('F<sub>4</sub> ← F<sub>4</sub> − F<sub>3</sub>')}, ${m('F<sub>1</sub> ← F<sub>1</sub> − F<sub>3</sub>')}, ${m('F<sub>2</sub> ← F<sub>2</sub> − F<sub>3</sub>')} s'obté exactament ${m('A′')}. Com que la forma de Gauss-Jordan és única, aquesta matriu té forma ${m('A′')}.</p>`)
    ],
    theoryYesNo: true
  });

  global.PastExams = {
    list: EXAMS, gauss,
    helpers: {
      gauss, gaussSolutionHTML, pSolutionHTML, rowCombHTML, systemSolutionHTML, paramSystemHTML,
      systemHTMLText, cols, col, fld, tf, mat2, m, mc, linHTML
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.PastExams;
})(typeof window !== 'undefined' ? window : globalThis);
