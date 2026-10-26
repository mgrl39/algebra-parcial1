/* ============================================================
   Àlgebra · Parcial 1 — Generador de nombres complexos
   ============================================================ */
(function (global) {
  'use strict';
  const { C, PI, TAU, anglePiLabelSigned, nthRoots, perfectRoot } = global.Complex;
  const Fmt = global.Fmt;
  const esc = Fmt.esc;

  const BASES = [
    { re: 1, im: 0, rl: '1', rel: '1', iml: '0' },
    { re: 0, im: 1, rl: '1', rel: '0', iml: '1' },
    { re: 1, im: 1, rl: '√2', rel: '1', iml: '1' },
    { re: 1, im: Math.sqrt(3), rl: '2', rel: '1', iml: '√3' },
    { re: Math.sqrt(3), im: 1, rl: '2', rel: '√3', iml: '1' },
    { re: 2, im: 2, rl: '2√2', rel: '2', iml: '2' },
    { re: 2, im: 2 * Math.sqrt(3), rl: '4', rel: '2', iml: '2√3' },
    { re: 2 * Math.sqrt(3), im: 2, rl: '4', rel: '2√3', iml: '2' }
  ];

  function scaleLabel(label, k) {
    if (k === 1) return label;
    if (label === '0') return '0';
    if (label.indexOf('√') >= 0) {
      if (label.startsWith('√')) return k + label;
      return label.replace(/^(\d+)/, m => String(Number(m) * k));
    }
    return String(Number(label) * k);
  }

  function signedLabel(label, sign) {
    if (label === '0') return '0';
    return (sign < 0 ? '−' : '') + label;
  }

  function makeZ(rng, allowSqrt2) {
    let base;
    do { base = rng.pick(BASES); } while (!allowSqrt2 && base.rl.indexOf('√') >= 0);
    const k = rng.int(1, 3);
    const sr = rng.sign(), si = rng.sign();
    const re = sr * k * base.re, im = si * k * base.im;
    if (!re && !im) return makeZ(rng, allowSqrt2);
    const theta = Math.atan2(im, re);
    return {
      z: new C(re, im),
      exact: {
        reLabel: signedLabel(scaleLabel(base.rel, k), sr),
        imLabel: signedLabel(scaleLabel(base.iml, k), si),
        rLabel: scaleLabel(base.rl, k),
        thetaLabel: anglePiLabelSigned(theta)
      },
      theta
    };
  }

  function zHTML(obj) {
    if (!obj) return '';
    if (obj.exact) {
      const { reLabel, imLabel } = obj.exact;
      const cleanIm = imLabel.replace('−', '');
      if (imLabel === '0') return esc(reLabel);
      const body = cleanIm === '1' ? '' : cleanIm;
      const sign = imLabel.startsWith('−') ? '−' : '';
      if (reLabel === '0') return esc(sign + body + 'i');
      return esc(reLabel + (sign ? ' − ' : ' + ') + body + 'i');
    }
    return Fmt.complexHTML(obj);
  }

  function complexTex(z) { return Fmt.complexHTML(z); }

  function expHTML(label) {
    const s = String(label);
    return /^[−-]/.test(s)
      ? 'e<sup>−i' + esc(s.slice(1)) + '</sup>'
      : 'e<sup>i' + esc(s) + '</sup>';
  }

  function polarHTML(rLabel, thetaLabel) {
    return esc(rLabel) + ' ' + expHTML(thetaLabel);
  }

  function angleText(theta) {
    const label = global.Complex.anglePiLabelSigned(theta);
    return /°$/.test(label) ? '≈ ' + label : label;
  }

  function modulusPowerLabel(rLabel, n) {
    // Exact label for (a√2)^n, or an integer power for the other bases.
    let a, sqrt2 = false;
    if (rLabel === '√2') { a = 1; sqrt2 = true; }
    else if (rLabel.endsWith('√2')) { a = Number(rLabel.slice(0, -2)); sqrt2 = true; }
    if (!sqrt2) return String(Math.pow(Number(rLabel), n));
    const c = Math.pow(a, n);
    if (n % 2 === 0) return String(c * Math.pow(2, n / 2));
    const coef = c * Math.pow(2, (n - 1) / 2);
    return (coef === 1 ? '' : String(coef)) + '√2';
  }

  function numOrApprox(z) {
    const reInt = Math.abs(z.re - Math.round(z.re)) < 1e-8;
    const imInt = Math.abs(z.im - Math.round(z.im)) < 1e-8;
    if (reInt && imInt) return complexTex(z);
    return complexTex(z) + ' <span class="muted">(aprox.)</span>';
  }

  // ---------- mode 1: polar form and powers ----------
  function polarPower(rng) {
    const obj = makeZ(rng, true);
    const z = obj.z;
    const n = rng.pick([2, 3, 4, 5, 6]);
    const theta = obj.theta;
    const thetaLabel = obj.exact.thetaLabel;
    const power = z.pow(n);
    const rPowLabel = modulusPowerLabel(obj.exact.rLabel, n);
    const powerTheta = theta * n;
    const normalized = global.Complex.normAngle(powerTheta);
    const thetaPowLabel = anglePiLabelSigned(powerTheta);
    const isReal = Math.abs(Math.sin(normalized)) < 1e-8 || Math.abs(normalized - PI) < 1e-8;
    const isPos = isReal && Math.cos(normalized) > 0;
    const cart = numOrApprox(power);

    const statement = `
      <p>Considera el nombre complex <span class="math">z = ${zHTML(obj)}</span>.</p>
      <ol class="parts">
        <li>Calcula el mòdul i l'argument de <span class="math">z</span>.</li>
        <li>Escriu <span class="math">z</span> en forma polar i exponencial.</li>
        <li>Calcula <span class="math">z<sup>${n}</sup></span> en forma polar. És un nombre real? Positiu o negatiu?</li>
      </ol>`;

    const reRel = z.re > 0 ? '> 0' : z.re < 0 ? '< 0' : '= 0';
    const imRel = z.im > 0 ? '> 0' : z.im < 0 ? '< 0' : '= 0';
    const solution = `
      <div class="solution-block">
        <h4>1. Mòdul i argument</h4>
        <p><span class="math">|z| = √((${obj.exact.reLabel})<sup>2</sup> + (${obj.exact.imLabel})<sup>2</sup>) = ${obj.exact.rLabel}</span>.</p>
        <p>Com que <span class="math">Re(z) ${reRel}</span> i <span class="math">Im(z) ${imRel}</span>, l'angle és al quadrant corresponent. Amb la taula d'angles:
        <span class="math">arg(z) = ${thetaLabel}</span>.</p>
        <h4>2. Forma polar</h4>
        <p><span class="math">z = ${polarHTML(obj.exact.rLabel, thetaLabel)}</span>.</p>
        <h4>3. Potència</h4>
        <p>Per la fórmula de De Moivre:</p>
        <p><span class="math">z<sup>${n}</sup> = (${obj.exact.rLabel})<sup>${n}</sup> e<sup>i·${n}·(${thetaLabel})</sup>
        = ${rPowLabel} ${expHTML(thetaPowLabel)}</span>.</p>
        <p>En forma cartesiana: <span class="math">z<sup>${n}</sup> = ${cart}</span>.</p>
        <p>Com que l'angle és ${isReal ? (isPos ? '0 (o múltiple de 2π)' : 'π (o equivalent)') : 'no és múltiple de π'}, el resultat és
        <strong>${isReal ? (isPos ? 'un nombre real positiu' : 'un nombre real negatiu') : 'un nombre complex no real'}</strong>.</p>
        <div class="note">Truc: el mòdul es multiplica <span class="math">n</span> vegades i l'argument se suma <span class="math">n</span> vegades. Si l'angle final és múltiple de <span class="math">2π</span>, el nombre és real positiu; si és múltiple de <span class="math">π</span> senar, és real negatiu.</div>
      </div>`;

    return {
      topic: 'complexos',
      data: { mode: 'polar', z, n, power },
      title: 'Forma polar i potències',
      statementHTML: statement,
      solutionHTML: solution,
      plot: {
        points: [
          { z, label: 'z', color: 'var(--c1)' },
          { z: z.pow(2), label: 'z²', color: 'var(--c2)' },
          { z: z.pow(3), label: 'z³', color: 'var(--c3)' }
        ],
        unit: true
      }
    };
  }

  // ---------- mode 2: nth roots of a real number ----------
  function rootsExercise(rng) {
    const n = rng.pick([3, 3, 4]);
    const m = rng.int(2, 4);
    // Both signs are exact: for n = 4, x^4 + m^4 factors with m√2.
    const sign = rng.sign();
    const c = sign * Math.pow(m, n);
    const roots = nthRoots(new C(c, 0), n);
    const expr = n === 3 ? 'x<sup>3</sup>' : 'x<sup>4</sup>';
    const cAbs = Math.abs(c);

    const rootLine = roots.map((rt, k) => {
      const th = global.Complex.anglePiLabelSigned(rt.theta);
      const cart = complexTex(rt.value);
      return `<li><span class="math">z<sub>${k}</sub> = ${m} ${expHTML(th)} ≈ ${cart}</span></li>`;
    }).join('');

    // Exact factorisation over R for x^n − c.
    let realFactorHTML;
    if (n === 3) {
      if (sign > 0) {
        realFactorHTML = `(x − ${m})(x<sup>2</sup> + ${m}x + ${m * m})`;
      } else {
        realFactorHTML = `(x + ${m})(x<sup>2</sup> − ${m}x + ${m * m})`;
      }
    } else if (sign > 0) {
      realFactorHTML = `(x − ${m})(x + ${m})(x<sup>2</sup> + ${m * m})`;
    } else {
      realFactorHTML = `(x<sup>2</sup> − ${m}√2 x + ${m * m})(x<sup>2</sup> + ${m}√2 x + ${m * m})`;
    }

    const statement = `
      <p>Calcula totes les solucions de l'equació <span class="math">z<sup>${n}</sup> = ${Fmt.numStr(c)}</span> i factoritza el polinomi
      <span class="math">p(x) = ${expr} ${c > 0 ? '−' : '+'} ${cAbs}</span> a <span class="math">C[x]</span> i a <span class="math">R[x]</span>.</p>`;

    const solution = `
      <div class="solution-block">
        <h4>1. Arrels n-èsimes</h4>
        <p>Escrivim <span class="math">${Fmt.numStr(c)} = ${m}<sup>${n}</sup> e<sup>i${sign < 0 ? 'π' : '0'}</sup></span>. Les arrels són:</p>
        <p><span class="math">z<sub>k</sub> = ${m} e<sup>i(${sign < 0 ? 'π' : '0'} + 2πk)/${n}</sup>, &nbsp; k = 0, 1, …, ${n - 1}</span>.</p>
        <ul class="math-list">${rootLine}</ul>
        <h4>2. Factorització a C[x]</h4>
        <p><span class="math">p(x) = ${roots.map((rt, k) => `(x − z<sub>${k}</sub>)`).join('')}</span>.</p>
        <h4>3. Factorització a R[x]</h4>
        <p>Agrupem cada parell d'arrels conjugades en un factor quadràtic irreducible:</p>
        <p class="answer"><span class="math">p(x) = ${realFactorHTML}</span>.</p>
        <div class="note">A <span class="math">R[x]</span>, els factors lineals corresponen a arrels reals; cada parell de complexos conjugats dona un factor de grau 2 amb discriminant negatiu. Comprova que el producte reprodueix exactament el polinomi inicial.</div>
      </div>`;

    return {
      topic: 'complexos',
      data: { mode: 'roots', n, c, roots: roots.map(rt => rt.value) },
      title: 'Arrels n-èsimes i factorització',
      statementHTML: statement,
      solutionHTML: solution,
      plot: {
        points: roots.map((rt, k) => ({ z: rt.value, label: 'z' + k, color: k === 0 ? 'var(--c1)' : 'var(--c2)' })),
        unit: false
      }
    };
  }

  // ---------- mode 3: operations ----------
  function gauss(rng) {
    let a = 0, b = 0;
    while (a === 0 && b === 0) { a = rng.int(-3, 3); b = rng.int(-3, 3); }
    return new C(a, b);
  }
  function sqrtLabel(n) {
    const r = Math.round(Math.sqrt(n));
    return r * r === n ? String(r) : '√' + n;
  }
  function exactGauss(z, rLabel) {
    const im = z.im;
    const imLabel = im === 0 ? '0' : (im === 1 ? '1' : im === -1 ? '−1' : String(im).replace('-', '−'));
    return {
      z,
      exact: {
        reLabel: String(z.re).replace('-', '−'),
        imLabel,
        rLabel: rLabel || sqrtLabel(z.re * z.re + z.im * z.im),
        thetaLabel: angleText(z.arg())
      }
    };
  }
  function operationsExercise(rng) {
    let w, q, z;
    do {
      w = gauss(rng);
      q = gauss(rng);
      z = w.mul(q);
    } while (z.abs() > 20 || z.eq(w));
    const a = exactGauss(z), b = exactGauss(w);
    const sum = z.add(w);
    const prod = z.mul(w); // = w² q
    const quot = z.div(w); // = q
    const conj = z.conj();
    const argSum = global.Complex.normAngle(z.arg() + w.arg());
    const argQuot = global.Complex.normAngle(z.arg() - w.arg());
    const approxSum = a.exact.thetaLabel.includes('≈') || b.exact.thetaLabel.includes('≈');
    const sumPair = (u, v) => {
      const ul = String(u).replace('-', '−');
      if (v === 0) return ul;
      if (u === 0) return String(v).replace('-', '−');
      return ul + (v < 0 ? ' − ' : ' + ') + Math.abs(v);
    };
    const reSumText = sumPair(z.re, w.re);
    const imSumText = sumPair(z.im, w.im);
    const sumExpr = `(${reSumText}) + (${imSumText})i`;

    const statement = `
      <p>Donats <span class="math">z = ${zHTML(a)}</span> i <span class="math">w = ${zHTML(b)}</span>, calcula:</p>
      <ol class="parts">
        <li><span class="math">z + w</span> i <span class="math">z·w</span> en forma cartesiana.</li>
        <li><span class="math">z/w</span>.</li>
        <li><span class="math">|z|</span>, <span class="math">arg(z)</span> i el conjugat <span class="math">z̄</span>.</li>
      </ol>`;

    const solution = `
      <div class="solution-block">
        <h4>1. Suma i producte</h4>
        <p><span class="math">z + w = ${sumExpr} = ${complexTex(sum)}</span>.</p>
        <p><span class="math">z·w = ${complexTex(prod)}</span>.</p>
        <p>Comprovació polar: <span class="math">|zw| = |z||w| = ${a.exact.rLabel}·${b.exact.rLabel}</span> i
        <span class="math">arg(zw) = arg(z) + arg(w) = ${a.exact.thetaLabel} + (${b.exact.thetaLabel}) ≡ ${approxSum ? '≈ ' : ''}${global.Complex.anglePiLabelSigned(argSum)}</span>.</p>
        <h4>2. Quocient</h4>
        <p>Com que <span class="math">z = w·(${complexTex(q)})</span>, tenim directament:</p>
        <p><span class="math">z/w = ${complexTex(quot)}</span>.</p>
        <p>També es pot fer multiplicant pel conjugat: <span class="math">z/w = z·w̄ / |w|<sup>2</sup></span>.</p>
        <p>Comprovació: <span class="math">arg(z/w) = ${a.exact.thetaLabel} − (${b.exact.thetaLabel}) ≡ ${approxSum ? '≈ ' : ''}${global.Complex.anglePiLabelSigned(argQuot)}</span>.</p>
        <h4>3. Mòdul, argument i conjugat</h4>
        <p><span class="math">|z| = ${a.exact.rLabel}</span>, <span class="math">arg(z) = ${a.exact.thetaLabel}</span>, <span class="math">z̄ = ${complexTex(conj)}</span>.</p>
        <div class="note">El conjugat canvia el signe de la part imaginària; conserva el mòdul i canvia l'argument de signe (mòdul 2π).</div>
      </div>`;

    return {
      topic: 'complexos',
      data: { mode: 'ops', z, w, sum, prod, quot },
      title: 'Operacions amb complexos',
      statementHTML: statement,
      solutionHTML: solution,
      plot: {
        points: [
          { z, label: 'z', color: 'var(--c1)' },
          { z: w, label: 'w', color: 'var(--c2)' },
          { z: prod, label: 'zw', color: 'var(--c3)' }
        ],
        unit: false
      }
    };
  }

  function generate(mode, rng) {
    rng = rng || new global.Rand.RNG();
    if (mode === 'roots') return rootsExercise(rng);
    if (mode === 'operations') return operationsExercise(rng);
    return polarPower(rng);
  }

  global.ComplexGen = { generate, polarPower, rootsExercise, operationsExercise, makeZ, zHTML };
})(typeof window !== 'undefined' ? window : globalThis);
