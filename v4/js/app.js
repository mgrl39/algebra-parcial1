/* ============================================================
   app.js — Lògica de la interfície: navegació, exercicis,
   exàmens reals, test (format 2025), problemes resolts,
   simulacre d'examen i gràfiques SVG.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Utilitats ---------------- */
  function renderMath(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
    drawPlots(el);
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const LETTERS = "abcde";

  /* ---------------- Gràfiques SVG (esbossos de funcions) ---------------- */
  function drawPlots(root) {
    root.querySelectorAll(".plot:not([data-drawn])").forEach(div => {
      div.dataset.drawn = "1";
      try { div.appendChild(buildPlot(div.dataset)); } catch (e) { div.textContent = "(no s'ha pogut dibuixar la gràfica)"; }
    });
  }
  function buildPlot(ds) {
    const W = 420, H = 280, NS = "http://www.w3.org/2000/svg";
    const [x0, x1] = ds.xr.split(",").map(Number);
    const [y0, y1] = ds.yr.split(",").map(Number);
    const sx = x => (x - x0) / (x1 - x0) * W;
    const sy = y => H - (y - y0) / (y1 - y0) * H;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "plot-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Esbós de y = " + ds.f);
    const add = (tag, attrs) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      svg.appendChild(n);
      return n;
    };
    // quadrícula als enters (si no són massa)
    const stepX = (x1 - x0) > 20 ? 5 : 1, stepY = niceStep(y1 - y0);
    for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1; x += stepX) add("line", { x1: sx(x), x2: sx(x), y1: 0, y2: H, class: "plot-grid" });
    for (let y = Math.ceil(y0 / stepY) * stepY; y <= y1; y += stepY) add("line", { x1: 0, x2: W, y1: sy(y), y2: sy(y), class: "plot-grid" });
    if (y0 < 0 && y1 > 0) add("line", { x1: 0, x2: W, y1: sy(0), y2: sy(0), class: "plot-axis" });
    if (x0 < 0 && x1 > 0) add("line", { x1: sx(0), x2: sx(0), y1: 0, y2: H, class: "plot-axis" });
    // etiquetes d'eixos
    for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1; x += stepX) {
      if (x === 0 || x <= x0 || x >= x1) continue;
      const t = add("text", { x: sx(x), y: Math.min(H - 4, Math.max(12, sy(0) + 13)), class: "plot-label", "text-anchor": "middle" });
      t.textContent = x;
    }
    for (let y = Math.ceil(y0 / stepY) * stepY; y <= y1; y += stepY) {
      if (Math.abs(y) < 1e-9 || y <= y0 || y >= y1) continue;
      const t = add("text", { x: Math.min(W - 4, Math.max(4, sx(0) + 4)), y: sy(y) - 2, class: "plot-label" });
      t.textContent = +y.toFixed(2);
    }
    // asímptotes
    const vas = ds.va ? ds.va.split(",").map(Number) : [];
    vas.forEach(v => add("line", { x1: sx(v), x2: sx(v), y1: 0, y2: H, class: "plot-asym" }));
    (ds.lines ? ds.lines.split(";") : []).forEach(expr => {
      const g = MathParser.compile(expr);
      add("line", { x1: sx(x0), y1: sy(g(x0)), x2: sx(x1), y2: sy(g(x1)), class: "plot-asym" });
    });
    // corba
    const f = MathParser.compile(ds.f);
    const N = 800;
    let d = "", pen = false, prevX = null;
    for (let i = 0; i <= N; i++) {
      const x = x0 + (x1 - x0) * i / N;
      let y;
      try { y = f(x); } catch (e) { y = NaN; }
      const crossVA = prevX !== null && vas.some(v => (prevX - v) * (x - v) <= 0);
      if (!isFinite(y) || crossVA || y > y1 + (y1 - y0) || y < y0 - (y1 - y0)) { pen = false; prevX = x; continue; }
      d += (pen ? "L" : "M") + sx(x).toFixed(1) + " " + sy(y).toFixed(1) + " ";
      pen = true; prevX = x;
    }
    const cp = document.createElementNS(NS, "clipPath");
    cp.id = "clip" + Math.random().toString(36).slice(2);
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("width", W); r.setAttribute("height", H);
    cp.appendChild(r); svg.appendChild(cp);
    add("path", { d, class: "plot-curve", "clip-path": `url(#${cp.id})` });
    (ds.pts ? ds.pts.split(";") : []).forEach(p => {
      const [px, py] = p.split(",").map(Number);
      add("circle", { cx: sx(px), cy: sy(py), r: 4, class: "plot-pt" });
    });
    return svg;
  }
  function niceStep(range) {
    const raw = range / 8, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }

  /* ---------------- Navegació per pestanyes ---------------- */
  const tabButtons = document.querySelectorAll(".tab-btn");
  function openTab(name) {
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
    window.scrollTo({ top: 0 });
  }
  tabButtons.forEach(btn => btn.addEventListener("click", () => openTab(btn.dataset.tab)));
  // Enllaços interns: data-goto="pestanya" (+ data-cat / data-exam / data-list)
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    openTab(b.dataset.goto);
    if (b.dataset.cat) {
      const chip = document.querySelector(`#exerciseCategoryRow .chip[data-cat="${b.dataset.cat}"]`);
      if (chip) chip.click();
    }
    if (b.dataset.list && window.showClassList) window.showClassList(b.dataset.list);
    if (b.dataset.exam) {
      const card = document.getElementById("exam-" + b.dataset.exam);
      if (card) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  });

  /* ---------------- Teoria: render KaTeX + cerca ---------------- */
  renderMath(document.getElementById("theoryAccordion"));
  renderMath(document.getElementById("tab-inici"));

  const theorySearch = document.getElementById("theorySearch");
  theorySearch.addEventListener("input", () => {
    const q = theorySearch.value.trim().toLowerCase();
    document.querySelectorAll(".theory-block").forEach(block => {
      const text = block.textContent.toLowerCase();
      if (q === "" || text.includes(q)) {
        block.classList.remove("hidden");
        if (q !== "") block.open = true;
      } else {
        block.classList.add("hidden");
      }
    });
  });

  /* ---------------- Progrés (localStorage) ---------------- */
  const PROGRESS_KEY = "calculParcialProgress_v1";
  const CAT_LABELS = {
    functionStudy: "Estudi de funció (tipus 2025)",
    taylorProblem: "Taylor + fita (tipus 2025)",
    taylorDegree: "Taylor amb error < 10^-k (Llista 5)",
    absExtrema: "Extrems absoluts [a,b]",
    continuity: "Continuïtat amb paràmetre k",
    expQuadratic: "Equacions exponencials (e^4x...)",
    tangent: "Recta tangent",
    logDerivative: "Derivada f(x)^g(x)",
    powLimit: "Límits — nivell 4: 1^∞, 0^0, ∞^0",
    inequality: "Inequacions",
    newton: "Mètode de Newton",
    domain: "Domini d'una funció",
    bolzano: "Bolzano: existència + unicitat",
    rolleTvm: "Rolle i teorema del valor mitjà",
    implicitDerivative: "Derivació implícita",
    polyGrowth: "Creixement i extrems d'un polinomi",
    derivBasic: "Derivades — nivell 1: potències i sumes",
    derivChain: "Derivades — nivell 2: regla de la cadena",
    derivProdQuot: "Derivades — nivell 3: producte i quocient",
    derivative: "Derivades — nivell 4: combinat (repte)",
    limitDirect: "Límits — nivell 1: substitució directa",
    limitFactor: "Límits — nivell 2: factoritzar / conjugat (0/0)",
    limit: "Límits — nivell 3: l'Hôpital",
    equation: "Equacions exp./log.",
    taylor: "Taylor: valor",
    taylorError: "Taylor: fita de l'error",
    interpolation: "Interpolació",
    asymptote: "Asímptota obliqua"
  };
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
  }
  let progress = loadProgress();

  function renderProgressSummary() {
    const container = document.getElementById("progressSummary");
    container.innerHTML = "";
    let totalCorrect = 0, totalAll = 0;
    Object.keys(CAT_LABELS).forEach(k => {
      const st = progress[k] || { correct: 0, total: 0 };
      totalCorrect += st.correct; totalAll += st.total;
      const pct = st.total ? Math.round((st.correct / st.total) * 100) : 0;
      container.appendChild(el("div", "progress-item", `
        <div class="label">${CAT_LABELS[k]}</div>
        <div class="value">${st.correct} / ${st.total}</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      `));
    });
    const pctAll = totalAll ? Math.round((totalCorrect / totalAll) * 100) : 0;
    container.prepend(el("div", "progress-item total", `
      <div class="label">Total</div>
      <div class="value">${totalCorrect} / ${totalAll} (${pctAll}%)</div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pctAll}%"></div></div>
    `));
    const best = progress._bestExam;
    document.getElementById("bestExam").textContent = best !== undefined ? `Millor nota al simulacre: ${best.toFixed(2)} / 10` : "Encara no has fet cap simulacre.";
  }
  renderProgressSummary();

  document.getElementById("resetProgressBtn").addEventListener("click", () => {
    if (confirm("Vols reiniciar tot el progrés desat?")) {
      progress = {};
      saveProgress(progress);
      renderProgressSummary();
    }
  });

  function recordResult(cat, correct) {
    if (!progress[cat]) progress[cat] = { correct: 0, total: 0 };
    progress[cat].total++;
    if (correct) progress[cat].correct++;
    saveProgress(progress);
    renderProgressSummary();
  }

  /* ---------------- Motor d'exercicis ---------------- */
  const GEN_MAP = {
    derivative: Gen.derivative,
    domain: Gen.domain,
    bolzano: Gen.bolzano,
    rolleTvm: Gen.rolleTvm,
    implicitDerivative: Gen.implicitDerivative,
    polyGrowth: Gen.polyGrowth,
    derivBasic: Gen.derivBasic,
    derivChain: Gen.derivChain,
    derivProdQuot: Gen.derivProdQuot,
    limit: Gen.limit,
    limitDirect: Gen.limitDirect,
    limitFactor: Gen.limitFactor,
    equation: Gen.equation,
    taylor: Gen.taylorValue,
    taylorError: Gen.taylorError,
    interpolation: Gen.interpolation,
    asymptote: Gen.asymptote,
    expQuadratic: Gen.expQuadratic,
    inequality: Gen.inequality,
    tangent: Gen.tangent,
    continuity: Gen.continuity,
    logDerivative: Gen.logDerivative,
    newton: Gen.newton,
    absExtrema: Gen.absExtrema,
    functionStudy: Gen.functionStudy,
    taylorProblem: Gen.taylorProblem,
    powLimit: Gen.powLimit,
    taylorDegree: Gen.taylorDegree
  };

  const exercisePanel = document.getElementById("exercisePanel");
  const exerciseTitle = document.getElementById("exerciseTitle");
  const exerciseScore = document.getElementById("exerciseScore");
  const exercisePrompt = document.getElementById("exercisePrompt");
  const exerciseInstructions = document.getElementById("exerciseInstructions");
  const exerciseInputs = document.getElementById("exerciseInputs");
  const feedbackArea = document.getElementById("feedbackArea");
  const hintArea = document.getElementById("hintArea");
  const solutionArea = document.getElementById("solutionArea");

  let currentCat = null;
  let currentExercise = null;

  function insertPrompt(container, latex) {
    container.innerHTML = latex.includes("$") ? latex : `$$${latex}$$`;
    renderMath(container);
  }

  // Crea les caselles de resposta d'un exercici (una o diverses) dins `container`
  function buildInputs(container, ex, onEnter) {
    container.innerHTML = "";
    const fields = ex.fields || [{ label: "", checker: ex.checker }];
    const inputs = fields.map((fd, i) => {
      const wrap = el("label", "field-wrap");
      if (fd.label) wrap.appendChild(el("span", "field-label", fd.label));
      const input = el("input", "input-field");
      input.placeholder = fd.label ? "" : "La teva resposta...";
      input.dataset.idx = i;
      input.autocomplete = "off";
      input.spellcheck = false;
      if (onEnter) input.addEventListener("keydown", e => { if (e.key === "Enter") onEnter(); });
      wrap.appendChild(input);
      container.appendChild(wrap);
      return input;
    });
    container.classList.toggle("multi", fields.length > 1);
    return inputs;
  }
  // Retorna {nOk, n, details[]} i marca cada casella
  function gradeInputs(ex, inputs) {
    const fields = ex.fields || [{ label: "", checker: ex.checker }];
    let nOk = 0;
    const details = [];
    fields.forEach((fd, i) => {
      const v = inputs[i].value.trim();
      let r = { ok: false };
      if (v) r = fd.checker(v);
      inputs[i].classList.toggle("ok", !!r.ok);
      inputs[i].classList.toggle("bad", !r.ok);
      if (r.ok) nOk++;
      else details.push((fd.label || "resposta") + " " + (v ? (r.error ? "— " + r.error : "no és correcta") : "buida"));
    });
    return { nOk, n: fields.length, details };
  }

  let exerciseInputEls = [];
  function newExercise() {
    if (!currentCat) return;
    currentExercise = GEN_MAP[currentCat]();
    currentExercise._answered = false;
    exerciseTitle.textContent = CAT_LABELS[currentCat];
    const st = progress[currentCat] || { correct: 0, total: 0 };
    exerciseScore.textContent = `${st.correct} / ${st.total}`;
    insertPrompt(exercisePrompt, currentExercise.promptLatex);
    exerciseInstructions.textContent = currentExercise.instructions;
    exerciseInputEls = buildInputs(exerciseInputs, currentExercise, checkExercise);
    if (exerciseInputEls[0]) exerciseInputEls[0].focus({ preventScroll: true });

    feedbackArea.className = "feedback";
    feedbackArea.textContent = "";
    hintArea.style.display = "none";
    hintArea.textContent = "";
    solutionArea.style.display = "none";
    solutionArea.innerHTML = "";
  }

  document.querySelectorAll("#exerciseCategoryRow .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#exerciseCategoryRow .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentCat = chip.dataset.cat;
      exercisePanel.style.display = "block";
      newExercise();
    });
  });

  function checkExercise() {
    if (!currentExercise) return;
    if (exerciseInputEls.every(i => !i.value.trim())) { showFeedback(false, "Escriu una resposta abans de comprovar."); return; }
    const g = gradeInputs(currentExercise, exerciseInputEls);
    const ok = g.nOk === g.n;
    if (ok) showFeedback(true, "Correcte! 🎉");
    else if (g.n === 1) showFeedback(false, g.details[0].startsWith("resposta no") ? "No és correcte. Torna-ho a intentar o mira la pista." : "Revisa: " + g.details.join(" · "));
    else showFeedback(false, `${g.nOk}/${g.n} correctes. Revisa: ` + g.details.join(" · "));
    if (!currentExercise._answered) {
      currentExercise._answered = true;
      recordResult(currentCat, ok);
      exerciseScore.textContent = `${progress[currentCat].correct} / ${progress[currentCat].total}`;
    }
  }
  document.getElementById("checkBtn").addEventListener("click", checkExercise);

  function showFeedback(ok, msg) {
    feedbackArea.className = "feedback " + (ok ? "ok" : "bad");
    feedbackArea.textContent = msg;
  }

  document.getElementById("hintBtn").addEventListener("click", () => {
    if (!currentExercise) return;
    hintArea.style.display = hintArea.style.display === "none" ? "block" : "none";
    hintArea.textContent = "💡 " + currentExercise.hint;
  });

  document.getElementById("solutionBtn").addEventListener("click", () => {
    if (!currentExercise) return;
    solutionArea.style.display = solutionArea.style.display === "none" ? "block" : "none";
    solutionArea.innerHTML = `$$${currentExercise.solutionLatex}$$`;
    renderMath(solutionArea);
  });

  document.getElementById("nextBtn").addEventListener("click", newExercise);

  /* ---------------- Preguntes de test (opció múltiple, a–e) ---------------- */
  // Prepara una pregunta: barreja (opcional) les opcions i recorda on és la correcta
  function prepMC(q, doShuffle) {
    const opts = q.options.map((text, idx) => ({ text, idx }));
    const order = doShuffle ? shuffle(opts) : opts;
    return { ...q, order, correctPos: order.findIndex(o => o.idx === q.correct), selected: null };
  }
  // Dibuixa una pregunta. mode "instant": corregeix en clicar. Si no, es pot deseleccionar (en blanc).
  function renderMC(item, number, mode) {
    const block = el("div", "mc-question");
    const stem = el("div", "mc-stem", `<b>${number}.</b> ${item.q}`);
    if (item.src) stem.appendChild(el("span", "src-tag", item.src));
    block.appendChild(stem);
    item.order.forEach((opt, oi) => {
      const b = el("button", "mc-option", `<span class="mc-letter">(${LETTERS[oi]})</span> ${opt.text}`);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        if (mode === "instant") {
          item.selected = oi;
          revealMC(item, block);
          return;
        }
        item.selected = item.selected === oi ? null : oi;   // tornar a clicar = deixar en blanc
        block.querySelectorAll(".mc-option").forEach((x, xi) => x.classList.toggle("selected", xi === item.selected));
      });
      block.appendChild(b);
    });
    renderMath(block);
    return block;
  }
  function revealMC(item, block) {
    block.querySelectorAll(".mc-option").forEach((optEl, oi) => {
      optEl.disabled = true;
      if (oi === item.correctPos) optEl.classList.add("correct");
      else if (oi === item.selected) optEl.classList.add("incorrect");
    });
    if (!block.querySelector(".mc-explain")) {
      const status = item.correctPos < 0 ? "" : item.selected === null ? "⚪ En blanc. " : item.selected === item.correctPos ? "✅ " : "❌ ";
      const expEl = el("div", "mc-explain", status + item.exp);
      expEl.style.display = "block";
      block.appendChild(expEl);
      renderMath(expEl);
    }
  }
  // Puntuació format 2025: +0.8 encert, -0.2 error, 0 en blanc
  function scoreMC(items) {
    let ok = 0, bad = 0, blank = 0;
    items.forEach(it => {
      if (it.selected === null) blank++;
      else if (it.selected === it.correctPos) ok++;
      else bad++;
    });
    return { ok, bad, blank, points: Math.max(0, 0.8 * ok - 0.2 * bad) };
  }

  /* ---------------- Test ---------------- */
  const testRunner = document.getElementById("testRunner");
  const testResult = document.getElementById("testResult");
  const testIntro = document.getElementById("testIntro");

  function runTest(pool, n, examFormat) {
    testIntro.style.display = "none";
    testResult.style.display = "none";
    testRunner.style.display = "block";
    testRunner.innerHTML = "";
    testRunner.appendChild(el("p", "muted", examFormat
      ? "Format examen 2025: 5 preguntes, 5 opcions. +0.8 si l'encertes, −0.2 si falles, 0 si la deixes en blanc (torna a clicar una opció per desmarcar-la)."
      : "Pràctica: tria una opció a cada pregunta i prem «Finalitza»."));

    const picked = shuffle(pool).slice(0, n).map(q => prepMC(q, true));
    const blocks = picked.map((item, qi) => {
      const b = renderMC(item, qi + 1, "deferred");
      testRunner.appendChild(b);
      return b;
    });

    const finishBtn = el("button", "btn-primary", "Finalitza el test");
    finishBtn.addEventListener("click", () => {
      picked.forEach((item, qi) => revealMC(item, blocks[qi]));
      finishBtn.style.display = "none";
      const s = scoreMC(picked);
      testResult.style.display = "block";
      if (examFormat) {
        testResult.innerHTML = `<h3>Nota del test: ${s.points.toFixed(1)} / 4</h3>
          <p>✅ ${s.ok} encerts · ❌ ${s.bad} errors · ⚪ ${s.blank} en blanc</p>
          <p class="muted">Consell: amb +0.8/−0.2, si pots descartar almenys 1–2 opcions, val la pena arriscar (l'esperança és positiva). Si no tens ni idea, amb 5 opcions l'esperança és 0.</p>`;
      } else {
        testResult.innerHTML = `<h3>Resultat: ${s.ok} / ${picked.length}</h3><p>${s.ok >= 8 ? "Molt bé! Domines la teoria. 🚀" : s.ok >= 5 ? "Bé, però repassa els temes que has fallat." : "Toca repassar la secció de Teoria amb calma."}</p>`;
      }
      const again = el("button", "btn-secondary", "🔁 Un altre test");
      again.addEventListener("click", () => runTest(pool, n, examFormat));
      testResult.appendChild(again);
      testResult.scrollIntoView({ behavior: "smooth" });
    });
    testRunner.appendChild(finishBtn);
  }
  document.getElementById("startExamTestBtn").addEventListener("click", () => runTest(EXAM_TEST_BANK, 5, true));
  document.getElementById("startTestBtn").addEventListener("click", () => runTest(EXAM_TEST_BANK.concat(CONCEPTUAL_MC), 10, false));

  /* ---------------- Exàmens reals ---------------- */
  const examsList = document.getElementById("realExamsList");
  const examsFilter = document.getElementById("realExamsFilter");
  function solutionToggle(html, label) {
    const wrap = el("div");
    const btn = el("button", "btn-secondary btn-small", label || "👁️ Solució");
    const sol = el("div", "solved-solution", html);
    btn.addEventListener("click", () => {
      sol.classList.toggle("visible");
      btn.textContent = sol.classList.contains("visible") ? "🙈 Amaga" : (label || "👁️ Solució");
      if (sol.classList.contains("visible")) renderMath(sol);
    });
    wrap.appendChild(btn);
    wrap.appendChild(sol);
    return wrap;
  }
  REAL_EXAMS.forEach(ex => {
    const chip = el("button", "chip" + (ex.hot ? " hot" : ""), ex.id.replace(/^R/, "Recu "));
    chip.addEventListener("click", () => {
      document.getElementById("exam-" + ex.id).scrollIntoView({ behavior: "smooth", block: "start" });
    });
    examsFilter.appendChild(chip);

    const card = el("div", "card exam-card" + (ex.hot ? " hot" : ""));
    card.id = "exam-" + ex.id;
    card.appendChild(el("div", "exam-head", `<h3>${ex.title}</h3><span class="exam-tag${ex.hot ? " hot" : ""}">${ex.tag}</span>`));
    card.appendChild(el("p", "muted", "📋 " + ex.format));
    if (ex.test) {
      card.appendChild(el("h4", "exam-section-title", "Preguntes de test <span class='muted small'>(clica una opció: es corregeix a l'instant)</span>"));
      ex.test.forEach((q, i) => card.appendChild(renderMC(prepMC(q, false), i + 1, "instant")));
    }
    (ex.problems || []).forEach(p => {
      const pb = el("div", "exam-problem");
      pb.appendChild(el("h4", "exam-section-title", p.title));
      if (p.statement) pb.appendChild(el("p", null, p.statement));
      p.parts.forEach(part => {
        const pp = el("div", "exam-part");
        pp.appendChild(el("p", null, part.q));
        pp.appendChild(solutionToggle(part.sol));
        pb.appendChild(pp);
      });
      card.appendChild(pb);
    });
    examsList.appendChild(card);
    renderMath(card);
  });

  /* ---------------- Simulador de patrons (llistes + exàmens reals, problemes oberts) ---------------- */
  const PATRONS_KEY = "calculParcialPatrons_v1";
  let patronsState = {};
  try { patronsState = JSON.parse(localStorage.getItem(PATRONS_KEY)) || {}; } catch (e) { patronsState = {}; }
  function savePatrons() { try { localStorage.setItem(PATRONS_KEY, JSON.stringify(patronsState)); } catch (e) { /* ignore */ } }

  const PATRONS_POOL = [];
  CLASS_LISTS.forEach(list => {
    list.items.forEach(it => {
      PATRONS_POOL.push({
        key: "L:" + list.id + ":" + it.n,
        source: `${list.short} · ${it.n}`,
        weight: list.stars,
        promptLatex: it.q,
        solutionLatex: it.sol,
        check: it.check || null
      });
    });
  });
  REAL_EXAMS.forEach(ex => {
    (ex.problems || []).forEach(p => {
      p.parts.forEach((part, pi) => {
        PATRONS_POOL.push({
          key: "E:" + ex.id + ":" + p.title + ":" + pi,
          source: `${ex.title.replace("Primer Parcial — ", "")} · ${p.title}`,
          weight: ex.hot ? 3 : 2,
          promptLatex: (p.statement ? p.statement + " " : "") + part.q,
          solutionLatex: part.sol,
          check: null
        });
      });
    });
  });

  let patronsMinW = 3;
  let patronsCurrent = null;

  const patronsCard = document.getElementById("patronsCard");
  const patronsDoneCard = document.getElementById("patronsDoneCard");
  const patronsSource = document.getElementById("patronsSource");
  const patronsPrompt = document.getElementById("patronsPrompt");
  const patronsCheckRow = document.getElementById("patronsCheckRow");
  const patronsSolBtn = document.getElementById("patronsSolBtn");
  const patronsSolArea = document.getElementById("patronsSolArea");
  const patronsMeter = document.getElementById("patronsMeter");

  function patronsGroup() { return PATRONS_POOL.filter(p => p.weight >= patronsMinW); }

  function updatePatronsMeter() {
    const group = patronsGroup();
    const n = group.filter(p => patronsState[p.key] === "mastered").length;
    const pct = group.length ? Math.round(100 * n / group.length) : 0;
    patronsMeter.querySelector(".lm-text").textContent = `${n}/${group.length} patrons dominats`;
    patronsMeter.querySelector(".progress-bar-fill").style.width = pct + "%";
  }

  function pickPatron() {
    const group = patronsGroup();
    let pending = group.filter(p => patronsState[p.key] !== "mastered" && p.key !== (patronsCurrent && patronsCurrent.key));
    if (!pending.length) pending = group.filter(p => patronsState[p.key] !== "mastered");
    if (!pending.length) { patronsCard.style.display = "none"; patronsDoneCard.style.display = "block"; patronsCurrent = null; return; }
    patronsDoneCard.style.display = "none";
    patronsCard.style.display = "block";
    const totalW = pending.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * totalW;
    for (const p of pending) { r -= p.weight; if (r <= 0) { patronsCurrent = p; break; } }
    if (!patronsCurrent) patronsCurrent = pending[pending.length - 1];
    renderPatron();
  }

  function renderPatron() {
    const p = patronsCurrent;
    patronsSource.textContent = p.source + "  " + "★".repeat(p.weight);
    patronsPrompt.innerHTML = p.promptLatex.includes("$") ? p.promptLatex : `$$${p.promptLatex}$$`;
    patronsCheckRow.innerHTML = "";
    if (p.check) {
      const wrap = el("label", "field-wrap");
      wrap.appendChild(el("span", "field-label", p.check.label));
      const input = el("input", "input-field");
      input.autocomplete = "off";
      input.placeholder = "comprova el teu resultat";
      wrap.appendChild(input);
      const btn = el("button", "btn-secondary btn-small", "Comprova");
      const fb = el("span", "list-fb");
      const run = () => {
        const v = input.value.trim();
        if (!v) return;
        const tol = p.check.tol !== undefined ? p.check.tol : Math.max(1e-3, Math.abs(p.check.value) * 0.005);
        const r = MathParser.checkNumber(v, p.check.value, { tol });
        input.classList.toggle("ok", r.ok); input.classList.toggle("bad", !r.ok);
        fb.textContent = r.ok ? "✅ Correcte" : (r.error ? "⚠️ " + r.error : "❌ Torna-hi");
        fb.className = "list-fb " + (r.ok ? "good" : "bad");
      };
      btn.addEventListener("click", run);
      input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
      const row = el("div", "exercise-inputs list-check");
      row.appendChild(wrap); row.appendChild(btn); row.appendChild(fb);
      patronsCheckRow.appendChild(row);
    }
    patronsSolArea.style.display = "none";
    patronsSolArea.innerHTML = "";
    patronsSolBtn.textContent = "👁️ Mostra solució";
    renderMath(patronsPrompt);
  }

  patronsSolBtn.addEventListener("click", () => {
    const show = patronsSolArea.style.display === "none";
    patronsSolArea.style.display = show ? "block" : "none";
    patronsSolBtn.textContent = show ? "🙈 Amaga solució" : "👁️ Mostra solució";
    if (show) { patronsSolArea.innerHTML = patronsCurrent.solutionLatex; renderMath(patronsSolArea); }
  });
  document.getElementById("patronsMasteredBtn").addEventListener("click", () => {
    if (!patronsCurrent) return;
    patronsState[patronsCurrent.key] = "mastered";
    savePatrons(); updatePatronsMeter(); pickPatron();
  });
  document.getElementById("patronsReviewBtn").addEventListener("click", () => {
    if (!patronsCurrent) return;
    patronsState[patronsCurrent.key] = "review";
    savePatrons(); updatePatronsMeter(); pickPatron();
  });
  document.getElementById("patronsNextBtn").addEventListener("click", pickPatron);
  document.getElementById("patronsResetBtn").addEventListener("click", () => {
    if (!confirm("Reiniciar el progrés d'aquest grup de patrons?")) return;
    patronsGroup().forEach(p => delete patronsState[p.key]);
    savePatrons(); updatePatronsMeter(); pickPatron();
  });
  document.querySelectorAll("#patronsFilterRow .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#patronsFilterRow .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      patronsMinW = Number(chip.dataset.minw);
      updatePatronsMeter();
      pickPatron();
    });
  });
  updatePatronsMeter();
  pickPatron();

  /* ---------------- Problemes resolts ---------------- */
  const solvedList = document.getElementById("solvedProblemsList");
  SOLVED_PROBLEMS.forEach((p, i) => {
    const card = el("div", "card solved-item");
    card.appendChild(el("h4", null, `${i + 1}. ${p.title}`));
    card.appendChild(el("div", "solved-statement", p.statement));
    card.appendChild(solutionToggle(p.solutionHtml, "👁️ Mostra la solució"));
    solvedList.appendChild(card);
    renderMath(card);
  });

  /* ---------------- Llistes de classe (Llista 0–5) ---------------- */
  const DONE_KEY = "calculParcialLlistes_v1";
  let done = {};
  try { done = JSON.parse(localStorage.getItem(DONE_KEY)) || {}; } catch (e) { done = {}; }
  function saveDone() { try { localStorage.setItem(DONE_KEY, JSON.stringify(done)); } catch (e) { /* ignore */ } }

  const listsNav = document.getElementById("classListsNav");
  const listsContainer = document.getElementById("classListsContainer");
  const listMeters = {};
  function updateMeter(list) {
    const n = list.items.filter(it => done[list.id + ":" + it.n]).length;
    const pct = Math.round(100 * n / list.items.length);
    listMeters[list.id].forEach(m => {
      m.querySelector(".lm-text").textContent = `${n}/${list.items.length} fets`;
      m.querySelector(".progress-bar-fill").style.width = pct + "%";
    });
  }
  function showList(id) {
    listsNav.querySelectorAll(".list-chip").forEach(c => c.classList.toggle("active", c.dataset.id === id));
    listsContainer.querySelectorAll(".class-list").forEach(c => c.style.display = c.dataset.id === id ? "block" : "none");
    const visible = listsContainer.querySelector(`.class-list[data-id="${id}"]`);
    if (visible && !visible.dataset.rendered) { renderMath(visible); visible.dataset.rendered = "1"; }
  }
  CLASS_LISTS.forEach(list => {
    const meter = () => el("div", "list-meter", `<span class="lm-text"></span><div class="progress-bar"><div class="progress-bar-fill"></div></div>`);
    const chip = el("button", "list-chip" + (list.latest ? " hot" : ""),
      `<b>${list.short}</b><span class="stars">${"★".repeat(list.stars)}${"☆".repeat(3 - list.stars)}</span>`);
    chip.dataset.id = list.id;
    const chipMeter = meter();
    chip.appendChild(chipMeter);
    chip.addEventListener("click", () => showList(list.id));
    listsNav.appendChild(chip);

    const sec = el("div", "class-list");
    sec.dataset.id = list.id;
    const head = el("div", "card list-head" + (list.latest ? " hot" : ""));
    head.appendChild(el("div", "exam-head", `<h3>${list.title}</h3>${list.latest ? '<span class="exam-tag hot">LA MÉS NOVA</span>' : ""}`));
    head.appendChild(el("p", null, `<b>Temari:</b> ${list.topic}`));
    head.appendChild(el("p", "list-exam-link", `🎯 <b>Com surt a l'examen:</b> ${list.exam}`));
    const headMeter = meter();
    head.appendChild(headMeter);
    sec.appendChild(head);
    listMeters[list.id] = [chipMeter, headMeter];

    list.items.forEach(it => {
      const key = list.id + ":" + it.n;
      const card = el("div", "card list-item" + (done[key] ? " done" : ""));
      const top = el("div", "list-item-top");
      top.appendChild(el("span", "list-num", it.n));
      const cb = el("label", "done-toggle", `<input type="checkbox"${done[key] ? " checked" : ""}> fet`);
      cb.querySelector("input").addEventListener("change", e => {
        if (e.target.checked) done[key] = true; else delete done[key];
        card.classList.toggle("done", e.target.checked);
        saveDone();
        updateMeter(list);
      });
      top.appendChild(cb);
      card.appendChild(top);
      card.appendChild(el("div", "list-q", it.q));
      if (it.check) {
        const row = el("div", "exercise-inputs list-check");
        const wrap = el("label", "field-wrap");
        wrap.appendChild(el("span", "field-label", it.check.label));
        const input = el("input", "input-field");
        input.autocomplete = "off";
        input.placeholder = "comprova el teu resultat";
        wrap.appendChild(input);
        row.appendChild(wrap);
        const btn = el("button", "btn-secondary btn-small", "Comprova");
        const fb = el("span", "list-fb");
        const run = () => {
          const v = input.value.trim();
          if (!v) return;
          const tol = it.check.tol !== undefined ? it.check.tol : Math.max(1e-3, Math.abs(it.check.value) * 0.005);
          const r = MathParser.checkNumber(v, it.check.value, { tol });
          input.classList.toggle("ok", r.ok); input.classList.toggle("bad", !r.ok);
          fb.textContent = r.ok ? "✅ Correcte" : (r.error ? "⚠️ " + r.error : "❌ Torna-hi");
          fb.className = "list-fb " + (r.ok ? "good" : "bad");
        };
        btn.addEventListener("click", run);
        input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
        row.appendChild(btn);
        row.appendChild(fb);
        card.appendChild(row);
      }
      card.appendChild(solutionToggle(it.sol));
      sec.appendChild(card);
    });
    listsContainer.appendChild(sec);
    updateMeter(list);
  });
  showList(CLASS_LISTS[0].id);
  window.showClassList = showList;


  /* ---------------- Pla de 3 dies (llista prioritzada) ---------------- */
  const PLAN_KEY = "calculParcialPla_v1";
  let planDone = {};
  try { planDone = JSON.parse(localStorage.getItem(PLAN_KEY)) || {}; } catch (e) { planDone = {}; }
  const linkBtns = links => links.map(k =>
    `<button class="link-chip" data-goto="${k.goto}"${k.cat ? ` data-cat="${k.cat}"` : ""}${k.exam ? ` data-exam="${k.exam}"` : ""}${k.list ? ` data-list="${k.list}"` : ""}>${k.l} →</button>`).join("");

  const rankBody = document.getElementById("rankingBody");
  TOPIC_RANKING.forEach((r, i) => {
    const tr = el("tr", "tier-" + r.tier);
    const dots = EXAM_COLS.map(c => `<span class="dot${r.seen.includes(c) ? " on" : ""}" title="${c.replace(/^R/, "Recu ")}"></span>`).join("");
    tr.innerHTML = `<td class="rank-n">${i + 1}</td><td><span class="tier-badge t${r.tier}">${r.tier}</span></td>
      <td><b>${r.topic}</b><div class="muted small">${r.why}</div><div class="link-row">${linkBtns(r.links)}</div></td>
      <td class="dots-cell"><div class="dots">${dots}</div><div class="small muted">${r.seen.length}/10</div></td>
      <td class="small">${r.lists}</td><td class="small">${r.weight}</td>`;
    rankBody.appendChild(tr);
  });
  document.getElementById("rankingHead").innerHTML = EXAM_COLS.map(c => `<span>${c.replace(/^R20/, "R").replace(/^20/, "")}</span>`).join("");

  const daysWrap = document.getElementById("planDays");
  const planMeter = document.getElementById("planMeter");
  function updatePlanMeter() {
    const all = PLAN_DAYS.flatMap(d => d.tasks);
    const n = all.filter(t => planDone[t.id]).length;
    planMeter.querySelector(".lm-text").textContent = `${n} / ${all.length} tasques fetes`;
    planMeter.querySelector(".progress-bar-fill").style.width = Math.round(100 * n / all.length) + "%";
    daysWrap.querySelectorAll(".day-card").forEach((c, i) => {
      const ts = PLAN_DAYS[i].tasks, k = ts.filter(t => planDone[t.id]).length;
      c.querySelector(".day-count").textContent = `${k}/${ts.length}`;
      c.classList.toggle("complete", k === ts.length);
    });
  }
  PLAN_DAYS.forEach(d => {
    const total = d.tasks.reduce((a, t) => a + parseInt(t.h, 10), 0);
    const card = el("div", "card day-card");
    card.appendChild(el("div", "day-head", `<div><span class="day-label">${d.day}</span><h3>${d.title}</h3></div><span class="day-count"></span>`));
    card.appendChild(el("p", "muted small", `🎯 ${d.goal} · ≈ ${Math.round(total / 6) / 10} h`));
    d.tasks.forEach(t => {
      const row = el("div", "plan-task" + (planDone[t.id] ? " done" : ""));
      row.innerHTML = `<label class="plan-check"><input type="checkbox"${planDone[t.id] ? " checked" : ""}></label>
        <div class="plan-body"><div><span class="plan-time">${t.h}</span> ${t.t}</div><div class="link-row">${linkBtns(t.links)}</div></div>`;
      row.querySelector("input").addEventListener("change", e => {
        if (e.target.checked) planDone[t.id] = true; else delete planDone[t.id];
        row.classList.toggle("done", e.target.checked);
        try { localStorage.setItem(PLAN_KEY, JSON.stringify(planDone)); } catch (err) { /* ignore */ }
        updatePlanMeter();
      });
      card.appendChild(row);
    });
    daysWrap.appendChild(card);
  });
  const tplWrap = document.getElementById("planTemplates");
  TEMPLATES.forEach(tp => tplWrap.appendChild(el("details", "theory-block", `<summary>${tp.t}</summary><div class="theory-content">${tp.b}</div>`)));
  const errList = document.getElementById("planErrors");
  COMMON_ERRORS.forEach(x => errList.appendChild(el("li", null, x)));
  updatePlanMeter();
  renderMath(document.getElementById("tab-pla"));

  /* ---------------- Simulacre d'examen (format 2025) ---------------- */
  const startExamBtn = document.getElementById("startExamBtn");
  const examIntro = document.getElementById("examIntro");
  const examRunner = document.getElementById("examRunner");
  const examResult = document.getElementById("examResult");
  let examTimerId = null;

  startExamBtn.addEventListener("click", () => {
    const minutes = Number(document.getElementById("examMinutes").value) || 90;
    examIntro.style.display = "none";
    examResult.style.display = "none";
    examRunner.style.display = "block";
    examRunner.innerHTML = "";
    let finished = false;

    const timerEl = el("div", "exam-timer", `⏱️ ${minutes}:00`);
    examRunner.appendChild(timerEl);
    let secondsLeft = minutes * 60;
    clearInterval(examTimerId);
    examTimerId = setInterval(() => {
      secondsLeft--;
      const m = Math.floor(secondsLeft / 60), s = secondsLeft % 60;
      timerEl.textContent = `⏱️ ${m}:${s < 10 ? "0" : ""}${s}`;
      timerEl.classList.toggle("low", secondsLeft < 300);
      if (secondsLeft <= 0) finalizeExam();
    }, 1000);

    examRunner.appendChild(el("h3", "exam-section-title", "Preguntes de Test (4 punts) — +0.8 / −0.2 / en blanc 0"));
    const mcPicked = shuffle(EXAM_TEST_BANK).slice(0, 5).map(q => prepMC(q, true));
    const mcBlocks = mcPicked.map((item, qi) => {
      const b = renderMC(item, qi + 1, "deferred");
      examRunner.appendChild(b);
      return b;
    });

    examRunner.appendChild(el("h3", "exam-section-title", "Problemes (3 + 3 punts)"));
    const probs = [
      { cat: "functionStudy", title: "Problema 1 (3 punts) — estudi de funció" },
      { cat: Math.random() < 0.5 ? "taylorProblem" : "absExtrema", title: "Problema 2 (3 punts)" }
    ].map(p => ({ ...p, ex: GEN_MAP[p.cat]() }));
    if (probs[1].cat === "absExtrema") probs[1].title += " — extrems absoluts";
    else probs[1].title += " — Taylor i fita de l'error";
    probs.forEach(pe => {
      const block = el("div", "mc-question");
      block.appendChild(el("div", "mc-stem", `<b>${pe.title}</b>`));
      const promptDiv = el("div", "exercise-prompt");
      insertPrompt(promptDiv, pe.ex.promptLatex);
      block.appendChild(promptDiv);
      block.appendChild(el("p", "exercise-instructions", pe.ex.instructions));
      const inputsDiv = el("div", "exercise-inputs");
      pe.inputs = buildInputs(inputsDiv, pe.ex);
      block.appendChild(inputsDiv);
      pe.block = block;
      examRunner.appendChild(block);
    });

    const finishExamBtn = el("button", "btn-primary", "Finalitza i corregeix");
    finishExamBtn.addEventListener("click", () => {
      if (confirm("Segur que vols entregar l'examen?")) finalizeExam();
    });
    examRunner.appendChild(finishExamBtn);

    function finalizeExam() {
      if (finished) return;
      finished = true;
      clearInterval(examTimerId);
      mcPicked.forEach((item, qi) => revealMC(item, mcBlocks[qi]));
      const s = scoreMC(mcPicked);

      let probPoints = 0;
      const probLines = probs.map(pe => {
        const g = gradeInputs(pe.ex, pe.inputs);
        const pts = 3 * g.nOk / g.n;
        probPoints += pts;
        recordResult(pe.cat, g.nOk === g.n);
        const solDiv = el("div", "solution-box", `$$${pe.ex.solutionLatex}$$`);
        solDiv.style.display = "block";
        pe.block.appendChild(solDiv);
        renderMath(solDiv);
        return `${pe.title.split(" — ")[0]}: <b>${pts.toFixed(2)} / 3</b> (${g.nOk}/${g.n} caselles)`;
      });

      examRunner.querySelectorAll("input").forEach(i => i.disabled = true);
      finishExamBtn.style.display = "none";
      timerEl.textContent = "⏱️ Examen entregat";

      const total = s.points + probPoints;
      if (progress._bestExam === undefined || total > progress._bestExam) progress._bestExam = total;
      saveProgress(progress);
      renderProgressSummary();

      examResult.style.display = "block";
      examResult.innerHTML = `
        <h3>Nota del simulacre: ${total.toFixed(2)} / 10</h3>
        <p>Test: <b>${s.points.toFixed(1)} / 4</b> (✅ ${s.ok} · ❌ ${s.bad} · ⚪ ${s.blank})</p>
        <p>${probLines.join("<br>")}</p>
        <p>${total >= 7 ? "Excel·lent, vas molt ben preparat/ada! 🏆" : total >= 5 ? "Aprovat! Repassa els punts febles abans de l'examen." : "Torna a la pestanya Exàmens reals i a Exercicis (tipus 2025) i repeteix el simulacre."}</p>
        <p class="muted">Recorda: a l'examen real els problemes es corregeixen pel <b>raonament escrit</b>, no només pel resultat.</p>`;
      const again = el("button", "btn-secondary", "🔁 Nou simulacre");
      again.addEventListener("click", () => { examIntro.style.display = "block"; examRunner.style.display = "none"; examResult.style.display = "none"; window.scrollTo({ top: 0 }); });
      examResult.appendChild(again);
      examResult.scrollIntoView({ behavior: "smooth" });
    }
  });

})();
