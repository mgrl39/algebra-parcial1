/* ============================================================
   Àlgebra · Parcial 1 — Generador de polinomis
   ============================================================ */
(function (global) {
  'use strict';
  const { C } = global.Complex;
  const Fmt = global.Fmt;
  const Frac = global.Frac;
  const esc = Fmt.esc;

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }

  function coeffsOf(q, p, a, b) {
    const c = a * a + b * b;
    return [q, -2 * a * q - p, q * c + 2 * a * p, -p * c];
  }

  function signTerm(coef, body) {
    return (coef < 0 ? '−' : '') + body;
  }

  function linearFactorHTML(q, p) {
    // qx − p
    if (q === 1) {
      if (p === 0) return 'x';
      return p > 0 ? '(x − ' + p + ')' : '(x + ' + (-p) + ')';
    }
    if (p === 0) return q === 1 ? 'x' : q + 'x';
    return '(' + q + 'x ' + (p > 0 ? '− ' + p : '+ ' + (-p)) + ')';
  }

  function quadraticHTML(a, b) {
    const c = a * a + b * b;
    const coeff = -2 * a;
    let xTerm = '';
    if (coeff !== 0) {
      const abs = Math.abs(coeff);
      const coef = abs === 1 ? '' : abs;
      xTerm = (coeff > 0 ? ' + ' : ' − ') + coef + 'x';
    }
    return '(x<sup>2</sup>' + xTerm + ' + ' + c + ')';
  }

  function rootHTML(z) {
    const re = Math.round(z.re), im = Math.round(z.im);
    if (im === 0) return String(re).replace('-', '−');
    const imBody = Math.abs(im) === 1 ? '' : String(Math.abs(im));
    if (re === 0) return (im < 0 ? '−' : '') + imBody + 'i';
    return String(re).replace('-', '−') + (im < 0 ? ' − ' : ' + ') + imBody + 'i';
  }
  function numLabel(x) { return String(x).replace('-', '−'); }

  function generate(rng) {
    rng = rng || new global.Rand.RNG();
    let p, q, a, b, coeffs;
    do {
      q = rng.int(1, 3);
      p = rng.nonZero(-5, 5);
      while (gcd(p, q) !== 1) p = rng.nonZero(-5, 5);
      a = rng.int(-3, 3);
      b = rng.int(1, 3);
      coeffs = coeffsOf(q, p, a, b);
      // avoid a completely trivial polynomial and keep coefficients readable
    } while (Math.max(...coeffs.map(Math.abs)) > 120 || (a === 0 && p === 0));

    const [c3, c2, c1, c0] = coeffs;
    const z = new C(a, b);
    const z2 = z.pow(2);
    const z3 = z.pow(3);
    const t3 = z3.scale(c3), t2 = z2.scale(c2), t1 = z.scale(c1);
    const total = t3.add(t2).add(t1).add(new C(c0, 0));
    const pFrac = new Frac(p, q);
    const sumRoots = new Frac(-c2, c3);
    const wantsPowers = rng.chance(0.4);

    const poly = Fmt.polyHTML(coeffs);

    const termLabel = (c, body) => {
      if (c === 0) return '';
      const abs = Math.abs(c);
      return (c < 0 ? '−' : '') + (abs === 1 ? '' : abs) + body;
    };
    const calcLines = [
      c3 ? `<div><span class="math">${termLabel(c3, 'z<sup>3</sup>')} = ${Fmt.complexHTML(t3)}</span></div>` : '',
      c2 ? `<div><span class="math">${termLabel(c2, 'z<sup>2</sup>')} = ${Fmt.complexHTML(t2)}</span></div>` : '',
      c1 ? `<div><span class="math">${termLabel(c1, 'z')} = ${Fmt.complexHTML(t1)}</span></div>` : '',
      c0 ? `<div><span class="math">${numLabel(c0)}</span></div>` : ''
    ].filter(Boolean).join('');
    const summands = [];
    if (c3) summands.push(Fmt.complexHTML(t3));
    if (c2) summands.push(Fmt.complexHTML(t2));
    if (c1) summands.push(Fmt.complexHTML(t1));
    if (c0) summands.push(numLabel(c0));
    const sumExpression = summands.map((s, i) => i === 0 ? `(${s})` : ` + (${s})`).join('');
    const r3Expression = 2 * a === 0
      ? Fmt.fracHTML(sumRoots)
      : `${Fmt.fracHTML(sumRoots)} ${2 * a < 0 ? '+' : '−'} ${numLabel(Math.abs(2 * a))}`;

    const drawingSolution = wantsPowers
      ? `<h4>3. Dibuix de z, z² i z³</h4>
        <p>Els punts que cal representar són:</p>
        <p><span class="math">z = ${Fmt.complexHTML(z)}</span>, &nbsp;
           <span class="math">z<sup>2</sup> = ${Fmt.complexHTML(z2)}</span>, &nbsp;
           <span class="math">z<sup>3</sup> = ${Fmt.complexHTML(z3)}</span>.</p>
        <p>El dibuix mostra aquests tres punts amb les seves projeccions sobre els eixos. Fixa't que cada producte per <span class="math">z</span> multiplica el mòdul per <span class="math">|z|</span> i suma l'argument.</p>`
      : `<h4>3. Dibuix al pla complex</h4>
        <p>Les arrels són els punts <span class="math">(${numLabel(a)}, ${numLabel(b)})</span>, <span class="math">(${numLabel(a)}, ${numLabel(-b)})</span> i <span class="math">(${Fmt.fracPlain(pFrac)}, 0)</span>.
        Fixa't que les dues arrels complexes són simètriques respecte de l'eix real.</p>`;

    const statement = `
      <p>Considera el polinomi <span class="math">p(x) = ${poly} ∈ C[x]</span>.</p>
      <ol class="parts">
        <li>Comprova que <span class="math">z = ${rootHTML(z)}</span> és una arrel de <span class="math">p(x)</span>.</li>
        <li>Troba les altres arrels de <span class="math">p(x)</span>.<br><span class="hint">(Indicació: en un polinomi amb coeficients reals, el conjugat d'una arrel també és arrel.)</span></li>
        <li>${wantsPowers
          ? 'Dibuixa <span class="math">z</span>, <span class="math">z<sup>2</sup></span> i <span class="math">z<sup>3</sup></span> en el pla complex.'
          : 'Dibuixa les arrels de <span class="math">p(x)</span> en el pla complex.'}</li>
        <li>Si considerem <span class="math">p(x) ∈ R[x]</span>, expressa <span class="math">p(x)</span> com a producte de polinomis irreductibles.</li>
      </ol>`;

    const solution = `
      <div class="solution-block">
        <h4>1. Comprovació que z és arrel</h4>
        <p>Calculem les potències de <span class="math">z = ${rootHTML(z)}</span>:</p>
        <p><span class="math">z<sup>2</sup> = ${Fmt.complexHTML(z2)}</span>, &nbsp;
           <span class="math">z<sup>3</sup> = ${Fmt.complexHTML(z3)}</span>.</p>
        <p>Substituïm a <span class="math">p(x)</span>:</p>
        <div class="calc-steps">${calcLines}</div>
        <p><span class="math">p(z) = ${sumExpression} = ${Fmt.complexHTML(total)}</span>.</p>
        <p>Per tant, <strong><span class="math">z = ${rootHTML(z)}</span> és una arrel de <span class="math">p(x)</span></strong>.</p>

        <h4>2. Les altres arrels</h4>
        <p>Com que <span class="math">p(x)</span> té coeficients reals, el conjugat <span class="math">z̄ = ${rootHTML(z.conj())}</span> també és arrel.</p>
        <p>Fem servir la fórmula de Vieta per a un polinomi de grau 3:</p>
        <p><span class="math">r<sub>1</sub> + r<sub>2</sub> + r<sub>3</sub> = −b/a = −(${numLabel(c2)})/(${numLabel(c3)}) = ${Fmt.fracHTML(sumRoots)}</span>.</p>
        <p>La suma de les dues arrels complexes és <span class="math">z + z̄ = 2a = ${numLabel(2 * a)}</span>. Aïllant la tercera arrel:</p>
        <p><span class="math">r<sub>3</sub> = ${r3Expression} = ${Fmt.fracHTML(pFrac)}</span>.</p>
        <p>Les tres arrels són <span class="math">${rootHTML(z)}, ${rootHTML(z.conj())}, ${Fmt.fracHTML(pFrac)}</span>.</p>

        ${drawingSolution}

        <h4>4. Factorització a R[x]</h4>
        <p>El factor lineal associat a l'arrel real és <span class="math">${linearFactorHTML(q, p)}</span>.</p>
        <p>El parell d'arrels conjugades dona el factor quadràtic:</p>
        <p><span class="math">(x − z)(x − z̄) = x<sup>2</sup> − 2ax + (a<sup>2</sup> + b<sup>2</sup>) = ${quadraticHTML(a, b)}</span>.</p>
        <p>El discriminant d'aquest quadràtica és <span class="math">Δ = (${numLabel(-2 * a)})<sup>2</sup> − 4·${a * a + b * b} = ${numLabel(-4 * b * b)} &lt; 0</span>, per tant és irreductible a <span class="math">R[x]</span>.</p>
        <p class="answer"><span class="math">p(x) = ${linearFactorHTML(q, p)}${quadraticHTML(a, b)}</span></p>
        <p>A <span class="math">C[x]</span> la factorització completa és:</p>
        <p class="answer"><span class="math">p(x) = ${linearFactorHTML(q, p)}(x − (${rootHTML(z)}))(x − (${rootHTML(z.conj())}))</span>.</p>

        <div class="note">No cal dividir el polinomi: si coneixes una arrel complexa i els coeficients són reals, la seva conjugada també ho és. Amb Vieta (suma de les arrels = −b/a) obtens la tercera arrel de manera immediata.</div>
      </div>`;

    return {
      topic: 'polinomis',
      title: 'Arrel complexa i factorització',
      poly: { coeffs, q, p, a, b, z, wantsPowers },
      statementHTML: statement,
      solutionHTML: solution,
      plot: {
        points: wantsPowers
          ? [
              { z, label: 'z', color: 'var(--c1)' },
              { z: z2, label: 'z²', color: 'var(--c2)' },
              { z: z3, label: 'z³', color: 'var(--c3)' }
            ]
          : [
              { z, label: 'z', color: 'var(--c1)' },
              { z: z.conj(), label: 'z̄', color: 'var(--c2)' },
              { z: new C(p / q, 0), label: 'r₃', color: 'var(--c3)' }
            ],
        unit: false
      }
    };
  }

  global.PolyGen = { generate, coeffsOf };
})(typeof window !== 'undefined' ? window : globalThis);
