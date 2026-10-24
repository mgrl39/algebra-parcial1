/* ============================================================
   Àlgebra · Parcial 1 — Controlador de la interfície
   ============================================================ */
(function (global) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const VIEWS = ['inici', 'teoria', 'generador', 'examen', 'anteriors', 'formulari'];
  const TOPICS = ['complexos', 'polinomis', 'matrius', 'qüestions'];
  const VIEW_TITLES = {
    inici: 'Àlgebra · Primer Parcial — Teoria i generador',
    teoria: 'Teoria · Àlgebra · Primer Parcial',
    generador: 'Generador d\'exercicis · Àlgebra',
    examen: 'Parcial complet · Àlgebra',
    anteriors: 'Exàmens reals · Àlgebra',
    formulari: 'Formulari · Àlgebra'
  };
  const BADGES = {
    complexos: 'Complexos',
    polinomis: 'Polinomis',
    matrius: 'Matrius i sistemes'
  };
  const EXAM_SECONDS = 120 * 60;
  const STAT_KEY = 'algebra-parcial-generated';
  const THEME_KEY = 'algebra-parcial-theme';

  const state = {
    view: 'inici',
    theory: 'complexos',
    topic: 'complexos',
    complexMode: 'polar',
    matrixMode: 'mixed',
    quizMode: 'all',
    quizFilterUsed: null,
    exercise: null,
    quiz: null,
    quizRevealed: false,
    solutionVisible: false,
    exam: null,
    examSolutions: false,
    timer: { seconds: EXAM_SECONDS, running: false, id: null },
    angle: Math.PI / 3,
    past: null,
    pastRendered: null,
    renderedExercise: null,
    examPainted: null,
    examDelivered: false
  };

  let generatedCount = 0;
  let resizeTimer = null;

  /* ------------------------------------------------------------
     Utilitats generals
     ------------------------------------------------------------ */
  function safeGet(key, fallback) {
    try {
      const v = global.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try { global.localStorage.setItem(key, String(value)); } catch (e) { /* file:// o mode privat */ }
  }

  function readCount() {
    const n = Number(safeGet(STAT_KEY, '0'));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function paintCount() {
    const el = $('stat-generated');
    if (el) el.textContent = String(generatedCount);
  }

  function bumpCount(n) {
    generatedCount += n;
    safeSet(STAT_KEY, generatedCount);
    paintCount();
  }

  function routeHash(view, arg) {
    return '#' + view + (arg ? '/' + encodeURIComponent(arg) : '');
  }

  function updateHashSilently(view, arg) {
    const target = routeHash(view, arg);
    if (global.location.hash === target) return;
    try {
      global.history.replaceState(null, '', target);
    } catch (e) {
      global.location.hash = target;
    }
  }

  /* ------------------------------------------------------------
     Tema clar / fosc
     ------------------------------------------------------------ */
  function preferredTheme() {
    const stored = safeGet(THEME_KEY, '');
    if (stored === 'dark' || stored === 'light') return stored;
    return global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const icon = document.querySelector('#theme-toggle .theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    const btn = $('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Activa el tema clar' : 'Activa el tema fosc');
      btn.title = theme === 'dark' ? 'Tema clar' : 'Tema fosc';
    }
    if (persist) safeSet(THEME_KEY, theme);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.view === 'generador') drawExercisePlot();
      if (state.view === 'formulari') drawAngle();
      if (state.view === 'anteriors') global.Plots.redrawAll();
    }, 80);
  }

  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  }

  /* ------------------------------------------------------------
     Navegació
     ------------------------------------------------------------ */
  function parseRoute() {
    let raw = global.location.hash.replace(/^#\/?/, '');
    let view = 'inici';
    let arg = '';
    if (raw) {
      const parts = raw.split('/');
      try {
        view = decodeURIComponent(parts[0] || 'inici');
        arg = decodeURIComponent(parts.slice(1).join('/') || '');
      } catch (e) {
        view = 'inici';
        arg = '';
      }
    }
    if (VIEWS.indexOf(view) === -1) { view = 'inici'; arg = ''; }
    return { view, arg };
  }

  function navigate(view, opts) {
    opts = opts || {};
    if (!VIEWS.includes(view)) view = 'inici';
    if (view === 'teoria' && opts.theory) state.theory = opts.theory;
    if (view === 'generador' && opts.topic) {
      if (TOPICS.includes(opts.topic) && state.topic !== opts.topic) {
        state.topic = opts.topic;
        state.exercise = null;
        state.quiz = null;
        state.solutionVisible = false;
        state.quizRevealed = false;
      }
    }
    const arg = view === 'teoria' ? state.theory
      : view === 'generador' ? state.topic
        : view === 'anteriors' ? (state.past || '') : '';
    const target = routeHash(view, arg);
    if (global.location.hash === target) {
      handleRoute();
    } else {
      global.location.hash = target;
    }
  }

  function handleRoute() {
    const { view, arg } = parseRoute();
    if (view === 'teoria' && arg && global.TheoryContent.getTheory()[arg]) {
      state.theory = arg;
    }
    if (view === 'generador' && TOPICS.includes(arg)) {
      state.topic = arg;
    }
    if (view === 'anteriors' && arg && global.PastExams.list.some(e => e.id === arg)) {
      state.past = arg;
    }
    if (state.view === 'examen' && view !== 'examen') pauseTimer();
    state.view = view;
    showView(view);
  }

  function showView(view) {
    VIEWS.forEach(v => {
      const section = $('view-' + v);
      if (section) section.hidden = v !== view;
    });
    $$('.nav-link').forEach(btn => {
      const active = btn.dataset.view === view;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    document.title = VIEW_TITLES[view] || VIEW_TITLES.inici;

    if (view === 'teoria') renderTheory();
    if (view === 'generador') renderGenerator();
    if (view === 'examen') ensureExam();
    if (view === 'anteriors') renderPast();
    if (view === 'formulari') {
      renderFormulari();
      requestAnimationFrame(drawAngle);
    }
    global.scrollTo(0, 0);
  }

  function selectTheory(id) {
    if (!global.TheoryContent.getTheory()[id]) return;
    state.theory = id;
    renderTheory();
    updateHashSilently('teoria', id);
  }

  function renderTheory() {
    const section = global.TheoryContent.getSection(state.theory);
    const article = $('theory-article');
    if (article) {
      article.innerHTML =
        '<h2>' + section.title + '</h2>' +
        '<p class="muted theory-subtitle">' + section.subtitle + '</p>' +
        section.html;
    }
    $$('.theory-tab').forEach(tab => {
      const active = tab.dataset.theory === state.theory;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  /* ------------------------------------------------------------
     Generador
     ------------------------------------------------------------ */
  function setActiveChip(groupId, mode) {
    const group = $(groupId);
    if (!group) return;
    $$('.mode-chip', group).forEach(chip => chip.classList.toggle('active', chip.dataset.mode === mode));
  }

  function syncGeneratorTabs() {
    $$('.gen-tab').forEach(tab => {
      const active = tab.dataset.topic === state.topic;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    setActiveChip('complex-modes', state.complexMode);
    setActiveChip('matrix-modes', state.matrixMode);
    setActiveChip('quiz-modes', state.quizMode);

    const isQuiz = state.topic === 'qüestions';
    const complex = $('complex-modes');
    const matrix = $('matrix-modes');
    const quiz = $('quiz-modes');
    if (complex) complex.hidden = state.topic !== 'complexos';
    if (matrix) matrix.hidden = state.topic !== 'matrius';
    if (quiz) quiz.hidden = !isQuiz;

    const toolbar = $('gen-toolbar');
    if (toolbar) toolbar.hidden = state.topic === 'polinomis';

    const exercise = $('generator-exercise');
    const quizPanel = $('generator-quiz');
    if (exercise) exercise.hidden = isQuiz;
    if (quizPanel) quizPanel.hidden = !isQuiz;

    const newBtn = $('btn-new-exercise');
    if (newBtn) newBtn.textContent = isQuiz ? '↻ Noves qüestions' : '↻ Nou exercici';
  }

  function renderGenerator() {
    syncGeneratorTabs();
    if (state.topic === 'qüestions') {
      if (!state.quiz || state.quizFilterUsed !== state.quizMode) generateQuiz(true);
      return;
    }
    if (!state.exercise || state.exercise.topic !== state.topic) {
      generateExercise(true);
    } else {
      renderExercise(state.exercise);
    }
  }

  function selectTopic(topic) {
    if (!TOPICS.includes(topic)) return;
    if (state.topic !== topic) {
      state.topic = topic;
      state.exercise = null;
      state.quiz = null;
      state.solutionVisible = false;
      state.quizRevealed = false;
    }
    renderGenerator();
    updateHashSilently('generador', topic);
  }

  function generateExercise(countIt) {
    if (state.topic === 'qüestions') {
      generateQuiz(countIt);
      return;
    }
    let ex = null;
    if (state.topic === 'complexos') {
      ex = global.ComplexGen.generate(state.complexMode);
    } else if (state.topic === 'polinomis') {
      ex = global.PolyGen.generate();
    } else if (state.topic === 'matrius') {
      const opts = state.matrixMode === 'numeric'
        ? { param: false }
        : state.matrixMode === 'param'
          ? { param: true }
          : {};
      ex = global.MatrixGen.generate(null, opts);
    }
    if (!ex) return;
    state.exercise = ex;
    state.solutionVisible = false;
    renderExercise(ex);
    if (countIt) bumpCount(1);
  }

  function renderExercise(ex) {
    const badge = $('exercise-badge');
    const title = $('exercise-title');
    const statement = $('exercise-statement');
    const solution = $('exercise-solution');
    const plotBox = $('exercise-plot');
    const body = document.querySelector('#generator-exercise .exercise-body');

    if (badge) badge.textContent = BADGES[ex.topic] || 'Exercici';
    if (title) title.textContent = ex.title || '';
    const fresh = state.renderedExercise !== ex;
    state.renderedExercise = ex;
    if (statement && fresh) {
      const spec = global.PracticeSpecs.fromGenerated(ex, { title: 'Resol-ho tu' });
      statement.innerHTML = (ex.statementHTML || '') + (spec ? global.Practice.render(spec) : '');
    }
    if (solution) {
      solution.innerHTML = ex.solutionHTML || '';
      solution.hidden = !state.solutionVisible;
    }
    const toggle = $('btn-toggle-solution');
    if (toggle) toggle.textContent = state.solutionVisible ? 'Amaga la solució' : 'Mostra tota la solució';

    // El dibuix revela les arrels: només es mostra amb la solució.
    if (state.solutionVisible && ex.plot && ex.plot.points && ex.plot.points.length) {
      if (plotBox) plotBox.hidden = false;
      if (body) body.classList.remove('no-plot');
      const legend = $('plot-legend');
      if (legend) {
        legend.innerHTML = ex.plot.points.map(p =>
          '<span class="legend-item"><span class="legend-dot" style="background:' +
          (p.color || 'var(--c1)') + '"></span>' + p.label + '</span>'
        ).join('');
      }
      requestAnimationFrame(() => requestAnimationFrame(drawExercisePlot));
    } else {
      if (plotBox) plotBox.hidden = true;
      if (body) body.classList.add('no-plot');
    }
  }

  function drawExercisePlot() {
    const ex = state.exercise;
    if (!ex || !ex.plot) return;
    const plotBox = $('exercise-plot');
    if (plotBox && plotBox.hidden) return;
    if (state.view !== 'generador') return;
    const canvas = $('complex-canvas');
    if (!canvas) return;
    global.Plots.drawComplexPlane(canvas, ex.plot.points, { unit: !!ex.plot.unit });
  }

  function toggleSolution() {
    state.solutionVisible = !state.solutionVisible;
    if (state.exercise) renderExercise(state.exercise);
  }

  /* ------------------------------------------------------------
     Qüestionari de teoria
     ------------------------------------------------------------ */
  function generateQuiz(countIt) {
    const filter = state.quizMode === 'all' ? null : state.quizMode;
    const set = global.TheoryGen.generateSet(4, null, filter);
    state.quiz = set;
    state.quizFilterUsed = state.quizMode;
    state.quizRevealed = false;
    const list = $('quiz-list');
    if (list) {
      list.innerHTML = set.map((q, i) =>
        '<div class="quiz-item">' +
          '<div class="q-head">' +
            '<span class="q-letter">' + String.fromCharCode(97 + i) + ')</span>' +
            '<span class="q-text">' + q.statementHTML + '</span>' +
            '<span class="muted" style="font-size:.68rem;letter-spacing:.04em;text-transform:uppercase">' + q.topic + '</span>' +
          '</div>' +
          '<div class="tf-actions" data-answer="' + q.isTrue + '">' +
            '<button type="button" class="btn tiny tf" data-val="true">Certa</button>' +
            '<button type="button" class="btn tiny tf" data-val="false">Falsa</button>' +
          '</div>' +
          '<div class="theory-feedback" hidden></div>' +
          '<div class="theory-explanation" hidden>' + q.explanationHTML + '</div>' +
        '</div>'
      ).join('');
    }
    const reveal = $('btn-reveal-quiz');
    if (reveal) reveal.textContent = 'Mostra solucions';
    if (countIt) bumpCount(1);
  }

  function revealQuiz(force) {
    state.quizRevealed = typeof force === 'boolean' ? force : !state.quizRevealed;
    const list = $('quiz-list');
    if (!list) return;
    $$('.quiz-item', list).forEach(item => {
      const explanation = item.querySelector('.theory-explanation');
      if (explanation) explanation.hidden = !state.quizRevealed;
      const actions = item.querySelector('.tf-actions');
      const incorrect = item.querySelector('.correct-answer');
      if (incorrect) incorrect.classList.remove('correct-answer');
      if (state.quizRevealed && actions) {
        const correctVal = actions.dataset.answer === 'true';
        const correctBtn = actions.querySelector('[data-val="' + correctVal + '"]');
        if (correctBtn) correctBtn.classList.add('correct-answer');
        const feedback = item.querySelector('.theory-feedback');
        if (feedback && !feedback.textContent) {
          feedback.hidden = false;
          feedback.className = 'theory-feedback';
          feedback.textContent = 'Resposta correcta: ' + (correctVal ? 'CERTA' : 'FALSA') + '.';
        }
      } else if (actions) {
        const feedback = item.querySelector('.theory-feedback');
        if (feedback && feedback.textContent.indexOf('Resposta correcta:') === 0) {
          feedback.hidden = true;
          feedback.textContent = '';
          feedback.className = 'theory-feedback';
        }
      }
    });
    const btn = $('btn-reveal-quiz');
    if (btn) btn.textContent = state.quizRevealed ? 'Amaga solucions' : 'Mostra solucions';
  }

  function answerQuiz(e) {
    const btn = e.target.closest('#quiz-list .tf');
    if (!btn) return;
    const actions = btn.closest('.tf-actions');
    const item = btn.closest('.quiz-item');
    if (!actions || !item) return;
    const selected = btn.dataset.val === 'true';
    const correct = actions.dataset.answer === 'true';
    $$('.tf', actions).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const feedback = item.querySelector('.theory-feedback');
    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'theory-feedback ' + (selected === correct ? 'good' : 'bad');
      feedback.textContent = selected === correct
        ? 'Correcte.'
        : 'Incorrecte. Revisa l\'explicació.';
    }
    const explanation = item.querySelector('.theory-explanation');
    if (explanation) explanation.hidden = false;
  }

  /* ------------------------------------------------------------
     Examen complet
     ------------------------------------------------------------ */
  function ensureExam() {
    if (!state.exam) {
      newExam(false);
    } else if (state.examPainted !== state.exam) {
      paintExam();
    }
  }

  function newExam(countIt) {
    state.exam = global.ExamGen.generate();
    state.examSolutions = false;
    state.examDelivered = false;
    paintExam();
    resetTimer();
    if (countIt) bumpCount(3);
  }

  function paintExam() {
    const paper = $('exam-paper');
    const solutions = $('exam-solutions');
    const btn = $('btn-show-exam-solutions');
    if (!state.exam) return;
    if (paper) {
      paper.innerHTML = state.exam.statementHTML;
      const fill = (slot, ex) => {
        const el = paper.querySelector('.practice-slot[data-slot="' + slot + '"]');
        const spec = global.PracticeSpecs.fromGenerated(ex, { exam: true, title: 'Les teves respostes' });
        if (el && spec) el.innerHTML = global.Practice.render(spec);
      };
      fill('poly', state.exam.poly);
      fill('mat', state.exam.mat);
    }
    state.examPainted = state.exam;
    paintGrade();
    if (solutions) {
      solutions.innerHTML = state.exam.solutionHTML;
      solutions.hidden = !state.examSolutions;
    }
    if (btn) btn.textContent = state.examSolutions ? 'Amaga solucions' : 'Mostra solucions';
    syncExamTheoryReveal();
  }

  function setExamSolutions(show) {
    state.examSolutions = show;
    const solutions = $('exam-solutions');
    if (solutions) solutions.hidden = !show;
    const btn = $('btn-show-exam-solutions');
    if (btn) btn.textContent = show ? 'Amaga solucions' : 'Mostra solucions';
    syncExamTheoryReveal();
  }

  function syncExamTheoryReveal() {
    const paper = $('exam-paper');
    if (!paper) return;
    $$('.exam-theory-item', paper).forEach(item => {
      const explanation = item.querySelector('.theory-explanation');
      const reveal = state.examSolutions || state.examDelivered;
      if (explanation) explanation.hidden = !reveal;
      const actions = item.querySelector('.tf-actions');
      if (actions) {
        const old = actions.querySelector('.correct-answer');
        if (old) old.classList.remove('correct-answer');
        if (reveal) {
          const correctVal = actions.dataset.answer === 'true';
          const correctBtn = actions.querySelector('[data-val="' + correctVal + '"]');
          if (correctBtn) correctBtn.classList.add('correct-answer');
        }
      }
      updateExamFeedback(item);
    });
  }

  function updateExamFeedback(item) {
    const actions = item.querySelector('.tf-actions');
    const feedback = item.querySelector('.theory-feedback');
    if (!actions || !feedback) return;
    const selected = actions.querySelector('.tf.selected');
    if (!(state.examSolutions || state.examDelivered) || !selected) {
      feedback.hidden = true;
      feedback.textContent = '';
      feedback.className = 'theory-feedback';
      return;
    }
    const selectedVal = selected.dataset.val === 'true';
    const correct = actions.dataset.answer === 'true';
    feedback.hidden = false;
    feedback.className = 'theory-feedback ' + (selectedVal === correct ? 'good' : 'bad');
    feedback.textContent = selectedVal === correct ? 'Correcte.' : 'Incorrecte.';
  }

  // Nota del simulacre: 4 + 4 punts repartits per apartats i 0,5 per qüestió.
  function examGrade() {
    const paper = $('exam-paper');
    const blocks = $$('.practice', paper).map(root => global.Practice.score(root));
    const items = $$('.exam-theory-item', paper);
    const theoryOk = items.filter(item => {
      const actions = item.querySelector('.tf-actions');
      const sel = actions && actions.querySelector('.tf.selected');
      return sel && (sel.dataset.val === 'true') === (actions.dataset.answer === 'true');
    }).length;
    const exPts = blocks.map(b => b.total ? 4 * b.correct / b.total : 0);
    const total = exPts.reduce((a, b) => a + b, 0) + 0.5 * theoryOk;
    return { blocks, exPts, theoryOk, theoryTotal: items.length, total };
  }

  function paintGrade() {
    const box = $('exam-grade');
    if (!box) return;
    box.hidden = !state.examDelivered;
    const btn = $('btn-deliver-exam');
    if (btn) btn.disabled = state.examDelivered;
    if (!state.examDelivered) return;
    const g = examGrade();
    const fmt = x => (Math.round(x * 100) / 100).toLocaleString('ca-ES');
    box.innerHTML = `
      <div class="grade-main"><span>Nota</span><strong>${fmt(g.total)}</strong><span>/ 10</span></div>
      <ul class="grade-list">
        <li>Exercici 1: ${g.blocks[0].correct}/${g.blocks[0].total} apartats → <strong>${fmt(g.exPts[0])}</strong> / 4</li>
        <li>Exercici 2: ${g.blocks[1].correct}/${g.blocks[1].total} apartats → <strong>${fmt(g.exPts[1])}</strong> / 4</li>
        <li>Qüestions: ${g.theoryOk}/${g.theoryTotal} → <strong>${fmt(0.5 * g.theoryOk)}</strong> / 2</li>
      </ul>
      <p class="muted">Correcció automàtica de les respostes finals (a l'examen real també compten la justificació i els passos). Els apartats de dibuix, avalua-te'ls tu amb els botons: la nota s'actualitza. Ara pots obrir la solució de cada apartat.</p>`;
  }

  function deliverExam() {
    if (!state.exam || state.examDelivered) return;
    pauseTimer();
    state.examDelivered = true;
    $$('#exam-paper .practice').forEach(root => global.Practice.checkAll(root));
    syncExamTheoryReveal();
    paintGrade();
    const box = $('exam-grade');
    if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function answerExamTheory(e) {
    const btn = e.target.closest('#exam-paper .tf');
    if (!btn) return;
    const actions = btn.closest('.tf-actions');
    const item = btn.closest('.exam-theory-item');
    if (!actions || !item) return;
    $$('.tf', actions).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateExamFeedback(item);
    if (state.examDelivered) paintGrade();
  }

  /* ------------------------------------------------------------
     Exàmens reals
     ------------------------------------------------------------ */
  function pastExam() {
    const list = global.PastExams.list;
    return list.find(e => e.id === state.past) || list[0];
  }

  function renderPast() {
    const exam = pastExam();
    state.past = exam.id;
    if (state.pastRendered === exam.id) return;
    state.pastRendered = exam.id;
    const years = $('past-years');
    if (years) {
      years.innerHTML = '<span class="toolbar-label">Curs:</span>' + global.PastExams.list.map(e =>
        '<button type="button" class="mode-chip' + (e.id === exam.id ? ' active' : '') + '" data-past="' + e.id + '">' + e.course + '</button>'
      ).join('');
    }
    const paper = $('past-paper');
    if (!paper) return;
    const exercises = exam.exercises.map((ex, i) => `
      <section class="exam-exercise">
        <h2>${i + 1}.– <span class="pts">(${ex.pts} punts)</span> ${ex.title}</h2>
        ${ex.statementHTML}
        ${global.Practice.render(global.PracticeSpecs.build(ex.practice, ex.solutionHTML, { plot: ex.plot }))}
        <div class="past-tools">
          <button type="button" class="btn small ghost past-sol-toggle" data-ex="${i}">Mostra tota la solució</button>
        </div>
        <div class="past-solution" data-ex="${i}" hidden>
          ${ex.plot ? '<canvas class="past-canvas" data-plot="complex" height="300"></canvas><div class="plot-legend">' +
            ex.plot.map(p => '<span class="legend-item"><span class="legend-dot" style="background:' + p.color + '"></span>' + p.label + '</span>').join('') +
            '</div>' : ''}
          ${ex.solutionHTML}
        </div>
      </section>`).join('');
    const yesNo = exam.theoryYesNo;
    const theory = exam.theory.map((q, i) => `
      <div class="exam-theory-item">
        <div class="exam-theory-head"><span class="q-letter">${String.fromCharCode(97 + i)})</span> <span>${q.statementHTML}</span></div>
        <div class="tf-actions" data-answer="${q.isTrue}">
          <button type="button" class="btn tiny tf" data-val="true">${yesNo ? 'Sí' : 'Certa'}</button>
          <button type="button" class="btn tiny tf" data-val="false">${yesNo ? 'No' : 'Falsa'}</button>
        </div>
        <div class="theory-feedback" hidden></div>
        <div class="theory-explanation" hidden>${q.explanationHTML}</div>
      </div>`).join('');
    paper.innerHTML = `
      <div class="exam-paper-head">
        <div class="exam-meta">
          <div><strong>Àlgebra</strong> · Grau en Enginyeria Informàtica</div>
          <div class="muted"></div>
        </div>
        <div class="exam-meta right">
          <div>Curs ${exam.course}</div>
          <div class="muted">${exam.date}</div>
        </div>
      </div>
      <div class="exam-title">PRIMER PARCIAL</div>
      ${exam.note ? '<p class="past-note">' + exam.note + '</p>' : ''}
      ${exercises}
      <section class="exam-exercise">
        <h2>${exam.exercises.length + 1}.– ${exam.theoryTitle || 'Qüestions'}</h2>
        ${exam.theoryIntro ? '<p>' + exam.theoryIntro + '</p>' : ''}
        <p class="muted">Per a cadascuna de les afirmacions següents, determineu si és certa o falsa i justifiqueu-ho. Tria la teva resposta per veure la solució.</p>
        ${theory}
      </section>`;
  }

  function selectPast(id) {
    state.past = id;
    renderPast();
    updateHashSilently('anteriors', id);
  }

  function handlePastClick(e) {
    const toggle = e.target.closest('.past-sol-toggle');
    if (toggle) {
      const box = document.querySelector('.past-solution[data-ex="' + toggle.dataset.ex + '"]');
      if (!box) return;
      box.hidden = !box.hidden;
      toggle.textContent = box.hidden ? 'Mostra tota la solució' : 'Amaga la solució';
      const canvas = box.querySelector('canvas');
      const ex = pastExam().exercises[Number(toggle.dataset.ex)];
      if (!box.hidden && canvas && ex.plot) {
        global.Plots.drawComplexPlane(canvas, ex.plot, {});
      }
      return;
    }
    const btn = e.target.closest('.tf');
    if (!btn) return;
    const actions = btn.closest('.tf-actions');
    const item = btn.closest('.exam-theory-item');
    const correct = actions.dataset.answer === 'true';
    const selected = btn.dataset.val === 'true';
    $$('.tf', actions).forEach(b => b.classList.remove('selected', 'correct-answer'));
    btn.classList.add('selected');
    actions.querySelector('[data-val="' + correct + '"]').classList.add('correct-answer');
    const feedback = item.querySelector('.theory-feedback');
    feedback.hidden = false;
    feedback.className = 'theory-feedback ' + (selected === correct ? 'good' : 'bad');
    feedback.textContent = selected === correct ? 'Correcte.' : 'Incorrecte. Llegeix la justificació.';
    item.querySelector('.theory-explanation').hidden = false;
  }

  function formatTimer(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  function paintTimer() {
    const value = $('timer-value');
    if (value) value.textContent = formatTimer(state.timer.seconds);
    const toggle = $('timer-toggle');
    if (toggle) {
      toggle.textContent = state.timer.running ? '❚❚' : (state.timer.seconds <= 0 ? '↺' : '▶');
      toggle.setAttribute('aria-label', state.timer.running ? 'Pausar temporitzador' : 'Iniciar temporitzador');
    }
    const timer = $('exam-timer');
    if (timer) timer.title = state.timer.seconds <= 0 ? 'Temps esgotat' : 'Temporitzador de l\'examen';
  }

  function tickTimer() {
    if (!state.timer.running) return;
    state.timer.seconds -= 1;
    if (state.timer.seconds <= 0) {
      state.timer.seconds = 0;
      state.timer.running = false;
      if (state.timer.id) {
        clearInterval(state.timer.id);
        state.timer.id = null;
      }
    }
    paintTimer();
  }

  function startTimer() {
    if (state.timer.running) return;
    if (state.timer.seconds <= 0) state.timer.seconds = EXAM_SECONDS;
    state.timer.running = true;
    if (state.timer.id) clearInterval(state.timer.id);
    state.timer.id = setInterval(tickTimer, 1000);
    paintTimer();
  }

  function pauseTimer() {
    state.timer.running = false;
    if (state.timer.id) {
      clearInterval(state.timer.id);
      state.timer.id = null;
    }
    paintTimer();
  }

  function resetTimer() {
    pauseTimer();
    state.timer.seconds = EXAM_SECONDS;
    paintTimer();
  }

  /* ------------------------------------------------------------
     Formulari: 16 angles privilegiats
     ------------------------------------------------------------ */
  const PI = Math.PI;
  const fr = (a, b) => '<span class="frac"><span>' + a + '</span><span>' + b + '</span></span>';
  const neg = (s) => '−' + s;
  const r2 = fr('√2', '2');
  const r3 = fr('√3', '2');

  const ANGLES = [
    { t: 0, label: '0', cos: '1', sin: '0', exp: '1' },
    { t: PI / 6, label: 'π/6', cos: r3, sin: fr('1', '2'), exp: r3 + ' + ' + fr('1', '2') + 'i' },
    { t: PI / 4, label: 'π/4', cos: r2, sin: r2, exp: r2 + ' + ' + r2 + 'i' },
    { t: PI / 3, label: 'π/3', cos: fr('1', '2'), sin: r3, exp: fr('1', '2') + ' + ' + r3 + 'i' },
    { t: PI / 2, label: 'π/2', cos: '0', sin: '1', exp: 'i' },
    { t: 2 * PI / 3, label: '2π/3', cos: neg(fr('1', '2')), sin: r3, exp: neg(fr('1', '2')) + ' + ' + r3 + 'i' },
    { t: 3 * PI / 4, label: '3π/4', cos: neg(r2), sin: r2, exp: neg(r2) + ' + ' + r2 + 'i' },
    { t: 5 * PI / 6, label: '5π/6', cos: neg(r3), sin: fr('1', '2'), exp: neg(r3) + ' + ' + fr('1', '2') + 'i' },
    { t: PI, label: 'π', cos: '−1', sin: '0', exp: '−1' },
    { t: 7 * PI / 6, label: '7π/6', cos: neg(r3), sin: neg(fr('1', '2')), exp: neg(r3) + ' − ' + fr('1', '2') + 'i' },
    { t: 5 * PI / 4, label: '5π/4', cos: neg(r2), sin: neg(r2), exp: neg(r2) + ' − ' + r2 + 'i' },
    { t: 4 * PI / 3, label: '4π/3', cos: neg(fr('1', '2')), sin: neg(r3), exp: neg(fr('1', '2')) + ' − ' + r3 + 'i' },
    { t: 3 * PI / 2, label: '3π/2', cos: '0', sin: '−1', exp: '−i' },
    { t: 5 * PI / 3, label: '5π/3', cos: fr('1', '2'), sin: neg(r3), exp: fr('1', '2') + ' − ' + r3 + 'i' },
    { t: 7 * PI / 4, label: '7π/4', cos: r2, sin: neg(r2), exp: r2 + ' − ' + r2 + 'i' },
    { t: 11 * PI / 6, label: '11π/6', cos: r3, sin: neg(fr('1', '2')), exp: r3 + ' − ' + fr('1', '2') + 'i' }
  ];

  let formulariRendered = false;

  function renderFormulari() {
    if (formulariRendered) return;
    formulariRendered = true;

    const table = $('angle-table');
    if (table) {
      const rows = ANGLES.map(a =>
        '<tr data-angle="' + a.t + '" title="Veure aquest angle al cercle">' +
          '<td>' + a.label + '</td>' +
          '<td>' + a.cos + '</td>' +
          '<td>' + a.sin + '</td>' +
          '<td>' + a.exp + '</td>' +
        '</tr>'
      ).join('');
      table.innerHTML =
        '<table class="angle-table">' +
          '<thead><tr><th>θ</th><th>cos θ</th><th>sin θ</th><th>e<sup>iθ</sup></th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';
    }

    const buttons = $('angle-buttons');
    if (buttons) {
      buttons.innerHTML = ANGLES.map((a, i) =>
        '<button type="button" data-angle-index="' + i + '" title="Dibuixa θ = ' + a.label + '">' + a.label + '</button>'
      ).join('');
    }
    syncAngleUI();
  }

  function selectAngle(theta) {
    const known = ANGLES.find(a => Math.abs(a.t - theta) < 1e-9);
    state.angle = known ? known.t : theta;
    syncAngleUI();
    drawAngle();
  }

  function syncAngleUI() {
    const buttons = $('angle-buttons');
    if (buttons) {
      $$('button', buttons).forEach((b, i) => {
        b.classList.toggle('active', ANGLES[i] && Math.abs(ANGLES[i].t - state.angle) < 1e-9);
      });
    }
    const rows = $$('#angle-table tr[data-angle]');
    rows.forEach(row => {
      row.style.background = Math.abs(Number(row.dataset.angle) - state.angle) < 1e-9
        ? 'color-mix(in srgb, var(--primary-soft) 55%, transparent)'
        : '';
    });
  }

  function drawAngle() {
    const canvas = $('angle-canvas');
    if (!canvas) return;
    global.Plots.drawAngleCircle(canvas, state.angle);
  }

  /* ------------------------------------------------------------
     Esdeveniments
     ------------------------------------------------------------ */
  function bind() {
    const themeBtn = $('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    $$('.nav-link, .footer-links button').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.view));
    });

    document.addEventListener('click', e => {
      const viewLink = e.target.closest('a[data-view-link]');
      if (viewLink) {
        e.preventDefault();
        navigate(viewLink.dataset.viewLink, {
          theory: viewLink.dataset.theory,
          topic: viewLink.dataset.topic
        });
        return;
      }
      const go = e.target.closest('[data-go]');
      if (go) {
        navigate(go.dataset.go, {
          theory: go.dataset.theory,
          topic: go.dataset.topic
        });
      }
    });

    $$('.theory-tab').forEach(tab => {
      tab.addEventListener('click', () => selectTheory(tab.dataset.theory));
    });

    $$('.gen-tab').forEach(tab => {
      tab.addEventListener('click', () => selectTopic(tab.dataset.topic));
    });

    const complexModes = $('complex-modes');
    if (complexModes) {
      complexModes.addEventListener('click', e => {
        const chip = e.target.closest('.mode-chip');
        if (!chip) return;
        if (state.complexMode === chip.dataset.mode) return;
        state.complexMode = chip.dataset.mode;
        setActiveChip('complex-modes', state.complexMode);
        state.exercise = null;
        state.solutionVisible = false;
        generateExercise(true);
      });
    }

    const matrixModes = $('matrix-modes');
    if (matrixModes) {
      matrixModes.addEventListener('click', e => {
        const chip = e.target.closest('.mode-chip');
        if (!chip) return;
        if (state.matrixMode === chip.dataset.mode) return;
        state.matrixMode = chip.dataset.mode;
        setActiveChip('matrix-modes', state.matrixMode);
        state.exercise = null;
        state.solutionVisible = false;
        generateExercise(true);
      });
    }

    const quizModes = $('quiz-modes');
    if (quizModes) {
      quizModes.addEventListener('click', e => {
        const chip = e.target.closest('.mode-chip');
        if (!chip) return;
        if (state.quizMode === chip.dataset.mode) return;
        state.quizMode = chip.dataset.mode;
        setActiveChip('quiz-modes', state.quizMode);
        state.quiz = null;
        state.quizRevealed = false;
        generateQuiz(true);
      });
    }

    const newExercise = $('btn-new-exercise');
    if (newExercise) {
      newExercise.addEventListener('click', () => {
        if (state.topic === 'qüestions') generateQuiz(true);
        else generateExercise(true);
      });
    }

    const another = $('btn-another');
    if (another) another.addEventListener('click', () => generateExercise(true));

    const toggle = $('btn-toggle-solution');
    if (toggle) toggle.addEventListener('click', toggleSolution);

    const reveal = $('btn-reveal-quiz');
    if (reveal) reveal.addEventListener('click', () => revealQuiz());

    const newQuiz = $('btn-new-quiz');
    if (newQuiz) newQuiz.addEventListener('click', () => generateQuiz(true));

    const quizList = $('quiz-list');
    if (quizList) quizList.addEventListener('click', answerQuiz);

    const newExamBtn = $('btn-new-exam');
    if (newExamBtn) newExamBtn.addEventListener('click', () => newExam(true));

    const examSolutions = $('btn-show-exam-solutions');
    if (examSolutions) {
      examSolutions.addEventListener('click', () => setExamSolutions(!state.examSolutions));
    }

    const printExam = $('btn-print-exam');
    if (printExam) {
      printExam.addEventListener('click', () => {
        ensureExam();
        global.print();
      });
    }

    const examPaper = $('exam-paper');
    if (examPaper) {
      examPaper.addEventListener('click', answerExamTheory);
      examPaper.addEventListener('practice:change', paintGrade);
    }
    const deliver = $('btn-deliver-exam');
    if (deliver) deliver.addEventListener('click', deliverExam);

    const timerToggle = $('timer-toggle');
    if (timerToggle) {
      timerToggle.addEventListener('click', () => {
        if (state.timer.running) pauseTimer();
        else startTimer();
      });
    }
    const pastYears = $('past-years');
    if (pastYears) {
      pastYears.addEventListener('click', e => {
        const chip = e.target.closest('[data-past]');
        if (chip) selectPast(chip.dataset.past);
      });
    }
    const pastPaper = $('past-paper');
    if (pastPaper) pastPaper.addEventListener('click', handlePastClick);

    const timerReset = $('timer-reset');
    if (timerReset) timerReset.addEventListener('click', resetTimer);

    const angleButtons = $('angle-buttons');
    if (angleButtons) {
      angleButtons.addEventListener('click', e => {
        const btn = e.target.closest('button[data-angle-index]');
        if (!btn) return;
        const angle = ANGLES[Number(btn.dataset.angleIndex)];
        if (angle) selectAngle(angle.t);
      });
    }
    const angleTable = $('angle-table');
    if (angleTable) {
      angleTable.addEventListener('click', e => {
        const row = e.target.closest('tr[data-angle]');
        if (!row) return;
        selectAngle(Number(row.dataset.angle));
      });
    }

    global.addEventListener('hashchange', handleRoute);
    global.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (state.view === 'generador') drawExercisePlot();
        if (state.view === 'formulari') drawAngle();
      }, 130);
    });
  }

  function init() {
    generatedCount = readCount();
    paintCount();
    applyTheme(preferredTheme(), false);
    bind();
    paintTimer();
    handleRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
