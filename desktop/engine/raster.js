// ─── Ballz raster ──────────────────────────────────────────────────────────
// Flat-filled circles drawn a row at a time, with fuzz (ragged row starts),
// speckles (one stray pixel per upper-half row, mirrored ramp shade) and
// partial outlines. Tapered "linez" are scanline-filled to match.
// See docs/ballz-technique.json for provenance of each rule.
var BZ = window.BZ || (window.BZ = {});

BZ.rng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// circle lookup, one entry per diameter (read_out: InitCircleLookup)
const CIRCLES = [];
BZ.circle = function (d) {
  d = Math.max(1, Math.min(200, Math.round(d)));
  let c = CIRCLES[d];
  if (c) return c;
  const r = BZ.rng(d * 7919 + 13);
  c = { d, w: [], start: [], spot: [], fuzz: [] };
  for (let i = 0; i < d; i++) {
    const k = d - 2 * i - 1; // row centre (ours: symmetric top/bottom)
    const w = Math.max(0, Math.round(Math.sqrt(Math.max(0, d * d - k * k))));
    c.w.push(w);
    c.start.push(Math.floor((d - w) / 2));
    c.spot.push(Math.floor(r() * (w + 1)));
  }
  for (let L = 0; L < 8; L++) {
    const row = [];
    for (let i = 0; i < d; i++) row.push(L === 0 ? 0 : Math.floor(r() * (L + 1)) - (L >> 1));
    c.fuzz.push(row);
  }
  CIRCLES[d] = c;
  return c;
};

// Ball modes: -1 none, 0 half outline (leftmost px), >0 outline N px thick
BZ.drawBall = function (ctx, cx, cy, d, color, outline, speckle, mode, fuzz, dense) {
  d = Math.round(d);
  if (d < 1) return;
  const c = BZ.circle(d);
  const fz = c.fuzz[Math.max(0, Math.min(7, fuzz | 0))];
  const x0 = Math.round(cx - d / 2), y0 = Math.round(cy - d / 2);
  if (color) {
    ctx.fillStyle = color;
    for (let i = 0; i < d; i++) {
      const w = c.w[i]; if (!w) continue;
      ctx.fillRect(x0 + c.start[i] + fz[i], y0 + i, w, 1);
    }
  }
  if (mode > 0 && outline) {
    ctx.fillStyle = outline;
    for (let i = 0; i < d; i++) {
      const w = c.w[i]; if (!w) continue;
      const sx = x0 + c.start[i] + fz[i];
      if (i < mode || i >= d - mode) ctx.fillRect(sx, y0 + i, w, 1);
      else { ctx.fillRect(sx, y0 + i, mode, 1); ctx.fillRect(sx + w - mode, y0 + i, mode, 1); }
    }
    return;
  }
  if (mode === 0 && outline) {
    ctx.fillStyle = outline;
    for (let i = 0; i < d; i++) if (c.w[i]) ctx.fillRect(x0 + c.start[i] + fz[i], y0 + i, 1, 1);
  }
  if (speckle && dense === 'wave') { // rex curls (ours): staggered dash rows
    ctx.fillStyle = speckle;
    for (let i = 1; i < d - 1; i += 3) {
      const w = c.w[i]; if (w < 4) continue;
      const sx = x0 + c.start[i] + fz[i], ph = ((i / 3) | 0) % 2 ? 2 : 0;
      for (let x = sx + 1 + ph; x < sx + w - 2; x += 4) ctx.fillRect(x, y0 + i, 2, 1);
    }
    return;
  }
  if (speckle) {
    ctx.fillStyle = speckle;
    // read_out: upper-half rows only. dense (ours, rex curls): every row, two spots
    const rows = dense ? d - 1 : d / 2;
    for (let i = 0; i < rows; i++) {
      const w = c.w[i]; if (w < 3) continue;
      const sx = x0 + c.start[i] + fz[i];
      ctx.fillRect(sx + Math.min(w - 1, c.spot[i]), y0 + i, 1, 1);
      if (dense && w > 5) ctx.fillRect(sx + ((c.spot[i] + (w >> 1) + (i & 1) * 2) % (w - 1)), y0 + i, 1, 1);
    }
  }
};

// Row span of a drawn ball at screen row y (for clipping spots, irises, lids)
BZ.ballSpan = function (cx, cy, d, fuzz, y) {
  d = Math.round(d);
  const c = BZ.circle(d);
  const x0 = Math.round(cx - d / 2), y0 = Math.round(cy - d / 2);
  const i = y - y0;
  if (i < 0 || i >= d || !c.w[i]) return null;
  const sx = x0 + c.start[i] + c.fuzz[Math.max(0, Math.min(7, fuzz | 0))][i];
  return [sx, sx + c.w[i]];
};

// A filled circle clipped to a parent ball (paint spots, irises)
BZ.drawClipped = function (ctx, cx, cy, d, color, parent, fuzz) {
  d = Math.round(d); if (d < 1) return;
  const c = BZ.circle(d);
  const fz = c.fuzz[Math.max(0, Math.min(7, fuzz | 0))];
  const x0 = Math.round(cx - d / 2), y0 = Math.round(cy - d / 2);
  ctx.fillStyle = color;
  for (let i = 0; i < d; i++) {
    const w = c.w[i]; if (!w) continue;
    let a = x0 + c.start[i] + fz[i], b = a + w;
    if (parent) {
      const s = BZ.ballSpan(parent.x, parent.y, parent.d, parent.fuzz, y0 + i);
      if (!s) continue;
      a = Math.max(a, s[0] + (parent.inset || 0)); b = Math.min(b, s[1] - (parent.inset || 0));
    }
    if (b > a) ctx.fillRect(a, y0 + i, b - a, 1);
  }
};

// Tapered line between two balls: thickness at each end = radius*256/300
// (read_out), scaled per line (ours). Scanline fill + 1px edge pixels.
BZ.drawLine = function (ctx, x1, y1, t1, x2, y2, t2, color, outline, fuzz) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 0.5) return;
  const nx = -dy / len, ny = dx / len;
  const P = [
    [x1 + nx * t1 / 2, y1 + ny * t1 / 2], [x2 + nx * t2 / 2, y2 + ny * t2 / 2],
    [x2 - nx * t2 / 2, y2 - ny * t2 / 2], [x1 - nx * t1 / 2, y1 - ny * t1 / 2],
  ];
  let ymin = Infinity, ymax = -Infinity;
  for (const p of P) { ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]); }
  ymin = Math.floor(ymin); ymax = Math.ceil(ymax);
  const fr = BZ.circle(Math.min(200, Math.max(1, ymax - ymin + 1))).fuzz[Math.max(0, Math.min(7, fuzz | 0))];
  const rows = [];
  for (let y = ymin; y <= ymax; y++) {
    const sy = y + 0.5; let a = Infinity, b = -Infinity;
    for (let k = 0; k < 4; k++) {
      const p = P[k], q = P[(k + 1) % 4];
      if ((p[1] <= sy && q[1] > sy) || (q[1] <= sy && p[1] > sy)) {
        const x = p[0] + (sy - p[1]) / (q[1] - p[1]) * (q[0] - p[0]);
        a = Math.min(a, x); b = Math.max(b, x);
      }
    }
    if (a === Infinity) continue;
    const f = fr[(y - ymin) % fr.length] || 0;
    let ia = Math.round(a) + f, ib = Math.round(b) + f;
    if (ib - ia < 1) ib = ia + 1;
    rows.push([ia, y, ib - ia]);
  }
  ctx.fillStyle = color;
  for (const r of rows) ctx.fillRect(r[0], r[1], r[2], 1);
  if (outline) {
    ctx.fillStyle = outline;
    for (const r of rows) { ctx.fillRect(r[0], r[1], 1, 1); if (r[2] > 1) ctx.fillRect(r[0] + r[2] - 1, r[1], 1, 1); }
  }
};

// 1px line (whiskers)
BZ.drawThin = function (ctx, x1, y1, x2, y2, color) {
  x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
  const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx + dy; ctx.fillStyle = color;
  for (let n = 0; n < 200; n++) {
    ctx.fillRect(x1, y1, 1, 1);
    if (x1 === x2 && y1 === y2) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x1 += sx; }
    if (e2 <= dx) { err += dx; y1 += sy; }
  }
};

// Eye: ball, then iris eased toward look target and clamped inside the eye
// (read_out), slit pupil (ours), catchlight (ours), eyelid as cut circle.
BZ.drawEye = function (ctx, e) {
  const { x, y, d, white, rim, iris, pupil, ix, iy, irisD, pupilW, lid, lidColor, lidLine } = e;
  BZ.drawBall(ctx, x, y, d, white, rim, null, 1, 0);
  const parent = { x, y, d, fuzz: 0, inset: 1 };
  if (lid < 0.98) {
    BZ.drawClipped(ctx, x + ix, y + iy, irisD, iris, parent, 0);
    if (irisD > 4) {
      // slit pupil: narrow vertical ellipse
      const ph = Math.max(2, Math.round(irisD - 2)), pw = Math.max(1, Math.round(pupilW));
      const px0 = Math.round(x + ix - pw / 2), py0 = Math.round(y + iy - ph / 2);
      ctx.fillStyle = pupil;
      for (let i = 0; i < ph; i++) {
        const k = (2 * i + 1 - ph) / ph, w = Math.max(1, Math.round(pw * Math.sqrt(1 - k * k)));
        const a = px0 + Math.round((pw - w) / 2), yy = py0 + i;
        const s = BZ.ballSpan(x, y, d, 0, yy); if (!s) continue;
        const aa = Math.max(a, s[0] + 1), bb = Math.min(a + w, s[1] - 1);
        if (bb > aa) ctx.fillRect(aa, yy, bb - aa, 1);
      }
      ctx.fillStyle = '#ffffff';
      const hx = Math.round(x + ix - irisD / 4), hy = Math.round(y + iy - irisD / 4);
      if (BZ.ballSpan(x, y, d, 0, hy)) ctx.fillRect(hx, hy, 1, 1);
    }
  }
  if (lid > 0.02) {
    const d0 = Math.round(d), y0 = Math.round(y - d0 / 2), rows = Math.round(lid * d0);
    ctx.fillStyle = lidColor;
    for (let i = 0; i < rows; i++) {
      const s = BZ.ballSpan(x, y, d0, 0, y0 + i); if (s) ctx.fillRect(s[0], y0 + i, s[1] - s[0], 1);
    }
    const s = BZ.ballSpan(x, y, d0, 0, y0 + rows);
    if (s && rows < d0) { ctx.fillStyle = lidLine; ctx.fillRect(s[0], y0 + rows, s[1] - s[0], 1); }
  }
};

// ── shared fills (ours) ──
BZ.ellipse = function (ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color; const h = Math.max(1, Math.round(ry * 2)), y0 = Math.round(cy - ry);
  for (let i = 0; i < h; i++) { const k = (2 * i + 1 - h) / h, w = Math.round(rx * 2 * Math.sqrt(Math.max(0, 1 - k * k))); if (w > 0) ctx.fillRect(Math.round(cx - w / 2), y0 + i, w, 1); }
};
BZ.ballSpanE = function (cx, cy, rx, ry, y) {
  const k = (y + 0.5 - cy) / ry; if (Math.abs(k) >= 1) return null;
  const hw = rx * Math.sqrt(1 - k * k); return [Math.round(cx - hw), Math.round(cx + hw)];
};
BZ.fillPoly = function (ctx, pts, color) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  ctx.fillStyle = color;
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) xs.push(a[0] + ((sy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) ctx.fillRect(a, y, b - a, 1); }
  }
};
BZ.ellRing = function (ctx, cx, cy, rx, ry, col) {
  let px = null, py = null;
  for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; if (px !== null) BZ.drawThin(ctx, px, py, x, y, col); px = x; py = y; }
};
BZ.leafPts = function (x, y, len, wid, ang, notch) {
  const top = [], bot = [], c = Math.cos(ang), s = Math.sin(ang), n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n; let w = wid * Math.pow(Math.sin(Math.PI * t), 0.75);
    if (notch && t < 0.18) w *= t / 0.18;
    top.push([t * len, -w]); bot.push([t * len, w]);
  }
  return top.concat(bot.reverse()).map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
};
BZ.leaf = function (ctx, x, y, len, wid, ang, col, rib, notch) {
  BZ.fillPoly(ctx, BZ.leafPts(x, y, len, wid, ang, notch), col);
  if (rib) BZ.drawThin(ctx, x, y, x + Math.cos(ang) * len * 0.9, y + Math.sin(ang) * len * 0.9, rib);
};
