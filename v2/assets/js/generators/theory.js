/* ============================================================
   Àlgebra · Parcial 1 — Generador de qüestions de teoria
   ============================================================ */
(function (global) {
  'use strict';
  const { C, PI, TAU } = global.Complex;
  const Fmt = global.Fmt;
  const Mat = global.Mat;
  const F = global.F;

  const m2 = (a, b, c, d) => [[a, b], [c, d]];
  const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const tr2 = (A) => A[0][0] + A[1][1];
  const mat2 = (A) => Fmt.matHTML(A);
  const eq2 = (A, B) => Mat.matEq(A, B);
  const mul2 = (A, B) => Mat.mul(A, B);
  const add2 = (A, B) => A.map((r, i) => r.map((x, j) => x + B[i][j]));
  const sub2 = (A, B) => A.map((r, i) => r.map((x, j) => x - B[i][j]));
  const scale2 = (A, k) => A.map(r => r.map(x => x * k));
  const id2 = () => [[1, 0], [0, 1]];
  const zeros2 = () => [[0, 0], [0, 0]];
  const rank2 = (A) => Mat.rank(A);

  function randMat(rng, mn, mx, nonZero) {
    let A;
    do {
      A = [[rng.int(mn, mx), rng.int(mn, mx)], [rng.int(mn, mx), rng.int(mn, mx)]];
    } while (nonZero && A.every(r => r.every(x => x === 0)));
    return A;
  }
  function randInvertible(rng, mn, mx) {
    let A;
    do { A = randMat(rng, mn, mx, true); } while (det2(A) === 0);
    return A;
  }
  function randSymmetric(rng, mn, mx) {
    const a = rng.int(mn, mx), b = rng.int(mn, mx), d = rng.int(mn, mx);
    return [[a, b], [b, d]];
  }
  function quadrant(z) {
    if (Math.abs(z.re) < 1e-9 || Math.abs(z.im) < 1e-9) return 0;
    if (z.re > 0 && z.im > 0) return 1;
    if (z.re < 0 && z.im > 0) return 2;
    if (z.re < 0 && z.im < 0) return 3;
    return 4;
  }
  const QNAME = ['', 'primer', 'segon', 'tercer', 'quart'];

  function polarZ(z) {
    const label = global.Complex.anglePiLabelSigned(z.arg());
    return /°$/.test(label) ? '≈ ' + label : label;
  }

  // ---------------- complex templates ----------------
  function quadrantSquare(rng) {
    const a = rng.int(1, 3), b = rng.int(1, 3);
    const z = new C(a, b);
    const z2 = z.pow(2);
    const q = quadrant(z2);
    const truth = q === 2;
    const where = q === 0
      ? 'Aquest nombre és sobre un eix (no pertany a cap quadrant).'
      : q === 2
        ? 'Aquest nombre és al <strong>segon quadrant</strong>.'
        : `Aquest nombre és al <strong>${QNAME[q]} quadrant</strong>, no al segon.`;
    return {
      id: 'quadrant-square',
      topic: 'Complexos',
      isTrue: truth,
      statementHTML: `Si <span class="math">z = ${Fmt.complexHTML(z)}</span> és un nombre complex del primer quadrant, aleshores <span class="math">z<sup>2</sup></span> pertany al segon quadrant.`,
      explanationHTML: `<span class="math">z<sup>2</sup> = (${a} + ${b}i)<sup>2</sup> = ${Fmt.numStr(z2.re)} ${z2.im >= 0 ? '+' : '−'} ${Fmt.numStr(Math.abs(z2.im))}i = ${Fmt.complexHTML(z2)}</span>.
        ${where}
        ${truth ? 'Per tant, és certa.' : 'Per tant, és falsa.'}`
    };
  }

  function argumentPower(rng) {
    const k = rng.int(1, 11);
    const theta = k * PI / 6;
    const n = rng.int(2, 8);
    const finalAngle = global.Complex.normAngle(n * theta);
    const realPos = Math.abs(finalAngle) < 1e-9;
    const realNeg = Math.abs(finalAngle - PI) < 1e-9;
    const claimType = rng.int(1, 3);
    let claim, truth;
    if (claimType === 1) { claim = 'real positiu'; truth = realPos; }
    else if (claimType === 2) { claim = 'real negatiu'; truth = realNeg; }
    else { claim = 'igual a 1'; truth = false; }
    const thLabel = global.Complex.anglePiLabelSigned(theta);
    const finalLabel = global.Complex.anglePiLabelSigned(finalAngle);
    let explanation;
    if (claimType === 3) {
      explanation = `Escrivim <span class="math">z = r e<sup>i(${thLabel})</sup></span> amb <span class="math">r = |z| &gt; 0</span>. Per De Moivre,
        <span class="math">z<sup>${n}</sup> = r<sup>${n}</sup> e<sup>i(${finalLabel})</sup></span>.
        Perquè aquest nombre sigui 1 cal que <span class="math">r<sup>${n}</sup> = 1</span>, és a dir <span class="math">r = 1</span>${realPos ? '' : `, i que l'angle <span class="math">${finalLabel}</span> sigui 0 (mòdul <span class="math">2π</span>), cosa que aquí no passa`}.
        Com que l'afirmació admet qualsevol <span class="math">r &gt; 0</span>, és <strong>falsa</strong>.`;
    } else {
      explanation = `Escrivim <span class="math">z = r e<sup>i(${thLabel})</sup></span>. Per De Moivre,
        <span class="math">z<sup>${n}</sup> = r<sup>${n}</sup> e<sup>i·${n}·(${thLabel})</sup> = r<sup>${n}</sup> e<sup>i(${finalLabel})</sup></span>.
        L'angle final és <span class="math">${finalLabel}</span> (mòdul <span class="math">2π</span>).
        ${truth ? "Per tant, l'afirmació és certa." : `Com que no és ${claim}, l'afirmació és falsa.`}`;
    }
    return {
      id: 'argument-power',
      topic: 'Complexos',
      isTrue: truth,
      statementHTML: `Si <span class="math">z</span> és un nombre complex no nul amb argument <span class="math">${thLabel}</span>, aleshores <span class="math">z<sup>${n}</sup></span> és un nombre ${claim}.`,
      explanationHTML: explanation
    };
  }

  function conjugateModulus(rng) {
    const a = rng.int(-3, 3), b = rng.nonZero(-3, 3);
    const z = new C(a, b);
    const askMod = rng.chance(0.5);
    return {
      id: 'conjugate-modulus',
      topic: 'Complexos',
      isTrue: askMod,
      statementHTML: `Per a <span class="math">z = ${Fmt.complexHTML(z)}</span>, el nombre complex <span class="math">z</span> i el seu conjugat <span class="math">z̄</span> tenen sempre ${askMod ? 'el mateix mòdul' : 'el mateix argument'}.`,
      explanationHTML: askMod
        ? `<span class="math">|z| = √((${Fmt.numStr(a)})<sup>2</sup> + (${Fmt.numStr(b)})<sup>2</sup>) = |z̄|</span>, perquè el signe de la part imaginària no afecta el mòdul. És certa.`
        : `<span class="math">z = ${Fmt.complexHTML(z)}</span> té argument <span class="math">${polarZ(z)}</span>, mentre que <span class="math">z̄ = ${Fmt.complexHTML(z.conj())}</span> té argument <span class="math">${polarZ(z.conj())}</span>. No són iguals (excepte si <span class="math">z</span> és real). És falsa.`
    };
  }

  function productConjugate(rng) {
    const a = rng.int(-3, 3), b = rng.nonZero(-3, 3);
    const z = new C(a, b);
    const prod = z.mul(z.conj());
    return {
      id: 'product-conjugate',
      topic: 'Complexos',
      isTrue: true,
      statementHTML: `El producte d'un nombre complex no nul <span class="math">z</span> pel seu conjugat <span class="math">z̄</span> sempre és un nombre real positiu.`,
      explanationHTML: `Si <span class="math">z = a + bi</span>, aleshores <span class="math">z·z̄ = (a + bi)(a − bi) = a<sup>2</sup> + b<sup>2</sup> = |z|<sup>2</sup> &gt; 0</span>.
        Per a <span class="math">z = ${Fmt.complexHTML(z)}</span>: <span class="math">z·z̄ = ${Fmt.complexHTML(prod)} = ${a * a + b * b}</span>. És certa.`
    };
  }

  function modulusProduct(rng) {
    const z = new C(rng.int(-3, 3), rng.nonZero(-2, 2));
    const w = new C(rng.int(-3, 3), rng.nonZero(-2, 2));
    return {
      id: 'modulus-product',
      topic: 'Complexos',
      isTrue: true,
      statementHTML: `Per a qualssevol nombres complexos <span class="math">z</span> i <span class="math">w</span>, es compleix <span class="math">|z·w| = |z|·|w|</span>.`,
      explanationHTML: `En forma polar, <span class="math">z = r<sub>1</sub>e<sup>iθ<sub>1</sub></sup></span> i <span class="math">w = r<sub>2</sub>e<sup>iθ<sub>2</sub></sup></span>.
        Llavors <span class="math">zw = r<sub>1</sub>r<sub>2</sub>e<sup>i(θ<sub>1</sub>+θ<sub>2</sub>)</sup></span>, i el mòdul és <span class="math">r<sub>1</sub>r<sub>2</sub> = |z||w|</span>. És certa.`
    };
  }

  function squareEquality(rng) {
    const z = new C(rng.int(-2, 2), rng.nonZero(-2, 2));
    const w = new C(-z.re, -z.im);
    return {
      id: 'square-equality',
      topic: 'Complexos',
      isTrue: false,
      statementHTML: `Si <span class="math">z<sup>2</sup> = w<sup>2</sup></span>, aleshores necessàriament <span class="math">z = w</span>.`,
      explanationHTML: `És falsa: també pot ser <span class="math">z = −w</span>. Per exemple,
        <span class="math">z = ${Fmt.complexHTML(z)}</span> i <span class="math">w = ${Fmt.complexHTML(w)}</span> tenen
        <span class="math">z<sup>2</sup> = w<sup>2</sup> = ${Fmt.complexHTML(z.pow(2))}</span>, però <span class="math">z ≠ w</span>.`
    };
  }

  function conjugateRoot(rng) {
    return {
      id: 'conjugate-root',
      topic: 'Polinomis',
      isTrue: true,
      statementHTML: `Si un polinomi <span class="math">p(x)</span> amb coeficients reals té una arrel complexa no real <span class="math">z</span>, aleshores el seu conjugat <span class="math">z̄</span> també és arrel de <span class="math">p(x)</span>.`,
      explanationHTML: `Si <span class="math">p(z) = 0</span> i els coeficients són reals, conjugant tota l'expressió s'obté
        <span class="math">p(z̄) = 0</span>. És certa. Aquesta és la clau per factoritzar a <span class="math">R[x]</span>.`
    };
  }

  function nthRootsCount(rng) {
    const n = rng.int(2, 6);
    return {
      id: 'nth-roots-count',
      topic: 'Complexos',
      isTrue: true,
      statementHTML: `Tot nombre complex no nul té exactament <span class="math">${n}</span> arrels <span class="math">${n}</span>-èsimes diferents.`,
      explanationHTML: `Si <span class="math">z = re<sup>iθ</sup></span>, les arrels són
        <span class="math">r<sup>1/${n}</sup>e<sup>i(θ+2πk)/${n}</sup></span> per a <span class="math">k = 0, 1, …, ${n - 1}</span>.
        Són ${n} arguments diferents mòdul <span class="math">2π</span>, per tant hi ha exactament ${n} arrels. És certa.`
    };
  }

  function argumentSum(rng) {
    return {
      id: 'argument-sum',
      topic: 'Complexos',
      isTrue: true,
      statementHTML: `Per a qualssevol nombres complexos no nuls <span class="math">z</span> i <span class="math">w</span>, es compleix <span class="math">arg(z·w) = arg(z) + arg(w)</span> mòdul <span class="math">2π</span>.`,
      explanationHTML: `En forma polar, multiplicar suma arguments i multiplica mòduls:
        <span class="math">(r<sub>1</sub>e<sup>iθ<sub>1</sub></sup>)(r<sub>2</sub>e<sup>iθ<sub>2</sub></sup>) = r<sub>1</sub>r<sub>2</sub>e<sup>i(θ<sub>1</sub>+θ<sub>2</sub>)</sup></span>.
        Cal entendre la igualtat mòdul <span class="math">2π</span> (l'argument no és únic). És certa.`
    };
  }

  // ---------------- polynomial templates ----------------
  function oddDegreeRoot(rng) {
    const n = rng.pick([3, 5, 7]);
    return {
      id: 'odd-degree-root',
      topic: 'Polinomis',
      isTrue: true,
      statementHTML: `Tot polinomi amb coeficients reals de grau senar (per exemple, grau <span class="math">${n}</span>) té almenys una arrel real.`,
      explanationHTML: `Les arrels no reals d'un polinomi real van per parelles de conjugades, de manera que el nombre d'arrels no reals és parell.
        Pel teorema fonamental de l'àlgebra, un polinomi de grau senar té un nombre senar d'arrels complexes (comptant multiplicitats).
        Com que les no reals són un nombre parell, n'ha de quedar almenys una de real. És certa.`
    };
  }

  function evenNoReal(rng) {
    const c = rng.int(1, 6);
    return {
      id: 'even-no-real',
      topic: 'Polinomis',
      isTrue: true,
      statementHTML: `Un polinomi amb coeficients reals de grau parell pot no tenir cap arrel real.`,
      explanationHTML: `Per exemple, <span class="math">p(x) = x<sup>2</sup> + ${c}</span> té discriminant <span class="math">−${4 * c} &lt; 0</span>,
        així que no té arrels reals. El seu grau és 2, que és parell. És certa.`
    };
  }

  function irreducibleDegree(rng) {
    return {
      id: 'irreducible-degree',
      topic: 'Polinomis',
      isTrue: true,
      statementHTML: `Els únics polinomis irreductibles a <span class="math">R[x]</span> són els de grau 1 i els de grau 2 amb discriminant negatiu.`,
      explanationHTML: `A <span class="math">C[x]</span> tot polinomi es descompon en factors lineals. Agrupant les arrels conjugades no reals,
        cada parell dona un factor quadràtic <span class="math">x<sup>2</sup> − 2ax + (a<sup>2</sup>+b<sup>2</sup>)</span> amb discriminant <span class="math">−4b<sup>2</sup> &lt; 0</span>.
        Els factors lineals restants són de grau 1. És certa.`
    };
  }

  function quarticRoots(rng) {
    return {
      id: 'quartic-roots',
      topic: 'Polinomis',
      isTrue: false,
      statementHTML: `Un polinomi amb coeficients reals de grau 4 pot tenir exactament 3 arrels reals i una arrel complexa no real.`,
      explanationHTML: `És falsa. Si té una arrel complexa no real <span class="math">z</span>, també ha de tenir la seva conjugada <span class="math">z̄</span>.
        Per tant, les arrels no reals van per parelles i no pot haver-hi exactament una arrel no real.`
    };
  }

  function vietaSum(rng) {
    const a = rng.nonZero(-3, 3), b = rng.int(-4, 4), c = rng.int(-4, 4), d = rng.int(-4, 4);
    const correct = -b / a;
    const claim = b / a;
    const truth = Math.abs(correct - claim) < 1e-9;
    return {
      id: 'vieta-sum',
      topic: 'Polinomis',
      isTrue: truth,
      statementHTML: `Per al polinomi <span class="math">p(x) = ${Fmt.polyHTML([a, b, c, d])}</span>, la suma de les tres arrels és <span class="math">${Fmt.fracHTML(global.F(b, a))}</span>.`,
      explanationHTML: `Per les fórmules de Vieta, <span class="math">r<sub>1</sub>+r<sub>2</sub>+r<sub>3</sub> = −b/a = ${Fmt.fracHTML(global.F(-b, a))}</span>.
        ${truth ? "L'afirmació coincideix, així que és certa." : `L'afirmació dona <span class="math">${Fmt.fracHTML(global.F(b, a))}</span>, que no coincideix: falta el signe negatiu. És falsa.`}`
    };
  }

  function vietaProduct(rng) {
    const a = rng.nonZero(-3, 3), b = rng.int(-4, 4), c = rng.int(-4, 4), d = rng.int(-4, 4);
    const correct = -d / a;
    const claim = d / a;
    const truth = Math.abs(correct - claim) < 1e-9;
    return {
      id: 'vieta-product',
      topic: 'Polinomis',
      isTrue: truth,
      statementHTML: `Per al polinomi <span class="math">p(x) = ${Fmt.polyHTML([a, b, c, d])}</span>, el producte de les tres arrels és <span class="math">${Fmt.fracHTML(global.F(d, a))}</span>.`,
      explanationHTML: `Per Vieta, <span class="math">r<sub>1</sub>r<sub>2</sub>r<sub>3</sub> = −d/a = ${Fmt.fracHTML(global.F(-d, a))}</span>.
        ${truth ? "L'afirmació coincideix, així que és certa." : "L'afirmació té el signe canviat. És falsa."}`
    };
  }

  function factorRoot(rng) {
    return {
      id: 'factor-root',
      topic: 'Polinomis',
      isTrue: true,
      statementHTML: `Si <span class="math">r</span> és una arrel del polinomi <span class="math">p(x)</span>, aleshores <span class="math">(x − r)</span> divideix <span class="math">p(x)</span>.`,
      explanationHTML: `És el teorema del factor: <span class="math">p(r) = 0 ⇔ (x − r) | p(x)</span>.
        Aquesta propietat és la base per factoritzar un cop trobada una arrel. És certa.`
    };
  }

  // ---------------- matrix templates ----------------
  function commute(rng) {
    const A = randMat(rng, -2, 2, true);
    let B, truth;
    if (rng.chance(0.4)) {
      // construct a commuting B
      B = rng.chance(0.5) ? mul2(A, A) : scale2(A, rng.int(2, 3));
      truth = true;
    } else {
      B = randMat(rng, -2, 2, true);
      truth = eq2(mul2(A, B), mul2(B, A));
    }
    const AB = mul2(A, B), BA = mul2(B, A);
    return {
      id: 'commute',
      topic: 'Matrius',
      isTrue: truth,
      statementHTML: `Si <span class="math">A = ${mat2(A)}</span> i <span class="math">B = ${mat2(B)}</span>, aleshores <span class="math">AB = BA</span>.`,
      explanationHTML: `<span class="math">AB = ${mat2(AB)}</span> i <span class="math">BA = ${mat2(BA)}</span>.
        ${truth ? 'Són iguals, així que és certa.' : 'No són iguals, així que és falsa. El producte de matrius no és commutatiu en general.'}`
    };
  }

  function symmetricProduct(rng) {
    const A = randSymmetric(rng, -2, 2);
    let B, commuteFlag;
    if (rng.chance(0.5)) {
      B = scale2(id2(), rng.int(1, 3));
      commuteFlag = true;
    } else {
      B = randSymmetric(rng, -2, 2);
      commuteFlag = eq2(mul2(A, B), mul2(B, A));
    }
    const AB = mul2(A, B);
    const symmetric = eq2(AB, Mat.transpose(AB));
    return {
      id: 'symmetric-product',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Siguin <span class="math">A</span> i <span class="math">B</span> matrius simètriques. Si <span class="math">AB = BA</span>, aleshores <span class="math">AB</span> és també simètrica.`,
      explanationHTML: `Si <span class="math">A<sup>t</sup> = A</span>, <span class="math">B<sup>t</sup> = B</span> i <span class="math">AB = BA</span>, llavors
        <span class="math">(AB)<sup>t</sup> = B<sup>t</sup>A<sup>t</sup> = BA = AB</span>, així que <span class="math">AB</span> és simètrica. És certa.
        ${commuteFlag ? `En aquest exemple, <span class="math">AB = ${mat2(AB)}</span>, que és simètrica.` : ''}`
    };
  }

  function detScalar(rng) {
    const A = randInvertible(rng, -2, 2);
    const k = rng.int(2, 4);
    const claim = k * det2(A);
    const actual = det2(scale2(A, k));
    return {
      id: 'det-scalar',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Per a <span class="math">A = ${mat2(A)}</span> i <span class="math">k = ${k}</span>, es compleix <span class="math">det(${k}A) = ${k}·det(A)</span>.`,
      explanationHTML: `En una matriu <span class="math">n×n</span>, multiplicar tota la matriu per <span class="math">k</span> multiplica cada una de les <span class="math">n</span> files per <span class="math">k</span>:
        <span class="math">det(kA) = k<sup>n</sup>det(A)</span>. Aquí <span class="math">n = 2</span>, així que
        <span class="math">det(${k}A) = ${k}<sup>2</sup>·det(A) = ${Fmt.numStr(actual)}</span>, mentre que <span class="math">${k}·det(A) = ${Fmt.numStr(claim)}</span>.
        No coincideixen: l'afirmació és falsa.`
    };
  }

  function detProduct(rng) {
    const A = randMat(rng, -2, 2, true), B = randMat(rng, -2, 2, true);
    const lhs = det2(mul2(A, B)), rhs = det2(A) * det2(B);
    return {
      id: 'det-product',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Per a qualssevol matrius quadrades <span class="math">A</span> i <span class="math">B</span> del mateix ordre, <span class="math">det(AB) = det(A)·det(B)</span>.`,
      explanationHTML: `És una propietat fonamental dels determinants. Amb <span class="math">A = ${mat2(A)}</span> i <span class="math">B = ${mat2(B)}</span>:
        <span class="math">det(A) = ${Fmt.numStr(det2(A))}</span>, <span class="math">det(B) = ${Fmt.numStr(det2(B))}</span>, i
        <span class="math">det(AB) = ${Fmt.numStr(lhs)} = ${Fmt.numStr(rhs)}</span>. És certa.`
    };
  }

  function inverseOrder(rng) {
    return {
      id: 'inverse-order',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Si <span class="math">A</span> i <span class="math">B</span> són matrius invertibles del mateix ordre, aleshores <span class="math">(AB)<sup>−1</sup> = A<sup>−1</sup>B<sup>−1</sup></span>.`,
      explanationHTML: `És falsa. La fórmula correcta és <span class="math">(AB)<sup>−1</sup> = B<sup>−1</sup>A<sup>−1</sup></span>.
        Comprovació: <span class="math">(AB)(B<sup>−1</sup>A<sup>−1</sup>) = A(BB<sup>−1</sup>)A<sup>−1</sup> = AA<sup>−1</sup> = I</span>.
        L'ordre dels factors s'inverteix.`
    };
  }

  function nilpotent(rng) {
    return {
      id: 'nilpotent',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Si <span class="math">A</span> és una matriu quadrada tal que <span class="math">A<sup>2</sup> = 0</span>, aleshores <span class="math">A = 0</span>.`,
      explanationHTML: `És falsa. Contraexemple: <span class="math">A = ${mat2([[0, 1], [0, 0]])}</span>.
        Llavors <span class="math">A<sup>2</sup> = ${mat2(mul2([[0, 1], [0, 0]], [[0, 1], [0, 0]]))}</span>, però <span class="math">A ≠ 0</span>.`
    };
  }

  function rrefIdentity(rng) {
    return {
      id: 'rref-identity',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Si <span class="math">A</span> és una matriu <span class="math">2×2</span> en forma de Gauss-Jordan i no té cap fila nul·la, aleshores <span class="math">A = I<sub>2</sub></span>.`,
      explanationHTML: `Una matriu <span class="math">2×2</span> en forma de Gauss-Jordan sense files nul·les ha de tenir dos pivots.
        Els pivots han d'estar en columnes diferents i, com que només hi ha dues columnes, han de ser les columnes 1 i 2.
        A més, cada pivot és l'únic element no nul de la seva columna, així que la matriu és la identitat. És certa.`
    };
  }

  function rrefCount(rng) {
    return {
      id: 'rref-count',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Hi ha exactament quatre matrius diferents <span class="math">2×2</span> en forma de Gauss-Jordan.`,
      explanationHTML: `És falsa. Sobre <span class="math">R</span> n'hi ha infinites. Per exemple,
        <span class="math">${mat2([[1, 'a'], [0, 0]])}</span> està en forma de Gauss-Jordan per a qualsevol <span class="math">a ∈ R</span>.
        (Sobre <span class="math">Z<sub>2</sub></span> n'hi ha 5, no 4.)`
    };
  }

  function rrefRank2(rng) {
    const A = [[1, rng.nonZero(-2, 2), 0], [0, 0, 1]];
    const AAt = mul2(A, Mat.transpose(A));
    return {
      id: 'rref-rank2',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Siguin <span class="math">A</span> una matriu de mida <span class="math">2×3</span> en forma de Gauss-Jordan i de rang 2. Aleshores <span class="math">AA<sup>t</sup> = I<sub>2</sub></span>.`,
      explanationHTML: `És falsa en general. Contraexemple: <span class="math">A = ${mat2(A)}</span> té rang 2 i forma de Gauss-Jordan, però
        <span class="math">AA<sup>t</sup> = ${mat2(AAt)} ≠ I<sub>2</sub></span>.`
    };
  }

  function zeroProduct(rng) {
    const B = randInvertible(rng, -3, 3);
    const A = zeros2();
    const AB = mul2(A, B);
    return {
      id: 'zero-product',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Siguin <span class="math">A</span> i <span class="math">B</span> matrius <span class="math">2×2</span>. Si <span class="math">det(B) ≠ 0</span> i <span class="math">AB = 0</span>, aleshores <span class="math">A = 0</span>.`,
      explanationHTML: `Com que <span class="math">det(B) ≠ 0</span>, <span class="math">B</span> és invertible. Multiplicant <span class="math">AB = 0</span> per <span class="math">B<sup>−1</sup></span> per la dreta:
        <span class="math">A = A(BB<sup>−1</sup>) = (AB)B<sup>−1</sup> = 0</span>. És certa.`
    };
  }

  function dependentRow(rng) {
    return {
      id: 'dependent-row',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Si una fila d'una matriu quadrada és combinació lineal de les altres files, aleshores el seu determinant és zero.`,
      explanationHTML: `Les files són linealment dependents. Un determinant és zero si i només si les seves files són linealment dependents.
        Per tant, <span class="math">det(A) = 0</span>. És certa. (El que seria fals és dir que el determinant és diferent de zero.)`
    };
  }

  function rankSum(rng) {
    const A = [[1, 0], [0, 0]];
    const B = [[0, 0], [1, 0]];
    const S = add2(A, B);
    return {
      id: 'rank-sum',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Per a qualssevol matrius <span class="math">A</span> i <span class="math">B</span> de la mateixa mida, <span class="math">rang(A+B) = rang(A) + rang(B)</span>.`,
      explanationHTML: `És falsa. Contraexemple: <span class="math">A = ${mat2(A)}</span>, <span class="math">B = ${mat2(B)}</span>.
        <span class="math">rang(A) = rang(B) = 1</span>, però <span class="math">A+B = ${mat2(S)}</span> té rang <span class="math">${rank2(S)}</span>.
        En general només es pot afirmar <span class="math">rang(A+B) ≤ rang(A) + rang(B)</span>.`
    };
  }

  function rankProduct(rng) {
    return {
      id: 'rank-product',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Per a qualssevol matrius <span class="math">A</span> i <span class="math">B</span> que es puguin multiplicar, <span class="math">rang(AB) ≤ min(rang(A), rang(B))</span>.`,
      explanationHTML: `La imatge de <span class="math">AB</span> està continguda en la imatge de <span class="math">A</span>, així que <span class="math">rang(AB) ≤ rang(A)</span>.
        També es pot veure que <span class="math">rang(AB) ≤ rang(B)</span>. Per tant, és certa.`
    };
  }

  function zeroDivisor(rng) {
    const A = [[1, 0], [0, 0]];
    const B = [[0, 0], [0, 1]];
    return {
      id: 'zero-divisor',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Si <span class="math">A</span> i <span class="math">B</span> són matrius <span class="math">2×2</span> i <span class="math">AB = 0</span>, aleshores <span class="math">A = 0</span> o <span class="math">B = 0</span>.`,
      explanationHTML: `És falsa. Contraexemple: <span class="math">A = ${mat2(A)}</span> i <span class="math">B = ${mat2(B)}</span>.
        Cap de les dues és zero, però <span class="math">AB = ${mat2(mul2(A, B))}</span>.`
    };
  }

  function squareBinomial(rng) {
    const A = randMat(rng, -2, 2, true), B = randMat(rng, -2, 2, true);
    const lhs = mul2(add2(A, B), add2(A, B));
    const rhs = add2(add2(mul2(A, A), scale2(mul2(A, B), 2)), mul2(B, B));
    const coincide = eq2(lhs, rhs);
    return {
      id: 'square-binomial',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Per a qualssevol matrius quadrades <span class="math">A</span> i <span class="math">B</span> del mateix ordre, <span class="math">(A+B)<sup>2</sup> = A<sup>2</sup> + 2AB + B<sup>2</sup></span>.`,
      explanationHTML: `És falsa en general, perquè <span class="math">(A+B)<sup>2</sup> = A<sup>2</sup> + AB + BA + B<sup>2</sup></span>.
        Només és igual a la fórmula donada si <span class="math">AB = BA</span>.
        ${!coincide ? `Amb <span class="math">A = ${mat2(A)}</span> i <span class="math">B = ${mat2(B)}</span> es veu que no coincideixen.` : "En aquest cas particular coincideixen perquè les matrius commuten, però l'afirmació general és falsa."}`
    };
  }

  function scalarCommutes(rng) {
    const k = rng.nonZero(-3, 3);
    const A = randMat(rng, -2, 2, true);
    return {
      id: 'scalar-commutes',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Per a qualsevol matriu quadrada <span class="math">A</span> i qualsevol escalar <span class="math">k</span>, la matriu <span class="math">kI</span> commuta amb <span class="math">A</span>.`,
      explanationHTML: `<span class="math">(kI)A = k(IA) = kA</span> i <span class="math">A(kI) = k(AI) = kA</span>. Per tant, <span class="math">(kI)A = A(kI)</span>. És certa.`
    };
  }

  function detTranspose(rng) {
    const A = randMat(rng, -3, 3, true);
    return {
      id: 'det-transpose',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Per a qualsevol matriu quadrada <span class="math">A</span>, <span class="math">det(A<sup>t</sup>) = det(A)</span>.`,
      explanationHTML: `El determinant es pot desenvolupar per files o per columnes; transposar intercanvia files i columnes sense canviar el valor.
        Amb <span class="math">A = ${mat2(A)}</span>: <span class="math">det(A) = det(A<sup>t</sup>) = ${Fmt.numStr(det2(A))}</span>. És certa.`
    };
  }

  function uniqueSolution(rng) {
    return {
      id: 'unique-solution',
      topic: 'Sistemes',
      isTrue: true,
      statementHTML: `Si un sistema d'equacions lineals <span class="math">AX = B</span> amb <span class="math">A ∈ M<sub>n</sub>(R)</span> té solució única, aleshores <span class="math">A</span> és invertible.`,
      explanationHTML: `Si <span class="math">A</span> no fos invertible, <span class="math">det(A) = 0</span> i el sistema o bé seria incompatible o bé tindria infinits graus de llibertat
        (el nucli de <span class="math">A</span> no seria trivial). Per tant, solució única implica <span class="math">det(A) ≠ 0</span> i <span class="math">A</span> invertible. És certa.`
    };
  }

  function scdNonSquare(rng) {
    const A = [[1, 0], [0, 1], [0, 0]];
    const B = [2, 3, 0];
    return {
      id: 'scd-non-square',
      topic: 'Sistemes',
      isTrue: false,
      statementHTML: `Si un sistema d'equacions lineals <span class="math">AX = B</span> és compatible determinat (SCD), aleshores la matriu <span class="math">A</span> ha de ser quadrada.`,
      explanationHTML: `És falsa. Contraexemple:
        <span class="math">${Fmt.systemHTML(A, B)}</span>.
        La matriu <span class="math">A</span> és de mida <span class="math">3×2</span> (no quadrada), però el sistema té la solució única
        <span class="math">(x,y) = (2,3)</span>. La condició d'SCD és <span class="math">rang(A) = rang(A|B) = n</span>, on <span class="math">n</span> és el nombre d'incògnites; no cal que <span class="math">A</span> sigui quadrada.`
    };
  }

  function detInverseScalar(rng) {
    const A = randInvertible(rng, -3, 3);
    const d = det2(A);
    const k = rng.int(2, 4);
    const claim = F(k * d);
    const actual = F(k * k, d);
    return {
      id: 'det-inverse-scalar',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Per a <span class="math">A = ${mat2(A)}</span> amb <span class="math">det(A) = ${Fmt.fracHTML(F(d))}</span> i <span class="math">k = ${k}</span>, es compleix
        <span class="math">det(${k}A<sup>−1</sup>) = ${Fmt.fracHTML(claim)}</span>.`,
      explanationHTML: `Com que <span class="math">det(A) = ${Fmt.fracHTML(F(d))} ≠ 0</span>, <span class="math">A</span> és invertible i
        <span class="math">det(A<sup>−1</sup>) = 1/det(A) = ${Fmt.fracHTML(F(1, d))}</span>.
        Per a una matriu <span class="math">2×2</span>, <span class="math">det(kA<sup>−1</sup>) = k<sup>2</sup>det(A<sup>−1</sup>) = ${Fmt.fracHTML(actual)}</span>,
        que no coincideix amb <span class="math">${Fmt.fracHTML(claim)}</span>. És falsa.`
    };
  }

  function rrefInfiniteQ(rng) {
    return {
      id: 'rref-infinite-q',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Hi ha infinites matrius <span class="math">2×2</span> en forma de Gauss-Jordan amb coeficients racionals.`,
      explanationHTML: `És certa. Per a cada <span class="math">a ∈ Q</span>, la matriu
        <span class="math">${mat2([[1, 'a'], [0, 0]])}</span> està en forma de Gauss-Jordan.
        Com que <span class="math">Q</span> és infinit, n'hi ha infinites.`
    };
  }

  function complexProductConditions(rng) {
    return {
      id: 'complex-product-conditions',
      topic: 'Complexos',
      isTrue: false,
      statementHTML: `Si <span class="math">z<sup>2</sup>w<sup>4</sup> = 1</span> i <span class="math">z<sup>8</sup> = 1</span>, aleshores necessàriament <span class="math">w<sup>8</sup> = 1</span>.`,
      explanationHTML: `És falsa. Contraexemple:
        <span class="math">z = e<sup>iπ/4</sup></span> i <span class="math">w = e<sup>−iπ/8</sup></span>.
        Llavors <span class="math">z<sup>2</sup> = e<sup>iπ/2</sup> = i</span>, <span class="math">w<sup>4</sup> = e<sup>−iπ/2</sup> = −i</span>, així que
        <span class="math">z<sup>2</sup>w<sup>4</sup> = i·(−i) = 1</span>; també <span class="math">z<sup>8</sup> = e<sup>i2π</sup> = 1</span>.
        Però <span class="math">w<sup>8</sup> = e<sup>−iπ</sup> = −1 ≠ 1</span>.`
    };
  }

  function noncommutingSquares(rng) {
    const A = [[0, 1], [0, 0]];
    const B = [[1, 0], [0, 0]];
    const AB = mul2(A, B);
    const BA = mul2(B, A);
    const lhs = mul2(mul2(A, A), mul2(B, B));
    const rhs = mul2(AB, AB);
    return {
      id: 'noncommuting-squares',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Si <span class="math">A</span> i <span class="math">B</span> són matrius <span class="math">2×2</span> amb <span class="math">AB ≠ BA</span>, aleshores <span class="math">A<sup>2</sup>B<sup>2</sup> ≠ (AB)<sup>2</sup></span>.`,
      explanationHTML: `És falsa. Contraexemple: <span class="math">A = ${mat2(A)}</span> i <span class="math">B = ${mat2(B)}</span>.
        Tenim <span class="math">AB = ${mat2(AB)}</span> i <span class="math">BA = ${mat2(BA)}</span>, així que <span class="math">AB ≠ BA</span>.
        Però <span class="math">A<sup>2</sup> = 0</span>, de manera que <span class="math">A<sup>2</sup>B<sup>2</sup> = 0</span>, i també
        <span class="math">(AB)<sup>2</sup> = 0</span>. Per tant, són iguals.`
    };
  }

  function matrixPower(rng) {
    const k = rng.int(2, 4);
    return {
      id: 'matrix-power',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Si <span class="math">A</span> és una matriu quadrada tal que <span class="math">A<sup>2</sup> = ${k}A</span>, aleshores
        <span class="math">A<sup>n</sup> = ${k}<sup>n−1</sup>A</span> per a tot natural <span class="math">n ≥ 1</span>.`,
      explanationHTML: `És certa per inducció. Per a <span class="math">n=1</span>: <span class="math">A = ${k}<sup>0</sup>A = A</span>.
        Si <span class="math">A<sup>n</sup> = ${k}<sup>n−1</sup>A</span>, aleshores
        <span class="math">A<sup>n+1</sup> = A<sup>n</sup>A = ${k}<sup>n−1</sup>A<sup>2</sup> = ${k}<sup>n−1</sup>·${k}A = ${k}<sup>n</sup>A</span>.`
    };
  }

  function dependentRowInvertible(rng) {
    const A = [[1, 2], [2, 4]];
    return {
      id: 'dependent-row-invertible',
      topic: 'Matrius',
      isTrue: false,
      statementHTML: `Si una fila d'una matriu quadrada és combinació lineal de les altres files, aleshores la matriu és invertible.`,
      explanationHTML: `És falsa. Contraexemple: <span class="math">A = ${mat2(A)}</span>. La segona fila és el doble de la primera,
        així que <span class="math">det(A) = ${det2(A)}</span> i <span class="math">A</span> no és invertible.
        Una fila dependent implica <span class="math">det(A)=0</span>, justament la condició contrària a la invertibilitat.`
    };
  }

  function rowSwapInvertible(rng) {
    const A = [[1, 2], [3, 4]];
    const B = [[3, 4], [1, 2]];
    return {
      id: 'row-swap-invertible',
      topic: 'Matrius',
      isTrue: true,
      statementHTML: `Si <span class="math">A</span> és una matriu quadrada invertible i s'intercanvien dues files seves, la matriu resultant també és invertible.`,
      explanationHTML: `És certa. Intercanviar dues files multiplica el determinant per <span class="math">−1</span>.
        Per exemple, <span class="math">A = ${mat2(A)}</span> té <span class="math">det(A) = ${Fmt.fracHTML(F(det2(A)))} ≠ 0</span>, i la matriu amb les files intercanviades,
        <span class="math">B = ${mat2(B)}</span>, té <span class="math">det(B) = ${Fmt.fracHTML(F(det2(B)))} ≠ 0</span>.`
    };
  }

  const TEMPLATES = [
    quadrantSquare, argumentPower, conjugateModulus, productConjugate, modulusProduct,
    squareEquality, conjugateRoot, nthRootsCount, argumentSum,
    oddDegreeRoot, evenNoReal, irreducibleDegree, quarticRoots, vietaSum, vietaProduct, factorRoot,
    commute, symmetricProduct, detScalar, detProduct, inverseOrder, nilpotent, rrefIdentity,
    rrefCount, rrefRank2, zeroProduct, dependentRow, rankSum, rankProduct, zeroDivisor,
    squareBinomial, scalarCommutes, detTranspose, uniqueSolution,
    scdNonSquare, detInverseScalar, rrefInfiniteQ, complexProductConditions,
    noncommutingSquares, matrixPower, dependentRowInvertible, rowSwapInvertible
  ];

  function generateSet(count, rng, filterTopic) {
    rng = rng || new global.Rand.RNG();
    let pool = TEMPLATES;
    if (filterTopic) {
      const map = { complexos: ['Complexos'], polinomis: ['Polinomis'], matrius: ['Matrius', 'Sistemes'] };
      const allowed = map[filterTopic] || [filterTopic];
      pool = TEMPLATES.filter(t => {
        const sample = t(new global.Rand.RNG(1));
        return allowed.includes(sample.topic);
      });
    }
    const chosen = rng.sample(pool, Math.min(count, pool.length));
    return chosen.map(t => t(rng));
  }

  global.TheoryGen = { generateSet, TEMPLATES };
})(typeof window !== 'undefined' ? window : globalThis);
