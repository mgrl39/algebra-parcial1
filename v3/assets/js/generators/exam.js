/* ============================================================
   Àlgebra · Parcial 1 — Generador de parcials complets
   ============================================================ */
(function (global) {
  'use strict';

  function generate(rng) {
    rng = rng || new global.Rand.RNG();
    const poly = global.PolyGen.generate(rng);
    const mat = global.MatrixGen.generate(rng, { exam: true });
    const theory = global.TheoryGen.generateSet(4, rng);

    const theoryHTML = theory.map((q, i) => `
      <div class="exam-theory-item" data-theory-index="${i}">
        <div class="exam-theory-head"><span class="q-letter">${String.fromCharCode(97 + i)})</span> <span>${q.statementHTML}</span></div>
        <div class="tf-actions" data-answer="${q.isTrue}">
          <button class="btn tiny tf" data-val="true">Certa</button>
          <button class="btn tiny tf" data-val="false">Falsa</button>
        </div>
        <div class="theory-feedback" hidden></div>
        <div class="theory-explanation" hidden>${q.explanationHTML}</div>
      </div>`).join('');

    return {
      rngSeed: rng.seed,
      poly,
      mat,
      theory,
      statementHTML: `
        <div class="exam-paper-head">
          <div class="exam-meta">
            <div><strong>Àlgebra</strong> · Grau en Enginyeria Informàtica</div>
            <div class="muted">Primer parcial · U.A.B.</div>
          </div>
          <div class="exam-meta right">
            <div>Curs 2025/2026</div>
            <div class="muted">Durada: 120 minuts · Sense calculadora</div>
          </div>
        </div>
        <div class="exam-title">PRIMER PARCIAL</div>
        <div class="exam-sub">Preguntes generades automàticament · mateix patró que els parcials</div>
        <div class="student-fields">
          <span>Nom i cognoms: ______________________________</span>
          <span>NIU: ____________________</span>
          <span>Grup: ______________</span>
        </div>
        <section class="exam-exercise">
          <h2>1. <span class="pts">(4 punts)</span></h2>
          ${poly.statementHTML}
          <div class="practice-slot" data-slot="poly"></div>
        </section>
        <section class="exam-exercise">
          <h2>2. <span class="pts">(4 punts)</span></h2>
          ${mat.statementHTML}
          <div class="practice-slot" data-slot="mat"></div>
        </section>
        <section class="exam-exercise">
          <h2>3. <span class="pts">(2 punts)</span> Qüestions</h2>
          <p class="muted">Per a cadascuna de les afirmacions següents, determineu si és certa o falsa. Justifiqueu la vostra decisió amb un breu argument o un contraexemple.</p>
          ${theoryHTML}
        </section>`,
      solutionHTML: `
        <div class="solution-block exam-solutions">
          <h2>Solucions del parcial</h2>
          <section>
            <h3>1. Complexos i polinomis</h3>
            ${poly.solutionHTML}
          </section>
          <section>
            <h3>2. Matrius i sistemes</h3>
            ${mat.solutionHTML}
          </section>
          <section>
            <h3>3. Qüestions de teoria</h3>
            ${theory.map((q, i) => `
              <div class="theory-solution">
                <h4>${String.fromCharCode(97 + i)}) ${q.isTrue ? 'CERTA' : 'FALSA'}</h4>
                ${q.explanationHTML}
              </div>`).join('')}
          </section>
        </div>`
    };
  }

  global.ExamGen = { generate };
})(typeof window !== 'undefined' ? window : globalThis);
