/**
 * chart-asset-line.js — 資産推移ラインチャート
 * 名目残高・実質残高・取り崩し額の3本線グラフ。ホバーでツールチップ表示。
 *
 * 前提: base.js を先に読み込むこと（clamp を使用）
 *
 * 使い方:
 *   <script src="./base.js"></script>
 *   <script src="./chart-asset-line.js"></script>
 *   drawAssetLineChart(document.getElementById('chart'), years, { startAge: 35, retireAge: 60, animate: true });
 *
 * years: [{ age, end, realEnd, realWithdraw }, ...]
 */

(function(){ 'use strict';

  const _clamp = typeof clamp === 'function' ? clamp : (v, min, max) => Math.min(max, Math.max(min, v));

  function _yen(n) {
    if (!isFinite(n)) return '-';
    return Math.round(n).toLocaleString('ja-JP');
  }

  function _compactYen(v) {
    if (!isFinite(v)) return '-';
    const abs = Math.abs(v);
    if (abs >= 1e8) return (v/1e8).toFixed(1) + '億';
    if (abs >= 1e4) return (v/1e4).toFixed(0) + '万';
    return Math.round(v).toString();
  }

  function _roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  let _chartAnimId = null;
  const CHART_ANIM_MS = 800;

  /**
   * グラフを progress (0〜1) まで描画
   * @param {HTMLCanvasElement} canvas
   * @param {Array} years [{ age, end, realEnd, realWithdraw }, ...]
   * @param {{ startAge: number, retireAge: number }} opts
   * @param {number} progress 0〜1
   */
  function drawChartFrame(canvas, years, opts, progress) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.scale(dpr, dpr);

    const W = cssW, H = cssH;
    ctx.clearRect(0,0,W,H);

    const pad = {l:52, r:16, t:16, b:34};
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const ages = years.map(d=>d.age);
    const nom = years.map(d=>d.end);
    const real = years.map(d=>d.realEnd);
    const wReal = years.map(d=>d.realWithdraw);

    const maxY = Math.max(1, ...nom, ...real, ...wReal.map(v=>v*3));
    const minY = 0;

    const x = (i)=> pad.l + (i/(years.length-1||1))*plotW;
    const y = (v)=> pad.t + (1 - (v-minY)/(maxY-minY))*plotH;

    const maxIdx = progress >= 1 ? years.length - 1 : Math.max(0, Math.floor(progress * (years.length - 1)));

    // Grid
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = 'rgba(74,140,111,.2)';
    ctx.lineWidth = 1;
    const gridN = 5;
    for (let g=0; g<=gridN; g++){
      const yy = pad.t + (g/gridN)*plotH;
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(W - pad.r, yy);
      ctx.stroke();
      const val = maxY * (1 - g/gridN);
      ctx.fillStyle = 'rgba(74,140,111,.8)';
      ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('¥' + _compactYen(val), pad.l - 8, yy);
    }
    ctx.restore();

    // Age ticks
    ctx.save();
    ctx.fillStyle = 'rgba(74,140,111,.8)';
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const tickEvery = Math.max(1, Math.round(years.length/8));
    for (let i=0; i<years.length; i+=tickEvery){
      ctx.fillText(String(ages[i]), x(i), pad.t + plotH + 8);
    }
    ctx.restore();

    // Retirement marker
    const retireIdx = _clamp(opts.retireAge - opts.startAge, 0, years.length-1);
    ctx.save();
    ctx.strokeStyle = 'rgba(224,122,58,.65)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo(x(retireIdx), pad.t);
    ctx.lineTo(x(retireIdx), pad.t + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(224,122,58,.9)';
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('取り崩し開始', x(retireIdx)+6, pad.t + 14);
    ctx.restore();

    function drawLine(arr, stroke, toIdx){
      const n = (toIdx !== undefined ? toIdx : arr.length - 1) + 1;
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i=0; i<n; i++){
        const xx = x(i), yy = y(arr[i]);
        if (i===0) ctx.moveTo(xx,yy);
        else ctx.lineTo(xx,yy);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(122,168,232,.12)';
    ctx.beginPath();
    for (let i=0; i<=maxIdx; i++){
      const xx = x(i), yy = y(years[i].end);
      if (i===0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.lineTo(x(maxIdx), pad.t + plotH);
    ctx.lineTo(x(0), pad.t + plotH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const style = getComputedStyle(document.documentElement);
    const colNom = style.getPropertyValue('--data-blue-2').trim() || '#7aa8e8';
    const colReal = style.getPropertyValue('--accent-deep').trim() || '#4a8c6f';
    const colWithdraw = style.getPropertyValue('--data-orange').trim() || '#e07a3a';
    drawLine(nom, colNom, maxIdx);
    drawLine(real, colReal, maxIdx);

    ctx.save();
    ctx.strokeStyle = colWithdraw;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (let i=0; i<=maxIdx; i++){
      const xx = x(i), yy = y(wReal[i]);
      if (i===0) ctx.moveTo(xx,yy);
      else ctx.lineTo(xx,yy);
    }
    ctx.stroke();
    ctx.restore();
  }

  function setupChartTooltip(canvas, years, opts) {
    const canvasWrap = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const pad = {l:52, r:16, t:16, b:34};
    const plotW = canvas.clientWidth - pad.l - pad.r;
    const style = getComputedStyle(document.documentElement);
    const colNom = style.getPropertyValue('--data-blue-2').trim() || '#7aa8e8';
    const colReal = style.getPropertyValue('--accent-deep').trim() || '#4a8c6f';
    const colWithdraw = style.getPropertyValue('--data-orange').trim() || '#e07a3a';
    const x = (i)=> pad.l + (i/(years.length-1||1))*plotW;
    const y = (v)=> {
      const maxY = Math.max(1, ...years.map(d=>d.end), ...years.map(d=>d.realEnd), ...years.map(d=>d.realWithdraw*3));
      return pad.t + (1 - v/maxY)*(canvas.clientHeight - pad.t - pad.b);
    };

    canvasWrap.onmousemove = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) {
        drawChartFrame(canvas, years, opts, 1);
        return;
      }
      const idx = Math.round(((mx - pad.l) / plotW) * (years.length-1));
      const i = _clamp(idx, 0, years.length-1);
      drawChartFrame(canvas, years, opts, 1);

      const d = years[i];
      const xx = x(i);
      const W = canvas.clientWidth, H = canvas.clientHeight;

      ctx.save();
      ctx.strokeStyle = 'rgba(74,140,111,.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xx, pad.t);
      ctx.lineTo(xx, pad.t + H - pad.t - pad.b);
      ctx.stroke();

      const pts = [
        {v:d.end, c:colNom},
        {v:d.realEnd, c:colReal},
        {v:d.realWithdraw, c:colWithdraw},
      ];
      pts.forEach(p2=>{
        ctx.fillStyle = p2.c;
        ctx.beginPath();
        ctx.arc(xx, y(p2.v), 3.5, 0, Math.PI*2);
        ctx.fill();
      });

      const lines = [
        `年齢: ${d.age}`,
        `名目残高: ¥${_yen(d.end)}`,
        `実質残高: ¥${_yen(d.realEnd)}`,
        `取り崩し(実質): ¥${_yen(d.realWithdraw)}`,
      ];
      const boxW = 220;
      const boxH = 16 + lines.length * 16;
      const bx = _clamp(xx + 10, pad.l, W - pad.r - boxW);
      const by = pad.t + 10;

      ctx.fillStyle = 'rgba(255,255,255,.98)';
      ctx.strokeStyle = 'rgba(212,237,227,.9)';
      ctx.lineWidth = 1;
      _roundRect(ctx, bx, by, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(68,80,76,.95)';
      ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((t, k)=>{
        ctx.fillText(t, bx + 10, by + 10 + k*16);
      });
      ctx.restore();
    };

    canvasWrap.onmouseleave = () => {
      drawChartFrame(canvas, years, opts, 1);
    };
  }

  /**
   * 資産推移ラインチャートを描画
   * @param {HTMLCanvasElement|string} canvasOrId  canvas 要素または id
   * @param {Array} years [{ age, end, realEnd, realWithdraw }, ...]
   * @param {{ startAge: number, retireAge: number, animate?: boolean }} options
   */
  function drawAssetLineChart(canvasOrId, years, options) {
    const canvas = typeof canvasOrId === 'string'
      ? document.getElementById(canvasOrId)
      : canvasOrId;
    if (!canvas || !canvas.getContext) return;

    const opts = {
      startAge: options.startAge ?? 35,
      retireAge: options.retireAge ?? 60,
    };
    const animate = options.animate === true;

    if (animate) {
      if (_chartAnimId) cancelAnimationFrame(_chartAnimId);
      const t0 = performance.now();
      function tick(now) {
        const elapsed = now - t0;
        const progress = Math.min(1, elapsed / CHART_ANIM_MS);
        const ease = 1 - Math.pow(1 - progress, 2);
        drawChartFrame(canvas, years, opts, ease);
        if (progress < 1) {
          _chartAnimId = requestAnimationFrame(tick);
        } else {
          _chartAnimId = null;
          setupChartTooltip(canvas, years, opts);
        }
      }
      _chartAnimId = requestAnimationFrame(tick);
    } else {
      drawChartFrame(canvas, years, opts, 1);
      setupChartTooltip(canvas, years, opts);
    }
  }

  window.drawAssetLineChart = drawAssetLineChart;

})();
