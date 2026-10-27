/* ============================================================
   Àlgebra · Parcial 1 — Full de respostes amb correcció
   Cada apartat té camps propis, «Comprova» i la seva solució.
   ============================================================ */
(function (global) {
  'use strict';
  const Expr = global.Expr;
  const esc = s => global.Fmt.esc(s);
  const PROGRESS_KEY = 'algebra-parcial-progress';
  const registry = new Map();
  let nextId = 1;

  /* ---------- progrés guardat ---------- */
  function readProgress() {
    try {
      const v = JSON.parse(global.localStorage.getItem(PROGRESS_KEY) || '{}');
      return { tried: v.tried | 0, solved: v.solved | 0 };
    } catch (e) { return { tried: 0, solved: 0 }; }
  }
  function writeProgress(p) {
    try { global.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) { /* sense emmagatzematge */ }
    document.querySelectorAll('[data-progress]').forEach(paintProgress);
  }
  function paintProgress(el) {
    const p = readProgress();
    el.textContent = el.dataset.progress === 'pct'
      ? (p.tried ? Math.round(100 * p.solved / p.tried) + '%' : '—')
      : String(p.solved);
  }

  /* ---------- lectura de valors ---------- */
  const PI2 = 2 * Math.PI;
  const ok = () => ({ ok: true });
  const bad = msg => ({ ok: false, msg });

  function readScalar(raw, f) { return Expr.value(raw, { env: f.env }); }

  function sameAngle(a, b) {
    const d = ((a - b) % PI2 + PI2) % PI2;
    return d < 1e-6 || PI2 - d < 1e-6;
  }

  function toCx(v) {
    if (typeof v === 'number') return Expr.cx(v, 0);
    if (v && typeof v.toNumber === 'function') return Expr.cx(v.toNumber(), 0);
    return Expr.cx(v.re, v.im);
  }

  function numMatrix(M) { return M.map(r => r.map(v => toCx(v).re)); }
  function mulNum(A, B) {
    return A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
  }
  function detNum(M) {
    const A = M.map(r => r.slice());
    const n = A.length;
    let d = 1;
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      if (Math.abs(A[p][c]) < 1e-12) return 0;
      if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; d = -d; }
      d *= A[c][c];
      for (let i = c + 1; i < n; i++) {
        const k = A[i][c] / A[c][c];
        for (let j = c; j < n; j++) A[i][j] -= k * A[c][j];
      }
    }
    return d;
  }
  const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));

  /* ---------- tipus de camp ----------
     Cada tipus sap pintar-se (html) i validar-se (check). */
  const TYPES = {
    num: {
      html: f => scalarInput(f),
      read: (el, f) => readScalar(el[0], f),
      check(v, f) {
        if (Math.abs(v.im) > 1e-9 * Math.max(1, Math.abs(v.re))) return bad('Ha de ser un nombre real.');
        return near(v.re, toCx(f.answer).re) ? ok() : bad('No és correcte.');
      }
    },
    angle: {
      html: f => scalarInput(f),
      read: (el, f) => readScalar(el[0], f),
      check(v, f) {
        if (Math.abs(v.im) > 1e-9) return bad('L\'angle ha de ser real.');
        return sameAngle(v.re, f.answer) ? ok() : bad('No és correcte (es compara mòdul 2π).');
      }
    },
    cplx: {
      html: f => scalarInput(f),
      read: (el, f) => readScalar(el[0], f),
      check: (v, f) => Expr.close(v, toCx(f.answer)) ? ok() : bad('No és correcte.')
    },
    choice: {
      html: f => `<span class="pchoice">${f.options.map(o =>
        `<button type="button" class="btn tiny pchoice-opt" data-v="${esc(o.v)}">${o.label}</button>`).join('')}</span>`,
      read: (el) => {
        if (!el[0]) throw new Expr.ExprError('Tria una opció');
        return el[0];
      },
      check: (v, f) => String(v) === String(f.answer) ? ok() : bad('No és correcte.')
    },
    roots: {
      html: f => '<span class="pmulti">' + Array.from({ length: f.answers.length }, (_, k) =>
        `<input class="pinput" data-k="${k}" autocomplete="off" spellcheck="false" placeholder="${f.label ? '' : 'arrel ' + (k + 1)}">`).join('') + '</span>',
      read: (el, f) => el.map(raw => readScalar(raw, f)),
      check(vals, f) {
        const left = f.answers.map(toCx);
        const marks = vals.map(v => {
          const k = left.findIndex(a => a && Expr.close(v, a));
          if (k < 0) return false;
          left[k] = null;
          return true;
        });
        return marks.every(Boolean) ? ok() : Object.assign(bad('Hi ha arrels incorrectes o repetides (l\'ordre no importa).'), { marks });
      }
    },
    vector: {
      html: f => '<span class="pvector">(' + Array.from({ length: f.n }, (_, k) =>
        `<input class="pinput small" data-k="${k}" autocomplete="off" spellcheck="false">`).join(',') + ')</span>',
      read: (el, f) => el.map(raw => readScalar(raw, f).re),
      check(x, f) {
        if (f.answer) return f.answer.every((a, k) => near(x[k], toCx(a).re)) ? ok() : bad('No és correcte.');
        // vecsol: qualsevol x amb M·x = c
        const M = numMatrix(f.M), c = f.c.map(v => toCx(v).re);
        const good = M.every((row, i) => near(row.reduce((s, a, k) => s + a * x[k], 0), c[i]));
        return good ? ok() : bad('Aquest vector no satisfà totes les equacions del sistema.');
      }
    },
    matrix: {
      html: f => `<span class="pmatrix" style="grid-template-columns:repeat(${f.cols}, minmax(2.6rem, 3.6rem))">` +
        Array.from({ length: f.rows * f.cols }, (_, k) =>
          `<input class="pinput cell" data-k="${k}" autocomplete="off" spellcheck="false">`).join('') + '</span>',
      read: (el, f) => {
        const vals = el.map(raw => (raw.trim() === '' ? (() => { throw new Expr.ExprError('Omple totes les caselles'); })() : readScalar(raw, f).re));
        return Array.from({ length: f.rows }, (_, i) => vals.slice(i * f.cols, (i + 1) * f.cols));
      },
      check(M, f) {
        if (f.answer) {
          const A = numMatrix(f.answer);
          const marks = M.flat().map((v, k) => near(v, A[Math.floor(k / f.cols)][k % f.cols]));
          return marks.every(Boolean) ? ok() : Object.assign(bad('Les caselles en vermell no coincideixen.'), { marks });
        }
        // P amb P·A = J, invertible
        if (Math.abs(detNum(M)) < 1e-9) return bad('Aquesta matriu no és invertible (det = 0).');
        const PA = mulNum(M, numMatrix(f.A)), J = numMatrix(f.J);
        const good = PA.every((row, i) => row.every((v, j) => near(v, J[i][j])));
        return good ? ok() : bad('No compleix P·A = J. Multiplica-la per A per comprovar-ho.');
      }
    },
    det: {
      // determinant de la matriu que ha escrit l'estudiant en un altre camp
      html: f => scalarInput(f),
      read: (el, f) => readScalar(el[0], f),
      check(v, f, ctx) {
        const P = ctx.values[f.of];
        const target = Array.isArray(P) ? detNum(P) : toCx(f.answer).re;
        return near(v.re, target) ? ok() : bad(Array.isArray(P) ? 'No és el determinant de la teva P.' : 'No és correcte.');
      }
    },
    rowcomb: {
      html: f => '<span class="pmulti">' + f.A.map((_, k) =>
        `<span class="pcoef"><input class="pinput small" data-k="${k}" autocomplete="off" spellcheck="false">·f<sub>${k + 1}</sub>(${f.matLabel || 'A'})</span>`).join(' + ') + '</span>',
      read: (el, f) => el.map(raw => readScalar(raw, f).re),
      check(c, f) {
        const A = numMatrix(f.A), target = f.target.map(v => toCx(v).re);
        const good = target.every((t, j) => near(A.reduce((s, row, i) => s + c[i] * row[j], 0), t));
        return good ? ok() : bad('Aquesta combinació no dona la fila demanada.');
      }
    },
    poly: {
      html: f => scalarInput(f, 'wide'),
      read: (el, f) => Expr.parse(el[0], { env: f.env }),
      check(ast, f) {
        const env = f.env || {};
        const pts = [Expr.cx(0.37, 0.71), Expr.cx(-1.3, 0.42), Expr.cx(2.1, -0.9), Expr.cx(0.55, 0)];
        const target = x => f.coeffs.reduce((s, c) => Expr.add(Expr.mul(s, x), toCx(c)), Expr.cx(0, 0));
        for (const x of pts) {
          const u = Expr.evaluate(ast, Object.assign({}, env, { x }));
          if (!Expr.close(u, target(x), 1e-6)) return bad('El producte no és igual a p(x). Multiplica els factors per comprovar-ho.');
        }
        if (!f.mode) return ok();
        for (const fac of Expr.factors(ast)) {
          const info = Expr.coefficients(fac.ast, env);
          if (!info) return bad('Un dels factors no és un polinomi.');
          const real = info.coeffs.every(c => Math.abs(c.im) < 1e-9);
          if (f.mode === 'C' && info.degree > 1) return bad('A C[x] tots els factors han de ser de grau 1.');
          if (f.mode === 'R') {
            if (!real) return bad('A R[x] els factors han de tenir coeficients reals.');
            if (info.degree > 2) return bad('Hi ha un factor de grau ' + info.degree + ': no és irreductible a R[x].');
            if (info.degree === 2) {
              const [c0, c1, c2] = info.coeffs.map(c => c.re);
              if (c1 * c1 - 4 * c2 * c0 >= -1e-9) return bad('Un factor de grau 2 té arrels reals: encara es pot descompondre.');
            }
          }
        }
        return ok();
      }
    }
  };

  function scalarInput(f, cls) {
    return `<input class="pinput${cls ? ' ' + cls : ''}" data-k="0" autocomplete="off" spellcheck="false" placeholder="${esc(f.placeholder || '')}">`;
  }

  /* ---------- pintar ---------- */
  function fieldHTML(f, i) {
    const t = TYPES[f.type];
    return `<div class="pfield" data-f="${i}">
      ${f.label ? `<span class="pfield-label">${f.label}</span>` : ''}
      ${t.html(f)}
      <span class="pfield-msg" hidden></span>
    </div>`;
  }

  const HELP = `<details class="phelp"><summary>Com escriure les respostes</summary>
    <ul>
      <li>Fraccions: <code>-2/3</code> · decimals: <code>0,5</code> o <code>0.5</code></li>
      <li>Arrels: <code>√2</code>, <code>3√2/2</code> o <code>sqrt(2)</code> · π: <code>pi</code> o <code>π</code></li>
      <li>Complexos: <code>-1+2i</code>, <code>2+2√3i</code>, <code>2e^(iπ/6)</code></li>
      <li>Angles en radiants (<code>3pi/4</code>) o graus (<code>135°</code>); es comparen mòdul 2π</li>
      <li>Polinomis: <code>(3x-2)(x^2+2x+5)</code> o amb <code>x²</code></li>
    </ul></details>`;

  // spec = { title?, parts: [{ label, title, fields, solutionHTML, self }], exam }
  function render(spec) {
    const id = 'p' + (nextId++);
    const state = { spec, parts: spec.parts.map(() => ({ tried: false, solved: false, helped: false, ok: null, self: null })) };
    registry.set(id, state);
    const parts = spec.parts.map((p, i) => `
      <div class="ppart" data-part="${i}">
        <div class="ppart-head">
          <span class="ppart-label">${p.label}</span>
          <span class="ppart-title">${p.title || ''}</span>
          <span class="ppart-status"></span>
        </div>
        ${p.self
          ? `<p class="pself-note">Aquest apartat no es pot corregir automàticament${p.selfNote ? ': ' + p.selfNote : ''}. Fes-lo en paper, mira la solució i avalua't.</p>
             <div class="pself"><button type="button" class="btn tiny pself-opt" data-v="1">M'ha sortit bé</button><button type="button" class="btn tiny pself-opt" data-v="0">No m'ha sortit</button></div>`
          : `<div class="pfields">${p.fields.map(fieldHTML).join('')}</div>`}
        <div class="ppart-actions">
          ${p.self ? '' : '<button type="button" class="btn small primary p-check">Comprova</button>'}
          <button type="button" class="btn small ghost p-sol">Mostra la solució</button>
        </div>
        <div class="psolution" hidden>${i === spec.plotPart && spec.plot ? plotHTML(spec.plot) : ''}${p.solutionHTML || '<p class="muted">Vegeu la solució completa.</p>'}</div>
      </div>`).join('');
    return `<div class="practice${spec.exam ? ' exam-mode' : ''}" data-pid="${id}">
      <div class="practice-head">
        <strong>${spec.title || 'Resol-ho tu'}</strong>
        <span class="practice-score"></span>
      </div>
      ${HELP}
      ${parts}
    </div>`;
  }

  function plotHTML(plot) {
    return '<canvas class="past-canvas" data-plot="complex" height="300"></canvas><div class="plot-legend">' +
      plot.points.map(pt => '<span class="legend-item"><span class="legend-dot" style="background:' + pt.color + '"></span>' + pt.label + '</span>').join('') +
      '</div>';
  }

  /* ---------- corregir ---------- */
  function rawValues(fieldEl, f) {
    if (f.type === 'choice') {
      const sel = fieldEl.querySelector('.pchoice-opt.selected');
      return [sel ? sel.dataset.v : ''];
    }
    return Array.from(fieldEl.querySelectorAll('.pinput')).map(i => i.value);
  }

  function checkPart(root, i, opts) {
    opts = opts || {};
    const st = registry.get(root.dataset.pid);
    const part = st.spec.parts[i];
    const pst = st.parts[i];
    const el = root.querySelector('.ppart[data-part="' + i + '"]');
    if (part.self) {
      pst.ok = pst.self === true;
      paintPart(el, pst.self === null ? 'pending' : pst.ok ? 'good' : 'bad');
      return pst.ok;
    }
    const ctx = { values: {} };
    const results = part.fields.map((f, k) => {
      const fieldEl = el.querySelector('.pfield[data-f="' + k + '"]');
      const raws = rawValues(fieldEl, f);
      if (raws.every(r => String(r).trim() === '')) return { empty: true };
      try {
        const v = TYPES[f.type].read(raws, f);
        if (f.key) ctx.values[f.key] = v;
        return { v };
      } catch (e) {
        return { ok: false, msg: e instanceof Expr.ExprError ? e.message : 'No s\'entén la resposta.' };
      }
    });
    let allOk = true, anyEmpty = false;
    part.fields.forEach((f, k) => {
      const fieldEl = el.querySelector('.pfield[data-f="' + k + '"]');
      let r = results[k];
      if (r.empty) { anyEmpty = true; allOk = false; markField(fieldEl, null, 'Falta la resposta.'); return; }
      if (!('ok' in r)) {
        try { r = Object.assign(r, TYPES[f.type].check(r.v, f, ctx)); }
        catch (e) { r = { ok: false, msg: e instanceof Expr.ExprError ? e.message : 'No s\'entén la resposta.' }; }
      }
      if (!r.ok) allOk = false;
      markField(fieldEl, r.ok, r.ok ? '' : r.msg, r.marks);
    });
    pst.ok = allOk;
    if (!opts.silent) {
      const prog = readProgress();
      if (!pst.tried) { pst.tried = true; prog.tried++; }
      if (allOk && !pst.solved) { pst.solved = true; if (!pst.helped) prog.solved++; }
      writeProgress(prog);
    }
    paintPart(el, allOk ? 'good' : anyEmpty && results.every(r => r.empty) ? 'pending' : 'bad', pst.helped && allOk);
    paintScore(root);
    return allOk;
  }

  function markField(fieldEl, good, msg, marks) {
    fieldEl.classList.toggle('is-good', good === true);
    fieldEl.classList.toggle('is-bad', good === false);
    const inputs = fieldEl.querySelectorAll('.pinput');
    inputs.forEach((inp, k) => {
      inp.classList.toggle('bad', !!(marks && marks[k] === false));
      inp.classList.toggle('good', !!(marks && marks[k] === true) || good === true);
    });
    const m = fieldEl.querySelector('.pfield-msg');
    m.hidden = !msg;
    m.textContent = msg || '';
  }

  function paintPart(el, status, helped) {
    el.classList.remove('good', 'bad');
    const s = el.querySelector('.ppart-status');
    if (status === 'good') { el.classList.add('good'); s.textContent = helped ? '✓ Correcte (amb la solució vista)' : '✓ Correcte'; }
    else if (status === 'bad') { el.classList.add('bad'); s.textContent = '✗ Revisa-ho'; }
    else s.textContent = '';
  }

  function paintScore(root) {
    const st = registry.get(root.dataset.pid);
    const good = st.parts.filter(p => p.ok).length;
    const s = root.querySelector('.practice-score');
    if (s) s.textContent = good + ' / ' + st.parts.length + ' apartats correctes';
  }

  // Corregeix tots els apartats (mode examen). Retorna la fracció d'apartats correctes.
  function checkAll(root) {
    const st = registry.get(root.dataset.pid);
    st.spec.parts.forEach((_, i) => checkPart(root, i));
    root.classList.add('delivered');
    return { correct: st.parts.filter(p => p.ok).length, total: st.parts.length };
  }

  function score(root) {
    const st = registry.get(root.dataset.pid);
    return { correct: st.parts.filter(p => p.ok).length, total: st.parts.length };
  }

  /* ---------- esdeveniments (delegació) ---------- */
  function onClick(e) {
    const root = e.target.closest('.practice');
    if (!root || !registry.has(root.dataset.pid)) return;
    const partEl = e.target.closest('.ppart');
    if (!partEl) return;
    const i = Number(partEl.dataset.part);
    const st = registry.get(root.dataset.pid);
    if (e.target.closest('.p-check')) { checkPart(root, i); return; }
    if (e.target.closest('.p-sol')) {
      const sol = partEl.querySelector('.psolution');
      sol.hidden = !sol.hidden;
      e.target.closest('.p-sol').textContent = sol.hidden ? 'Mostra la solució' : 'Amaga la solució';
      if (!sol.hidden && !st.parts[i].solved) st.parts[i].helped = true;
      const canvas = sol.querySelector('canvas');
      if (!sol.hidden && canvas && global.Plots) global.Plots.drawComplexPlane(canvas, st.spec.plot.points, { unit: !!st.spec.plot.unit });
      root.dispatchEvent(new CustomEvent('practice:solution', { bubbles: true, detail: { part: i, open: !sol.hidden } }));
      return;
    }
    const opt = e.target.closest('.pchoice-opt');
    if (opt) {
      opt.parentElement.querySelectorAll('.pchoice-opt').forEach(b => b.classList.toggle('selected', b === opt));
      return;
    }
    const self = e.target.closest('.pself-opt');
    if (self) {
      partEl.querySelectorAll('.pself-opt').forEach(b => b.classList.toggle('selected', b === self));
      st.parts[i].self = self.dataset.v === '1';
      if (!st.spec.exam || root.classList.contains('delivered')) checkPart(root, i, { silent: true });
      root.dispatchEvent(new CustomEvent('practice:change', { bubbles: true }));
    }
  }

  function onKey(e) {
    if (e.key !== 'Enter' || !e.target.classList.contains('pinput')) return;
    const root = e.target.closest('.practice');
    const partEl = e.target.closest('.ppart');
    if (!root || !partEl || root.classList.contains('exam-mode')) return;
    e.preventDefault();
    checkPart(root, Number(partEl.dataset.part));
  }

  // Separa una solució completa en trossos per apartat segons els <h4>:
  // «(a) …», «(b) …» o «1. …», «2. …».
  function splitSolution(html, n) {
    let s = String(html).trim();
    const wrap = /^<div class="solution-block">([\s\S]*)<\/div>$/.exec(s);
    if (wrap) s = wrap[1];
    const out = Array.from({ length: n }, () => '');
    const pieces = s.split(/(?=<h4)/);
    let current = 0;
    pieces.forEach(piece => {
      const m = /^<h4>\s*(?:\(([a-z])\)|(\d+)\.)/.exec(piece);
      if (m) current = m[1] ? m[1].charCodeAt(0) - 97 : Number(m[2]) - 1;
      current = Math.max(0, Math.min(n - 1, current));
      out[current] += piece;
    });
    return out;
  }

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-progress]').forEach(paintProgress));

  global.Practice = { render, checkAll, checkPart, score, splitSolution, readProgress, paintProgress, TYPES };
})(typeof window !== 'undefined' ? window : globalThis);
