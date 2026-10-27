/* ============================================================
   Àlgebra · Parcial 1 — Matrius i sistemes (aritmètica exacta)
   ============================================================ */
(function (global) {
  'use strict';
  const Frac = global.Frac, F = global.F;

  function zeros(m, n) {
    return Array.from({ length: m }, () => Array.from({ length: n }, () => F(0)));
  }
  function identity(n) {
    const I = zeros(n, n);
    for (let i = 0; i < n; i++) I[i][i] = F(1);
    return I;
  }
  function fromNumbers(A) { return A.map(r => r.map(x => F(x))); }
  function toNumbers(A) { return A.map(r => r.map(x => x instanceof Frac ? x.toNumber() : x)); }
  function clone(A) { return A.map(r => r.map(x => x instanceof Frac ? new Frac(x.n, x.d) : x)); }

  function mul(A, B) {
    const m = A.length, n = B[0].length, p = B.length;
    if (A[0].length !== p) throw new Error('mul: dimensions');
    const C = zeros(m, n);
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      let s = F(0);
      for (let k = 0; k < p; k++) s = s.add(F(A[i][k]).mul(F(B[k][j])));
      C[i][j] = s;
    }
    return C;
  }
  function mulVec(A, v) {
    return A.map(row => {
      let s = F(0);
      for (let j = 0; j < row.length; j++) s = s.add(F(row[j]).mul(F(v[j])));
      return s;
    });
  }
  function transpose(A) {
    return A[0].map((_, j) => A.map(row => row[j]));
  }
  function matEq(A, B, eps) {
    eps = eps || 1e-8;
    if (A.length !== B.length || A[0].length !== B[0].length) return false;
    for (let i = 0; i < A.length; i++) for (let j = 0; j < A[0].length; j++) {
      const a = A[i][j] instanceof Frac ? A[i][j].toNumber() : A[i][j];
      const b = B[i][j] instanceof Frac ? B[i][j].toNumber() : B[i][j];
      if (Math.abs(a - b) > eps) return false;
    }
    return true;
  }

  function rowStep(M, op) {
    return { op, matrix: clone(M) };
  }

  // Gauss-Jordan with exact fractions and a trace.
  function rrefSteps(input) {
    const A = fromNumbers(input);
    const m = A.length, n = A[0].length;
    const steps = [];
    let row = 0;
    const pivots = [];
    for (let col = 0; col < n && row < m; col++) {
      let pivot = -1;
      for (let i = row; i < m; i++) if (!A[i][col].isZero()) { pivot = i; break; }
      if (pivot === -1) continue;
      if (pivot !== row) {
        [A[row], A[pivot]] = [A[pivot], A[row]];
        steps.push(rowStep(A, { type: 'swap', i: row, j: pivot }));
      }
      if (!A[row][col].isOne()) {
        const k = A[row][col].inv();
        for (let j = 0; j < n; j++) A[row][j] = A[row][j].mul(k);
        steps.push(rowStep(A, { type: 'scale', i: row, k }));
      }
      for (let i = 0; i < m; i++) {
        if (i === row) continue;
        if (A[i][col].isZero()) continue;
        const k = A[i][col].neg();
        for (let j = 0; j < n; j++) A[i][j] = A[i][j].add(k.mul(A[row][j]));
        steps.push(rowStep(A, { type: 'add', i, j: row, k }));
      }
      pivots.push(col);
      row++;
    }
    return { J: A, pivots, steps };
  }

  function rref(input) {
    const r = rrefSteps(input);
    return r.J;
  }

  function rank(input) {
    const r = rrefSteps(input);
    return r.pivots.length;
  }

  function det(input) {
    const A = fromNumbers(input);
    const n = A.length;
    if (n !== A[0].length) throw new Error('det: matriu no quadrada');
    let d = F(1);
    for (let col = 0; col < n; col++) {
      let p = -1;
      for (let i = col; i < n; i++) if (!A[i][col].isZero()) { p = i; break; }
      if (p === -1) return F(0);
      if (p !== col) {
        [A[col], A[p]] = [A[p], A[col]];
        d = d.neg();
      }
      d = d.mul(A[col][col]);
      const piv = A[col][col];
      for (let i = col + 1; i < n; i++) {
        if (A[i][col].isZero()) continue;
        const k = A[i][col].div(piv);
        for (let j = col; j < n; j++) A[i][j] = A[i][j].sub(k.mul(A[col][j]));
      }
    }
    return d;
  }

  function inverse(input) {
    const A = fromNumbers(input);
    const n = A.length;
    if (n !== A[0].length) return null;
    const aug = A.map((row, i) => row.concat(identity(n)[i]));
    const tmp = rrefSteps(aug);
    // If the left block is not the identity, the matrix is singular.
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const expected = i === j ? 1 : 0;
        if (!tmp.J[i][j].eq(F(expected))) return null;
      }
    }
    return tmp.J.map(row => row.slice(n));
  }

  function isRREF(input) {
    const A = fromNumbers(input);
    const m = A.length, n = A[0].length;
    const pivots = [];
    let last = -1;
    for (let i = 0; i < m; i++) {
      let first = -1;
      for (let j = 0; j < n; j++) if (!A[i][j].isZero()) { first = j; break; }
      if (first === -1) continue;
      if (!A[i][first].isOne()) return false;
      if (first <= last) return false;
      last = first;
      pivots.push({ row: i, col: first });
      // all entries above/below pivot must be zero
      for (let k = 0; k < m; k++) {
        if (k !== i && !A[k][first].isZero()) return false;
      }
    }
    // zero rows must be at the bottom
    let seenZero = false;
    for (let i = 0; i < m; i++) {
      const z = A[i].every(x => x.isZero());
      if (z) seenZero = true;
      else if (seenZero) return false;
    }
    return true;
  }

  // Solve J x = y where J is in RREF. Returns particular + nullspace basis.
  function solveRREF(J, y) {
    const m = J.length, n = J[0].length;
    const pivots = [];
    for (let i = 0; i < m; i++) {
      let first = -1;
      for (let j = 0; j < n; j++) if (!F(J[i][j]).isZero()) { first = j; break; }
      if (first !== -1) pivots.push({ row: i, col: first });
    }
    // consistency: zero rows must have zero rhs
    for (let i = 0; i < m; i++) {
      const zeroRow = J[i].every(x => F(x).isZero());
      if (zeroRow && !F(y[i]).isZero()) return { compatible: false, pivots };
    }
    const pivotCols = pivots.map(p => p.col);
    const freeCols = [];
    for (let j = 0; j < n; j++) if (!pivotCols.includes(j)) freeCols.push(j);
    const particular = Array.from({ length: n }, () => F(0));
    for (const p of pivots) particular[p.col] = F(y[p.row]);
    const basis = freeCols.map(free => {
      const v = Array.from({ length: n }, () => F(0));
      v[free] = F(1);
      for (const p of pivots) {
        v[p.col] = F(J[p.row][free]).neg();
      }
      return { free, vector: v };
    });
    return { compatible: true, particular, basis, freeCols, pivotCols };
  }

  global.Mat = {
    zeros, identity, fromNumbers, toNumbers, clone, mul, mulVec, transpose,
    matEq, rref, rrefSteps, rank, det, inverse, isRREF, solveRREF
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Mat;
})(typeof window !== 'undefined' ? window : globalThis);
