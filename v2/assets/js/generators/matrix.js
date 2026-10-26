/* ============================================================
   Àlgebra · Parcial 1 — Generador de matrius, Gauss-Jordan i sistemes
   ============================================================ */
(function (global) {
  'use strict';
  const Mat = global.Mat, Fmt = global.Fmt, F = global.F, Frac = global.Frac;

  function intMatrix(m, n, min, max, rng) {
    return Array.from({ length: m }, () => Array.from({ length: n }, () => rng.int(min, max)));
  }

  function randomRREF(rng, m, n, r) {
    const pivotCols = rng.sample(Array.from({ length: n }, (_, i) => i), r).sort((a, b) => a - b);
    const J = Array.from({ length: m }, () => Array.from({ length: n }, () => 0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < n; j++) {
        if (pivotCols.includes(j)) continue;
        // Entries to the left of the pivot must be zero in RREF.
        if (j < pivotCols[i]) continue;
        // Mostly small numbers; occasionally zero.
        J[i][j] = rng.chance(0.32) ? 0 : rng.int(-2, 2);
      }
      J[i][pivotCols[i]] = 1;
    }
    return { J, pivotCols };
  }

  function randomUnimodular(rng, m) {
    let P = Mat.identity(m);
    const ops = rng.int(3, 6);
    for (let t = 0; t < ops; t++) {
      const type = rng.int(1, 3);
      if (type === 1) {
        const i = rng.int(0, m - 1), j = rng.int(0, m - 1);
        if (i === j) continue;
        [P[i], P[j]] = [P[j], P[i]];
      } else if (type === 2) {
        const i = rng.int(0, m - 1), j = rng.int(0, m - 1);
        if (i === j) continue;
        const k = rng.pick([-2, -1, 1, 2]);
        for (let c = 0; c < m; c++) P[i][c] = P[i][c].add(P[j][c].mul(F(k)));
      } else {
        const i = rng.int(0, m - 1);
        for (let c = 0; c < m; c++) P[i][c] = P[i][c].neg();
      }
    }
    return P;
  }

  function invertInt(P) {
    const inv = Mat.inverse(P);
    if (!inv) return null;
    const nums = [];
    for (const row of inv) {
      const out = [];
      for (const v of row) {
        if (!v.d || v.d !== 1) return null;
        out.push(v.n);
      }
      nums.push(out);
    }
    return nums;
  }

  function buildMatrix(rng, m, n) {
    const r = rng.chance(0.18) && m >= 4 ? m - 2 : m - 1;
    const { J, pivotCols } = randomRREF(rng, m, n, r);
    for (let attempt = 0; attempt < 120; attempt++) {
      const P = randomUnimodular(rng, m);
      const Pinv = invertInt(P);
      if (!Pinv) continue;
      const Af = Mat.mul(Pinv, J);
      const A = Af.map(row => row.map(v => {
        if (!v.d || v.d !== 1) return null;
        return v.n;
      }));
      if (A.some(row => row.some(x => x === null))) continue;
      if (Mat.matEq(P, Mat.identity(m))) continue;
      if (Mat.matEq(A, J)) continue;
      const maxAbs = Math.max(...A.flat().map(Math.abs));
      if (maxAbs > 28) continue;
      // avoid an absurdly sparse matrix with a zero column in every place
      const nonZero = A.flat().filter(x => x !== 0).length;
      if (nonZero < Math.max(4, Math.floor(m * n * 0.35))) continue;
      // verify the defining relations
      if (!Mat.matEq(Mat.mul(P, A), J)) continue;
      const rr = Mat.rref(A);
      if (!Mat.matEq(rr, J)) continue;
      return { A, J, P, Pinv, pivotCols, rank: r };
    }
    // fallback: a simple but valid case
    return buildMatrix(rng, m, n);
  }

  function systemWithParam(A, c0, k) {
    const rows = [];
    for (let i = 0; i < A.length; i++) {
      const parts = [];
      for (let j = 0; j < A[i].length; j++) {
        const v = A[i][j];
        if (v === 0) continue;
        const abs = Math.abs(v);
        const coef = abs === 1 ? '' : String(abs);
        const name = Fmt.VARS[j] || ('x' + (j + 1));
        const term = coef + name;
        if (!parts.length) parts.push((v < 0 ? '−' : '') + term);
        else parts.push((v < 0 ? ' − ' : ' + ') + term);
      }
      if (!parts.length) parts.push('0');
      const rhs = i === k ? '<span class="param">b</span>' : Fmt.fracHTML(F(c0[i]));
      rows.push(parts.join('') + ' = ' + rhs);
    }
    return '<div class="eqsys">' + rows.map(r => '<div>' + r + '</div>').join('') + '</div>';
  }

  function combinationHTML(coeffs, rowLetter) {
    const terms = [];
    coeffs.forEach((c, j) => {
      if (Math.abs(c) < 1e-12) return;
      const abs = Math.abs(c);
      const coef = Math.abs(abs - 1) < 1e-12 ? '' : Fmt.fracHTML(F(abs));
      const body = coef + 'F<sub>' + (j + 1) + '</sub><sup>' + rowLetter + '</sup>';
      if (!terms.length) terms.push((c < 0 ? '−' : '') + body);
      else terms.push((c < 0 ? ' − ' : ' + ') + body);
    });
    return terms.length ? terms.join('') : '0';
  }

  function generate(rng, opts) {
    rng = rng || new global.Rand.RNG();
    opts = opts || {};
    const sizes = opts.exam
      ? [[3, 4], [4, 4], [4, 5], [3, 5]]
      : [[3, 4], [4, 4], [4, 5], [3, 5]];
    const [m, n] = rng.pick(sizes);
    const data = buildMatrix(rng, m, n);
    const { A, J, P, rank } = data;

    // The exercise is generated so that A is consistent for the numeric system.
    const x0 = Array.from({ length: n }, () => rng.int(-3, 3));
    const c = Mat.mulVec(A, x0).map(v => v.n);
    const y = Mat.mulVec(P, c).map(v => v.n);
    const sol = Mat.solveRREF(J, y);
    const dim = n - rank;

    // Parameter-in-b variant, like the 2025 exam.
    const useParam = opts.param !== undefined ? opts.param : rng.chance(0.35);
    let paramData = null;
    if (useParam) {
      const zeroRows = [];
      for (let i = rank; i < m; i++) zeroRows.push(i);
      const zr = zeroRows[0];
      let k = -1;
      for (let j = 0; j < m; j++) if (!P[zr][j].isZero()) { k = j; break; }
      if (k >= 0) {
        const cStar = Mat.mulVec(A, x0).map(v => v.n);
        const c0 = cStar.slice();
        // The system displays b in row k, so replacing that component of cStar
        // by the parameter gives the compatibility condition in terms of b.
        const v = P.map(row => row[k]).map(x => x.toNumber());
        const condCoef = v[zr];
        // y = P·c(b) = P·c0 + condCoef·(b − c0[k]); the constant term must be
        // written directly in terms of b, not in terms of c0[k].
        const condConst = -condCoef * c0[k];
        // Only accept if the parameter really appears in the compatibility condition.
        if (Math.abs(condCoef) > 1e-9) {
          const bSol = new Frac(c0[k], 1);
          paramData = { k, c0, cStar, bSol, zr, v, condCoef, condConst };
        }
      }
    }

    const detP = Mat.det(P);
    const stepTrace = Mat.rrefSteps(A);
    const rowIndex = Math.min(2, m - 1);
    const rowComb = P[rowIndex].map(x => x.toNumber ? x.toNumber() : x);

    // coordinate query for the numeric system
    const qk = rng.int(0, n - 1);
    const qv = rng.int(-4, 4);
    let coordPossible = false, coordParam = null;
    const fixedVal = sol.particular[qk].toNumber();
    const varying = sol.basis.find(b => !b.vector[qk].isZero());
    if (varying) {
      coordPossible = true;
      coordParam = new Frac(qv, 1).sub(sol.particular[qk]).div(varying.vector[qk]);
    } else {
      coordPossible = Math.abs(fixedVal - qv) < 1e-9;
    }

    const systemHTML = Fmt.systemHTML(A, c);
    const queryHTML = `<span class="math">${Fmt.VARS[qk]} = ${Fmt.fracHTML(F(qv))}</span>`;
    const matrixHTML = Fmt.matHTML(A);
    const jHTML = Fmt.matHTML(J);
    const pHTML = Fmt.matHTML(P);

    const stepHTML = stepTrace.steps.map((s, i) => `
      <div class="step">
        <div class="step-op">${Fmt.opHTML(s.op)}</div>
        ${Fmt.matHTML(s.matrix)}
      </div>`).join('');

    const solutionA = `
      <h4>(a) Matriu de Gauss-Jordan i rang</h4>
      <p>Apliquem operacions elementals per files fins a obtenir la forma reduïda esglaonada:</p>
      <details class="steps"><summary>Veure la reducció pas a pas (${stepTrace.steps.length} operacions)</summary>
        <div class="steps-body">${stepHTML}</div>
      </details>
      <p class="answer"><span class="math">J = ${jHTML}</span></p>
      <p><span class="math">rang(A) = ${rank}</span> (nombre de pivots de <span class="math">J</span>).</p>`;

    const solutionB = `
      <h4>(b) Matriu P amb PA = J</h4>
      <p>Una possible matriu és:</p>
      <p class="answer"><span class="math">P = ${pHTML}</span></p>
      <p><span class="math">det(P) = ${Fmt.fracHTML(detP)}</span>. Com que <span class="math">det(P) ≠ 0</span>, <span class="math">P</span> és invertible.</p>
      <p>Comprovació: <span class="math">P·A = J</span>.</p>
      <div class="note">La matriu <span class="math">P</span> no és única: qualsevol successió d'operacions elementals que porti <span class="math">A</span> a <span class="math">J</span> dona una <span class="math">P</span> vàlida.</div>`;

    const solutionC = `
      <h4>(c) Fila ${rowIndex + 1} de J com a combinació lineal de les files d'A</h4>
      <p>Com que <span class="math">P·A = J</span>, la fila <span class="math">i</span> de <span class="math">J</span> és la combinació de les files d'<span class="math">A</span> amb coeficients la fila <span class="math">i</span> de <span class="math">P</span>:</p>
      <p class="answer"><span class="math">F<sub>${rowIndex + 1}</sub><sup>J</sup> = ${combinationHTML(rowComb, 'A')}</span></p>
      <p>És a dir, la fila ${rowIndex + 1} de <span class="math">J</span> és <span class="math">${Fmt.vectorHTML(J[rowIndex])}</span>.</p>`;

    let solutionD;
    if (paramData) {
      const { k, c0, bSol, zr, condCoef, condConst, cStar } = paramData;
      const bStr = Fmt.fracHTML(bSol);
      const yStar = Mat.mulVec(P, cStar).map(v => v.n);
      const solStar = Mat.solveRREF(J, yStar);
      solutionD = `
        <h4>(d) Discussió en funció del paràmetre b</h4>
        ${systemWithParam(A, c0, k)}
        <p>Transformem el sistema multiplicant per <span class="math">P</span>: <span class="math">J x = P c(b)</span>.</p>
        <p>La fila ${zr + 1} de <span class="math">J</span> és nul·la. Per tant, la condició de compatibilitat és que la component ${zr + 1} de <span class="math">P c(b)</span> sigui zero:</p>
        <p><span class="math">${Fmt.fracHTML(F(condConst))} ${condCoef >= 0 ? '+' : '−'} ${Math.abs(condCoef) === 1 ? '' : Fmt.fracHTML(F(Math.abs(condCoef)))}b = 0 &nbsp;⇒&nbsp; b = ${bStr}</span>.</p>
        <p>Per tant:</p>
        <ul>
          <li>Si <span class="math">b = ${bStr}</span>, el sistema és <strong>compatible indeterminat</strong> amb <span class="math">${dim}</span> grau${dim === 1 ? '' : 's'} de llibertat.</li>
          <li>Si <span class="math">b ≠ ${bStr}</span>, el sistema és <strong>incompatible</strong> (no té solució).</li>
        </ul>
        <p>Quan <span class="math">b = ${bStr}</span>, les solucions són:</p>
        <p class="answer"><span class="math">${Fmt.paramVectorHTML(n, solStar.particular, solStar.basis)}</span></p>
        <p><span class="math">${Fmt.paramLineHTML(n, solStar.particular, solStar.basis)}</span></p>
        <p>La dimensió de la varietat lineal és <span class="math">${dim}</span>.</p>`;
    } else {
      const queryText = coordPossible
        ? (() => {
            const b = sol.basis.find(bb => !bb.vector[qk].isZero());
            if (!b) {
              return `<p><strong>Sí</strong> que existeix una solució amb <span class="math">${Fmt.VARS[qk]} = ${Fmt.fracHTML(F(qv))}</span>: de fet, <span class="math">${Fmt.VARS[qk]}</span> val sempre <span class="math">${Fmt.fracHTML(F(fixedVal))}</span>; per exemple, la solució particular.</p>`;
            }
            const pname = Fmt.PARAMS[sol.basis.indexOf(b)] || 'λ';
            const how = coordParam && !coordParam.isZero()
              ? `prenent <span class="math">${pname} = ${Fmt.fracHTML(coordParam)}</span> (i els altres paràmetres igual a 0)`
              : 'prenent tots els paràmetres igual a 0';
            return `<p><strong>Sí</strong> que existeix una solució amb <span class="math">${Fmt.VARS[qk]} = ${Fmt.fracHTML(F(qv))}</span>: per exemple, ${how}.</p>`;
          })()
        : `<p><strong>No</strong> hi ha cap solució amb <span class="math">${Fmt.VARS[qk]} = ${Fmt.fracHTML(F(qv))}</span>: en aquest sistema <span class="math">${Fmt.VARS[qk]}</span> val sempre <span class="math">${Fmt.fracHTML(F(fixedVal))}</span>.</p>`;
      solutionD = `
        <h4>(d) Resolució del sistema</h4>
        ${systemHTML}
        <p>Resolem amb la matriu de Gauss-Jordan. La solució en forma paramètrica és:</p>
        <p class="answer"><span class="math">${Fmt.paramVectorHTML(n, sol.particular, sol.basis)}</span></p>
        <p><span class="math">${Fmt.paramLineHTML(n, sol.particular, sol.basis)}</span></p>
        <p>La dimensió de la varietat lineal (graus de llibertat) és <span class="math">${dim}</span>, perquè hi ha <span class="math">${n}</span> incògnites i <span class="math">rang(A) = ${rank}</span>.</p>
        ${queryText}`;
    }

    const statement = `
      <p>Considereu la matriu</p>
      <p class="math center">A = ${matrixHTML} ∈ M<sub>${m}×${n}</sub>(R).</p>
      <ol class="parts">
        <li>Troba la matriu de Gauss-Jordan <span class="math">J</span> associada a <span class="math">A</span> i calcula el rang de <span class="math">A</span>.</li>
        <li>Troba una matriu <span class="math">P</span> invertible tal que <span class="math">P·A = J</span>. Calcula'n el determinant.</li>
        <li>Expressa la fila ${rowIndex + 1} de <span class="math">J</span> com a combinació lineal de les files d'<span class="math">A</span>.</li>
        <li>${paramData
          ? 'Discuteix la compatibilitat (i els graus de llibertat, si és el cas) del sistema següent en funció del paràmetre <span class="math">b ∈ R</span>, i resol-lo quan sigui compatible.'
          : `Resol el sistema d'equacions lineals següent, expressa les solucions en forma paramètrica i calcula la dimensió de la varietat lineal. Hi ha alguna solució amb ${queryHTML}?`}</li>
      </ol>
      ${paramData ? systemWithParam(A, paramData.c0, paramData.k) : systemHTML}`;

    return {
      topic: 'matrius',
      title: 'Gauss-Jordan, matriu P i sistema',
      statementHTML: statement,
      solutionHTML: `<div class="solution-block">
        ${solutionA}
        ${solutionB}
        ${solutionC}
        ${solutionD}
        <div class="note">El rang és el nombre de pivots de la forma de Gauss-Jordan. Si <span class="math">rang(A) = rang(A|b) =</span> nombre d'incògnites → SCD; si <span class="math">rang(A) = rang(A|b) &lt;</span> nombre d'incògnites → SCI; si <span class="math">rang(A) ≠ rang(A|b)</span> → incompatible.</div>
      </div>`,
      data: {
        A, J, P, rank, c, sol, paramData, rowIndex,
        query: paramData ? null : { index: qk, variable: Fmt.VARS[qk], value: qv }
      }
    };
  }

  global.MatrixGen = { generate, buildMatrix, randomRREF, randomUnimodular, invertInt };
})(typeof window !== 'undefined' ? window : globalThis);
