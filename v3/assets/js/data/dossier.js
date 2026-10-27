/* ============================================================
   Àlgebra · Parcial 1 — Dossier d'exercicis (*)
   Exercicis marcats amb (*) al full de problemes oficial
   "ExercicisAlgEngInf" — els que el professor corregeix a
   classe de problemes — filtrats als temes I i II (Nombres
   complexos, Matrius) perquè els temes III i IV (espais
   vectorials, diagonalització) són del segon parcial.
   Reutilitza el mateix motor (Practice + camps de resposta)
   que els exàmens reals.
   ============================================================ */
(function (global) {
  'use strict';
  const H = global.PastExams.helpers;
  const { fld, m, mc, mat2, gauss, gaussSolutionHTML, pSolutionHTML, systemHTMLText } = H;
  const Mat = global.Mat, F = global.F, Fmt = global.Fmt;
  const PI = Math.PI, SQ2 = Math.SQRT2, SQ3 = Math.sqrt(3);

  /* Variant de rowCombHTML que permet indicar quina matriu es combina (A o A′). */
  function rowCombHTMLFor(row, label) {
    const parts = [];
    row.forEach((c, j) => {
      const f = F(c);
      if (f.isZero()) return;
      const abs = f.abs();
      const coef = abs.isOne() ? '' : Fmt.fracHTML(abs);
      const term = coef + 'f<sub>' + (j + 1) + '</sub>(' + label + ')';
      if (!parts.length) parts.push((f.n < 0 ? '−' : '') + term);
      else parts.push((f.n < 0 ? ' − ' : ' + ') + term);
    });
    return parts.join('') || '0';
  }

  /* ============================================================
     I. NOMBRES COMPLEXOS
     ============================================================ */
  const COMPLEXOS = [];

  /* ---- Exercici 1: part real, imaginària, mòdul, conjugat, invers ---- */
  COMPLEXOS.push((() => {
    const items = [
      { expr: '(1+i)<sup>3</sup>', z: { re: -2, im: 2 } },
      { expr: '(1+i)<sup>6</sup>', z: { re: 0, im: -8 } },
      { expr: 'i<sup>17</sup>', z: { re: 0, im: 1 } },
      { expr: '(i−1)/(i+1)', z: { re: 0, im: 1 } },
      { expr: '(3+3i)<sup>4</sup>', z: { re: -324, im: 0 } },
      { expr: '(−i)<sup>−1</sup>', z: { re: 0, im: 1 } },
      { expr: '(i−4)/(2i−3)', z: { re: 14 / 13, im: 5 / 13 } }
    ];
    const parts = items.map(it => ({
      title: m('z = ' + it.expr),
      fields: [
        fld.num('|z| =', Math.hypot(it.z.re, it.z.im)),
        fld.ang('arg(z) =', Math.atan2(it.z.im, it.z.re)),
        fld.cx('z̄ =', it.z.re, -it.z.im),
        fld.cx('z<sup>−1</sup> =', it.z.re / (it.z.re ** 2 + it.z.im ** 2), -it.z.im / (it.z.re ** 2 + it.z.im ** 2))
      ]
    }));
    const letters = 'abcdefg';
    const sol = items.map((it, i) => `<h4>(${letters[i]}) z = ${m(it.expr)}</h4>
      <p class="answer">${m('z = ' + Fmt.complexHTML(it.z) + ', &nbsp; |z| = ' + Fmt.numStr(Math.hypot(it.z.re, it.z.im)) +
        ', &nbsp; z̄ = ' + Fmt.complexHTML({ re: it.z.re, im: -it.z.im }) +
        ', &nbsp; z<sup>−1</sup> = ' + Fmt.complexHTML({ re: it.z.re / (it.z.re ** 2 + it.z.im ** 2), im: -it.z.im / (it.z.re ** 2 + it.z.im ** 2) }))}</p>`).join('') +
      `<p class="hint">Fixeu-vos que (c), (d) i (f) donen tots ${m('z = i')}: és un bon senyal si us en surt el mateix.</p>`;
    return {
      num: 1, topic: 'complexos', title: 'Part real, imaginària, mòdul, conjugat i invers',
      examLink: 'Base de tot: mòdul i argument de memòria (Nivell S).',
      statementHTML: `<p>Calculeu la part real, la part imaginària, el mòdul, el conjugat i l'invers dels nombres complexos següents:</p>
        <p class="eqsys">${items.map(it => m(it.expr)).join(', &nbsp; ')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 2: forma polar i potències grans (reduir angle mod 2π) ---- */
  COMPLEXOS.push((() => {
    const items = [
      { expr: '−5i', mod: 5, arg: -PI / 2 },
      { expr: '1+√3i', mod: 2, arg: PI / 3 },
      { expr: '3+3i', mod: 3 * SQ2, arg: PI / 4 },
      { expr: '5√3+5i', mod: 10, arg: PI / 6 },
      { expr: '−π', mod: PI, arg: PI },
      { expr: '−7+7i', mod: 7 * SQ2, arg: 3 * PI / 4 },
      { expr: '(1−√3i)/2', mod: 1, arg: -PI / 3 },
      { expr: 'cos(π/5)−i sin(π/5)', mod: 1, arg: -PI / 5 }
    ];
    const letters = 'abcdefgh';
    const polarParts = items.map(it => ({
      title: m(it.expr), fields: [fld.num('mòdul =', it.mod), fld.ang('arg =', it.arg)]
    }));
    const powerParts = [
      { title: m('(3+3i)<sup>829</sup>'), self: true, selfNote: 'potència amb mòdul enorme' },
      { title: m('(5√3+5i)<sup>135</sup>'), self: true, selfNote: 'surt un resultat net' },
      { title: m('(−7+7i)<sup>1017</sup>'), self: true, selfNote: 'surt un resultat net' },
      { title: m('[(1−√3i)<sup>2</sup>]<sup>4002</sup>'), self: true, selfNote: 'surt un resultat net' }
    ];
    const powerLetters = 'ijkl';
    const sol = items.map((it, i) => `<h4>(${letters[i]})</h4>
      <p class="answer">${m(it.expr + ' = ' + Fmt.numStr(it.mod) + '·e<sup>i·' + Fmt.numStr(it.arg / PI) + 'π</sup>')}</p>`).join('') +
      `<h4>(${powerLetters[0]}) (3+3i)<sup>829</sup> — reduir l'angle mòdul 2π</h4>
      <p>${m('3+3i = 3√2·e<sup>iπ/4</sup>')}. Com que ${m('829 = 8·103+5')}, l'angle equival a ${m('5π/4')}.</p>
      <p class="answer">${m('(3+3i)<sup>829</sup> = (3√2)<sup>829</sup>·e<sup>i5π/4</sup>')} (no es pot escriure en decimal: el mòdul té centenars de xifres).</p>
      <h4>(${powerLetters[1]}) (5√3+5i)<sup>135</sup></h4>
      <p>${m('5√3+5i = 10·e<sup>iπ/6</sup>')}. Com que ${m('135·(π/6) = 22π + π/2')}, l'angle equival a ${m('π/2')}.</p>
      <p class="answer">${m('(5√3+5i)<sup>135</sup> = 10<sup>135</sup>·i')} — un resultat net: queda imaginari pur.</p>
      <h4>(${powerLetters[2]}) (−7+7i)<sup>1017</sup></h4>
      <p>${m('−7+7i = 7√2·e<sup>i3π/4</sup>')}. Com que ${m('1017·3 = 3051 = 8·381+3')}, l'angle torna a ser ${m('3π/4')} (el mateix de partida).</p>
      <p class="answer">${m('(−7+7i)<sup>1017</sup> = (7√2)<sup>1017</sup>·e<sup>i3π/4</sup> = 7<sup>1017</sup>·2<sup>508</sup>·(−1+i)')}.</p>
      <h4>(${powerLetters[3]}) [(1−√3i)²]<sup>4002</sup></h4>
      <p>${m('1−√3i = 2·e<sup>−iπ/3</sup>')} ⇒ ${m('[(1−√3i)<sup>2</sup>]<sup>4002</sup> = (1−√3i)<sup>8004</sup>')}. Com que ${m('8004·(π/3) = 2668π')} és un múltiple parell de ${m('2π')}, l'angle equival a 0.</p>
      <p class="answer">${m('[(1−√3i)<sup>2</sup>]<sup>4002</sup> = 2<sup>8004</sup>')} — real positiu.</p>`;
    return {
      num: 2, topic: 'complexos', title: 'Forma polar i reducció d\'angle mòdul 2π',
      examLink: 'Exactament la tècnica darrere de z¹² i similars a 2017–2021 (Nivell S: "els 16 angles de memòria").',
      statementHTML: `<p>Expresseu en forma polar els nombres complexos següents:</p>
        <p class="eqsys">${items.map(it => m(it.expr)).join(', &nbsp; ')}</p>
        <p>Calculeu ${m('(3+3i)<sup>829</sup>')}, ${m('(5√3+5i)<sup>135</sup>')}, ${m('(−7+7i)<sup>1017</sup>')} i ${m('[(1−√3i)<sup>2</sup>]<sup>4002</sup>')}.</p>`,
      practice: { kind: 'custom', parts: polarParts.concat(powerParts) },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 3: forma exponencial e^{a+bi} ---- */
  COMPLEXOS.push((() => {
    const E = Math.E;
    const items = [
      { expr: 'e<sup>iπ</sup>', mod: 1, arg: PI },
      { expr: '2e<sup>−2πi/3</sup>', mod: 2, arg: -2 * PI / 3 },
      { expr: 'e<sup>cos 2</sup>', mod: Math.exp(Math.cos(2)), arg: 0 },
      { expr: 'e<sup>cos(2)·i</sup>', mod: 1, arg: Math.cos(2) },
      { expr: '12e<sup>πi/6</sup>', mod: 12, arg: PI / 6 },
      { expr: 'e<sup>2πi/3</sup>+e<sup>4πi/3</sup>', mod: 1, arg: PI },
      { expr: 'e<sup>−1+iπ/4</sup>', mod: 1 / E, arg: PI / 4 },
      { expr: 'e<sup>5+iπ/2</sup>', mod: Math.pow(E, 5), arg: PI / 2 }
    ];
    const letters = 'abcdefgh';
    const sol = items.map((it, i) => `<h4>(${letters[i]})</h4>
      <p class="answer">${m('|z| = ' + (Number.isInteger(it.mod) ? it.mod : it.mod.toFixed(4)) + ', &nbsp; arg(z) = ' + (it.arg / PI).toFixed(4) + 'π')}</p>`).join('');
    return {
      num: 3, topic: 'complexos', title: 'Forma exponencial e^{a+bi}: separar part real i imaginària de l\'exponent',
      examLink: 'Reforça De Moivre i la forma polar (Nivell S).',
      statementHTML: `<p>Calculeu el mòdul i l'argument dels nombres complexos següents, separant ${m('e<sup>a+bi</sup> = e<sup>a</sup>·e<sup>bi</sup>')}:</p>
        <p class="eqsys">${items.map(it => m(it.expr)).join(', &nbsp; ')}</p>
        <p class="hint">Un cop tingueu mòdul i argument, el conjugat i l'invers surten directament (comproveu-ho en paper).</p>`,
      practice: { kind: 'custom', parts: items.map(it => ({ title: m(it.expr), fields: [fld.num('|z| =', it.mod), fld.ang('arg(z) =', it.arg)] })) },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 8: arrels cúbiques en forma polar ---- */
  COMPLEXOS.push((() => {
    function cubeRoots(mod, arg) {
      const r = Math.cbrt(mod);
      return [0, 1, 2].map(k => ({ re: r * Math.cos((arg + 2 * PI * k) / 3), im: r * Math.sin((arg + 2 * PI * k) / 3) }));
    }
    const items = [
      { expr: '−1', mod: 1, arg: PI },
      { expr: 'i', mod: 1, arg: PI / 2 },
      { expr: 'e', mod: Math.E, arg: 0 },
      { expr: '8', mod: 8, arg: 0 },
      { expr: '1+i', mod: SQ2, arg: PI / 4 }
    ];
    const letters = 'abcde';
    const parts = items.map(it => ({ title: m('w<sup>3</sup> = ' + it.expr), fields: [fld.roots('Les 3 arrels:', cubeRoots(it.mod, it.arg).map(z => [z.re, z.im]))] }));
    const sol = items.map((it, i) => {
      const roots = cubeRoots(it.mod, it.arg);
      const r = Math.cbrt(it.mod);
      return `<h4>(${letters[i]}) w<sup>3</sup> = ${m(it.expr)}</h4>
        <p>${m(it.expr + ' = ' + Fmt.numStr(it.mod) + '·e<sup>i' + Fmt.numStr(it.arg / PI) + 'π</sup>')} ⇒ ${m('w<sub>k</sub> = ' + Fmt.numStr(r) + '·e<sup>i(' + Fmt.numStr(it.arg / PI) + 'π+2kπ)/3</sup>')}, ${m('k = 0, 1, 2')}.</p>
        <p class="answer">${roots.map(z => m(Fmt.complexHTML(z))).join(', &nbsp;')}</p>`;
    }).join('');
    return {
      num: 8, topic: 'complexos', title: 'Arrels cúbiques en forma polar',
      examLink: 'El format d\'exàmens 2017–2021: wⁿ = c (Nivell B).',
      statementHTML: `<p>Calculeu les arrels cúbiques, en forma polar, dels nombres complexos:</p>
        <p class="eqsys">${items.map(it => m(it.expr)).join(', &nbsp; ')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 9 (subconjunt representatiu): arrels de polinomis quadràtics ---- */
  COMPLEXOS.push((() => {
    const parts = [
      { title: m('x²+3x+4'), fields: [fld.roots('Les 2 arrels:', [[-1.5, Math.sqrt(7) / 2], [-1.5, -Math.sqrt(7) / 2]])] },
      { title: m('x⁴+4x²+3'), fields: [fld.roots('Les 4 arrels:', [[0, 1], [0, -1], [0, SQ3], [0, -SQ3]])] },
      { title: m('x⁴−(1−i)x²−i'), fields: [fld.roots('Les 4 arrels:', [[1, 0], [-1, 0], [SQ2 / 2, -SQ2 / 2], [-SQ2 / 2, SQ2 / 2]])] }
    ];
    const sol = `<h4>(a) x²+3x+4</h4>
      <p>${m('Δ = 9−16 = −7')} ⇒ ${m('x = (−3±i√7)/2')}.</p>
      <h4>(b) x⁴+4x²+3</h4>
      <p>Amb ${m('y = x²')}: ${m('y²+4y+3 = (y+1)(y+3) = 0')} ⇒ ${m('y = −1')} o ${m('y = −3')}.</p>
      <p class="answer">${m('x = ±i, ±i√3')}</p>
      <h4>(c) x⁴−(1−i)x²−i</h4>
      <p>Amb ${m('y = x²')}: ${m('y²−(1−i)y−i = 0')}, discriminant ${m('(1−i)²+4i = 2i')}, i ${m('√(2i) = ±(1+i)')}.</p>
      <p>${m('y = [(1−i)±(1+i)]/2')} ⇒ ${m('y = 1')} o ${m('y = −i')}.</p>
      <p class="answer">${m('x = ±1')} i ${m('x = ±(√2/2)(1−i)')}</p>
      <p class="hint">La resta de polinomis de l'exercici (${m('x²+4i')}, ${m('x²+2ix+i−1')}, ${m('x²+2ix±√3i')}, ${m('x⁴+x²+1')}) es resolen amb el mateix mètode: discriminant real o arrel quadrada d'un complex.</p>`;
    return {
      num: 9, topic: 'complexos', title: 'Arrels de polinomis quadràtics (i biquadrats) amb coeficients complexos',
      examLink: 'Tècnica de base per a l\'exercici 1 de qualsevol parcial (Nivell S: comprovar/trobar arrels).',
      statementHTML: `<p>Trobeu les arrels dels polinomis quadràtics següents (subconjunt representatiu de l'exercici complet):</p>
        <p class="eqsys">${m('x²+3x+4')}, &nbsp; ${m('x⁴+4x²+3')}, &nbsp; ${m('x⁴−(1−i)x²−i')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 10: factorització a C[x] i R[x] ---- */
  COMPLEXOS.push((() => {
    const parts = [
      { title: m('x⁴+16'), fields: [Object.assign(fld.poly('C', [1, 0, 0, 0, 16]), { label: m('A C[x]: p(x) =') }), Object.assign(fld.poly('R', [1, 0, 0, 0, 16]), { label: m('A R[x]: p(x) =') })] },
      { title: m('x³+27'), fields: [Object.assign(fld.poly('C', [1, 0, 0, 27]), { label: m('A C[x]: p(x) =') }), Object.assign(fld.poly('R', [1, 0, 0, 27]), { label: m('A R[x]: p(x) =') })] },
      { title: m('x⁴−1'), fields: [Object.assign(fld.poly('C', [1, 0, 0, 0, -1]), { label: m('A C[x]: p(x) =') }), Object.assign(fld.poly('R', [1, 0, 0, 0, -1]), { label: m('A R[x]: p(x) =') })] },
      { title: m('x⁶+3x³−4'), fields: [Object.assign(fld.poly('R', [1, 0, 0, 3, 0, 0, -4]), { label: m('A R[x]: p(x) =') })] }
    ];
    const sol = `<h4>(a) x⁴+16</h4>
      <p class="answer">${m('C[x]: (x−√2−√2i)(x−√2+√2i)(x+√2−√2i)(x+√2+√2i)')}</p>
      <p class="answer">${m('R[x]: (x²−2√2x+4)(x²+2√2x+4)')}</p>
      <h4>(b) x³+27</h4>
      <p>Arrel real ${m('x = −3')}; ${m('x²−3x+9')} té ${m('Δ = 9−36 < 0')}.</p>
      <p class="answer">${m('R[x]: (x+3)(x²−3x+9)')}, &nbsp; ${m('C[x]: (x+3)(x−(3+3√3i)/2)(x−(3−3√3i)/2)')}</p>
      <h4>(c) x⁴−1</h4>
      <p class="answer">${m('C[x]: (x−1)(x+1)(x−i)(x+i)')}, &nbsp; ${m('R[x]: (x−1)(x+1)(x²+1)')}</p>
      <h4>(d) x⁶+3x³−4</h4>
      <p>Amb ${m('y = x³')}: ${m('y²+3y−4 = (y−1)(y+4)')}. Useu ${m('a³−b³ = (a−b)(a²+ab+b²)')} i ${m('a³+b³ = (a+b)(a²−ab+b²)')} amb ${m('b = ∛4')} (l'arrel cúbica real de 4):</p>
      <p class="answer">${m('R[x]: (x−1)(x²+x+1)(x+∛4)(x²−∛4·x+∛4²)')}</p>`;
    return {
      num: 10, topic: 'complexos', title: 'Factorització a C[x] i a R[x]',
      examLink: 'EXACTAMENT el patró universal "factoritzar a C[x] i R[x]" — surt als 8/8 exàmens reals (Nivell S).',
      statementHTML: `<p>Factoritzeu, a ${m('C[x]')} i a ${m('R[x]')}, els polinomis:</p>
        <p class="eqsys">${m('x⁴+16')}, &nbsp; ${m('x³+27')}, &nbsp; ${m('x⁴−1')}, &nbsp; ${m('x⁶+3x³−4')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ============================================================
     II. MATRIUS
     ============================================================ */
  const MATRIUS = [];

  /* ---- Exercici 15: Gauss-Jordan, P i les files en les dues direccions ---- */
  MATRIUS.push((() => {
    const A = [[0, 1, 1, 0, -1, 0], [0, 3, 3, -2, -3, 2], [0, -1, -1, 1, 1, -1]];
    const g = gauss(A);
    const Pinv = Mat.inverse(g.P);
    const rowsA = ['f<sub>1</sub>(A′) =', 'f<sub>2</sub>(A′) =', 'f<sub>3</sub>(A′) ='];
    const rowsB = ['f<sub>1</sub>(A) =', 'f<sub>2</sub>(A) =', 'f<sub>3</sub>(A) ='];
    const parts = [
      {
        title: m('A′, P i rang'),
        fields: [
          { type: 'matrix', rows: 3, cols: 6, answer: g.J, label: m('A′ =') },
          { type: 'num', label: m('rang(A) ='), answer: g.rank },
          { type: 'matrix', key: 'P', rows: 3, cols: 3, A, J: g.J, label: m('P =') }
        ]
      },
      {
        title: 'Files de A′ com a combinació de files d\'A',
        fields: g.J.map((row, i) => ({ type: 'rowcomb', A, target: row, matLabel: 'A', label: m(rowsA[i]) }))
      },
      {
        title: 'Files de A com a combinació de files de A′',
        fields: g.J.map((_, i) => ({ type: 'rowcomb', A: g.J, target: A[i], matLabel: 'A′', label: m(rowsB[i]) }))
      }
    ];
    const sol = gaussSolutionHTML(g, '(a)').replace(/J = /, 'A′ = ') + pSolutionHTML(g, '(a)', false).replace('PA = J', 'PA = A′') +
      `<h4>(b) Files de A′ a partir de A</h4>
      <p>Com que ${m('PA = A′')}, cada fila de ${m('A′')} és la combinació de files d'${m('A')} amb els coeficients de la fila corresponent de ${m('P')}:</p>
      ${g.J.map((row, i) => `<p class="answer">${m(rowsA[i] + ' ' + rowCombHTMLFor(g.P[i], 'A'))}</p>`).join('')}
      <h4>(c) Files de A a partir de A′ (direcció inversa)</h4>
      <p>Com que ${m('A′ = PA')} i ${m('P')} és invertible, ${m('A = P<sup>−1</sup>A′')}. Calculem ${m('P<sup>−1</sup> = ' + Fmt.matHTML(Pinv))}:</p>
      ${A.map((row, i) => `<p class="answer">${m(rowsB[i] + ' ' + rowCombHTMLFor(Pinv[i], 'A′'))}</p>`).join('')}`;
    return {
      num: 15, topic: 'matrius', title: 'Gauss-Jordan, P i expressar files en les dues direccions',
      examLink: 'La mateixa estructura (a)+(b) de 2023 i 2024 (Nivell A: "fila de J com a combinació de files d\'A"), ampliada amb la direcció inversa.',
      statementHTML: `<p>Considereu la matriu</p>
        ${mc('A = ' + Fmt.matHTML(A) + ' ∈ M<sub>3×6</sub>(Q).')}
        <ol class="parts">
          <li>Calculeu la forma normal de Gauss-Jordan ${m('A′')} de ${m('A')}, i també una matriu invertible ${m('P')} tal que ${m('A′ = PA')}.</li>
          <li>Expresseu les files de la matriu ${m('A′')} com a combinació lineal de les files d'${m('A')}.</li>
          <li>Expresseu les files de la matriu ${m('A')} com a combinació lineal de les files d'${m('A′')}.</li>
        </ol>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 18: demostracions sobre invertibilitat (sense càlcul numèric) ---- */
  MATRIUS.push({
    num: 18, topic: 'matrius', title: 'Demostracions sobre invertibilitat',
    examLink: 'Contraexemples i arguments clàssics de les 4 qüestions de teoria (Nivell S/A).',
    practice: null,
    statementHTML: `<p>Proveu (amb raonaments) les afirmacions següents:</p>
      <ol class="parts">
        <li>Una matriu ${m('A ∈ M<sub>n</sub>(K)')} amb una fila idènticament nul·la no pot ser invertible.</li>
        <li>Una matriu ${m('A ∈ M<sub>3</sub>(Q)')} que satisfà ${m('(1, 7, −3)·A = (0, 0, 0)')} no pot ser invertible.</li>
        <li>Una matriu ${m('A ∈ M<sub>n</sub>(K)')} amb dues columnes idèntiques no pot ser invertible.</li>
        <li>Si ${m('A ∈ M<sub>n</sub>(K)')} és invertible, llavors ${m('A<sup>t</sup>')} és invertible i ${m('(A<sup>t</sup>)<sup>−1</sup> = (A<sup>−1</sup>)<sup>t</sup>')}.</li>
        <li>Si ${m('A ∈ M<sub>n</sub>(K)')} és invertible, llavors per a tot ${m('n ≥ 1')} la matriu ${m('A<sup>n</sup>')} és invertible i ${m('(A<sup>n</sup>)<sup>−1</sup> = (A<sup>−1</sup>)<sup>n</sup>')}.</li>
      </ol>`,
    solutionHTML: `<h4>(a)</h4>
      <p>Si ${m('B')} fos la inversa, la fila nul·la d'${m('A')} fa que aquella fila d'${m('AB')} sigui també nul·la, així que ${m('AB')} no pot ser ${m('I')}.</p>
      <h4>(b)</h4>
      <p>Si ${m('A')} fos invertible, multiplicant ${m('(1,7,−3)A=(0,0,0)')} per ${m('A<sup>−1</sup>')} a la dreta: ${m('(1,7,−3) = (0,0,0)')}, contradicció. Equival a dir que ${m('f<sub>1</sub>(A)+7f<sub>2</sub>(A)−3f<sub>3</sub>(A)=0')}: les files són dependents.</p>
      <h4>(c)</h4>
      <p>Dues columnes idèntiques són linealment dependents, així que ${m('rang(A) < n')} i ${m('det(A) = 0')}.</p>
      <h4>(d)</h4>
      <p>${m('A<sup>t</sup>(A<sup>−1</sup>)<sup>t</sup> = (A<sup>−1</sup>A)<sup>t</sup> = I<sup>t</sup> = I')} i igual per l'altre costat: ${m('(A<sup>−1</sup>)<sup>t</sup>')} és la inversa d'${m('A<sup>t</sup>')}.</p>
      <h4>(e)</h4>
      <p>Per inducció: si ${m('(A<sup>n</sup>)<sup>−1</sup> = (A<sup>−1</sup>)<sup>n</sup>')}, llavors ${m('A<sup>n+1</sup>(A<sup>−1</sup>)<sup>n+1</sup> = A<sup>n</sup>(AA<sup>−1</sup>)(A<sup>−1</sup>)<sup>n</sup> = A<sup>n</sup>(A<sup>−1</sup>)<sup>n</sup> = I')}.</p>`
  });

  /* ---- Exercici 19: matrius que commuten amb A = diag(1,0) ---- */
  MATRIUS.push((() => {
    const parts = [
      {
        title: 'Forma general de les B que commuten amb A',
        fields: [{
          type: 'choice', label: `Quina forma tenen totes les ${m('B')} tals que ${m('AB=BA')}?`,
          options: [{ v: 'diag', label: 'Diagonal' }, { v: 'sim', label: 'Simètrica' }, { v: 'qualsevol', label: 'Qualsevol' }, { v: 'tri', label: 'Triangular' }],
          answer: 'diag'
        }]
      },
      {
        title: `Amb B = ${mat2(0, 1, 1, 0)} (no commuta amb A)`,
        fields: [
          { type: 'choice', label: m('(AB)² = A²B²') + '?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'no' },
          { type: 'choice', label: m('(A+B)² = A²+2AB+B²') + '?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'no' },
          { type: 'choice', label: m('(A+B)(A−B) = A²−B²') + '?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'no' }
        ]
      }
    ];
    const sol = `<h4>(a)</h4>
      <p>Amb ${m('B = ' + mat2('p', 'q', 'r', 's'))}: ${m('AB = ' + mat2('p', 'q', 0, 0))}, ${m('BA = ' + mat2('p', 0, 'r', 0))}. Iguals ⇔ ${m('q = r = 0')}.</p>
      <p class="answer">${m('B')} ha de ser diagonal: ${m('B = ' + mat2('p', 0, 0, 's'))}.</p>
      <h4>(b)</h4>
      <p>Amb ${m('B = ' + mat2(0, 1, 1, 0))}: ${m('AB = ' + mat2(0, 1, 0, 0))} ≠ ${m('BA = ' + mat2(0, 0, 1, 0))}.</p>
      <p>${m('(AB)² = 0')} però ${m('A²B² = A·B² = A·I = A ≠ 0')}: <strong>fals</strong>.</p>
      <p>${m('(A+B)² = ' + mat2(2, 1, 1, 1))} però ${m('A²+2AB+B² = ' + mat2(2, 2, 0, 1))}: <strong>fals</strong>.</p>
      <p>${m('(A+B)(A−B) = ' + mat2(0, -1, 1, -1))} però ${m('A²−B² = ' + mat2(0, 0, 0, -1))}: <strong>fals</strong>.</p>
      <p>Les tres identitats només es compleixen quan ${m('AB = BA')}; per això cal <strong>no</strong> assumir-ho mai sense comprovar-ho.</p>`;
    return {
      num: 19, topic: 'matrius', title: 'Matrius que commuten amb A — per què (AB)² ≠ A²B² en general',
      examLink: 'El contraexemple de no-commutativitat de 2022, 2023 i 2025 és d\'aquesta mateixa família (Nivell A).',
      statementHTML: `<p>Sigui ${m('A = ' + mat2(1, 0, 0, 0) + ' ∈ M<sub>2</sub>(K)')}. Trobeu totes les matrius ${m('B ∈ M<sub>2</sub>(K)')} que commuten amb ${m('A')}, és a dir, que satisfan ${m('AB = BA')}.</p>
        <p>Comproveu amb exemples que si ${m('B ∈ M<sub>2</sub>(K)')} <em>no</em> commuta amb ${m('A')} llavors les identitats següents poden ser falses:</p>
        <p class="eqsys">${m('(AB)² = A²B²')}, &nbsp; ${m('(A+B)² = A²+2AB+B²')}, &nbsp; ${m('(A+B)(A−B) = A²−B²')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 21: dos sistemes — un incompatible, un amb 2 graus de llibertat ---- */
  MATRIUS.push((() => {
    const M1 = [[1, 1, -1, -2], [3, -1, 1, 4], [0, 2, -2, -5]];
    const M2 = [[1, -1, 1, -1, 0], [-1, 1, -1, 0, 2], [1, -1, 1, 1, 0]], c2 = [0, 1, 2];
    const vars2 = ['x', 'y', 'z', 't', 'u'];
    const parts = [
      {
        title: 'Sistema 1 (x, y, z, t)',
        fields: [{ type: 'choice', label: 'Aquest sistema és...', options: [{ v: 'c', label: 'Compatible' }, { v: 'i', label: 'Incompatible' }], answer: 'i' }]
      },
      {
        title: 'Sistema 2 (x, y, z, t, u)',
        fields: [
          { type: 'num', label: 'Graus de llibertat:', answer: 2 },
          { type: 'vector', n: 5, M: M2, c: c2, label: `Una solució qualsevol ${m('(' + vars2.join(', ') + ') =')}` }
        ]
      }
    ];
    const g1 = gauss(M1);
    const sol = `<h4>(a) Sistema 1</h4>
      <p class="answer">${m('J = ' + Fmt.matHTML(g1.J, { pivotCols: g1.pivots }))}</p>
      <p>La fila 3 de ${m('J')} és nul·la, però el terme independent corresponent (combinant amb ${m('P')}) no ho és: <strong>incompatible</strong>.</p>
      <h4>(b) Sistema 2</h4>
      <p>Resolent per Gauss-Jordan s'obté rang 3 sobre 5 incògnites ⇒ 2 graus de llibertat.</p>
      <p class="answer">${m('(x,y,z,t,u) = (1+λ−μ, λ, μ, 1, 1)')}, &nbsp; ${m('λ, μ ∈ R')}.</p>
      <p>(${m('λ = y')}, ${m('μ = z')} fets lliures; comproveu-ho substituint a les 3 equacions.)</p>`;
    return {
      num: 21, topic: 'matrius', title: 'Dos sistemes: un és incompatible, l\'altre té 2 graus de llibertat',
      examLink: 'Resoldre per Gauss-Jordan i reconèixer incompatibilitat (Nivell S).',
      statementHTML: `<p>Resoleu els sistemes d'equacions lineals següents. Doneu una descripció paramètrica de la varietat lineal que formen les solucions (o un mínim de vectors directors).</p>
        <p><strong>Sistema 1:</strong></p>${systemHTMLText(['x + y − z − 2t = 0', '3x − y + z + 4t = 1', '2y − 2z − 5t = 0'])}
        <p><strong>Sistema 2:</strong></p>${systemHTMLText(['x − y + z − t = 0', '−x + y − z + 2u = 1', 'x − y + z + t = 2'])}`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 24: sistema amb paràmetre s, graus de llibertat ---- */
  MATRIUS.push((() => {
    const M = s => [[1, s, 2, 1], [s, 1, -2, -1], [2, -1, 6, 3]];
    const c = s => [1, s, -2 * s];
    const parts = [
      {
        title: 'Discussió general',
        fields: [
          { type: 'num', label: m('Valor de s') + ' pel qual el sistema és incompatible:', answer: 0 },
          { type: 'choice', label: m('Per a s ∉ {0, −1}') + ', el sistema és...', options: [{ v: 'scd', label: 'Compatible determinat' }, { v: 'sci', label: 'Compatible indeterminat' }], answer: 'sci' },
          { type: 'num', label: 'Graus de llibertat en aquest cas general:', answer: 1 }
        ]
      },
      {
        title: 'Cas s = −1',
        fields: [
          { type: 'num', label: 'Graus de llibertat:', answer: 2 },
          { type: 'vector', n: 4, M: M(-1), c: c(-1), label: m('(x, y, z, t) =') }
        ]
      }
    ];
    const sol = `<h4>(a) Discussió general</h4>
      <p>El determinant d'un menor 3×3 és ${m('−6s(s+1)')}: els valors especials són ${m('s = 0')} i ${m('s = −1')}.</p>
      <ul>
        <li>${m('s = 0')}: <strong>incompatible</strong>.</li>
        <li>${m('s = −1')}: rang 2, compatible, <strong>2 graus de llibertat</strong>.</li>
        <li>Qualsevol altre ${m('s')}: rang 3, compatible, <strong>1 grau de llibertat</strong> (${m('4−3=1')}).</li>
      </ul>
      <h4>(b) Descripció paramètrica per a s = −1</h4>
      <p class="answer">${m('(x,y,z,t) = (1,0,0,0) + z·(−4,−2,1,0) + t·(−2,−1,0,1)')}</p>`;
    return {
      num: 24, topic: 'matrius', title: 'Sistema amb paràmetre s: discussió completa + cas particular',
      examLink: 'Igual que el bloc de 2017 i 2025 (Nivell B: "sistema amb paràmetre").',
      statementHTML: `<p>Estudieu, segons els valors del paràmetre ${m('s ∈ R')}, la dimensió de la varietat lineal de ${m('R<sup>4</sup>')} determinada pel sistema següent. Trobeu una descripció paramètrica per a ${m('s = −1')}.</p>
        ${systemHTMLText(['x + sy + 2z + t = 1', 'sx + y − 2z − t = s', '2x − y + 6z + 3t = −2s'])}`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercici 26: dos sistemes amb paràmetre a ---- */
  MATRIUS.push((() => {
    const parts = [
      {
        title: 'Sistema A — x + a²y + z = a, &nbsp; x + ay + az = 1, &nbsp; ax + ay + z = 1',
        fields: [
          { type: 'num', label: m('Valor de a') + ' pel qual és incompatible:', answer: 0 },
          { type: 'roots', label: m('Els dos valors de a') + ' pels quals és compatible indeterminat:', answers: [{ re: 1, im: 0 }, { re: -2, im: 0 }] },
          { type: 'choice', label: 'Per a la resta de valors de a, el sistema és...', options: [{ v: 'scd', label: 'Compatible determinat' }, { v: 'inc', label: 'Incompatible' }], answer: 'scd' }
        ]
      },
      {
        title: 'Sistema B — −x+y+2z+3t=a, &nbsp; 2x+ay+at=0, &nbsp; ax+2y−2z=−a',
        fields: [
          { type: 'choice', label: 'És incompatible per algun valor de a?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'no' },
          { type: 'roots', label: m('Els dos valors de a') + ' pels quals hi ha 2 graus de llibertat (en lloc d\'1):', answers: [{ re: 3, im: 0 }, { re: -2, im: 0 }] }
        ]
      }
    ];
    const sol = `<h4>(a) Sistema A</h4>
      <p>${m('det = a(a−1)²(a+2)')}: valors especials ${m('a = 0, 1, −2')}.</p>
      <ul>
        <li>${m('a = 0')}: <strong>incompatible</strong>.</li>
        <li>${m('a = 1')}: rang 1, <strong>2 graus de llibertat</strong>.</li>
        <li>${m('a = −2')}: rang 2, <strong>1 grau de llibertat</strong>.</li>
        <li>Resta: rang 3 = nombre d'incògnites ⇒ <strong>compatible determinat</strong>.</li>
      </ul>
      <h4>(b) Sistema B</h4>
      <p>El menor que treu la columna de ${m('x')} és idènticament 0; els altres tres valen ${m('±2(a−3)(a+2)')}: valors especials ${m('a = 3, −2')}.</p>
      <ul>
        <li>${m('a = 3')} i ${m('a = −2')}: rang 2, <strong>2 graus de llibertat</strong> (${m('4−2')}).</li>
        <li>Resta: rang 3, <strong>1 grau de llibertat</strong>.</li>
      </ul>
      <p>El sistema B és <strong>sempre compatible</strong>, sigui quin sigui ${m('a')} — no tots els sistemes amb paràmetre tenen un cas incompatible.</p>`;
    return {
      num: 26, topic: 'matrius', title: 'Dos sistemes amb paràmetre a (un amb incompatibilitat, l\'altre sense)',
      examLink: 'Doble pràctica del patró "sistema amb paràmetre" (Nivell B), amb un cas que mai és incompatible.',
      statementHTML: `<p>Resoleu, segons els valors del paràmetre ${m('a ∈ R')}, els sistemes següents:</p>
        <p><strong>Sistema A:</strong></p>${systemHTMLText(['x + a²y + z = a', 'x + ay + az = 1', 'ax + ay + z = 1'])}
        <p><strong>Sistema B:</strong></p>${systemHTMLText(['−x + y + 2z + 3t = a', '2x + ay + at = 0', 'ax + 2y − 2z = −a'])}`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  /* ---- Exercicis 27+29: invertibilitat, determinant i inversa (adjunta) ---- */
  MATRIUS.push((() => {
    const M1 = [[2, 1, 1], [4, 2, 3], [-2, -1, 2]];
    const M2 = [[1, 1, 1], [1, 2, 3], [1, 4, 6]];
    const invM2 = [[0, 2, -1], [3, -5, 2], [-2, 3, -1]];
    const M3 = [['i', 0, 'i'], ['1+i', '1−i', 2], [0, 1, 1]];
    const parts = [
      {
        title: m('M<sub>1</sub> = ' + Fmt.matHTML(M1)),
        fields: [
          { type: 'choice', label: 'És invertible?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'no' },
          { type: 'num', label: m('det(M<sub>1</sub>) ='), answer: 0 }
        ]
      },
      {
        title: m('M<sub>2</sub> = ' + Fmt.matHTML(M2)),
        fields: [
          { type: 'choice', label: 'És invertible?', options: [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }], answer: 'si' },
          { type: 'num', label: m('det(M<sub>2</sub>) ='), answer: -1 },
          { type: 'matrix', rows: 3, cols: 3, answer: invM2, label: m('M<sub>2</sub><sup>−1</sup> =') }
        ]
      },
      {
        title: m('M<sub>3</sub> = ' + Fmt.matHTML(M3)) + ' (sobre C)',
        self: true, selfNote: 'determinant amb nombres complexos'
      }
    ];
    const sol = `<h4>(a) M₁</h4>
      <p>Fent Gauss s'obté ${m('rang(M<sub>1</sub>) = 2 < 3')} ⇒ ${m('det(M<sub>1</sub>) = 0')}: <strong>no invertible</strong>.</p>
      <h4>(b) M₂</h4>
      <p>${m('det(M<sub>2</sub>) = −1 ≠ 0')}: invertible. Pel mètode de la matriu adjunta (cofactors):</p>
      <p class="answer">${m('M<sub>2</sub><sup>−1</sup> = ' + Fmt.matHTML(invM2))}</p>
      <h4>(c) M₃ (sobre C)</h4>
      <p>Desenvolupant el determinant, ${m('det(M<sub>3</sub>) = 0')}: <strong>no invertible</strong> (les files són dependents).</p>`;
    return {
      num: '27+29', topic: 'matrius', title: 'Invertibilitat per transformacions elementals, determinant i inversa per l\'adjunta',
      examLink: 'Tècnica alternativa per calcular det(P) i comprovar invertibilitat (Nivell A: "det(P)").',
      statementHTML: `<p>Per a les matrius següents, decidiu si són invertibles (per transformacions elementals), calculeu-ne el determinant i, si és invertible, la inversa pel mètode de la matriu adjunta:</p>
        <p class="eqsys">${m('M<sub>1</sub> = ' + Fmt.matHTML(M1))}, &nbsp; ${m('M<sub>2</sub> = ' + Fmt.matHTML(M2))}, &nbsp; ${m('M<sub>3</sub> = ' + Fmt.matHTML(M3) + ' ∈ M<sub>3</sub>(C)')}</p>`,
      practice: { kind: 'custom', parts },
      solutionHTML: sol
    };
  })());

  global.Dossier = { complexos: COMPLEXOS, matrius: MATRIUS };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.Dossier;
})(typeof window !== 'undefined' ? window : globalThis);
