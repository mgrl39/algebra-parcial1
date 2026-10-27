/* ============================================================
   Àlgebra · Parcial 1 — Dibuix del pla complex
   ============================================================ */
(function (global) {
  'use strict';

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function resize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, rect.width);
    const h = Math.max(240, rect.height);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h, ctx };
  }

  function arrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1), size = 7;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(ang - 0.4), y2 - size * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - size * Math.cos(ang + 0.4), y2 - size * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function drawComplexPlane(canvas, points, opts) {
    if (!canvas) return;
    opts = opts || {};
    const { w, h, ctx } = resize(canvas);
    canvas._plotData = { points, opts };

    const bg = cssVar('--plot-bg', '#ffffff');
    const grid = cssVar('--plot-grid', '#e6e8ef');
    const axis = cssVar('--plot-axis', '#59617a');
    const text = cssVar('--plot-text', '#243049');
    const muted = cssVar('--muted', '#7a8194');

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    let maxAbs = opts.unit ? 1.25 : 1.25;
    for (const p of points || []) {
      const z = p.z || p;
      if (!z || !Number.isFinite(z.re) || !Number.isFinite(z.im)) continue;
      maxAbs = Math.max(maxAbs, Math.abs(z.re), Math.abs(z.im));
    }
    const bound = Math.max(1.6, Math.ceil(maxAbs * 1.15 * 2) / 2);
    const margin = 34;
    const scale = Math.min((w - 2 * margin) / (2 * bound), (h - 2 * margin) / (2 * bound));
    const cx = w / 2, cy = h / 2;
    const X = re => cx + re * scale;
    const Y = im => cy - im * scale;

    // Choose a readable tick spacing (about 8 intervals across the axis).
    const rawStep = (2 * bound) / 8;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    const step = nice * magnitude;

    // grid
    const maxTick = Math.floor(bound / step + 1e-9) * step;
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    for (let k = -maxTick; k <= maxTick + 1e-9; k += step) {
      if (Math.abs(k) < 1e-9) continue;
      ctx.beginPath(); ctx.moveTo(X(k), margin); ctx.lineTo(X(k), h - margin); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(margin, Y(k)); ctx.lineTo(w - margin, Y(k)); ctx.stroke();
    }

    // axes
    arrow(ctx, margin, cy, w - margin, cy, axis);
    arrow(ctx, cx, h - margin, cx, margin, axis);

    ctx.fillStyle = muted;
    ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('Re', w - margin - 2, cy + 7);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('Im', cx + 8, margin - 2);

    // tick labels
    ctx.fillStyle = muted; ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let k = -maxTick; k <= maxTick + 1e-9; k += step) {
      if (Math.abs(k) < 1e-9) continue;
      ctx.fillText(String(Number(k.toFixed(6))), X(k), cy + 5);
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let k = -maxTick; k <= maxTick + 1e-9; k += step) {
      if (Math.abs(k) < 1e-9) continue;
      ctx.fillText(String(Number(k.toFixed(6))), cx - 5, Y(k));
    }

    // unit circle
    if (opts.unit) {
      ctx.strokeStyle = cssVar('--plot-circle', '#b9c0d4');
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, scale, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = muted; ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('|z| = 1', cx + scale * 0.72, cy - scale * 0.72);
    }

    // points
    const drawn = [];
    (points || []).forEach((p, idx) => {
      const z = p.z || p;
      if (!z || !Number.isFinite(z.re) || !Number.isFinite(z.im)) return;
      const varMatch = /^var\((--[\w-]+)\)$/.exec(p.color || '');
      const color = varMatch ? cssVar(varMatch[1], '#2f6f8f') : (p.color || cssVar('--c1', '#2f6f8f'));
      const px = X(z.re), py = Y(z.im);

      // dashed projections
      ctx.strokeStyle = color; ctx.globalAlpha = 0.23; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);

      // vector
      if (opts.vectors !== false && (Math.abs(z.re) > 1e-9 || Math.abs(z.im) > 1e-9)) {
        ctx.strokeStyle = color; ctx.globalAlpha = 0.65; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // point
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = bg; ctx.lineWidth = 1.5; ctx.stroke();

      // label with overlap avoidance
      let dy = -10;
      while (drawn.some(d => Math.abs(d.x - px) < 26 && Math.abs(d.y - (py + dy)) < 15)) dy -= 14;
      drawn.push({ x: px, y: py + dy });
      ctx.fillStyle = text;
      ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(p.label || '', px + 9, py + dy);
    });

    // origin label
    ctx.fillStyle = muted; ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('0', cx - 3, cy + 4);
  }

  function drawAngleCircle(canvas, theta) {
    if (!canvas) return;
    canvas._plotData = { angle: theta };
    canvas.dataset.angle = String(theta);
    const { w, h, ctx } = resize(canvas);
    const bg = cssVar('--plot-bg', '#fff');
    const grid = cssVar('--plot-grid', '#e6e8ef');
    const axis = cssVar('--plot-axis', '#59617a');
    const c1 = cssVar('--c1', '#2f6f8f');
    const accent = cssVar('--accent', '#c26a2e');
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32;
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    arrow(ctx, cx - R - 18, cy, cx + R + 18, cy, axis);
    arrow(ctx, cx, cy + R + 18, cx, cy - R - 18, axis);
    const px = cx + R * Math.cos(theta), py = cy - R * Math.sin(theta);
    // angle arc
    if (Math.abs(theta) > 1e-9) {
      ctx.strokeStyle = accent; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.36, 0, -theta, theta > 0); ctx.stroke();
    }
    ctx.strokeStyle = c1; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '600 13px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = cssVar('--text', '#1d263b');
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('θ = ' + global.Complex.anglePiLabelSigned(theta), cx + 8, cy - 8);
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  function redrawAll() {
    document.querySelectorAll('canvas[data-plot]').forEach(c => {
      if (!c._plotData) return;
      if (c.dataset.plot === 'angle') drawAngleCircle(c, Number(c.dataset.angle || 0));
      else drawComplexPlane(c, c._plotData.points, c._plotData.opts);
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(redrawAll, 120);
  });

  global.Plots = { drawComplexPlane, drawAngleCircle, redrawAll };
})(typeof window !== 'undefined' ? window : globalThis);
