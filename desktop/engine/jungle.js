// ─── Bo's Jungle: the habitat room (ours) ──────────────────────────────────
// Painted the way RollerCoaster Tycoon-era sprite art was: every material is a
// short shade ramp, mixed with a 4x4 ordered dither instead of smooth
// gradients; one light source (the window, upper right) puts a highlight on
// every top/left edge and a shadow on every bottom/right edge; and the room is
// dense with small, specific things, some of them quietly alive (clouds, the
// curtains, dust in the sunbeam, the clock, a pigeon that visits the ledge).
// Layers: bg (wall, floor, rug, furniture) → window view (sky, rooftops,
// clouds, pigeon) → window frame → curtains → plants → dust → [items, cats] → fg.
var BZ = window.BZ || (window.BZ = {});
(function () {
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
  const dith = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const rampAt = (ramp, L, x, y) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(L + dith(x, y))))];
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const R = {
    wall: ['#9ea395', '#a8ad9f', '#b2b7a9', '#bcc0b3', '#c5c9bc', '#ced1c5', '#d7d9ce', '#dfe1d7'],
    panel: ['#b4b8aa', '#bfc3b5', '#c9ccbf', '#d2d5c9', '#dadcd1', '#e2e4da', '#eaebe3'],
    wood: ['#4e2f19', '#5e3a20', '#6d4527', '#7b4f2d', '#875a35', '#93643c', '#9f6e44', '#ab7a4e', '#b8875a'],
    walnut: ['#2a1a10', '#3e2616', '#55351f', '#6b4429', '#7f5333', '#95653f'],
    trim: ['#a9ad9f', '#c6c9bd', '#dcded4', '#eceee6', '#f8f9f4'],
    linen: ['#cdbfa8', '#d9cdb8', '#e4dac8', '#eee6d7', '#f6f1e6'],
  };
  const BOOKS = ['#c9963a', '#3f6f6a', '#b5583c', '#e6d9bf', '#34446b', '#7a8f5a', '#7b4b6a', '#d8b48a', '#2f5d5a', '#a8432f'];
  const PHASES = {
    day:   { sky: ['#5f9fd2', '#7cb4de', '#9cc8e7', '#bcdbee', '#d6e9f3'], far: '#9fb3c2', beam: 1, cloud: ['#ffffff', '#e4eef4', '#c9d9e4'], lit: 0 },
    dawn:  { sky: ['#8a9fcf', '#b0b3d6', '#d9c1c9', '#f1cdb4', '#f8dcbc'], far: '#b5a9b8', beam: 0.7, cloud: ['#fff1e4', '#f3d4c4', '#d9b3b0'], lit: 0.15 },
    dusk:  { sky: ['#3e4685', '#6a5d97', '#b56f86', '#e8946a', '#f5b878'], far: '#7d6a85', beam: 0.55, cloud: ['#f7c6a0', '#d88f86', '#8d6a86'], lit: 0.35 },
    night: { sky: ['#0d1430', '#131d3e', '#1a274c', '#22325a', '#2b3d66'], far: '#1c2645', beam: 0.18, cloud: ['#3a4672', '#2e3961', '#242e52'], lit: 0.6 },
  };
  function phaseNow() { const h = new Date().getHours() + new Date().getMinutes() / 60; return h < 5.5 || h >= 20.5 ? 'night' : h < 8 ? 'dawn' : h < 17.5 ? 'day' : 'dusk'; }
  function mk() { return document.createElement('canvas'); }
  function ell(ctx, cx, cy, rx, ry, col) { BZ.ellipse(ctx, cx, cy, rx, ry, col); }
  function ellRing(ctx, cx, cy, rx, ry, col) { let px = null, py = null; for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; if (px !== null) BZ.drawThin(ctx, px, py, x, y, col); px = x; py = y; } }
  function px(g, x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  // a bevelled box: base fill, light top/left edge, dark bottom/right edge (light from the window, upper right → we bias top)
  function bevel(g, x, y, w, h, base, hi, lo) { rect(g, x, y, w, h, base); rect(g, x, y, w, 1, hi); rect(g, x, y, 1, h, hi); rect(g, x, y + h - 1, w, 1, lo); rect(g, x + w - 1, y, 1, h, lo); }
  function shade(g, pts, fn) { // fn(x, y) -> color or null, per pixel inside the polygon
    let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const sy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; if ((p[1] <= sy && q[1] > sy) || (q[1] <= sy && p[1] > sy)) xs.push(p[0] + ((sy - p[1]) / (q[1] - p[1])) * (q[0] - p[0])); }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) { const c = fn(x, y); if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } }
    }
  }
  const ellPts = (cx, cy, rx, ry, n = 32) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  function leafPts(x, y, len, wid, ang, notch) {
    const top = [], bot = [], c = Math.cos(ang), s = Math.sin(ang), n = 14;
    for (let i = 0; i <= n; i++) { const t = i / n; let w = wid * Math.pow(Math.sin(Math.PI * t), 0.75); if (notch && t < 0.18) w *= t / 0.18; top.push([t * len, -w]); bot.push([t * len, w]); }
    return top.concat(bot.reverse()).map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  }
  function leaf(ctx, x, y, len, wid, ang, col, rib, opt = {}) {
    BZ.fillPoly(ctx, leafPts(x, y, len, wid, ang, opt.notch), col);
    if (opt.edge) { const p = leafPts(x, y, len, wid, ang, opt.notch); for (let i = 1; i < p.length; i += 2) px(ctx, p[i][0], p[i][1], opt.edge); }
    if (opt.hi) { const p = leafPts(x, y, len * 0.9, wid * 0.55, ang - 0.08, opt.notch); for (let i = 2; i < p.length / 2; i += 3) px(ctx, p[i][0], p[i][1], opt.hi); }
    if (rib) BZ.drawThin(ctx, x, y, x + Math.cos(ang) * len * 0.92, y + Math.sin(ang) * len * 0.92, rib);
  }

  class Jungle {
    constructor(world) { this.w = world; this.key = 'room'; this.bg = mk(); this.frame = mk(); this.over = mk(); this.fg = mk(); this.view = mk(); this.phase = null; this.bird = null; this.birdWait = 600 + Math.random() * 900; }
    layout(st) {
      this.st = st; const W = st.w, H = st.h;
      this.floorY = Math.round(H * 0.5);
      const F = this.floorY;
      this.win = { x0: Math.round(W * 0.685), x1: Math.round(W * 0.965), y0: 18, y1: F - 50 };
      // the sunbeam patch on the floor (panes of light), and its centre for the nap spot
      const top = F + 14, bot = Math.round(H * 0.93), sh = W * 0.15;
      this.beam = { top, bot, xa: W * 0.5, xb: W * 0.8, sh };
      this.sun = { x: st.x + (this.beam.xa + this.beam.xb) / 2 - sh * 0.62, y: st.y + top + (bot - top) * 0.62 };
      this.clouds = Array.from({ length: 5 }, (_, i) => ({ x: Math.random() * (this.win.x1 - this.win.x0 + 60) - 30, y: 4 + Math.random() * (this.win.y1 - this.win.y0) * 0.32, s: 0.6 + Math.random() * 0.8, v: 0.02 + Math.random() * 0.03, k: i }));
      this.motes = Array.from({ length: 26 }, () => ({ u: Math.random(), v: Math.random(), p: Math.random() * 6.28, s: 0.4 + Math.random() }));
      // the room's own furniture (fixtures, not toy-box things): the daybed against the wall, the carved table out on the rug
      { const x0 = Math.round(W * 0.23), x1 = Math.round(W * 0.46); this.bookcase = { x0, x1, topY: F - 70, baseY: F + 5, mid: F - 38 }; this.cube = { x0: x1 - 50, x1: x1 - 6, y0: F - 35, y1: F - 2 }; this.cube.hx = Math.round((this.cube.x0 + this.cube.x1) / 2); this.cube.hy = this.cube.y1 - 15; }
      this.furniture = [{ key: 'daybed', type: 'daybed', x: st.x + Math.round(W * 0.6), y: st.y + F + 17 }, { key: 'ctable', type: 'ctable', x: st.x + Math.round(W * 0.43), y: st.y + Math.round(F + (H - F) * 0.62) }];
      this.paint();
    }
    paint() {
      this.phase = phaseNow(); const P = PHASES[this.phase];
      const { w: W, h: H } = this.st, F = this.floorY;
      for (const c of [this.bg, this.frame, this.over, this.fg]) { c.width = W; c.height = H; }
      this.paintWall(W, H, F); this.paintFloor(W, H, F, P); this.paintFurniture(W, H, F, P);
      this.paintView(P); this.paintFrame(W, H, F); this.paintPlants(W, H, F); this.paintFront(W, H);
    }

    // ── wall: dithered sage with the window's light pooling around it, stencil sprigs, wainscot, mouldings ──
    paintWall(W, H, F) {
      const g = this.bg.getContext('2d'), wn = this.win, wcx = (wn.x0 + wn.x1) / 2, wcy = (wn.y0 + wn.y1) / 2;
      const img = g.createImageData(W, F), d = img.data, rail = F - 44, cornerX = Math.round(W * 0.06);
      const panelL = (x, y) => 3.2 + 1.6 * Math.exp(-(((x - wcx) / (W * 0.32)) ** 2) - (((y - wcy) / (F * 0.9)) ** 2)) - (x < cornerX ? 1.6 : 0);
      for (let y = 0; y < F; y++) for (let x = 0; x < W; x++) {
        const ramp = y > rail ? R.panel : R.wall;
        let L = y > rail ? panelL(x, y) : 3.0 + 2.2 * Math.exp(-(((x - wcx) / (W * 0.3)) ** 2) - (((y - wcy) / (F * 0.8)) ** 2)) - 0.9 * Math.max(0, 1 - y / 26) + 0.6 * (y / F);
        if (x < cornerX) L -= 1.7 - (x / cornerX) * 0.4; // the side wall, out of the light
        const c = hex(rampAt(ramp, L, x, y)), i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      const r = BZ.rng(77);
      // stencilled botanical sprigs, very quiet
      for (let y = 30; y < rail - 8; y += 22) for (let x = ((y / 22) & 1) * 13 + 6; x < W; x += 26) {
        if (x > wn.x0 - 22 && x < wn.x1 + 22 && y > wn.y0 - 10 && y < wn.y1 + 10) continue;
        const c = x < cornerX ? '#a1a698' : '#b4b9ab';
        px(g, x, y, c); px(g, x, y + 1, c); px(g, x, y + 2, c); px(g, x - 1, y, c); px(g, x + 1, y + 1, c); px(g, x - 2, y - 1, c); px(g, x + 2, y, c);
      }
      // crown moulding + picture rail
      ['#8f9386', '#e9ebe2', '#d3d6ca', '#b9bdaf', '#a3a799'].forEach((c, i) => rect(g, 0, i, W, 1, c));
      rect(g, 0, 13, W, 1, '#e4e6dc'); rect(g, 0, 14, W, 1, '#a6aa9c');
      rect(g, cornerX, 0, 1, F, '#9a9e90'); rect(g, cornerX + 1, 0, 1, F, '#d4d7cb'); // the corner
      // chair rail
      ['#f2f3eb', '#e1e3d8', '#cbcec1', '#a5a99b'].forEach((c, i) => rect(g, 0, rail + i, W, 1, c));
      // wainscot panels
      for (let x = 8; x < W - 30; x += 46) {
        if (x + 38 < cornerX) continue;
        const y0 = rail + 9, h = F - 7 - y0 - 6;
        rect(g, x, y0, 38, h, '#cdd0c3'); rect(g, x, y0, 38, 1, '#b0b4a6'); rect(g, x, y0, 1, h, '#b0b4a6'); rect(g, x, y0 + h - 1, 38, 1, '#eceee5'); rect(g, x + 37, y0, 1, h, '#eceee5');
      }
      // baseboard
      ['#f4f4ed', '#e6e6dd', '#d8d8ce', '#d8d8ce', '#c6c6ba', '#a2a295', '#727268'].forEach((c, i) => rect(g, 0, F - 7 + i, W, 1, c));
      // art above the bookcase, the clock, and the window's cast shadow
      this.paintArt(g, W, F);
      const cx = Math.round(W * 0.6), cy = 34; this.clock = { x: cx, y: cy, r: 9 };
      ell(g, cx + 1, cy + 1, 10, 10, '#9a9e90'); ell(g, cx, cy, 10, 10, '#2e2b28'); ell(g, cx, cy, 8.5, 8.5, '#f4efe2'); ell(g, cx - 2, cy - 2, 5, 5, '#fbf8ef');
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; px(g, cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, k % 3 ? '#9c958a' : '#2e2b28'); }
      void r;
    }
    paintArt(g, W, F) {
      // a botanical print (black frame, cream mat) and a little sun-and-hills (oak frame)
      const a = { x: Math.round(W * 0.245), y: 30, w: 30, h: 40 }, b = { x: Math.round(W * 0.335), y: 40, w: 30, h: 28 };
      rect(g, a.x + 2, a.y + 2, a.w, a.h, '#a3a799'); rect(g, a.x, a.y, a.w, a.h, '#1f1c1a'); rect(g, a.x + 2, a.y + 2, a.w - 4, a.h - 4, '#efe8d8'); rect(g, a.x + 4, a.y + 4, a.w - 8, a.h - 8, '#f7f2e6');
      BZ.drawThin(g, a.x + a.w / 2, a.y + a.h - 7, a.x + a.w / 2 - 1, a.y + 14, '#4f6b3a');
      leaf(g, a.x + a.w / 2 - 1, a.y + 18, 13, 6, -2.2, '#2f5d36', '#7ea36a', { notch: true }); leaf(g, a.x + a.w / 2, a.y + 24, 11, 5, -0.7, '#3b6f3f', '#8db37a', { notch: true });
      rect(g, a.x + 6, a.y + a.h - 6, a.w - 12, 1, '#c9bfa9');
      rect(g, b.x + 2, b.y + 2, b.w, b.h, '#a3a799'); bevel(g, b.x, b.y, b.w, b.h, '#a5784a', '#c99a66', '#6e4a2a');
      const ix = b.x + 3, iy = b.y + 3, iw = b.w - 6, ih = b.h - 6; rect(g, ix, iy, iw, ih, '#cfd8c4');
      ell(g, ix + iw * 0.62, iy + ih * 0.42, 4.5, 4.5, '#e2a63c');
      BZ.fillPoly(g, [[ix, iy + ih], [ix, iy + ih * 0.62], [ix + iw * 0.3, iy + ih * 0.5], [ix + iw * 0.6, iy + ih * 0.7], [ix + iw, iy + ih * 0.56], [ix + iw, iy + ih]], '#b5583c');
      BZ.fillPoly(g, [[ix, iy + ih], [ix, iy + ih * 0.82], [ix + iw * 0.45, iy + ih * 0.72], [ix + iw, iy + ih * 0.86], [ix + iw, iy + ih]], '#8a3f2c');
    }

    // ── floor: perspective planks with grain, knots, bevels; the kilim; the paned sunbeam ──
    paintFloor(W, H, F, P) {
      const g = this.bg.getContext('2d'), r = BZ.rng(4242), wx = (this.win.x0 + this.win.x1) / 2;
      let y = F + 1, row = 0;
      while (y < H) {
        const t = (y - F) / (H - F), h = Math.round(4 + 6 * t);
        let x = -Math.floor(r() * 80);
        while (x < W) {
          const L = Math.round((70 + r() * 70) * (0.8 + 0.5 * t)), mid = x + L / 2;
          let k = 2 + Math.floor(r() * 4) + (Math.abs(mid - wx) < W * 0.25 ? 1 : 0) - (mid < W * 0.15 ? 1 : 0);
          k = Math.max(1, Math.min(R.wood.length - 2, k));
          rect(g, x, y, L, h, R.wood[k]);
          rect(g, x, y, L, 1, R.wood[k + 1]); rect(g, x, y + h - 1, L, 1, R.wood[0]);
          for (let s = 0; s < 2 + h / 3; s++) { const gx = x + r() * L, gl = 6 + r() * 26, gy = y + 1 + Math.floor(r() * Math.max(1, h - 2)); rect(g, gx, gy, gl, 1, R.wood[k - 1]); } // grain
          if (r() < 0.12) { const kx = x + 8 + r() * (L - 16), ky = y + h / 2; ell(g, kx, ky, 2, 1, R.wood[k - 1]); px(g, kx, ky, R.wood[0]); } // a knot
          rect(g, x, y, 1, h, R.wood[0]); rect(g, x + 1, y, 1, h - 1, R.wood[k + 1]); // butt joint
          x += L;
        }
        y += h; row++;
      }
      for (let i = 0; i < 4; i++) rect(g, 0, F + 1 + i, W, 1, `rgba(20,10,0,${0.28 - i * 0.07})`); // contact shadow under the baseboard
      this.paintRug(g, W, H, F);
      // the paned sunbeam: three columns of light split by the mullion shadows, two rows split by the transom
      const B = this.beam, a = 0.2 * P.beam, at = (yy) => (yy - B.top) / (B.bot - B.top);
      const quad = (u0, u1, v0, v1, col) => {
        const xl = (v) => B.xa - B.sh * v, wid = B.xb - B.xa;
        const y0 = B.top + (B.bot - B.top) * v0, y1 = B.top + (B.bot - B.top) * v1;
        BZ.fillPoly(g, [[xl(v0) + wid * u0, y0], [xl(v0) + wid * u1, y0], [xl(v1) + wid * u1, y1], [xl(v1) + wid * u0, y1]], col);
      };
      const tint = this.phase === 'night' ? '200,215,255' : this.phase === 'dusk' ? '255,196,140' : '255,228,168';
      for (const [u0, u1] of [[0, 0.315], [0.345, 0.655], [0.685, 1]]) for (const [v0, v1] of [[0, 0.43], [0.48, 1]]) { quad(u0, u1, v0, v1, `rgba(${tint},${a})`); quad(u0 + 0.03, u1 - 0.03, v0 + 0.05, v1 - 0.05, `rgba(${tint},${a * 0.45})`); }
      void at;
    }
    paintRug(g, W, H, F) {
      const top = Math.round(F + (H - F) * 0.36), bot = H - 7, xl0 = W * 0.17, xr0 = W * 0.75, xl1 = W * 0.08, xr1 = W * 0.84;
      const RW = 104, RH = 40, r = BZ.rng(31);
      const C = { edge: '#3b2c34', mus: '#c9963a', musD: '#a87a2c', cream: '#e6d9bf', base: '#8e4a43', baseD: '#7a3d38', ind: '#3f4f78', indL: '#5a6c98', sage: '#7d8f6a' };
      for (let y = top; y <= bot; y++) {
        const v = (y - top) / (bot - top), xl = xl0 + (xl1 - xl0) * v, xr = xr0 + (xr1 - xr0) * v;
        for (let x = Math.ceil(xl); x <= xr; x++) {
          const U = ((x - xl) / (xr - xl)) * RW, V = v * RH; let c;
          if (U < 2 || U > RW - 2 || V < 1.5 || V > RH - 1.5) c = C.edge;
          else if (U < 5 || U > RW - 5 || V < 3.5 || V > RH - 3.5) c = (Math.floor(U) + Math.floor(V)) % 4 < 2 ? C.mus : C.musD; // stepped border band
          else if (U < 6.5 || U > RW - 6.5 || V < 4.6 || V > RH - 4.6) c = C.cream;
          else {
            const cu = Math.round((U - 6) / 16) * 16 + 6, cv = Math.round((V - 2) / 12) * 12 + 2, dd = Math.abs(U - cu) / 8 + Math.abs(V - cv) / 6;
            const cu2 = Math.floor((U - 6) / 16) * 16 + 14, cv2 = Math.floor((V - 2) / 12) * 12 + 8, d2 = Math.abs(U - cu2) / 4 + Math.abs(V - cv2) / 3;
            c = dd < 0.22 ? C.mus : dd < 0.42 ? C.ind : dd < 0.55 ? C.cream : dd < 0.68 ? C.indL : d2 < 0.5 ? C.sage : (Math.floor(V) % 6 === 0 && Math.floor(U) % 3 === 0) ? C.baseD : C.base;
          }
          if (r() < 0.03) c = mix(c, '#d8c8b0', 0.25); // wear
          px(g, x, y, c);
        }
        if (y % 2 === 0) { px(g, xl - 1, y, '#efe6d4'); px(g, xl - 2, y, '#d9ccb4'); px(g, xr + 1, y, '#efe6d4'); px(g, xr + 2, y, '#d9ccb4'); } // fringe
      }
      for (let x = xl1; x < xr1; x++) px(g, x, bot + 1, 'rgba(20,10,0,0.35)');
    }

    // ── bookcase with books, lamp and pampas; its contact shadow ──
    paintFurniture(W, H, F, P) {
      const g = this.bg.getContext('2d'), r = BZ.rng(9001), Wd = R.walnut;
      const { x0, x1, topY, baseY, mid } = this.bookcase, w = x1 - x0, cb = this.cube;
      rect(g, x0 - 2, baseY - 1, w + 6, 3, 'rgba(20,10,0,0.28)');
      bevel(g, x0, topY, w, baseY - topY, Wd[2], Wd[3], Wd[0]);
      rect(g, x0 - 2, topY - 3, w + 4, 3, Wd[4]); rect(g, x0 - 2, topY - 3, w + 4, 1, Wd[5]); rect(g, x0 - 2, topY - 1, w + 4, 1, Wd[1]); // top board
      rect(g, x0 + 2, baseY - 5, w - 4, 4, Wd[1]); rect(g, x0 + 3, baseY, 2, 2, Wd[0]); rect(g, x1 - 5, baseY, 2, 2, Wd[0]); // plinth, feet
      const shelves = [[topY + 3, mid, x1 - 6], [mid + 3, baseY - 7, cb.x0 - 3]];
      for (const [sy0, sy1, bxEnd] of shelves) {
        rect(g, x0 + 3, sy0, w - 6, sy1 - sy0, Wd[0]); rect(g, x0 + 3, sy0, w - 6, 1, '#1a100a');
        rect(g, x0 + 3, sy1, w - 6, 2, Wd[4]); rect(g, x0 + 3, sy1, w - 6, 1, Wd[5]);
        let bx = x0 + 4; const bh = sy1 - sy0;
        while (bx < bxEnd - 3) {
          const q = r();
          if (q < 0.1 && bx < bxEnd - 15) { // a stack lying flat
            for (let k = 0; k < 3; k++) { const c = BOOKS[Math.floor(r() * BOOKS.length)], ww = 11 + Math.floor(r() * 4); bevel(g, bx, sy1 - 3 * (k + 1), ww, 3, c, mix(c, '#ffffff', 0.25), mix(c, '#000000', 0.35)); }
            bx += 16; continue;
          }
          if (q < 0.2) { bx += 3 + Math.floor(r() * 4); continue; } // a gap
          const c = BOOKS[Math.floor(r() * BOOKS.length)], ww = 3 + Math.floor(r() * 3), hh = Math.round(bh * (0.68 + r() * 0.3));
          if (q > 0.93 && bx < bxEnd - 10) { // one leaning over
            BZ.fillPoly(g, [[bx, sy1], [bx + ww, sy1], [bx + ww + hh * 0.45, sy1 - hh * 0.9], [bx + hh * 0.45, sy1 - hh * 0.9]], c); bx += ww + Math.ceil(hh * 0.45) + 1; continue;
          }
          bevel(g, bx, sy1 - hh, ww, hh, c, mix(c, '#ffffff', 0.28), mix(c, '#000000', 0.38));
          if (r() < 0.6) rect(g, bx, sy1 - hh + 2, ww, 1, mix(c, '#f3e6c0', 0.55)); // spine band
          if (r() < 0.4) rect(g, bx, sy1 - 4, ww, 1, mix(c, '#000000', 0.25));
          bx += ww;
        }
      }
      // the felt cube in the lower right compartment: dark inside, a black shaggy cushion at the bottom of the hole (its felt face is drawn in front of whoever's in it)
      rect(g, cb.x0 - 1, mid + 3, cb.x1 - cb.x0 + 4, baseY - 7 - mid - 3, '#1c1410'); rect(g, cb.x0 - 2, mid + 3, 1, baseY - 7 - mid - 3, Wd[2]); // divider
      rect(g, cb.x0, cb.y0, cb.x1 - cb.x0, cb.y1 - cb.y0, '#141214');
      for (let i = 0; i < 50; i++) { const a = Math.PI * (0.05 + 0.9 * (i / 50)), rr = 11.5; px(g, cb.hx + Math.cos(a) * rr * (0.6 + r() * 0.45), cb.hy + 5 + Math.sin(a) * 7 * (0.5 + r() * 0.5), i % 3 ? '#2a2628' : '#3a3538'); }
      // on top: brass lamp with a linen drum shade, a pampas vase, a little leaning photo
      const lx = x0 + 10, ly = topY - 3;
      rect(g, lx - 3, ly - 2, 7, 2, '#a07b3a'); rect(g, lx - 3, ly - 2, 7, 1, '#d6b46a'); rect(g, lx, ly - 13, 1, 11, '#b8924a');
      BZ.fillPoly(g, [[lx - 7, ly - 13], [lx + 7, ly - 13], [lx + 6, ly - 22], [lx - 6, ly - 22]], '#efe3c6');
      rect(g, lx - 7, ly - 14, 14, 1, '#d8c8a4'); rect(g, lx - 6, ly - 22, 12, 1, '#fbf3df');
      const glow = this.phase === 'night' ? 0.11 : this.phase === 'day' ? 0.03 : 0.06;
      for (let k = 1; k <= 5; k++) ell(g, lx, ly - 16, 7 + k * 5, 5 + k * 3.5, `rgba(255,214,140,${glow})`);
      const vx = x1 - 12; ell(g, vx, ly - 5, 4, 5, '#cfc6b5'); ell(g, vx - 1, ly - 6, 2, 3, '#e7e0d1'); rect(g, vx - 2, ly - 11, 4, 2, '#bdb3a0');
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.16, L = 16 + r() * 8, ex = vx + Math.cos(a) * L, ey = ly - 11 + Math.sin(a) * L; BZ.drawThin(g, vx, ly - 11, ex, ey, '#bfa77c'); ell(g, ex, ey, 1.6, 2.6, k % 2 ? '#e3d3ae' : '#d6c296'); }
      const fx = x0 + w * 0.48; BZ.fillPoly(g, [[fx, ly], [fx + 10, ly], [fx + 11, ly - 12], [fx + 1, ly - 12]], '#1f1c1a'); rect(g, fx + 2, ly - 10, 7, 8, '#9cb7c4'); rect(g, fx + 2, ly - 5, 7, 3, '#6f8d5a');
      void P;
    }

    // ── the view out of the window: sky by time of day, rooftops, a water tower, treetops ──
    paintView(P) {
      const wn = this.win, VW = wn.x1 - wn.x0, VH = wn.y1 - wn.y0, v = this.view; v.width = VW; v.height = VH;
      const g = v.getContext('2d'), r = BZ.rng(555), night = this.phase === 'night';
      for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) px(g, x, y, rampAt(P.sky, (y / (VH * 0.72)) * (P.sky.length - 1), x, y));
      if (night) for (let i = 0; i < 40; i++) px(g, r() * VW, r() * VH * 0.5, r() < 0.3 ? '#ffffff' : '#9fb0d8');
      // far skyline
      let x = -4; while (x < VW) { const bw = 8 + r() * 18, bh = VH * (0.28 + r() * 0.16); rect(g, x, VH - bh, bw, bh, P.far); if (r() < 0.3) rect(g, x + bw * 0.4, VH - bh - 4, 2, 4, P.far); x += bw - 1; }
      // nearer brick and limestone fronts
      const fronts = [['#8f5442', '#a8654f', '#6f3d30'], ['#c9bea6', '#ddd3bd', '#a59a83'], ['#9a5a44', '#b06b52', '#74402f'], ['#7f4a3c', '#965a49', '#5f352a']];
      x = -6; let k = 0;
      while (x < VW) {
        const f = fronts[k++ % fronts.length], bw = 26 + r() * 22, bh = VH * (0.2 + r() * 0.14), by = VH - bh;
        const shade = (c) => night ? mix(c, '#141a33', 0.72) : this.phase === 'dusk' ? mix(c, '#5b3c5c', 0.3) : c;
        rect(g, x, by, bw, bh, shade(f[0]));
        rect(g, x, by, bw, 2, shade(f[1])); rect(g, x, by + 2, bw, 1, shade(f[2])); // cornice
        for (let wy = by + 6; wy < VH - 4; wy += 7) for (let wx = x + 3; wx < x + bw - 4; wx += 6) {
          const lit = r() < P.lit; rect(g, wx, wy, 3, 4, lit ? '#f2cf72' : shade('#3c4a5a')); rect(g, wx, wy + 4, 3, 1, shade(f[1]));
          if (!lit && !night) px(g, wx, wy, '#8fa4b5');
        }
        if (k === 2) { // a wooden water tower
          const tx = x + bw * 0.55, ty = by - 14; const wd = night ? '#2a2230' : '#6b4a32', wdL = night ? '#3a2f3e' : '#8a6444';
          BZ.drawThin(g, tx - 4, by, tx - 3, ty + 8, wd); BZ.drawThin(g, tx + 4, by, tx + 3, ty + 8, wd); BZ.drawThin(g, tx - 4, by - 2, tx + 4, ty + 9, wd);
          rect(g, tx - 4, ty, 8, 9, wd); rect(g, tx - 4, ty, 2, 9, wdL); rect(g, tx - 4, ty + 3, 8, 1, '#2a2622'); rect(g, tx - 4, ty + 6, 8, 1, '#2a2622');
          BZ.fillPoly(g, [[tx - 5, ty], [tx + 5, ty], [tx, ty - 5]], night ? '#231c28' : '#4a3424');
        }
        x += bw;
      }
      // treetops in front
      for (let i = 0; i < 26; i++) { const cx = r() * VW, cy = VH - 2 - r() * VH * 0.12, rr = 4 + r() * 6; const tc = night ? ['#16241f', '#1c2e26', '#22382d'] : ['#3f6b35', '#4f7f3d', '#6a9a4a']; ell(g, cx, cy, rr, rr * 0.8, tc[0]); ell(g, cx - 1, cy - 1, rr * 0.7, rr * 0.55, tc[1]); for (let s = 0; s < 4; s++) px(g, cx - rr * 0.5 + r() * rr, cy - rr * 0.6 + r() * 2, tc[2]); }
      // a little wooden bird feeder hanging outside the left pane
      const fx = Math.round(VW * 0.17), fy = 26; this.feeder = { x: fx, y: fy + 12 };
      BZ.drawThin(g, fx, 0, fx, fy - 4, night ? '#555' : '#7a756c');
      BZ.fillPoly(g, [[fx - 7, fy], [fx + 7, fy], [fx, fy - 5]], night ? '#3a2a22' : '#8a4a32'); rect(g, fx - 7, fy, 14, 1, night ? '#2a1e18' : '#6a3626');
      rect(g, fx - 5, fy + 1, 10, 8, night ? '#4a3a2c' : '#c9a476'); rect(g, fx - 5, fy + 1, 2, 8, night ? '#5a4836' : '#ddb98a'); rect(g, fx - 2, fy + 3, 4, 4, night ? '#2a2018' : '#5a3a22');
      rect(g, fx - 8, fy + 9, 16, 2, night ? '#3a2a22' : '#9a6a44'); rect(g, fx - 8, fy + 9, 16, 1, night ? '#4a3a2c' : '#b8875a');
      for (let i = 0; i < 6; i++) px(g, fx - 6 + i * 2.4, fy + 8, night ? '#6a5a40' : '#d8c48a');
      rect(g, 0, VH - 2, VW, 2, night ? '#2b2b33' : '#9a9488'); rect(g, 0, VH - 3, VW, 1, night ? '#3b3b44' : '#c8c2b4'); // the outside ledge
    }

    // ── window trim, mullions, glass glare, sill, curtain rod ──
    paintFrame(W, H, F) {
      const g = this.frame.getContext('2d'), wn = this.win, T = R.trim;
      for (let k = 6; k > 0; k--) rect(g, wn.x0 - 6 - k, wn.y0 - 6 - k, wn.x1 - wn.x0 + 12 + 2 * k, wn.y1 - wn.y0 + 12 + 2 * k, 'rgba(255,252,236,0.03)'); // glow spilling onto the wall
      rect(g, wn.x0 - 6, wn.y0 - 6, wn.x1 - wn.x0 + 12, 6, T[3]); rect(g, wn.x0 - 6, wn.y0 - 6, wn.x1 - wn.x0 + 12, 1, T[4]); rect(g, wn.x0 - 6, wn.y0 - 1, wn.x1 - wn.x0 + 12, 1, T[1]);
      rect(g, wn.x0 - 6, wn.y0, 6, wn.y1 - wn.y0, T[3]); rect(g, wn.x0 - 6, wn.y0, 1, wn.y1 - wn.y0, T[4]); rect(g, wn.x0 - 1, wn.y0, 1, wn.y1 - wn.y0, T[1]);
      rect(g, wn.x1, wn.y0, 6, wn.y1 - wn.y0, T[2]); rect(g, wn.x1, wn.y0, 1, wn.y1 - wn.y0, T[4]); rect(g, wn.x1 + 5, wn.y0, 1, wn.y1 - wn.y0, T[0]);
      const VW = wn.x1 - wn.x0, VH = wn.y1 - wn.y0;
      for (const f of [1 / 3, 2 / 3]) { const mx = Math.round(wn.x0 + VW * f); rect(g, mx - 1, wn.y0, 3, VH, T[3]); rect(g, mx - 1, wn.y0, 1, VH, T[4]); rect(g, mx + 1, wn.y0, 1, VH, T[1]); }
      const ty = Math.round(wn.y0 + VH * 0.45); rect(g, wn.x0, ty - 1, VW, 3, T[3]); rect(g, wn.x0, ty - 1, VW, 1, T[4]); rect(g, wn.x0, ty + 1, VW, 1, T[1]);
      for (let i = 0; i < 3; i++) { const gx = wn.x0 + VW * (i / 3) + 6; BZ.fillPoly(g, [[gx, wn.y0 + VH * 0.55], [gx + 6, wn.y0 + VH * 0.55], [gx + 18, wn.y0 + 2], [gx + 12, wn.y0 + 2]], 'rgba(255,255,255,0.09)'); } // glare
      // sill
      // a deep sill: a seat for cats. Top surface, bullnose front, bracket shadow
      rect(g, wn.x0 - 12, wn.y1 - 2, VW + 24, 4, T[2]); rect(g, wn.x0 - 12, wn.y1 - 2, VW + 24, 1, T[4]); // top, receding
      rect(g, wn.x0 - 13, wn.y1 + 2, VW + 26, 5, T[3]); rect(g, wn.x0 - 13, wn.y1 + 2, VW + 26, 1, T[4]); rect(g, wn.x0 - 13, wn.y1 + 6, VW + 26, 1, T[0]);
      rect(g, wn.x0 - 11, wn.y1 + 7, VW + 22, 3, 'rgba(40,40,30,0.16)');
      for (const bx of [wn.x0 - 4, wn.x1 + 2]) { rect(g, bx, wn.y1 + 7, 3, 6, T[1]); rect(g, bx, wn.y1 + 7, 1, 6, T[3]); } // brackets
      // two linen cushions where the cats like to sit
      for (const [cx, w] of [[wn.x0 + 22, 30], [wn.x1 - 20, 26]]) {
        const L = ['#cdbfa8', '#dcd0bb', '#e8dfcd', '#f3ede1'];
        rect(g, cx - w / 2, wn.y1 - 4, w, 4, L[1]); rect(g, cx - w / 2 + 1, wn.y1 - 5, w - 2, 1, L[2]); rect(g, cx - w / 2 + 2, wn.y1 - 4, w - 6, 1, L[3]);
        rect(g, cx - w / 2, wn.y1 - 1, w, 1, L[0]); px(g, cx - w / 2, wn.y1 - 4, L[0]); px(g, cx + w / 2 - 1, wn.y1 - 4, L[0]);
        for (let i = 0; i < w; i += 4) px(g, cx - w / 2 + i, wn.y1 - 3, '#cbbca3'); // stitching
      }
      // a succulent on the sill
      const sx = Math.round(wn.x0 + VW * 0.58), sy = wn.y1 - 2; BZ.fillPoly(g, [[sx - 5, sy], [sx + 5, sy], [sx + 4, sy - 6], [sx - 4, sy - 6]], '#b8643e'); rect(g, sx - 5, sy - 7, 10, 2, '#cf7a50');
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.42; leaf(g, sx, sy - 7, 6, 2, a, k % 2 ? '#7fa38a' : '#9cbca2', null); }
      // curtain rod with finials
      const ry = wn.y0 - 11; rect(g, wn.x0 - 22, ry, VW + 44, 2, '#2b2724'); rect(g, wn.x0 - 22, ry, VW + 44, 1, '#57504a');
      ell(g, wn.x0 - 23, ry + 1, 2.5, 2.5, '#2b2724'); ell(g, wn.x1 + 23, ry + 1, 2.5, 2.5, '#2b2724'); px(g, wn.x0 - 24, ry, '#77706a'); px(g, wn.x1 + 22, ry, '#77706a');
      rect(g, wn.x0 - 20, ry + 2, 2, 4, '#2b2724'); rect(g, wn.x1 + 18, ry + 2, 2, 4, '#2b2724');
    }

    // ── plants that stand in front of the window and wall (unchanged species, richer shading) ──
    paintPlants(W, H, F) {
      const g = this.over.getContext('2d'), r = BZ.rng(1919);
      // hanging pothos (top left)
      const hx = W * 0.2; BZ.drawThin(g, hx, 0, hx, 14, '#3a3a36');
      ell(g, hx, 18, 11, 5, '#e9e4d8'); ell(g, hx, 16, 11, 2, '#cfc8b8'); ell(g, hx - 4, 18, 4, 3, '#f6f2e8');
      for (const [dx, len] of [[-8, 0.55], [-2, 0.75], [5, 0.45], [9, 0.62]]) {
        let vx = hx + dx, vy = 20;
        for (let k = 0; k < len * H * 0.5; k += 4) {
          const nx = vx + Math.sin(k * 0.11 + dx) * 1.6, ny = vy + 4; BZ.drawThin(g, vx, vy, nx, ny, '#4f6b2e');
          if (k % 8 === 0) leaf(g, nx, ny, 7, 3.2, Math.PI * (k % 16 ? 0.15 : 0.85), k % 24 ? '#5b8a32' : '#86ad4a', null, { notch: true, hi: '#a9c96e' });
          vx = nx; vy = ny;
        }
      }
      // bird of paradise (back left, speckled black pot)
      const bx = W * 0.13, bpY = F + 14;
      ell(g, bx + 3, bpY + 11, 17, 3, 'rgba(20,10,0,0.25)');
      for (const [a, L] of [[-1.95, 0.8], [-1.75, 0.95], [-1.45, 0.88], [-1.25, 0.7], [-2.2, 0.6], [-1.05, 0.55]]) {
        const sx = bx + Math.cos(a) * L * H * 0.42, sy = bpY - 10 + Math.sin(a) * L * H * 0.42;
        BZ.drawThin(g, bx, bpY - 10, sx, sy, '#4a6630'); BZ.drawThin(g, bx + 1, bpY - 10, sx + 1, sy, '#3e5828');
        const la = a + (a < -1.6 ? -0.35 : 0.35);
        leaf(g, sx, sy, H * 0.22 * L, 7 * L + 2, la, '#3f6a38', '#7da35e', { edge: '#2f5229', hi: '#5f8a4c' });
        for (let k = 0; k < 4; k++) { const t = 0.3 + k * 0.17, lx = sx + Math.cos(la) * H * 0.22 * L * t, ly = sy + Math.sin(la) * H * 0.22 * L * t; BZ.drawThin(g, lx, ly, lx + Math.cos(la + 1.4) * 5, ly + Math.sin(la + 1.4) * 5, '#c3c7ba'); }
      }
      BZ.fillPoly(g, [[bx - 15, bpY - 12], [bx + 15, bpY - 12], [bx + 12, bpY + 10], [bx - 12, bpY + 10]], '#2b2a2d');
      BZ.fillPoly(g, [[bx - 15, bpY - 12], [bx - 9, bpY - 12], [bx - 7, bpY + 10], [bx - 12, bpY + 10]], '#38373b');
      for (let i = 0; i < 40; i++) px(g, bx - 12 + r() * 24, bpY - 10 + r() * 18, '#d8d6d0');
      ell(g, bx, bpY - 12, 15, 3, '#1c1b1e'); ell(g, bx, bpY - 12, 13, 2, '#3a2a1e');
      // split-leaf philodendron on an iron stand by the window, porcelain pot
      const fx = W - 28, standTop = F - 6, potY = standTop - 12; // in the corner past the window, not in front of the sill
      ell(g, fx, F + 24, 18, 3, 'rgba(20,10,0,0.22)');
      BZ.drawThin(g, fx - 10, standTop, fx - 14, F + 22, '#2a2826'); BZ.drawThin(g, fx + 10, standTop, fx + 14, F + 22, '#2a2826'); BZ.drawThin(g, fx, standTop, fx, F + 24, '#2a2826');
      ellRing(g, fx - 15, F + 22, 2, 2, '#2a2826'); ellRing(g, fx + 15, F + 22, 2, 2, '#2a2826');
      ell(g, fx, standTop, 16, 3, '#33302c'); ell(g, fx - 4, standTop - 1, 8, 1, '#4a4642');
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI * 0.92 + (i / 10) * Math.PI * 0.84 + (r() - 0.5) * 0.12, L = H * (0.13 + r() * 0.07);
        const mx2 = fx + Math.cos(a) * L * 0.5, my2 = potY - 10 + Math.sin(a) * L * 0.75 - 4;
        const sx = fx + Math.cos(a) * L * 0.85, sy = potY - 8 + Math.sin(a) * L * 0.7;
        BZ.drawThin(g, fx, potY - 10, mx2, my2, '#6b8642'); BZ.drawThin(g, mx2, my2, sx, sy, '#6b8642');
        const droop = a + (Math.cos(a) > 0 ? 0.55 : -0.55), col = i % 3 ? '#2f5d2d' : '#3b6f35';
        for (let k = -4; k <= 4; k++) leaf(g, sx, sy, L * (0.62 - Math.abs(k) * 0.05), 3.4, droop + k * 0.2, col, k === 0 ? '#6f9d55' : null, { hi: k < 0 ? '#4f8a45' : null });
      }
      ell(g, fx, potY, 16, 13, '#e8ebf1'); ell(g, fx - 4, potY - 3, 8, 7, '#f6f8fb'); ell(g, fx + 6, potY + 4, 7, 6, '#d5d9e2'); ell(g, fx, potY - 12, 15, 3, '#c8ccd6');
      for (let i = 0; i < 28; i++) { const a = r() * Math.PI * 2, rr = r(); g.fillStyle = '#3c5aa3'; g.fillRect(Math.round(fx + Math.cos(a) * 13 * rr), Math.round(potY + Math.sin(a) * 9 * rr), 2, 1); }
      g.fillStyle = '#3c5aa3'; g.fillRect(Math.round(fx - 15), Math.round(potY - 8), 30, 1); g.fillRect(Math.round(fx - 14), Math.round(potY + 7), 28, 1);
    }
    paintFront(W, H) {
      const f = this.fg.getContext('2d'), r = BZ.rng(1920); f.clearRect(0, 0, W, H);
      const mx = 6, my = H + 4;
      for (const [a, L] of [[-1.15, 0.2], [-0.7, 0.17], [-1.5, 0.16]]) {
        const lx = mx + Math.cos(a) * 18, ly = my + Math.sin(a) * 18;
        BZ.drawThin(f, mx, my, lx, ly, '#7c9a5a');
        leaf(f, lx, ly, H * L, H * L * 0.45, a - 0.1, '#3f7d3b', '#d9e6c4', { notch: true, hi: '#5f9a55' });
        for (let k = 0; k < 5; k++) { const t = 0.25 + r() * 0.6, v = (r() - 0.5) * 0.5; const ex = lx + Math.cos(a) * H * L * t - Math.sin(a) * H * L * 0.45 * v, ey = ly + Math.sin(a) * H * L * t + Math.cos(a) * H * L * 0.45 * v; ell(f, ex, ey, 2 + r() * 3, 1 + r() * 2, k % 2 ? '#eef3e2' : '#d4e5bd'); }
      }
      for (let k = 0; k < 7; k++) leaf(f, W - 4 - k * 5, H + 2 - (k % 3) * 4, 13, 6, Math.PI + 0.5 + k * 0.18, k % 2 ? '#5b8a32' : '#6f9c3e', '#9dc06a', { notch: true });
    }

    // ── live bits ──
    tickBird() {
      const wn = this.win, VW = wn.x1 - wn.x0, fd = this.feeder || { x: 20, y: 38 }, ledge = fd.y;
      if (!this.bird) { if (--this.birdWait <= 0 && this.phase !== 'night') this.bird = { x: VW + 8, y: 4, st: 'in', t: 0, tx: fd.x + (Math.random() < 0.5 ? -4 : 4), stay: 500 + Math.random() * 700 }; return; }
      const b = this.bird; b.t++;
      if (b.st === 'in') { b.x += (b.tx - b.x) * 0.05 - 0.4; b.y += (ledge - b.y) * 0.06; if (Math.abs(b.x - b.tx) < 2 && Math.abs(b.y - ledge) < 1.5) { b.st = 'perch'; b.t = 0; b.y = ledge; } }
      else if (b.st === 'perch') { if (b.t % 90 === 0) b.face = Math.random() < 0.5 ? -1 : 1; if (b.t % 140 === 70) b.x = fd.x + (Math.random() < 0.5 ? -4 : 4); if (b.t > b.stay) { b.st = 'out'; b.t = 0; } }
      else { b.x += 1.5; b.y -= 0.6; if (b.x > VW + 12) { this.bird = null; this.birdWait = 1200 + Math.random() * 2400; } }
    }
    drawBird(ctx, X, Y) {
      const b = this.bird; if (!b) return; const wn = this.win, x = X + wn.x0 + b.x, y = Y + wn.y0 + b.y, f = b.face || -1;
      const body = this.phase === 'dusk' ? '#7d7f90' : '#8f95a3', wing = '#6c7180';
      if (b.st === 'perch') {
        const peck = b.t % 160 > 140; ell(ctx, x, y - 3, 3.5, 2.5, body); ell(ctx, x - f, y - 3, 2.2, 1.6, wing);
        const hx = x + f * (peck ? 3.5 : 3), hy = y - (peck ? 3 : 5.5); ell(ctx, hx, hy, 1.6, 1.6, '#7e8494'); px(ctx, hx - f * 0.5, hy + 1.3, '#5f9e7c'); px(ctx, hx, hy + 1.5, '#8c5f9e'); px(ctx, hx + f * 0.6, hy - 0.4, '#e09b3a'); px(ctx, hx + f * 1.7, hy + 0.3, '#3b3b3b');
        px(ctx, x - f * 4, y - 3, wing); px(ctx, x - 1, y, '#d48a8a'); px(ctx, x + 1, y, '#d48a8a');
      } else { const up = (b.t >> 2) & 1; ell(ctx, x, y, 3, 1.8, body); BZ.drawThin(ctx, x - 3, y - (up ? 3 : -1), x + 3, y - (up ? 3 : -1), wing); px(ctx, x + 3.5, y - 1, '#7e8494'); }
    }
    drawCurtains(ctx, X, Y, t) {
      const wn = this.win, F = this.floorY, top = wn.y0 - 9, bot = F + 1, L = R.linen;
      ctx.save(); ctx.globalAlpha = 0.94;
      for (const [x0, w, side] of [[wn.x0 - 19, 22, -1], [wn.x1 - 3, 22, 1]]) {
        const sway = 1.4 * Math.sin(t * 0.011 + side) + 0.6 * Math.sin(t * 0.027 + side * 2);
        for (let c = 0; c < w; c++) {
          const k = Math.sin(c * 0.62 + side) * 1.6 + 2.2 + (side < 0 ? c / w : 1 - c / w) * 0.8, col = L[Math.max(0, Math.min(L.length - 1, Math.round(k)))];
          ctx.fillStyle = col;
          for (let sg = 0; sg < 6; sg++) { const y0 = top + ((bot - top) * sg) / 6, y1 = top + ((bot - top) * (sg + 1)) / 6, u = (sg + 0.5) / 6, dx = sway * Math.pow(u, 1.6) * (1 - c / (w * 2)); ctx.fillRect(Math.round(X + x0 + c + dx), Math.round(Y + y0), 1, Math.ceil(y1 - y0)); }
        }
        for (let c = 0; c < w; c += 3) { ctx.fillStyle = '#2b2724'; ctx.fillRect(Math.round(X + x0 + c), Math.round(Y + top - 1), 1, 2); } // rings
        ctx.fillStyle = L[0]; for (let c = 0; c < w; c++) if ((c + Math.round(t * 0.02)) % 4 < 2) ctx.fillRect(Math.round(X + x0 + c + sway), Math.round(Y + bot), 1, 1); // hem
      }
      ctx.restore();
    }
    drawClock(ctx, X, Y) {
      const c = this.clock; if (!c) return; const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60;
      const am = (m / 60) * Math.PI * 2 - Math.PI / 2, ah = (h / 12) * Math.PI * 2 - Math.PI / 2, x = X + c.x, y = Y + c.y;
      BZ.drawThin(ctx, x, y, x + Math.cos(ah) * 4, y + Math.sin(ah) * 4, '#2e2b28'); BZ.drawThin(ctx, x, y, x + Math.cos(am) * 6.5, y + Math.sin(am) * 6.5, '#2e2b28');
      const as = (d.getSeconds() / 60) * Math.PI * 2 - Math.PI / 2; px(ctx, x + Math.cos(as) * 6, y + Math.sin(as) * 6, '#b5583c');
    }
    drawShaft(ctx, X, Y, t) { // the light in the air between window and floor, with dust turning in it
      const wn = this.win, B = this.beam, P = PHASES[this.phase], F = this.floorY;
      const quad = [[X + wn.x0 + 4, Y + wn.y1], [X + wn.x1 - 4, Y + wn.y1], [X + B.xb, Y + B.top + 4], [X + B.xa - B.sh * 0.1, Y + B.top + 4]];
      BZ.fillPoly(ctx, quad, `rgba(255,236,190,${0.045 * P.beam})`);
      if (P.beam < 0.3) return;
      ctx.fillStyle = 'rgba(255,248,224,0.75)';
      for (const m of this.motes) {
        const v = (m.v + t * 0.00025 * m.s) % 1, u = m.u + Math.sin(t * 0.01 * m.s + m.p) * 0.03;
        const yy = wn.y1 + (B.top + (B.bot - B.top) * 0.4 - wn.y1) * v, l = wn.x0 + (B.xa - B.sh * 0.2 - wn.x0) * v, rr = wn.x1 + (B.xb - wn.x1) * v;
        if ((t + m.p * 40) % 200 < 150) ctx.fillRect(Math.round(X + l + (rr - l) * u), Math.round(Y + yy), 1, 1);
      }
      void F;
    }

    drawBack(ctx) {
      const X = this.st.x, Y = this.st.y, t = this.w.frame || 0, wn = this.win;
      if (t % 900 === 0 && phaseNow() !== this.phase) this.paint();
      ctx.drawImage(this.bg, X, Y);
      ctx.drawImage(this.view, X + wn.x0, Y + wn.y0);
      // clouds drifting behind the rooftops
      const P = PHASES[this.phase]; ctx.save(); ctx.beginPath(); ctx.rect(X + wn.x0, Y + wn.y0, wn.x1 - wn.x0, (wn.y1 - wn.y0) * 0.5); ctx.clip();
      for (const c of this.clouds) {
        c.x += c.v; if (c.x > wn.x1 - wn.x0 + 30) c.x = -40;
        const cx = X + wn.x0 + c.x, cy = Y + wn.y0 + c.y, s = c.s;
        ell(ctx, cx, cy + 2 * s, 14 * s, 3 * s, P.cloud[2]); ell(ctx, cx - 5 * s, cy, 7 * s, 4 * s, P.cloud[1]); ell(ctx, cx + 4 * s, cy - 1 * s, 8 * s, 5 * s, P.cloud[0]); ell(ctx, cx + 11 * s, cy + 1 * s, 5 * s, 3 * s, P.cloud[1]);
      }
      ctx.restore();
      this.tickBird(); this.drawBird(ctx, X, Y);
      ctx.drawImage(this.frame, X, Y);
      this.drawCurtains(ctx, X, Y, t);
      this.drawClock(ctx, X, Y);
      ctx.drawImage(this.over, X, Y);
      this.drawShaft(ctx, X, Y, t);
    }
    drawFront(ctx) { ctx.drawImage(this.fg, this.st.x, this.st.y); }
    // where a cat should look to chatter at the pigeon (stage coords), or null
    fixtures() { const X = this.st.x, Y = this.st.y, F = this.floorY, cb = this.cube; return [{ key: 'cubby', type: 'cubby', draw: true, x: X + cb.hx, y: Y + F + 7, rootPx: F + 7 - cb.y1, hole: { cx: X + cb.hx, cy: Y + cb.hy, rx: 12.5, ry: 12 }, box: { x0: X + cb.x0, x1: X + cb.x1, y0: Y + cb.y0, y1: Y + cb.y1 } }]; }
    // places a small thing can be set down: the sill, the bookcase top and its two shelves (stage coords; `ground` sorts it)
    surfaces() {
      const X = this.st.x, Y = this.st.y, F = this.floorY, wn = this.win, bc = this.bookcase, back = Y + F + 1;
      return [
        { key: 'sill', x0: X + wn.x0 - 9, x1: X + wn.x1 + 9, y: Y + wn.y1 - 1, ground: back - 3.2 },
        { key: 'bookTop', x0: X + bc.x0 + 3, x1: X + bc.x1 - 3, y: Y + bc.topY - 3, ground: back - 3 },
        { key: 'shelf1', x0: X + bc.x0 + 6, x1: X + bc.x1 - 6, y: Y + bc.mid, ground: back - 2.8 },
        { key: 'shelf2', x0: X + bc.x0 + 6, x1: X + this.cube.x0 - 6, y: Y + bc.baseY - 7, ground: back - 2.6 },
      ];
    }
    birdSpot() { const b = this.bird; if (!b || b.st !== 'perch') return null; return [this.st.x + this.win.x0 + b.x, this.st.y + this.win.y0 + b.y - 3]; }
  }

  // ─── The backyard (ours): out the French doors of the green art studio ─────
  // Same RCT rules as the room: short ramps, ordered dither, one light (the sun,
  // high and to the right), dense specific things. Layers: bg (sky, woods,
  // studio, plant-care corner, lawn, flagstones, beds) → sun pools → leaf
  // dapple → [props, items, cats] → canopy + life (butterflies, leaves, the
  // squirrel) → time-of-day tint.
  const Y = {
    siding: ['#2c4231', '#334c37', '#3a563e', '#425f45', '#4a694c', '#537354', '#5e7e5e', '#6a8a69'],
    trim: ['#9da197', '#bfc2b9', '#d8dad2', '#eaebe5', '#f7f8f3'],
    deck: ['#4f3f30', '#62503d', '#76634d', '#8a765e', '#9d8a70', '#b09d83'],
    stone: ['#7b7a72', '#8a887f', '#98968c', '#a6a399', '#b3b0a5', '#c0bdb1', '#ccc9bd'],
    lawn: ['#355c27', '#3f6a2c', '#4a7932', '#558839', '#619642', '#6fa44b', '#7fb155'],
    litter: ['#4e3121', '#6b4026', '#86522e', '#a0663a', '#b97c47', '#7a5a3a', '#94744c'],
    bark: ['#2f2a25', '#3d3730', '#4c453c', '#5c544a', '#6e665b', '#807868'],
    leafD: ['#22381f', '#2c4727', '#365631', '#43663a', '#527845', '#648a52', '#7a9e60'],
    soil: ['#2e2016', '#3b2a1d', '#4a3524', '#5a422e', '#6b503a'],
  };
  const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
  class Yard {
    constructor(world) { this.w = world; this.key = 'yard'; this.bg = mk(); this.fg = mk(); this.dap = mk(); this.phase = null; this.doorT = 0; this.bflies = []; this.leaves = []; this.squirrel = null; this.sqWait = 500 + Math.random() * 900; this.ffl = []; }
    layout(st) {
      this.st = st; const W = st.w, H = st.h;
      const F = Math.round(H * 0.44); this.F = F; this.floorY = F + 7;
      const S = Math.round(W * 0.44); this.S = S;
      const top = 22; this.wallTop = top; this.door = { x0: S + 132, x1: S + 168, y0: top + 4, y1: F - 15 };
      this.landing = { x0: S + 122, x1: S + 172, top: F - 15, front: F - 7, foot: F + 5 };
      this.steps = [0, 1, 2].map((i) => ({ x0: S + 172 + i * 8, x1: S + 180 + i * 8, top: F - 11 + i * 5 }));
      this.shelf = { x0: S + 6, x1: S + 62, top: F - 48, mid: F - 26, foot: F + 3 };
      this.stand = { x: S + 76, top: F - 22, foot: F + 4 };
      this.bunny = { x: S + 204, y: F + 14 };
      this.tree = { x: Math.round(W * 0.15), base: F + 36, w: 15 };
      this.easel = { x: S + 216, foot: F + 34 }; this.wheel = { x: S + 182, foot: F + 66 }; // the studio spills out onto the patio: an easel and the kick wheel, right of the steps
      this.sandbox = { x0: -30, x1: 84, y0: H - 44, y1: H - 8 }; // the corner of the sandbox, bottom left
      this.feeder = { x: S - 30, base: F - 2, top: F - 72 }; // the bird feeder on its pole at the tree line, left of the shelves
      this.bushes = [{ kind: 'rhodo', x: S - 62, y: F - 3, r: 27 }, { kind: 'hydrangea', x: S - 10, y: F + 4, r: 17 }];
      this.birds = []; this.birdWait = 120 + Math.random() * 300;
      this.lawnEdge = (y) => S - 28 - (y - (F + 1)) * 0.32 + Math.sin(y * 0.19) * 4 + Math.sin(y * 0.061) * 9; // where the lawn meets the patio (stage y)
      // Juno lives out here, on her big bed on the lawn by the tree, watching the patio
      this.dogBed = { x: this.tree.x + 6, y: F + 76 };
      const dx = st.x + this.dogBed.x - 1 * this.w.size, dy = st.y + this.dogBed.y + 0.5;
      if (!this.dog) { this.dog = new BZ.Dog(this.w, dx, dy); this.dog.theta = 0.35; this.dog.anim = 'sphinx'; this.dog.st = 'watch'; this.dog.t = 0; this.dog.T = 700; for (let i = 0; i < 30; i++) this.dog.animate(); }
      else { this.dog.x = dx; this.dog.y = dy; }
      this.tire = { x: Math.round(W * 0.15) - 40, ropeY: 16, cy: F + 2, R: 19, r: 11, ground: F + 40 };
      const fy = (v) => F + 8 + (H - F - 8) * v;
      this.plots = [
        { key: 'wallBed', kind: 'bed', shape: 'rect', x0: S + 84, x1: S + 120, y0: F + 6, y1: F + 15, slots: [[S + 88, F + 13], [S + 96, F + 12], [S + 104, F + 13], [S + 112, F + 12], [S + 117, F + 13.5]] },
        { key: 'lawnBed', kind: 'bed', shape: 'ell', cx: Math.round(Math.min(W * 0.2, S - 90)), cy: Math.round(fy(0.66)), rx: 36, ry: 10, slots: [] },
        { key: 'patchA', kind: 'turf', shape: 'ell', cx: S + 70, cy: Math.round(fy(0.42)), rx: 17, ry: 6, slots: [] },
        { key: 'patchB', kind: 'turf', shape: 'ell', cx: Math.min(W - 26, S + 176), cy: Math.round(fy(0.8)), rx: 19, ry: 6, slots: [] },
      ];
      for (const p of this.plots) if (p.shape === 'ell') { const n = p.kind === 'bed' ? 7 : 3; for (let i = 0; i < n; i++) { const u = n === 1 ? 0 : (i / (n - 1)) * 2 - 1, row = p.kind === 'bed' ? (i % 2 ? -1 : 1) : 0; p.slots.push([p.cx + u * p.rx * 0.74, p.cy + row * p.ry * 0.3 + 1]); } }
      for (const p of this.plots) p.slots = p.slots.map(([x, y]) => [st.x + x, st.y + y]);
      this.adk = { x: Math.round(Math.max(W * 0.36, S - 36)), y: Math.round(fy(0.3)) };
      // sun pools on the ground: they drift with the hour, like the real dapple did
      const hr = new Date().getHours() + new Date().getMinutes() / 60, drift = Math.max(-1, Math.min(1, (hr - 13) / 5)) * 18;
      this.pools = [[S + 128 + drift, fy(0.3)], [W * 0.3 + drift, fy(0.5)], [S + 40 + drift, fy(0.74)]].map(([x, y]) => ({ x: st.x + x, y: st.y + y, rx: 34, ry: 10 }));
      this.sun = this.pools[0];
      this.ffl = Array.from({ length: 12 }, () => ({ x: Math.random() * W, y: F - 30 + Math.random() * (H - F + 10), p: Math.random() * 6.28, v: 0.3 + Math.random() * 0.5 }));
      this.paint();
    }
    paint() {
      this.phase = phaseNow(); const P = PHASES[this.phase], { w: W, h: H } = this.st, F = this.F;
      for (const c of [this.bg, this.fg, this.dap]) { c.width = W; c.height = H; }
      const g = this.bg.getContext('2d');
      this.paintSky(g, W, F, P); this.paintWoods(g, W, F); this.paintStudio(g, W, F); this.paintGround(g, W, H, F); this.paintPlots(g); this.paintRhodo(g, this.bushes[0]); this.paintFeeder(g); this.paintHydrangea(g, this.bushes[1]); this.paintCorner(g, F); this.paintDeck(g, F); this.paintSandbox(g);
      this.paintDapple(W, H, F); this.paintCanopy(W, H, F);
    }
    night() { return this.phase === 'night'; }
    // ── sky in the gaps, the woods: layered trunks, foliage masses, a carpet of last year's leaves ──
    paintSky(g, W, F, P) { for (let y = 0; y < F; y++) for (let x = 0; x < W; x++) px(g, x, y, rampAt(P.sky, (y / (F * 0.9)) * (P.sky.length - 1), x, y)); }
    paintWoods(g, W, F) {
      const r = BZ.rng(808), S = this.S, nt = this.night(), haze = (c, t) => mix(c, nt ? '#1b2440' : '#b8c8b4', t);
      for (const [layer, n, wMin, wMax, tone] of [[0, 26, 2, 5, 0.55], [1, 16, 3, 7, 0.32], [2, 9, 5, 10, 0.12]]) { // far → near trunks, hazier with distance
        for (let i = 0; i < n; i++) {
          const x = r() * (S + 20), w = wMin + r() * (wMax - wMin), base = F - 8 + layer * 5 + r() * 4;
          for (let y = 0; y < base; y++) { const k = (x + y * 0.02) % 3 < 1 ? 1 : 2; rect(g, x, y, w, 1, haze(Y.bark[k + (layer > 1 ? 1 : 0)], tone)); }
          rect(g, x, 0, 1, base, haze(Y.bark[3], tone)); // lit edge
        }
        for (let i = 0; i < 46 + layer * 16; i++) { // leaf masses between and above the trunks: lumpy, leafy edges, lit from the upper right
          const cx = r() * (S + 30), cy = r() * (F - 26) * (layer === 2 ? 0.55 : 0.92), rr = 7 + r() * (layer === 2 ? 10 : 14);
          const cols = Y.leafD.slice(Math.min(2, layer), Math.min(2, layer) + 5).map((c) => haze(c, tone));
          for (let k = 0; k < 7; k++) { const a = r() * 6.28, d = r() * rr * 0.6; ell(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, rr * (0.45 + r() * 0.25), rr * (0.35 + r() * 0.2), cols[k < 3 ? 0 : 1]); }
          ell(g, cx + rr * 0.2, cy - rr * 0.25, rr * 0.45, rr * 0.3, cols[2]);
          for (let k = 0; k < rr * 3; k++) { const a = r() * 6.28, d = r() * rr; px(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, cols[(Math.sin(a) < -0.2 ? 3 : 1) + (k & 1)]); }
        }
      }
      // the leaf-litter floor of the woods, sloping up behind the lawn
      for (let y = F - 16; y < F + 14; y++) for (let x = 0; x < S + 10; x++) {
        const edge = F - 10 + Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13) * 1.5; if (y < edge) continue;
        const q = r(); px(g, x, y, q < 0.3 ? Y.litter[1] : q < 0.55 ? Y.litter[2] : q < 0.72 ? Y.litter[0] : q < 0.86 ? Y.litter[3] : q < 0.95 ? Y.litter[5] : Y.litter[4]);
      }
      // two yellow stakes off in the woods (from the photo)
      const sx = Math.round(S * 0.42); rect(g, sx, F - 34, 1, 28, '#c9a43a'); rect(g, sx + 3, F - 30, 1, 25, '#d8b44a');
    }
    // ── the green studio: clapboard, white trim, windows with the woods in them, French doors ──
    paintStudio(g, W, F) {
      const S = this.S, eave = 12, nt = this.night(), r = BZ.rng(4040);
      rect(g, S - 4, 0, W - S + 8, eave - 2, '#3a3b3d'); for (let x = S - 4; x < W; x += 3) px(g, x, 2 + ((x / 3) & 1), '#4c4d50'); // roof edge
      rect(g, S - 6, eave - 3, W - S + 10, 3, Y.trim[3]); rect(g, S - 6, eave - 3, W - S + 10, 1, Y.trim[4]); rect(g, S - 6, eave - 1, W - S + 10, 1, Y.trim[1]); // fascia + gutter
      for (let y = eave; y < F - 5; y++) {
        const b = (y - eave) % 6;
        for (let x = S; x < W; x++) {
          let L = b === 0 ? 0.6 : b === 1 ? 6 : 3.4 + (b - 2) * 0.35 + ((x * 7 + y * 3) % 23 === 0 ? -0.8 : 0) + Math.sin(x * 0.7 + y * 3.1) * 0.25;
          if (x < S + 3) L -= 1.2; // the corner board's shadow
          px(g, x, y, rampAt(Y.siding, L, x, y));
        }
      }
      rect(g, S - 2, eave, 4, F - 5 - eave, Y.siding[5]); rect(g, S - 2, eave, 1, F - 5 - eave, Y.siding[7]); // corner board
      for (let x = S; x < W; x++) for (let y = F - 5; y < F + 1; y++) px(g, x, y, (Math.floor((x + (y & 1) * 3) / 6) + y) % 5 === 0 ? '#5e3a2c' : ((x + (y & 1) * 3) % 6 === 0 ? '#9a8f80' : y === F - 5 ? '#6f4635' : '#8a5440')); // brick foundation
      const win = (x0, x1, y0, y1, seed) => {
        const rr = BZ.rng(seed); rect(g, x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6, Y.trim[3]); rect(g, x0 - 3, y0 - 3, x1 - x0 + 6, 1, Y.trim[4]); rect(g, x1 + 2, y0 - 3, 1, y1 - y0 + 6, Y.trim[1]); rect(g, x0 - 3, y1 + 2, x1 - x0 + 6, 1, Y.trim[0]);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          if (nt) { px(g, x, y, (x + y) % 7 === 0 ? '#f2cf80' : rampAt(['#a8783a', '#c8954a', '#e0b060', '#efc778'], 1.6 + (y - y0) / (y1 - y0) * 1.4, x, y)); continue; }
          const u = (x - x0) / (x1 - x0), v = (y - y0) / (y1 - y0), trunk = Math.abs(u - 0.55 - Math.sin(v * 3) * 0.03) < 0.09;
          px(g, x, y, trunk ? '#4a443c' : rampAt(['#2c3a30', '#3a4c3c', '#4d644c', '#6c8468', '#9eb4a8', '#c8d8d4'], 1.2 + (1 - v) * 2.2 + Math.sin(x * 0.8 + y * 0.3) * 0.6 + (rr() < 0.05 ? 1.5 : 0), x, y));
        }
        if (!nt) BZ.fillPoly(g, [[x0 + 2, y1], [x0 + 7, y1], [x1 - 2, y0 + 6], [x1 - 2, y0 + 1]], 'rgba(255,255,255,0.12)');
        rect(g, x0 - 4, y1 + 3, x1 - x0 + 8, 2, Y.trim[2]); rect(g, x0 - 4, y1 + 3, x1 - x0 + 8, 1, Y.trim[4]); // sill
      };
      const wt = this.wallTop + 6;
      win(S + 12, S + 50, wt, F - 54, 1);
      win(S + 96, S + 122, wt + 4, F - 40, 2);
      win(S + 180, S + 200, wt + 4, F - 42, 3);
      for (let x = S + 290; x + 22 < W - 4; x += 64) win(x, x + 22, wt + 4, F - 42, x);
      // French doors (drawn by drawBack so they can swing); the porch light beside them
      const lx = S + 126, ly = this.door.y0 + 8; rect(g, lx - 3, ly - 5, 6, 7, Y.trim[2]); ell(g, lx + 2, ly, 3, 3, '#2a2724'); ell(g, lx + 5, ly + 2, 2, 2, nt ? '#fff1c0' : '#d8d2c2');
      if (nt) for (let k = 1; k <= 4; k++) ell(g, lx + 5, ly + 2, 4 + k * 5, 3 + k * 4, 'rgba(255,220,150,0.07)');
      rect(g, S + 168, F - 52, 4, 6, '#e2e2dc'); rect(g, S + 169, F - 51, 2, 2, '#9a9a94'); // an outdoor outlet
      // a downspout at the right
      const dx = Math.min(W - 6, S + 212); rect(g, dx, eave, 3, F - eave, Y.trim[2]); rect(g, dx, eave, 1, F - eave, Y.trim[4]);
      void r;
    }
    // ── ground: lawn on the left running into the litter, flagstones with moss on the right ──
    paintGround(g, W, H, F) {
      const S = this.S, r = BZ.rng(2626), top = F + 1;
      const edge = (y) => S - 28 - (y - top) * 0.32 + Math.sin(y * 0.19) * 4 + Math.sin(y * 0.061) * 9; // lawn | patio, the patio widening a little toward you
      const seeds = []; let row = 0; // flagstone seeds on a jittered grid, bigger toward the front
      for (let y = top - 6; y < H + 16; row++) { const sh = 9 + ((y - top) / (H - top)) * 13, sw = sh * 2.5; for (let x = -10 + (row & 1) * sw * 0.5; x < W + sw; x += sw) seeds.push([x + (r() - 0.5) * sw * 0.8, y + (r() - 0.5) * sh * 0.7, sh, r(), r()]); y += sh; }
      const grid = new Map(); for (const sd of seeds) { const k = Math.floor(sd[0] / 30) + ',' + Math.floor(sd[1] / 14); (grid.get(k) || grid.set(k, []).get(k)).push(sd); }
      const near = (x, y) => { let a = null, da = 1e9, db = 1e9; const gx = Math.floor(x / 30), gy = Math.floor(y / 14); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (const sd of grid.get((gx + i) + ',' + (gy + j)) || []) { const d = Math.hypot((x - sd[0]) / 2.5, y - sd[1]); if (d < da) { db = da; da = d; a = sd; } else if (d < db) db = d; } return [a, da, db]; };
      for (let y = top; y < H; y++) {
        const ex = edge(y), v = (y - top) / (H - top);
        for (let x = 0; x < W; x++) {
          const q = r();
          if (x < ex - 2 || (x < S - 6 && y < top + 4)) { // lawn: blades, darker under the tree, leaf litter drifting in at the back
            let L = 3 + v * 1.4 + Math.sin(x * 1.7 + y * 0.9) * 0.55 + (q < 0.16 ? 1.1 : 0) - Math.max(0, top + 12 - y) * 0.18 + Math.sin(x * 0.05 + y * 0.11) * 0.5;
            const dt = Math.hypot((x - this.tree.x) / 46, (y - this.tree.base) / 12); if (dt < 1) L -= (1 - dt) * 1.5;
            const litter = y < top + 16 && q < 0.35 * (1 - (y - top) / 16);
            px(g, x, y, litter ? Y.litter[1 + Math.floor(r() * 4)] : q < 0.008 ? Y.litter[2 + ((x + y) & 1)] : rampAt(Y.lawn, L, x, y)); continue;
          }
          if (x < ex + 2) { px(g, x, y, q < 0.45 ? Y.lawn[2 + (q < 0.2 ? 1 : 0)] : q < 0.75 ? '#5f7a3a' : '#5a4a32'); continue; } // moss and dirt along the seam
          const [a, da, db] = near(x, y), gap = db - da;
          if (gap < 1.5 + v * 0.9) { px(g, x, y, q < 0.62 ? (q < 0.4 ? '#5c7838' : '#76944a') : q < 0.85 ? '#5a4a36' : '#4a3c2c'); continue; } // moss and soil in the joints
          let L = 3.1 + (a[3] - 0.5) * 1.5 + v * 0.7 + Math.sin(x * 0.45 + y * 0.8 + a[3] * 9) * 0.3 + (q < 0.04 ? -0.8 : q > 0.96 ? 0.7 : 0);
          if (gap < 2.6 + v) L += (y - a[1]) < 0 ? 0.6 : -0.7; // a soft lip on each slab
          let c = rampAt(Y.stone, L, x, y);
          c = a[4] < 0.35 ? mix(c, '#8e98a3', 0.32) : a[4] > 0.78 ? mix(c, '#b4a283', 0.24) : c; // bluestone, buff
          if (q < 0.008) c = Y.litter[2 + ((x * 3 + y) % 3)]; else if (q < 0.025 && a[3] > 0.5) c = mix(c, '#6f8a42', 0.55); // a leaf, lichen
          px(g, x, y, c);
        }
      }
      for (let i = 0; i < 5; i++) rect(g, S, F + 1 + i, W - S, 1, `rgba(20,14,6,${0.3 - i * 0.06})`); // contact shadow at the foundation
    }
    // ── beds: a stone-edged bed along the wall, a kidney bed in the lawn, two turf patches in the patio ──
    paintPlots(g) {
      const X = this.st.x, Yo = this.st.y, r = BZ.rng(77);
      for (const p of this.plots) {
        const inside = p.shape === 'rect' ? (x, y) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 : (x, y) => ((x - p.cx) / p.rx) ** 2 + ((y - p.cy) / p.ry) ** 2 <= 1;
        const bx0 = p.shape === 'rect' ? p.x0 - 3 : p.cx - p.rx - 3, bx1 = p.shape === 'rect' ? p.x1 + 3 : p.cx + p.rx + 3, by0 = p.shape === 'rect' ? p.y0 - 3 : p.cy - p.ry - 3, by1 = p.shape === 'rect' ? p.y1 + 3 : p.cy + p.ry + 3;
        for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
          if (!inside(x, y)) continue;
          if (p.kind === 'bed') px(g, x, y, rampAt(Y.soil, 1.8 + Math.sin(x * 1.3 + y * 2.1) * 0.7 + (r() < 0.08 ? 1.5 : 0) + (y - by0) / (by1 - by0) * 0.8, x, y));
          else px(g, x, y, r() < 0.12 ? Y.soil[2] : rampAt(Y.lawn, 3.6 + Math.sin(x * 1.9 + y) * 0.8 + (r() < 0.2 ? 1.2 : 0), x, y));
        }
        // the edging: rounded river stones (beds) or a thin dark rim (turf)
        const pts = []; if (p.shape === 'rect') { for (let x = p.x0 - 2; x <= p.x1 + 2; x += 4) pts.push([x, p.y1 + 2]); for (let x = p.x0 - 1; x <= p.x1 + 1; x += 5) pts.unshift([x, p.y0 - 1]); }
        else for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; pts.push([p.cx + Math.cos(a) * (p.rx + 2), p.cy + Math.sin(a) * (p.ry + 1.5)]); }
        if (p.kind === 'bed') for (const [x, y] of pts.sort((a, b) => a[1] - b[1])) { const c = Y.stone[2 + Math.floor(r() * 4)]; ell(g, x, y, 2.6, 1.6, mix(c, '#000000', 0.25)); ell(g, x - 0.5, y - 0.6, 2.1, 1.2, c); px(g, x - 1, y - 1, Y.stone[6]); }
        else for (const [x, y] of pts) px(g, x, y, '#4a3a28');
      }
      void X; void Yo;
    }
    // ── the plant-care corner: wire shelving with pots and jugs, a rake, a wire stand, a bag of soil, the stone bunny ──
    paintCorner(g, F) {
      const sh = this.shelf, nt = this.night(), navy = '#2a303d', navyL = '#465066', r = BZ.rng(31);
      ell(g, (sh.x0 + sh.x1) / 2, sh.foot + 1, (sh.x1 - sh.x0) * 0.55, 3, 'rgba(20,14,6,0.25)');
      const unit = (x0, x1) => {
        for (const x of [x0, x1 - 2]) { rect(g, x, sh.top - 2, 2, sh.foot - sh.top + 2, navy); rect(g, x, sh.top - 2, 1, sh.foot - sh.top + 2, navyL); }
        for (const y of [sh.top, sh.mid, sh.foot - 6]) { rect(g, x0, y, x1 - x0, 2, navy); for (let x = x0 + 1; x < x1 - 1; x += 3) { px(g, x, y, navyL); px(g, x + 1, y + 1, navyL); } rect(g, x0, y + 2, x1 - x0, 1, 'rgba(0,0,0,0.25)'); }
      };
      const m = Math.round((sh.x0 + sh.x1) / 2); unit(sh.x0, m - 1); unit(m + 1, sh.x1);
      const pot = (x, y, w, h, c) => { BZ.fillPoly(g, [[x - w, y - h], [x + w, y - h], [x + w - 1, y], [x - w + 1, y]], c[0]); rect(g, x - w - 1, y - h - 1, w * 2 + 2, 2, c[1]); px(g, x - w + 1, y - h + 2, c[2]); };
      const terra = ['#b8643a', '#cf7a50', '#e09068'], gray = ['#6e6a62', '#8a857a', '#a29d90'];
      // top shelf: an iron wreath frame, a saucer, a stack of pots, a bottle
      BZ.ellRing(g, sh.x0 + 12, sh.top - 6, 7, 4, '#2a2622'); BZ.ellRing(g, sh.x0 + 12, sh.top - 6, 4, 2, '#3a3530'); BZ.drawThin(g, sh.x0 + 6, sh.top - 6, sh.x0 + 18, sh.top - 6, '#2a2622');
      ell(g, sh.x0 + 25, sh.top - 1, 6, 1.5, '#a85a34'); pot(m + 6, sh.top, 4, 5, terra); pot(m + 6, sh.top - 5, 3, 3, terra);
      rect(g, sh.x1 - 9, sh.top - 9, 3, 9, 'rgba(210,225,205,0.65)'); rect(g, sh.x1 - 8, sh.top - 12, 1, 3, 'rgba(210,225,205,0.75)'); px(g, sh.x1 - 9, sh.top - 8, '#ffffff');
      // middle: a gallon jug, a green spray bottle, glass jars, a clay pot with a dead stalk
      rect(g, sh.x0 + 5, sh.mid - 11, 8, 11, '#ecebe4'); rect(g, sh.x0 + 5, sh.mid - 11, 2, 11, '#ffffff'); rect(g, sh.x0 + 9, sh.mid - 14, 3, 3, '#d8d6cc'); rect(g, sh.x0 + 11, sh.mid - 10, 2, 5, '#c8c6bc');
      rect(g, sh.x0 + 18, sh.mid - 8, 3, 8, '#3fa058'); rect(g, sh.x0 + 18, sh.mid - 11, 3, 3, '#e8e8e0'); px(g, sh.x0 + 21, sh.mid - 11, '#e8e8e0');
      for (let k = 0; k < 3; k++) { rect(g, m + 4 + k * 5, sh.mid - 6, 4, 6, 'rgba(200,215,210,0.6)'); px(g, m + 4 + k * 5, sh.mid - 5, '#ffffff'); }
      pot(sh.x1 - 7, sh.mid, 4, 5, gray); BZ.drawThin(g, sh.x1 - 7, sh.mid - 6, sh.x1 - 9, sh.mid - 15, '#8a7a4a');
      // bottom: pots in a row, a bag of potting soil leaning on the post
      pot(sh.x0 + 9, sh.foot - 6, 5, 6, terra); pot(sh.x0 + 21, sh.foot - 6, 4, 5, gray); pot(m + 10, sh.foot - 6, 5, 6, terra);
      BZ.fillPoly(g, [[sh.x0 - 4, sh.foot + 3], [sh.x0 + 12, sh.foot + 3], [sh.x0 + 11, sh.foot - 4], [sh.x0 - 3, sh.foot - 5]], '#8cc04a'); rect(g, sh.x0 - 2, sh.foot - 2, 10, 2, '#e8e2c8'); px(g, sh.x0 + 9, sh.foot - 4, '#a8d85a');
      // the rake, leaning against the shelf, green handle, steel tines on the stones
      const rk = [sh.x1 - 4, sh.top - 6], rb = [sh.x0 + 30, F + 14];
      BZ.drawThin(g, rk[0], rk[1], rb[0], rb[1], '#4caa3c'); BZ.drawThin(g, rk[0] + 1, rk[1], rb[0] + 1, rb[1], '#2f7a2a');
      BZ.drawThin(g, rb[0] - 6, rb[1] + 1, rb[0] + 6, rb[1] - 1, '#5a5e64'); for (let k = -5; k <= 5; k += 2) BZ.drawThin(g, rb[0] + k, rb[1] - k * 0.15, rb[0] + k - 1, rb[1] + 3 - k * 0.15, '#7a7e84');
      // the wire plant stand with a jug on it, scrolled feet
      const st = this.stand; BZ.drawThin(g, st.x - 6, st.top, st.x + 6, st.top, '#1e1c1a'); BZ.drawThin(g, st.x - 5, st.top + 2, st.x + 5, st.top + 2, '#1e1c1a');
      for (const sd of [-1, 1]) { BZ.drawThin(g, st.x + sd * 5, st.top, st.x + sd * 4, st.foot, '#1e1c1a'); BZ.ellRing(g, st.x + sd * 5, st.foot - 1, 1.6, 1.6, '#1e1c1a'); }
      BZ.drawThin(g, st.x, st.top + 2, st.x, st.foot - 3, '#1e1c1a'); BZ.ellRing(g, st.x, st.top + 12, 3, 3, '#2a2724');
      rect(g, st.x - 5, st.top - 9, 8, 9, '#ecebe4'); rect(g, st.x - 5, st.top - 9, 2, 9, '#ffffff'); rect(g, st.x - 2, st.top - 12, 3, 3, '#d8d6cc'); rect(g, st.x - 4, st.top - 6, 5, 3, '#c94a3a'); // a jug with a red label
      void nt; void r;
    }
    // ── the rhododendron at the tree line: a mound of leathery leaves in whorls, each leaf long and glossy with a pale midrib; pink trusses ──
    paintRhodo(g, b) {
      const r = BZ.rng(606), nt = this.night(), R = b.r, X = b.x, Yb = b.y;
      const LF = ['#17301b', '#1f3e24', '#2a512f', '#376539', '#467a46', '#5a9254', '#79ab6a'], RIB = '#8fbb7c', WOOD = ['#3a2a1c', '#5a4330', '#7a5d44'];
      ell(g, X + 3, Yb + 2, R * 1.08, R * 0.3, 'rgba(20,14,6,0.3)');
      for (let i = -2; i <= 2; i++) { BZ.drawThin(g, X + i * 3, Yb, X + i * 9 + (r() - 0.5) * 6, Yb - R * 0.9 - r() * R * 0.3, WOOD[1]); BZ.drawThin(g, X + i * 3 + 1, Yb, X + i * 9 + 1, Yb - R * 0.8, WOOD[0]); } // the trunk and branches, mostly hidden
      const inMound = (x, y) => ((x - X) / (R * 1.05)) ** 2 + ((y - (Yb - R * 0.62)) / (R * 0.72)) ** 2 <= 1;
      // whorls: a center and 6-8 leaves radiating out and a little down, from the back of the mound to the front
      const whorls = [];
      for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.86; whorls.push({ x: X + Math.cos(a) * d * R * 0.95, y: Yb - R * 0.62 + Math.sin(a) * d * R * 0.62, k: r() }); }
      whorls.sort((p, q) => p.y - q.y);
      for (const w of whorls) {
        const n = 6 + Math.floor(r() * 3), lit = (w.x - X) / R * 0.45 - (w.y - (Yb - R * 0.62)) / R * 0.9; // upper right of the mound is in the light
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + w.k * 2 + 0.3, len = 8 + r() * 5, wid = 2.4 + r() * 0.8, ex = w.x + Math.cos(ang) * len, ey = w.y + Math.sin(ang) * len * 0.75;
          if (!inMound(ex, ey) && r() < 0.6) continue;
          const up = Math.sin(ang) < 0, L = 2.4 + lit + (up ? 0.9 : -0.5) + (r() - 0.5) * 0.8;
          const pts = leafPts(w.x, w.y, len, wid, Math.atan2(Math.sin(ang) * 0.75, Math.cos(ang)));
          shade(g, pts, (x, y) => rampAt(LF, L + (((x - w.x) * Math.sin(ang) - (y - w.y) * Math.cos(ang)) > 0 ? -0.5 : 0.4), x, y)); // one half of the leaf in light, the other folded away
          BZ.drawThin(g, w.x + Math.cos(ang) * 2, w.y + Math.sin(ang) * 1.5, w.x + Math.cos(ang) * len * 0.85, w.y + Math.sin(ang) * len * 0.64, up ? RIB : LF[4]); // the midrib
          if (up && r() < 0.5) px(g, w.x + Math.cos(ang) * len * 0.45 + 1, w.y + Math.sin(ang) * len * 0.34 - 1, LF[6]); // a gloss
        }
      }
      // the trusses: domes of florets, pink with white edges, deeper at the throat; a few buds
      const TR = ['#a8336e', '#c94a8a', '#e07ab0', '#f2a9cf', '#fbd6ea', '#ffffff'];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI + (i + 0.5) / 6 * Math.PI + (r() - 0.5) * 0.5, d = R * (0.5 + r() * 0.4), x = X + Math.cos(a) * d, y = Yb - R * 0.55 + Math.sin(a) * d * 0.72, rr = 5 + r() * 1.5;
        shade(g, ellPts(x, y, rr, rr * 0.82), (px_, py_) => rampAt(TR, 1.4 + ((px_ - x) / rr) * 0.8 - ((py_ - y) / rr) * 1.6, px_, py_));
        for (let q = 0; q < 9; q++) { const qa = r() * 6.28, qd = r() * rr * 0.8, fx = x + Math.cos(qa) * qd, fy = y + Math.sin(qa) * qd * 0.8; const c = TR[2 + Math.floor(r() * 3)]; px(g, fx, fy, c); px(g, fx + 1, fy, c); px(g, fx, fy - 1, c); px(g, fx - 1, fy, c); px(g, fx, fy + 1, TR[1]); } // florets: little crosses with a dark throat
        px(g, x + 1, y - rr * 0.6, '#ffffff');
      }
      for (let i = 0; i < 3; i++) { const x = X + (r() - 0.5) * R * 1.4, y = Yb - R * 0.8 - r() * R * 0.4; if (inMound(x, y)) { ell(g, x, y, 1.6, 2.4, TR[1]); px(g, x, y - 2, TR[2]); } } // buds
      if (nt) { g.fillStyle = 'rgba(10,16,40,0.3)'; g.fillRect(Math.round(X - R * 1.1), Math.round(Yb - R * 1.4), Math.round(R * 2.2), Math.round(R * 1.5)); }
    }
    // ── the hydrangea: a mophead, big serrated leaves, heads of blue-lavender florets (a couple going pink) ──
    paintHydrangea(g, b) {
      const r = BZ.rng(1313), nt = this.night(), R = b.r, X = b.x, Yb = b.y;
      const LF = ['#2a4a26', '#3a6334', '#4c7d42', '#619852', '#78b063', '#95c47a'], VEIN = '#a9d28e';
      ell(g, X + 2, Yb + 2, R * 1.15, R * 0.32, 'rgba(20,14,6,0.3)');
      for (let i = -1; i <= 1; i++) BZ.drawThin(g, X + i * 4, Yb + 1, X + i * 8, Yb - R * 0.7, '#6b5236'); // woody stems
      const inMound = (x, y) => ((x - X) / (R * 1.1)) ** 2 + ((y - (Yb - R * 0.55)) / (R * 0.7)) ** 2 <= 1;
      // leaves: broad ovate, serrated, veined, hanging outward; lit from the upper right
      const leaves = []; for (let i = 0; i < R * 2.2; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.92; leaves.push({ x: X + Math.cos(a) * d * R, y: Yb - R * 0.55 + Math.sin(a) * d * R * 0.66, a: Math.PI / 2 + (Math.cos(a) * 0.9) + (r() - 0.5) * 0.9, k: r() }); }
      leaves.sort((p, q) => p.y - q.y);
      for (const lf of leaves) {
        const len = 6.5 + lf.k * 3.5, wid = len * 0.52, lit = (lf.x - X) / R * 0.5 - (lf.y - (Yb - R * 0.55)) / R * 0.9;
        const pts = leafPts(lf.x, lf.y, len, wid, lf.a, true);
        shade(g, pts, (x, y) => rampAt(LF, 2.2 + lit + (((x - lf.x) * Math.sin(lf.a) - (y - lf.y) * Math.cos(lf.a)) > 0 ? -0.4 : 0.5) + (r() < 0.05 ? 0.8 : 0), x, y));
        for (let i = 1; i < pts.length / 2; i += 2) px(g, pts[i][0], pts[i][1], LF[Math.min(5, 3 + Math.round(lit + 1))]); // the serrated edge, as a lighter stitch
        BZ.drawThin(g, lf.x + Math.cos(lf.a) * 1.5, lf.y + Math.sin(lf.a) * 1.5, lf.x + Math.cos(lf.a) * len * 0.85, lf.y + Math.sin(lf.a) * len * 0.85, VEIN); // midrib
        for (let v = 1; v <= 2; v++) { const t = v / 3, cx = lf.x + Math.cos(lf.a) * len * t, cy = lf.y + Math.sin(lf.a) * len * t; for (const sd of [-1, 1]) BZ.drawThin(g, cx, cy, cx + (Math.cos(lf.a + sd * 1) * wid * 0.6), cy + Math.sin(lf.a + sd * 1) * wid * 0.6, LF[4]); } // side veins
      }
      // the mopheads: domes of four-petal florets, shaded blue to lavender, lit at the upper right; two of them blushing pink
      const BL = ['#3f4fa8', '#5566c2', '#7585d8', '#98a6e8', '#bfc8f2', '#e4e8fb'], PK = ['#8a4a8c', '#a866a8', '#c58ac4', '#dfb0dc', '#f2d4ee', '#fbeefa'];
      const heads = []; for (let i = 0; i < 7; i++) { const a = -Math.PI + (i + 0.5) / 7 * Math.PI + (r() - 0.5) * 0.5, d = R * (0.45 + r() * 0.5); heads.push({ x: X + Math.cos(a) * d, y: Yb - R * 0.5 + Math.sin(a) * d * 0.72, rr: 5.5 + r() * 1.8, pink: i === 2 || i === 5 }); }
      heads.sort((p, q) => p.y - q.y);
      for (const h of heads) {
        const C = h.pink ? PK : BL, x = h.x, y = h.y, rr = h.rr;
        shade(g, ellPts(x, y, rr, rr * 0.85), (px_, py_) => rampAt(C, 1.2 + ((px_ - x) / rr) * 0.9 - ((py_ - y) / rr) * 1.8, px_, py_));
        for (let q = 0; q < 10; q++) { const qa = r() * 6.28, qd = r() * rr * 0.85, fx = Math.round(x + Math.cos(qa) * qd), fy = Math.round(y + Math.sin(qa) * qd * 0.85), up = Math.sin(qa) < 0 || Math.cos(qa) > 0.3, c = C[up ? 3 + Math.floor(r() * 2) : 2]; px(g, fx - 1, fy, c); px(g, fx + 1, fy, c); px(g, fx, fy - 1, c); px(g, fx, fy + 1, c); px(g, fx, fy, C[up ? 5 : 1]); } // four-petal florets with a pale eye
        px(g, x + rr * 0.3, y - rr * 0.6, '#ffffff');
      }
      if (nt) { g.fillStyle = 'rgba(10,16,40,0.3)'; g.fillRect(Math.round(X - R * 1.2), Math.round(Yb - R * 1.3), Math.round(R * 2.4), Math.round(R * 1.4)); }
    }
    // ── the feeder: a cedar hopper with a copper roof gone green, plexi panels full of seed, a perch tray; on a black pole with a cone baffle; a suet cage on a chain ──
    paintFeeder(g) {
      const f = this.feeder, x = f.x, nt = this.night(), r = BZ.rng(707), CED = ['#5c3d22', '#7a5230', '#9a6b40', '#b8864f', '#d2a26a'], IRON = ['#1c1a18', '#2e2b28', '#45413c', '#5a554f'], COP = ['#3f6a58', '#4f8068', '#67977c', '#86ad92', '#a6c3ad'];
      ell(g, x + 1, f.base + 1, 6, 1.8, 'rgba(20,14,6,0.3)');
      rect(g, x - 1, f.top + 24, 3, f.base - f.top - 24, IRON[1]); rect(g, x - 1, f.top + 24, 1, f.base - f.top - 24, IRON[3]); rect(g, x + 1, f.top + 24, 1, f.base - f.top - 24, IRON[0]); // the pole
      const by = f.base - 30; shade(g, [[x - 9, by + 2], [x + 9, by + 2], [x + 3, by - 6], [x - 3, by - 6]], (px_, py_) => rampAt(IRON, 1.6 + (px_ - x) / 9 * 1.2 - (py_ - by) * 0.1, px_, py_)); BZ.drawThin(g, x - 9, by + 2, x + 9, by + 2, IRON[3]); // the cone baffle, lit on its right
      // the hopper: corner posts, plexi panels showing seed, the tray with a lip
      const hx0 = x - 9, hx1 = x + 9, hy0 = f.top + 8, hy1 = f.top + 23;
      for (let yy = hy0; yy < hy1; yy++) for (let xx = hx0 + 2; xx < hx1 - 2; xx++) { const seedLine = hy0 + 4 + Math.sin(xx * 0.9) * 0.6; px(g, xx, yy, yy < seedLine ? ((xx + yy) % 3 === 0 ? '#dfe9ec' : '#c9d8dc') : (r() < 0.45 ? '#d8b864' : r() < 0.7 ? '#2a2420' : r() < 0.85 ? '#b89a5a' : '#8a6a3a')); } // seed behind the plexi
      for (let yy = hy0; yy < hy1; yy += 1) if ((yy - hy0) % 5 === 1) rect(g, hx0 + 2, yy, hx1 - hx0 - 4, 1, 'rgba(255,255,255,0.22)'); // reflections on the plexi
      for (const xx of [hx0, hx1 - 2, x - 1]) { rect(g, xx, hy0 - 1, 2, hy1 - hy0 + 1, CED[2]); rect(g, xx, hy0 - 1, 1, hy1 - hy0 + 1, CED[3]); } // the cedar posts and the center divider
      rect(g, hx0 - 3, hy1, hx1 - hx0 + 6, 3, CED[1]); rect(g, hx0 - 3, hy1, hx1 - hx0 + 6, 1, CED[4]); rect(g, hx0 - 3, hy1 + 3, hx1 - hx0 + 6, 1, CED[0]); // the tray
      for (let i = 0; i < 12; i++) px(g, hx0 - 2 + r() * (hx1 - hx0 + 4), hy1 + (r() < 0.6 ? 0 : -1), r() < 0.5 ? '#e0c070' : '#4a3a2a'); // seed on the tray
      rect(g, hx0 - 3, hy1 - 1, 1, 1, CED[4]); rect(g, hx1 + 2, hy1 - 1, 1, 1, CED[4]); // the lip
      // the roof: a gable, copper with verdigris, a ridge cap, an overhang that shades the panels
      const ry = f.top + 8, rp = [[x - 13, ry + 1], [x, f.top - 2], [x + 13, ry + 1]];
      shade(g, [[x - 13, ry + 1], [x, f.top - 2], [x + 13, ry + 1], [x + 13, ry + 3], [x - 13, ry + 3]], (px_, py_) => rampAt(COP, 1.6 + (px_ > x ? 1.4 : 0) - Math.abs(py_ - (f.top - 2 + Math.abs(px_ - x) * 0.77)) * 0.25 + (((px_ * 3 + py_ * 5) % 11) === 0 ? 0.8 : 0), px_, py_));
      BZ.drawThin(g, rp[0][0], rp[0][1], rp[1][0], rp[1][1], COP[2]); BZ.drawThin(g, rp[1][0], rp[1][1], rp[2][0], rp[2][1], COP[4]); rect(g, x - 1, f.top - 3, 3, 2, '#8a5a3a'); px(g, x, f.top - 3, '#c98a5a'); // the ridge cap, still copper
      rect(g, x - 13, ry + 3, 26, 1, 'rgba(0,0,0,0.3)');
      // the suet cage on a chain from the left eave
      const cx = x - 15, cy0 = ry + 3; for (let yy = cy0; yy < cy0 + 6; yy += 2) px(g, cx, yy, IRON[3]);
      rect(g, cx - 3, cy0 + 6, 7, 7, '#d8cf9a'); for (let i = 0; i < 6; i++) px(g, cx - 2 + r() * 5, cy0 + 7 + r() * 5, '#b8a46a'); for (let i = 0; i <= 7; i += 2) { rect(g, cx - 3, cy0 + 6 + Math.min(i, 6), 7, 1, '#2a4a2a'); rect(g, cx - 3 + Math.min(i, 6), cy0 + 6, 1, 7, '#2a4a2a'); } // the green wire grid
      px(g, cx - 3, cy0 + 6, '#4a7a4a');
      // spilled seed and hulls below, and a sprig of grass the birds have been at
      for (let i = 0; i < 22; i++) px(g, x - 14 + r() * 28, f.base + 2 + r() * 8, r() < 0.4 ? '#d8b864' : r() < 0.7 ? '#2a2420' : '#8a7a4a');
      void nt;
    }
    // ── the studio spills out onto the patio: an A-frame easel with a painting in progress, the kick wheel with a pot half-thrown ──
    drawStudioStuff(ctx, X, Yo, which) {
      if (!this.stuffC) { this.stuffC = {}; for (const k of ['easel', 'wheel']) { const c = document.createElement('canvas'); c.width = 80; c.height = 76; this.paintStudioStuff(c.getContext('2d'), k); this.stuffC[k] = c; } }
      const o = which === 'easel' ? this.easel : this.wheel; ctx.drawImage(this.stuffC[which], Math.round(X + o.x - 40), Math.round(Yo + o.foot - 64));
    }
    paintStudioStuff(g, which) {
      const e = { x: 40, foot: 64 }, w = { x: 36, foot: 64 }, nt = this.night(), r = BZ.rng(2024);
      const OAK = ['#4e3418', '#6a4a26', '#866034', '#a27a46', '#bb935a', '#d0ab70'], board = (pts, base, grainAng) => shade(g, pts, (x, y) => rampAt(OAK, base + Math.sin((x * Math.cos(grainAng || 0) + y * Math.sin(grainAng || 0)) * 1.7) * 0.35 + (((x * 7 + y * 11) % 17) === 0 ? -0.7 : 0), x, y));
      if (which === 'easel') {
        ell(g, e.x + 1, e.foot + 1, 12, 2.4, 'rgba(20,14,6,0.28)');
        // the rear leg, then the two front legs of the A, a cross brace, rubber feet
        board([[e.x + 1, e.foot + 2], [e.x + 4, e.foot + 2], [e.x + 2, e.foot - 48], [e.x, e.foot - 48]], 1.4, 1.4);
        for (const sd of [-1, 1]) { const fx = e.x + sd * 10, tx = e.x + sd * 2.4; board([[fx - 1.4, e.foot], [fx + 1.4, e.foot], [tx + 1.4, e.foot - 54], [tx - 1.4, e.foot - 54]], sd > 0 ? 3.6 : 2.6, 1.3); BZ.drawThin(g, fx - 1.4, e.foot, tx - 1.4, e.foot - 54, OAK[sd > 0 ? 5 : 4]); rect(g, fx - 2, e.foot - 1, 4, 2, '#2a2622'); }
        board([[e.x - 8.5, e.foot - 12], [e.x + 8.5, e.foot - 12], [e.x + 8.5, e.foot - 10], [e.x - 8.5, e.foot - 10]], 3.2, 0); // the brace
        // the tray: a thick ledge with a lip, a rag over its end, a brush lying on it
        board([[e.x - 12, e.foot - 25], [e.x + 12, e.foot - 25], [e.x + 12, e.foot - 21], [e.x - 12, e.foot - 21]], 3.8, 0); rect(g, e.x - 12, e.foot - 25, 24, 1, OAK[5]); rect(g, e.x - 12, e.foot - 26, 24, 1, OAK[2]);
        shade(g, [[e.x + 6, e.foot - 26], [e.x + 13, e.foot - 26], [e.x + 14, e.foot - 17], [e.x + 9, e.foot - 16]], (x, y) => ((x + y) & 3) === 0 ? '#c9b8a0' : rampAt(['#cfc4b2', '#e3dacb', '#f1ece2'], 1 + (y - (e.foot - 26)) * 0.12, x, y)); px(g, e.x + 10, e.foot - 20, '#b5583c'); px(g, e.x + 8, e.foot - 22, '#3f6f6a'); // the rag, paint on it
        BZ.drawThin(g, e.x - 10, e.foot - 26, e.x - 2, e.foot - 27, '#c8a060'); px(g, e.x - 1, e.foot - 27, '#2a2622'); px(g, e.x, e.foot - 27, '#2a2622'); // a brush
        // the canvas on its stretcher: 22 x 26, a painting of the yard with a seal-point cat in it, the lower corner still bare
        const cx0 = e.x - 11, cx1 = e.x + 11, cy0 = e.foot - 52, cy1 = e.foot - 26;
        rect(g, cx0 - 1, cy0 - 1, cx1 - cx0 + 2, cy1 - cy0 + 2, '#d6c9a8'); rect(g, cx1, cy0, 1, cy1 - cy0 + 1, '#a08a60'); rect(g, cx0 - 1, cy1, cx1 - cx0 + 2, 1, '#a08a60'); // the stretcher edge
        for (let y = cy0; y < cy1; y++) for (let x = cx0; x < cx1; x++) {
          const u = (x - cx0) / (cx1 - cx0), v = (y - cy0) / (cy1 - cy0); let c;
          if (v > 0.7 && u < 0.35 + (v - 0.7) * 0.5) c = (x + y) & 1 ? '#efe9dc' : '#e6dfd0'; // unpainted, the weave showing
          else if (v < 0.42) c = rampAt(['#7fa8c8', '#9cc0d8', '#b9d4e3', '#d4e4ec'], 1 + (1 - v / 0.42) * 2.5 + Math.sin(x * 1.3 + y * 0.7) * 0.5, x, y); // sky, in long strokes
          else c = rampAt(['#3f6a2a', '#51802f', '#6a9a3e', '#87b050'], 0.8 + (v - 0.42) * 3 + Math.sin(x * 0.9 - y * 1.1) * 0.6, x, y); // lawn
          px(g, x, y, c);
        }
        rect(g, cx0 + 1, cy0 + 9, 20, 1, '#5a7a90'); // the tree line, one stroke
        const bx = e.x + 2, by = cy0 + 19; ell(g, bx, by, 4, 3, '#e9dcc5'); ell(g, bx + 2, by - 4, 2.4, 2.2, '#e9dcc5'); px(g, bx + 1, by - 6, '#3a3030'); px(g, bx + 3, by - 6, '#3a3030'); ell(g, bx + 3, by - 3, 1.4, 1, '#4f4343'); px(g, bx + 2, by - 4, '#3ccbdb'); BZ.drawThin(g, bx - 4, by + 1, bx - 7, by - 3, '#3a3030'); // Bo, sitting, seal points, one teal eye
        for (let i = 0; i < 5; i++) px(g, cx0 + 2 + r() * 18, cy0 + 3 + r() * 10, '#ffffff'); // highlights, impasto
        board([[e.x - 4, e.foot - 56], [e.x + 4, e.foot - 56], [e.x + 4, e.foot - 51], [e.x - 4, e.foot - 51]], 3.4, 0); rect(g, e.x - 1, e.foot - 60, 2, 5, OAK[4]); px(g, e.x, e.foot - 61, OAK[5]); // the top clamp on its mast
        // on the ground: a palette leaning on the left leg, a coffee can of brushes on the right
        shade(g, ellPts(e.x - 15, e.foot - 6, 6, 7.5), (x, y) => rampAt(['#8a6a3a', '#a8844a', '#c4a060', '#d8b878'], 1.4 + (x - (e.x - 15)) / 6 * 0.6 - (y - (e.foot - 6)) / 7.5 * 0.8, x, y)); px(g, e.x - 17, e.foot - 10, '#3a2a18');
        [['#b5583c', -17, -7], ['#c9a24a', -14, -9], ['#3f6f6a', -13, -4], ['#f4f4f0', -16, -2], ['#34446b', -12, -1]].forEach(([c, dx, dy]) => { px(g, e.x + dx, e.foot + dy, c); px(g, e.x + dx + 1, e.foot + dy, c); });
        rect(g, e.x + 14, e.foot - 10, 7, 10, '#b8b4a8'); rect(g, e.x + 14, e.foot - 10, 2, 10, '#d8d4c8'); rect(g, e.x + 14, e.foot - 7, 7, 4, '#c84a3a'); rect(g, e.x + 15, e.foot - 6, 5, 2, '#f2e6c8'); // the can, its label
        for (let i = 0; i < 5; i++) { const bx2 = e.x + 15 + i * 1.3; BZ.drawThin(g, bx2, e.foot - 10, bx2 + (i - 2) * 0.8, e.foot - 18 - (i % 2) * 3, i & 1 ? '#c8a060' : '#5a4a3a'); px(g, bx2 + (i - 2) * 0.8, e.foot - 19 - (i % 2) * 3, '#2a2622'); } // brushes, handles up
        return;
      }
      // the kick wheel: a heavy concrete flywheel low down, a steel shaft, the wheel head in its splash pan with a pot on it, a plank seat, a bucket of slip, tools
      ell(g, w.x + 3, w.foot + 1, 20, 4.2, 'rgba(20,14,6,0.28)');
      const CON = ['#3b3b40', '#4b4b51', '#5c5c63', '#6f6f76', '#85858c', '#9a9aa0'], STEEL = ['#4a4f58', '#6a717c', '#8d95a0', '#b2b9c2', '#d4d9df'];
      shade(g, ellPts(w.x, w.foot - 3, 17, 5.2), (x, y) => rampAt(CON, 1.7 + (x - w.x) / 17 * 0.9 + (r() < 0.05 ? 0.8 : 0), x, y)); // the flywheel's thickness, in shadow
      shade(g, ellPts(w.x, w.foot - 7, 17, 5.2), (x, y) => rampAt(CON, 4.3 + (x - w.x) / 17 * 0.8 - (y - (w.foot - 7)) / 5.2 * 0.8 + (r() < 0.06 ? 0.9 : 0), x, y)); // its top, lit
      ellRing(g, w.x, w.foot - 7, 17, 5.2, CON[5]); for (let i = 0; i < 9; i++) px(g, w.x - 14 + r() * 28, w.foot - 9 + r() * 5, r() < 0.5 ? '#b07a5a' : '#8a5a40'); // the rim, dried clay spatter
      rect(g, w.x - 1, w.foot - 30, 3, 26, STEEL[1]); rect(g, w.x - 1, w.foot - 30, 1, 26, STEEL[3]); rect(g, w.x + 1, w.foot - 30, 1, 26, STEEL[0]); rect(g, w.x - 2, w.foot - 12, 5, 3, STEEL[2]); rect(g, w.x - 2, w.foot - 12, 5, 1, STEEL[4]); // the shaft and its bearing collar
      shade(g, ellPts(w.x, w.foot - 30, 11, 3.6), (x, y) => rampAt(['#2d4a3a', '#3a5e48', '#4a7458', '#5c8a68'], 1.2 + (y < w.foot - 31 ? 1.4 : 0) + (x - w.x) / 11 * 0.6, x, y)); shade(g, ellPts(w.x, w.foot - 31, 9.5, 2.8), (x, y) => rampAt(['#4a7458', '#5c8a68', '#6fa07a'], 0.8 + (x - w.x) / 9.5 * 0.6, x, y)); // the splash pan, dark green
      shade(g, ellPts(w.x, w.foot - 32, 7.5, 2.4), (x, y) => rampAt(STEEL, 2 + (y < w.foot - 32 ? 1.4 : 0) + (x - w.x) / 7.5 * 0.8, x, y)); ellRing(g, w.x, w.foot - 32, 7.5, 2.4, STEEL[1]); for (let k = 2; k <= 6; k += 2) ellRing(g, w.x, w.foot - 32.4, k, k * 0.32, STEEL[4]); // the wheel head, with its rings
      const CL = ['#7a4a30', '#9a6040', '#b67a56', '#cf9872', '#e0b48e'], prof = (t) => 3.4 + Math.sin(Math.PI * Math.min(1, t * 1.25)) * 2.2 - t * 0.6, pot = []; for (let i = 0; i <= 10; i++) pot.push([w.x + prof(i / 10), w.foot - 33 - i]); for (let i = 10; i >= 0; i--) pot.push([w.x - prof(i / 10), w.foot - 33 - i]);
      shade(g, pot, (x, y) => { const t = (w.foot - 33 - y) / 10, R = prof(t); return rampAt(CL, 1.5 + ((x - w.x) / R) * 1.5 - Math.abs((x - w.x) / R) * 0.9 + (((w.foot - y) % 3) === 0 ? -0.5 : 0), x, y); }); shade(g, ellPts(w.x, w.foot - 43, prof(1), 1.4), (x, y) => rampAt(CL, 0.5 + (x - w.x) / 3 * 0.6, x, y)); ellRing(g, w.x, w.foot - 43, prof(1), 1.4, CL[4]); // the pot, wet, throwing rings
      px(g, w.x + 2, w.foot - 39, '#f0d0b0'); px(g, w.x + 2, w.foot - 37, '#f0d0b0');
      // the plank seat on its two legs, right of the wheel; a folded towel on it
      const sx0 = w.x + 14, sx1 = w.x + 30, sy = w.foot - 16; for (const lx of [sx0 + 1, sx1 - 3]) { rect(g, lx, sy, 2, 15, OAK[1]); rect(g, lx, sy, 1, 15, OAK[3]); } rect(g, sx0 + 2, sy + 9, sx1 - sx0 - 4, 1, OAK[2]);
      shade(g, [[sx0, sy - 3], [sx1, sy - 3], [sx1, sy], [sx0, sy]], (x, y) => rampAt(OAK, 3.4 + Math.sin(x * 0.8) * 0.4 - (y - (sy - 3)) * 0.4, x, y)); rect(g, sx0, sy - 3, sx1 - sx0, 1, OAK[5]);
      rect(g, sx0 + 3, sy - 7, 8, 4, '#d8d0b8'); rect(g, sx0 + 3, sy - 7, 8, 1, '#efe9dc'); rect(g, sx0 + 3, sy - 4, 8, 1, '#b8ae98'); // the towel
      // a bucket of slip on the left, a sponge and a wire tool on the flywheel's edge
      const bx = w.x - 22, byy = w.foot - 2; shade(g, [[bx - 4, byy], [bx + 4, byy], [bx + 5, byy - 11], [bx - 5, byy - 11]], (x, y) => rampAt(['#9aa0a6', '#b8bec4', '#d2d7dc', '#e6eaee'], 1.2 + (x - bx) / 5 * 1.4 - (y - (byy - 11)) * 0.05, x, y)); shade(g, ellPts(bx, byy - 11, 5, 1.8), (x, y) => rampAt(['#9a7050', '#b08060', '#c49474'], 0.8 + (x - bx) / 5 * 0.8, x, y)); ellRing(g, bx, byy - 11, 5, 1.8, '#e6eaee'); BZ.drawThin(g, bx - 5, byy - 11, bx, byy - 16, '#6a717c'); BZ.drawThin(g, bx, byy - 16, bx + 5, byy - 11, '#6a717c'); // slip in it, the handle up
      BZ.drawThin(g, bx + 1, byy - 10, bx + 2, byy - 4, '#c49474'); // a dribble
      rect(g, w.x - 11, w.foot - 10, 4, 2, '#e8c860'); px(g, w.x - 10, w.foot - 10, '#f8e080'); BZ.drawThin(g, w.x + 6, w.foot - 9, w.x + 12, w.foot - 11, '#8d95a0'); px(g, w.x + 6, w.foot - 9, '#5a4a3a'); px(g, w.x + 12, w.foot - 11, '#5a4a3a'); // a sponge, a wire tool
      void nt;
    }
    // ── the corner of the sandbox: a cedar 4x4 frame with a corner seat, sand with footprints and ruts, a Tonka-yellow dump truck and backhoe ──
    paintSandbox(g) {
      const s = this.sandbox, r = BZ.rng(909), CED = ['#5a3c22', '#7a5430', '#9a6e40', '#b8884f', '#d2a468'], SAND = ['#b49a66', '#c7ad78', '#d8bf8a', '#e6cf9c', '#efdbae', '#f6e6c0'];
      const x0 = Math.max(0, s.x0), x1 = s.x1, y0 = s.y0, y1 = s.y1, T = 6; // rail thickness
      shade(g, [[x0, y0 + T], [x1 - T, y0 + T], [x1 - T, y1 - 1], [x0, y1 - 1]], (x, y) => rampAt(SAND, 2.4 + Math.sin(x * 0.7 + y * 1.3) * 0.5 + (r() < 0.08 ? 1 : 0) + (y - y0) / (y1 - y0) * 0.9 - (y < y0 + T + 3 ? 1.1 : 0) - (x > x1 - T - 3 ? 0.9 : 0), x, y)); // the sand, in shadow under the rails
      // footprints (small, paired), tire ruts, a dug hole with its heap
      for (let i = 0; i < 4; i++) { const fx = x0 + 10 + i * 14 + r() * 6, fy = y0 + 10 + r() * 6 + i * 3; for (const sd of [0, 1]) { ell(g, fx + sd * 4, fy + sd * 2, 1.8, 1.1, SAND[0]); px(g, fx + sd * 4, fy + sd * 2 - 1, SAND[1]); } }
      for (let i = 0; i < 16; i++) { px(g, x0 + 30 + i * 2.2, y0 + 20 + (i & 1), SAND[0]); px(g, x0 + 32 + i * 2.2, y0 + 25 + (i & 1), SAND[0]); }
      shade(g, ellPts(x0 + 66, y0 + 25, 7, 3.6), (x, y) => rampAt(['#8a7450', '#a08a5a', '#b49a66'], 0.6 + (y - (y0 + 25)) / 3.6 * 1.2 + (x - (x0 + 66)) / 7 * 0.4, x, y)); shade(g, ellPts(x0 + 52, y0 + 11, 6, 2.6), (x, y) => rampAt(SAND, 3.2 - Math.abs(x - (x0 + 52)) / 6 * 1.2 - (y - (y0 + 9)) * 0.3, x, y)); // the hole, the heap beside it
      // the frame: the back rail, the right rail, a corner post with a seat board on top; grain, a lit top edge, a dark underside
      const rail = (pts, base, ang) => shade(g, pts, (x, y) => rampAt(CED, base + Math.sin((x * Math.cos(ang) + y * Math.sin(ang)) * 1.3) * 0.45 + (((x * 5 + y * 7) % 13) === 0 ? -0.6 : 0), x, y));
      rail([[x0, y0], [x1, y0], [x1, y0 + T], [x0, y0 + T]], 2.8, 0); rect(g, x0, y0, x1 - x0, 1, CED[4]); rect(g, x0, y0 + T - 1, x1 - x0, 1, CED[0]);
      rail([[x1 - T, y0], [x1, y0], [x1, y1], [x1 - T, y1]], 2.2, Math.PI / 2); rect(g, x1 - T, y0, 1, y1 - y0, CED[3]); rect(g, x1 - 1, y0, 1, y1 - y0, CED[0]);
      rail([[x1 - T - 3, y0 - 4], [x1 + 2, y0 - 4], [x1 + 2, y0 + T + 2], [x1 - T - 3, y0 + T + 2]], 3.4, 0); rect(g, x1 - T - 3, y0 - 4, T + 5, 1, CED[4]); rect(g, x1 - T - 3, y0 + T + 1, T + 5, 1, CED[0]); px(g, x1 - T, y0 - 1, CED[0]); px(g, x1 - 2, y0 + 3, CED[0]); // the corner seat, two screw heads
      rect(g, x0, y1 - 2, x1 - x0, 2, CED[1]); rect(g, x0, y1 - 2, x1 - x0, 1, CED[2]); // the front rail's top, just in view
      for (let i = 0; i < 10; i++) px(g, x0 + 10 + r() * 50, y1 - 3 + (r() < 0.5 ? 0 : 1), SAND[3]); // sand kicked onto the rail
      // the dump truck: a classic yellow steel one, side-on, the bed tipped up, fat black tires with silver hubs
      const YL = ['#9c7210', '#c48f12', '#e4ac1a', '#f4c531', '#fbd95a', '#fff0a8'], tx = x0 + 24, ty = y1 - 13;
      ell(g, tx + 2, ty + 3, 15, 2.6, 'rgba(20,14,6,0.28)');
      rect(g, tx - 13, ty - 3, 26, 3, '#2a2a2e'); rect(g, tx - 13, ty - 3, 26, 1, '#4a4a50'); // the chassis
      shade(g, [[tx - 14, ty - 12], [tx + 1, ty - 15], [tx + 3, ty - 5], [tx - 12, ty - 3]], (x, y) => rampAt(YL, 2.2 + (y - (ty - 15)) * -0.12 + (x - tx) / 14 * 0.6 + (((x - tx + 40) % 4) === 0 ? -0.9 : 0), x, y)); // the bed, tipped, ribbed
      shade(g, [[tx - 14, ty - 12], [tx + 1, ty - 15], [tx + 1, ty - 17], [tx - 14, ty - 14]], (x, y) => rampAt(YL, 3.6, x, y)); rect(g, tx - 14, ty - 14, 1, 2, YL[5]); // the bed's rim, lit
      shade(g, [[tx + 2, ty - 12], [tx + 12, ty - 12], [tx + 13, ty - 4], [tx + 2, ty - 4]], (x, y) => rampAt(YL, 2.4 + (y < ty - 11 ? 1.4 : 0) + (x - tx) / 12 * 0.5, x, y)); rect(g, tx + 4, ty - 11, 7, 1, YL[5]); // the cab
      rect(g, tx + 4, ty - 10, 6, 4, '#1e2c38'); rect(g, tx + 5, ty - 9, 2, 1, '#8fb4cc'); rect(g, tx + 12, ty - 8, 2, 4, '#9a9aa0'); px(g, tx + 13, ty - 9, '#ffffff'); rect(g, tx + 11, ty - 5, 3, 1, '#3a3a3e'); // window, grille, headlight, bumper
      for (const wx of [tx - 9, tx - 1, tx + 9]) { ell(g, wx, ty, 3.2, 3.2, '#1a1a1a'); ell(g, wx - 0.5, ty - 0.5, 1.5, 1.5, '#9a9aa0'); px(g, wx - 1, ty - 1, '#d8d8dc'); }
      // the backhoe: tracks, a yellow cab with a window and a stack, the boom up and the dipper down into the hole, a toothed bucket
      const bx = x0 + 52, by = y0 + 31; ell(g, bx + 2, by + 2, 11, 2, 'rgba(20,14,6,0.28)');
      rect(g, bx - 9, by - 3, 18, 4, '#2a2a2e'); rect(g, bx - 9, by - 3, 18, 1, '#4a4a50'); for (let i = 0; i < 9; i++) px(g, bx - 8 + i * 2, by, '#5a5a60'); ell(g, bx - 8, by - 1, 1.5, 1.5, '#6a6a70'); ell(g, bx + 8, by - 1, 1.5, 1.5, '#6a6a70'); // the tracks, sprockets
      shade(g, [[bx - 8, by - 12], [bx + 3, by - 12], [bx + 4, by - 3], [bx - 8, by - 3]], (x, y) => rampAt(YL, 2.4 + (y < by - 11 ? 1.4 : 0) + (x - bx) / 10 * 0.5, x, y)); rect(g, bx - 7, by - 11, 9, 1, YL[5]);
      rect(g, bx - 6, by - 10, 5, 4, '#1e2c38'); px(g, bx - 5, by - 9, '#8fb4cc'); rect(g, bx + 1, by - 15, 2, 4, '#3a3a3e'); px(g, bx + 1, by - 16, '#6a6a70'); // window, exhaust stack
      BZ.drawLine(g, bx + 3, by - 9, 3.2, bx + 11, by - 19, 2.6, YL[2], null, 0); BZ.drawLine(g, bx + 11, by - 19, 2.4, bx + 16, by - 8, 2, YL[3], null, 0); BZ.drawThin(g, bx + 4, by - 10, bx + 11, by - 20, YL[4]); px(g, bx + 11, by - 19, '#3a3a3e'); // boom, dipper, the pivot
      shade(g, [[bx + 13, by - 8], [bx + 19, by - 8], [bx + 20, by - 2], [bx + 13, by - 3]], (x, y) => rampAt(['#2a2a2e', '#3c3c42', '#50505a'], 0.8 + (x - (bx + 13)) / 6 * 1.2, x, y)); for (let i = 0; i < 3; i++) px(g, bx + 14 + i * 2, by - 2, '#8a8a90'); for (let i = 0; i < 4; i++) px(g, bx + 14 + i, by - 5 + (i & 1), SAND[2]); // the bucket, teeth, sand in it
      // a plastic shovel and a little blue bucket in the corner
      BZ.drawThin(g, x1 - 15, y0 + 9, x1 - 10, y0 - 6, '#c84a3a'); BZ.drawThin(g, x1 - 14, y0 + 9, x1 - 9, y0 - 6, '#e86a5a'); rect(g, x1 - 18, y0 + 8, 7, 4, '#d8d8d8'); rect(g, x1 - 18, y0 + 8, 7, 1, '#f4f4f4'); px(g, x1 - 10, y0 - 7, '#e86a5a');
      const ux = x0 + 63, uy = y0 + 10; shade(g, [[ux - 3, uy], [ux + 3, uy], [ux + 2, uy + 8], [ux - 2, uy + 8]], (x, y) => rampAt(['#2f5aa8', '#4f7fc9', '#7aa0dc'], 0.8 + (x - ux) / 3 * 0.8, x, y)); ellRing(g, ux, uy, 3, 1.1, '#7aa0dc'); BZ.drawThin(g, ux - 3, uy, ux, uy - 3, '#9a9aa0'); BZ.drawThin(g, ux, uy - 3, ux + 3, uy, '#9a9aa0');
    }
    // ── the landing and steps: weathered deck boards, posts, balusters, a top rail ──
    paintDeck(g, F) {
      const L = this.landing, D = Y.deck;
      rect(g, L.x0, L.front, L.x1 - L.x0, L.foot - L.front, D[1]); for (let x = L.x0; x < L.x1; x += 5) rect(g, x, L.front, 1, L.foot - L.front, D[0]); // skirt boards
      for (let y = L.top; y < L.front; y++) { rect(g, L.x0, y, L.x1 - L.x0, 1, (y - L.top) % 3 === 2 ? D[2] : D[4]); }
      rect(g, L.x0, L.top, L.x1 - L.x0, 1, D[5]); rect(g, L.x0, L.front - 1, L.x1 - L.x0, 1, D[5]); // nosing
      for (const s of this.steps) { rect(g, s.x0, s.top, s.x1 - s.x0 + 2, 3, D[4]); rect(g, s.x0, s.top, s.x1 - s.x0 + 2, 1, D[5]); rect(g, s.x0, s.top + 3, s.x1 - s.x0 + 2, L.foot - s.top - 3 + 2, D[1]); rect(g, s.x0, s.top + 3, 1, L.foot - s.top - 1, D[0]); }
      rect(g, L.x0 - 2, L.foot, L.x1 - L.x0 + 30, 3, 'rgba(20,14,6,0.25)');
      // railing: posts at the corners, balusters along the front, a rail stepping down the stairs
      const post = (x, y0, y1) => { rect(g, x, y0, 3, y1 - y0, D[3]); rect(g, x, y0, 1, y1 - y0, D[5]); rect(g, x + 2, y0, 1, y1 - y0, D[1]); };
      const railY = L.front - 20; post(L.x0, railY, L.foot); post(L.x1 - 3, railY, L.front + 2);
      rect(g, L.x0, railY, L.x1 - L.x0, 2, D[4]); rect(g, L.x0, railY, L.x1 - L.x0, 1, D[5]);
      for (let x = L.x0 + 6; x < L.x1 - 4; x += 5) rect(g, x, railY + 2, 1, L.front - railY - 2, D[2]);
      const end = this.steps[2]; post(end.x1, end.top - 16, L.foot + 1); BZ.drawThin(g, L.x1 - 2, railY, end.x1 + 1, end.top - 16, D[4]); BZ.drawThin(g, L.x1 - 2, railY + 1, end.x1 + 1, end.top - 15, D[2]);
      for (let k = 1; k < 4; k++) { const x = L.x1 + (end.x1 - L.x1) * (k / 4), y = railY + (end.top - 16 - railY) * (k / 4); rect(g, x, y + 1, 1, this.steps[Math.min(2, k - 1)].top - y - 1, D[2]); }
      // a shepherd's hook with a hanging lantern beside the steps
      const hx = L.x1 + 30; BZ.drawThin(g, hx, F + 8, hx, F - 40, '#2a2622'); BZ.drawThin(g, hx, F - 40, hx - 5, F - 44, '#2a2622'); BZ.drawThin(g, hx - 5, F - 44, hx - 8, F - 40, '#2a2622'); rect(g, hx - 10, F - 38, 5, 6, '#3a3632'); rect(g, hx - 9, F - 37, 3, 4, this.night() ? '#f8d888' : '#c8d4d8');
    }
    // the dapple: a still texture of leaf shadows; drawn twice, a hair apart, so it shimmers
    paintDapple(W, H, F) {
      const g = this.dap.getContext('2d'), r = BZ.rng(1212); g.clearRect(0, 0, W, H);
      if (this.night()) return;
      const shadeTop = (x) => x > this.S - 6 ? this.wallTop - 6 : F - 10;
      g.fillStyle = 'rgba(12,24,8,0.2)'; for (let x = 0; x < W; x++) g.fillRect(x, shadeTop(x), 1, H);
      g.globalCompositeOperation = 'destination-out';
      for (const p of this.pools) { const cx = p.x - this.st.x, cy = p.y - this.st.y; for (let k = 0; k < 9; k++) BZ.ellipse(g, cx + (r() - 0.5) * p.rx * 1.2, cy + (r() - 0.5) * p.ry, p.rx * (0.35 + r() * 0.3), p.ry * (0.45 + r() * 0.3), '#000'); }
      for (let i = 0; i < (W * H) / 90; i++) { const x = r() * W, y = shadeTop(x) + r() * (H - shadeTop(x)), big = r() < 0.15, rx = big ? 3 + r() * 4 : 1 + r() * 2, ry = rx * (y > F ? 0.45 : 0.9); BZ.ellipse(g, x, y, rx, ry, '#000'); } // the flecks
      g.globalCompositeOperation = 'source-over';
    }
    // overhanging boughs across the top (and the big tree's crown)
    paintCanopy(W, H, F) {
      const g = this.fg.getContext('2d'), r = BZ.rng(5150), nt = this.night(), C = nt ? ['#0f1a14', '#15231b', '#1b2c22', '#213428'] : ['#2c4a26', '#3b5f30', '#4f7a3c', '#6a9a4c', '#8ab35e', '#b8c96a'];
      const bough = (x0, y0, x1, y1, n) => { BZ.drawLine(g, x0, y0, 4.5, (x0 + x1) / 2, (y0 + y1) / 2 + 3, 2.6, nt ? '#151210' : '#3a322a', null, 0); BZ.drawLine(g, (x0 + x1) / 2, (y0 + y1) / 2 + 3, 2.6, x1, y1, 1.2, nt ? '#151210' : '#3a322a', null, 0); for (let i = 0; i < n; i++) { const t = r(), x = x0 + (x1 - x0) * t + (r() - 0.5) * 22, y = y0 + (y1 - y0) * t + 4 + r() * 16; leaf(g, x, y, 4 + r() * 3, 2.6 + r() * 1.4, Math.PI / 2 + (r() - 0.5) * 1.6, C[Math.floor(r() * (C.length - (nt ? 0 : 1)))], null, { hi: nt ? null : C[C.length - 1] }); } };
      bough(this.tree.x, 0, this.tree.x + 140, 22, 110); bough(this.tree.x + 30, 4, Math.min(W, this.S + 150), 30, 120); bough(W + 10, 0, this.S + 90, 18, 90);
      for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * (x < this.S ? 18 : 12); leaf(g, x, y, 5 + r() * 2, 3, Math.PI / 2 + (r() - 0.5) * 2, C[Math.floor(r() * 4)], null); }
      // foreground grass tufts in the lower-left corner
      for (let i = 0; i < 18; i++) { const x = r() * 40, y = H + 1; BZ.drawThin(g, x, y, x + (r() - 0.5) * 6, y - 8 - r() * 10, nt ? '#1c2a1c' : Y.lawn[3 + (i % 3)]); }
    }

    // ── fixtures the cats use, surfaces things can go on, props that sort with the cats ──
    fixtures() {
      const X = this.st.x, Yo = this.st.y, L = this.landing, sh = this.shelf, T = this.tire;
      return [
        { key: 'stoop', type: 'stoop', x: X + (L.x0 + L.x1) / 2 - 6, y: Yo + L.front - 2, rootPx: L.front - 2 - L.top - 2, frontPt: [X + (L.x0 + L.x1) / 2 + 4, Yo + L.foot + 9], face: Math.PI / 2 + 0.3, surf: 'landing' },
        { key: 'potTop', type: 'ledge', x: X + sh.x0 + 14, y: Yo + sh.foot + 1, rootPx: sh.foot + 1 - sh.top, face: Math.PI / 2 - 0.3, surf: 'shelfTop', front: [X + sh.x0 + 18, Yo + sh.foot + 12] },
        { key: 'tire', type: 'tire', x: X + T.x, y: Yo + T.ground, cy: Yo + T.cy, R: T.R, r: T.r, ropeY: Yo + T.ropeY },
        { key: 'adk', type: 'adk', x: X + this.adk.x, y: Yo + this.adk.y, draw: true },
        { key: 'dogbed', type: 'dogbed', x: X + this.dogBed.x, y: Yo + this.dogBed.y, draw: true },
      ];
    }
    surfaces() {
      const X = this.st.x, Yo = this.st.y, sh = this.shelf, L = this.landing, F = this.F, back = Yo + F + 1;
      return [
        { key: 'shelfTop', x0: X + sh.x0 + 20, x1: X + sh.x1 - 12, y: Yo + sh.top, ground: back - 3 },
        { key: 'shelfMid', x0: X + sh.x0 + 24, x1: X + sh.x1 - 14, y: Yo + sh.mid, ground: back - 2.8 },
        { key: 'stand', x0: X + this.stand.x - 2, x1: X + this.stand.x + 2, y: Yo + this.stand.top, ground: back - 2.6 },
        { key: 'landing', x0: X + L.x0 + 4, x1: X + L.x1 - 4, y: Yo + L.top + 4, ground: Yo + L.front - 2.5 },
      ];
    }
    plotSlot(x, y) { // the free slot nearest the pointer, if the pointer is over a bed
      let best = null, bd = 1e9;
      for (const p of this.plots) p.slots.forEach(([sx, sy], i) => { const d = Math.hypot(x - sx, (y - sy) * 1.6); if (d < 14 && d < bd) { bd = d; best = { plot: p.key, slot: i, x: sx, y: sy, kind: p.kind }; } });
      return best;
    }
    slotPos(plot, slot) { const p = this.plots.find((q) => q.key === plot); return p && p.slots[slot] ? p.slots[slot] : null; }
    props() {
      const X = this.st.x, Yo = this.st.y, t = this.tree, b = this.bunny;
      return [
        { y: Yo + t.base, draw: (ctx) => this.drawTrunk(ctx, X + t.x, Yo + t.base) },
        { y: Yo + b.y, draw: (ctx) => this.drawStoneBunny(ctx, X + b.x, Yo + b.y) },
        { y: this.dog.y + 0.2, draw: (ctx) => this.dog.draw(ctx) },
        { y: Yo + this.easel.foot, draw: (ctx) => this.drawStudioStuff(ctx, X, Yo, 'easel') },
        { y: Yo + this.wheel.foot, draw: (ctx) => this.drawStudioStuff(ctx, X, Yo, 'wheel') },
      ];
    }
    statueSpot() { return [this.st.x + this.bunny.x - 15, this.st.y + this.bunny.y + 3]; }
    drawTrunk(ctx, x, base) {
      const w = this.tree.w, r = BZ.rng(99), nt = this.night();
      if (!this.trunkC) { // painted once: bark plates, fissures, moss on the north side, a flared base, the rope ring
        const c = document.createElement('canvas'), H = base + 2, W = w * 3; c.width = W; c.height = H; const g = c.getContext('2d'), cx = W / 2;
        for (let y = 0; y < H; y++) { const flare = y > H - 14 ? (y - (H - 14)) * 0.9 : 0, hw = w / 2 + flare; for (let xx = Math.round(cx - hw); xx < cx + hw; xx++) { const u = (xx - (cx - hw)) / (hw * 2); let L = 1.4 + u * 2.6 - (u > 0.85 ? 1.6 : 0) + (Math.sin(xx * 1.9 + Math.floor(y / 4) * 2.3) > 0.6 ? -1.2 : 0) + (r() < 0.1 ? 0.8 : 0); px(g, xx, y, u < 0.18 && r() < 0.5 && y > H * 0.3 ? '#5f7a3a' : rampAt(Y.bark, L, xx, y)); } }
        for (let k = 0; k < 2; k++) rect(g, cx - w / 2 - 1, Math.round(H * 0.55) + k * 2, w + 2, 1, '#b9a57a'); // rope tied round the trunk
        this.trunkC = c;
      }
      ctx.drawImage(this.trunkC, Math.round(x - w * 1.5), 0);
      if (nt) { ctx.fillStyle = 'rgba(10,16,40,0.35)'; ctx.fillRect(Math.round(x - w), 0, w * 2, base); }
      void r;
    }
    drawStoneBunny(ctx, x, y) {
      ell(ctx, x + 1, y, 9, 2.4, 'rgba(20,14,6,0.25)');
      const S = Y.stone; ell(ctx, x, y - 6, 8, 6, S[2]); ell(ctx, x - 2, y - 7, 5, 4, S[4]); // haunch
      ell(ctx, x + 5, y - 11, 4.5, 4, S[3]); ell(ctx, x + 4, y - 12, 3, 2.6, S[5]); // head
      BZ.drawLine(ctx, x + 4, y - 14, 1.6, x + 3, y - 22, 1, S[3], null, 0); BZ.drawLine(ctx, x + 7, y - 14, 1.6, x + 8, y - 21, 1, S[2], null, 0); // ears
      px(ctx, x + 7, y - 12, '#4a4842'); ell(ctx, x - 7, y - 5, 2, 2, S[5]); // eye, tail
      px(ctx, x - 3, y - 4, '#6f8a42'); px(ctx, x - 2, y - 3, '#6f8a42'); px(ctx, x + 2, y - 2, '#7a9a48'); // moss
    }
    drawDoors(ctx, X, Yo) {
      const d = this.door, nt = this.night(), T = Y.trim, open = this.doorT > 0 ? Math.min(1, this.doorT / 10, (this.doorT) / 10) : 0;
      rect(ctx, X + d.x0 - 3, Yo + d.y0 - 3, d.x1 - d.x0 + 6, d.y1 - d.y0 + 3, T[3]); rect(ctx, X + d.x0 - 3, Yo + d.y0 - 3, d.x1 - d.x0 + 6, 1, T[4]);
      const mid = Math.round((d.x0 + d.x1) / 2), glass = nt ? '#e6b868' : '#3a463e';
      rect(ctx, X + d.x0, Yo + d.y0, d.x1 - d.x0, d.y1 - d.y0, nt ? '#c89048' : '#2a2a26'); // the room behind
      if (!nt) { for (let y = d.y0 + 2; y < d.y1; y += 9) rect(ctx, X + d.x0 + 2, Yo + y, d.x1 - d.x0 - 4, 1, '#4a4a42'); rect(ctx, X + d.x0 + 4, Yo + d.y0 + 30, 10, 14, '#6a5a44'); } // inside: shelves, an easel
      const panel = (x0, x1, shut) => { rect(ctx, X + x0, Yo + d.y0, x1 - x0, d.y1 - d.y0, T[2]); rect(ctx, X + x0 + 2, Yo + d.y0 + 2, x1 - x0 - 4, d.y1 - d.y0 - 4, glass); if (!nt) BZ.fillPoly(ctx, [[X + x0 + 3, Yo + d.y0 + 40], [X + x0 + 6, Yo + d.y0 + 40], [X + x1 - 3, Yo + d.y0 + 8], [X + x1 - 3, Yo + d.y0 + 3]], 'rgba(255,255,255,0.12)'); if (shut) px(ctx, X + (x0 < mid ? x1 - 2 : x0 + 1), Yo + (d.y0 + d.y1) / 2, '#c9a24a'); };
      panel(d.x0, mid, true);
      if (open > 0) { const w = Math.round((d.x1 - mid) * (1 - 0.7 * open)); panel(d.x1 - w, d.x1, false); } else panel(mid, d.x1, true);
    }

    // ── life: butterflies (fireflies at night), leaves letting go, a squirrel ──
    tick() {
      const W = this.st.w, H = this.st.h, F = this.F, X = this.st.x, Yo = this.st.y, nt = this.night();
      if (this.doorT > 0) this.doorT--;
      const want = nt ? 0 : 2; while (this.bflies.length < want) this.bflies.push({ x: Math.random() * W, y: F + 10 + Math.random() * (H - F - 30), z: 14 + Math.random() * 20, vx: 0, vy: 0, t: Math.random() * 100, col: ['#f6f3e6', '#f0a03c', '#f2d45a', '#8fb0e0'][Math.floor(Math.random() * 4)], tx: 0, ty: 0, k: Math.random().toString(36).slice(2, 6) });
      if (nt) this.bflies.length = 0;
      const blooms = this.w.items.filter((i) => i.type === 'sprout' && i.stage >= 3 && BZ.GARDEN[i.kind] && !BZ.GARDEN[i.kind].graze);
      for (const b of this.bflies) {
        b.t++;
        if (b.t % 140 === 1 || !b.tx) { const f = blooms.length && Math.random() < 0.7 ? blooms[Math.floor(Math.random() * blooms.length)] : null; b.tx = f ? f.x - X : Math.random() * W; b.ty = f ? f.y - Yo : F + 12 + Math.random() * (H - F - 30); b.tz = f ? 10 + Math.random() * 6 : 12 + Math.random() * 30; }
        const c = this.w.nearestCat(X + b.x, Yo + b.y, (q) => !q.asleep); if (c && dist(c.x, c.y, X + b.x, Yo + b.y) < 22 * this.w.size) { b.vx += (b.x + X - c.x) * 0.02; b.tz = 40; b.vy -= 0.1; } // spooked
        b.vx += ((b.tx - b.x) * 0.004 + (Math.random() - 0.5) * 0.35); b.vy += ((b.ty - b.y) * 0.004 + (Math.random() - 0.5) * 0.25); b.vx *= 0.9; b.vy *= 0.9;
        b.x = Math.max(4, Math.min(W - 4, b.x + b.vx)); b.y = Math.max(F + 6, Math.min(H - 3, b.y + b.vy)); b.z += ((b.tz || 20) - b.z) * 0.03 + Math.sin(b.t * 0.3) * 0.6;
      }
      if (!nt && Math.random() < 0.004 && this.leaves.length < 6) this.leaves.push({ x: Math.random() * W, y: F + 10 + Math.random() * (H - F - 20), z: 70 + Math.random() * 40, t: 0, life: 900, col: Y.litter[2 + Math.floor(Math.random() * 3)], ph: Math.random() * 6, k: Math.random().toString(36).slice(2, 6) });
      for (const l of this.leaves) { l.t++; if (l.z > 0) { l.z -= 0.35; l.x += Math.sin(l.t * 0.06 + l.ph) * 0.7; } else l.z = 0; } this.leaves = this.leaves.filter((l) => l.t < l.life);
      // the squirrel: down the trunk, out onto the lawn, a nibble, back up
      const T = this.tree;
      this.tickBirds(); this.tickDog();
      if (!this.squirrel) { if (!nt && --this.sqWait <= 0) { const raid = Math.random() < 0.4; this.squirrel = { st: 'down', x: T.x + 4, y: 30, t: 0, gx: raid ? this.feeder.x - 2 : T.x + 30 + Math.random() * 60, gy: raid ? this.feeder.base + 4 : T.base + 10 + Math.random() * 30 }; } }
      else {
        const q = this.squirrel; q.t++;
        if (q.st === 'down') { q.y += 1.6; if (q.y >= T.base - 2) { q.st = 'out'; q.y = T.base; } }
        else if (q.st === 'out') { const dx = q.gx - q.x, dy = q.gy - q.y, d = Math.hypot(dx, dy); if (d < 2) { q.st = 'sit'; q.t = 0; } else { q.x += (dx / d) * 2.2; q.y += (dy / d) * 1.2; } }
        else if (q.st === 'sit') { const c = this.w.nearestCat(X + q.x, Yo + q.y); if (q.t > 260 || (c && dist(c.x, c.y, X + q.x, Yo + q.y) < 70 * this.w.size)) { q.st = 'home'; } }
        else if (q.st === 'home') { const dx = T.x + 4 - q.x, dy = T.base - q.y, d = Math.hypot(dx, dy), v = 3.2; if (d < 3) { q.st = 'up'; } else { q.x += (dx / d) * v; q.y += (dy / d) * v * 0.56; } }
        else if (q.st === 'up') { q.y -= 2.4; if (q.y < 20) { this.squirrel = null; this.sqWait = 1800 + Math.random() * 2600; } }
      }
      for (const f of this.ffl) { f.p += 0.05; f.x += Math.sin(f.p * 0.7) * f.v; f.y += Math.cos(f.p * 0.5) * f.v * 0.5; if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; }
    }
    // ── the birds at the feeder: Northern Virginia regulars, by season ──
    birdKinds() {
      const m = new Date().getMonth(), winter = m >= 10 || m <= 2, summer = m >= 3 && m <= 8;
      const K = [
        { k: 'cardinal', w: 5, body: '#c8282e', head: '#c8282e', breast: '#b51e24', wing: '#a31a20', mask: '#1a1212', bill: '#e8903a', crest: true, size: 1.15, perch: ['tray', 'ground'] },
        { k: 'cardinalF', w: 3, body: '#b9a07a', head: '#b59a76', breast: '#c9b08a', wing: '#a2423a', mask: '#5a4a3a', bill: '#e8903a', crest: true, size: 1.1, perch: ['tray', 'ground'] },
        { k: 'bluejay', w: 3, body: '#4f7fc9', head: '#5a88d4', breast: '#e8e8ee', wing: '#2f5aa8', bar: '#ffffff', necklace: '#1a1a26', bill: '#2a2a2a', crest: true, size: 1.25, perch: ['tray', 'ground'], boss: true },
        { k: 'chickadee', w: 5, body: '#9a9a96', head: '#1a1a1a', cheek: '#f4f4f0', breast: '#e8e2d2', wing: '#7a7a76', bib: '#1a1a1a', bill: '#2a2a2a', size: 0.75, perch: ['tray', 'side'] },
        { k: 'titmouse', w: 4, body: '#8f8f94', head: '#9a9aa0', breast: '#e6e2da', wing: '#7a7a80', flank: '#d9a070', bill: '#2a2a2a', crest: true, size: 0.85, perch: ['tray', 'side'] },
        { k: 'goldfinch', w: summer ? 5 : 2, body: summer ? '#f2d21e' : '#b8a860', head: summer ? '#f2d21e' : '#b8a860', breast: summer ? '#f6dc3a' : '#d8cfa0', wing: '#1a1a1a', bar: '#f4f4f0', cap: summer ? '#1a1a1a' : null, bill: '#e8a060', size: 0.75, perch: ['tray', 'side'] },
        { k: 'housefinch', w: 4, body: '#8a7a68', head: '#c84a3a', breast: '#d05a46', wing: '#6e6054', streak: '#5a4e44', bill: '#8a7a6a', size: 0.85, perch: ['tray', 'ground'] },
        { k: 'wren', w: 3, body: '#a2663a', head: '#9a6038', breast: '#d9b58a', wing: '#8a5430', brow: '#f4ecd8', bill: '#5a4a3a', tailUp: true, size: 0.8, perch: ['side', 'ground', 'lawn'] },
        { k: 'downy', w: 3, body: '#1a1a1a', head: '#1a1a1a', breast: '#f4f4f0', wing: '#1a1a1a', bar: '#f4f4f0', cheek: '#f4f4f0', nape: '#d8262a', bill: '#2a2a2a', size: 0.9, perch: ['pole', 'trunk'], cling: true },
        { k: 'nuthatch', w: 3, body: '#6f86a8', head: '#1a1a24', breast: '#f2f0ea', wing: '#5a7090', cheek: '#f2f0ea', bill: '#2a2a2a', size: 0.8, perch: ['trunk', 'pole'], cling: true, headDown: true },
        { k: 'dove', w: 3, body: '#c2ab96', head: '#b8a18c', breast: '#d8c2ac', wing: '#a89080', spot: '#4a3a30', bill: '#2a2a2a', size: 1.35, perch: ['ground'], slow: true },
        { k: 'robin', w: 4, body: '#5a5450', head: '#3a3634', breast: '#e0702a', wing: '#4a4542', eyering: '#f4f4f0', bill: '#e8c040', size: 1.2, perch: ['lawn'], hops: true },
        { k: 'junco', w: winter ? 5 : 0, body: '#5a5e68', head: '#4a4e58', breast: '#f0f0ec', wing: '#4a4e58', bill: '#f0d8d0', size: 0.85, perch: ['ground', 'lawn'] },
      ];
      return K.filter((b) => b.w > 0);
    }
    birdSlots() { // where a bird can land, in stage coords
      const f = this.feeder, T = this.tree, out = [];
      out.push({ k: 'tray', x: f.x - 7, y: f.top + 18, f: 1 }, { k: 'tray', x: f.x + 7, y: f.top + 18, f: -1 }, { k: 'tray', x: f.x, y: f.top - 1, f: Math.random() < 0.5 ? 1 : -1, roof: true });
      out.push({ k: 'side', x: f.x - 5, y: f.top + 12, f: 1 }, { k: 'side', x: f.x + 5, y: f.top + 12, f: -1 });
      out.push({ k: 'pole', x: f.x + 1, y: f.base - 22, f: 1 }, { k: 'pole', x: f.x - 1, y: f.base - 32, f: -1 });
      for (let i = 0; i < 4; i++) out.push({ k: 'ground', x: f.x - 16 + i * 10 + Math.random() * 6, y: f.base + 4 + Math.random() * 6, f: Math.random() < 0.5 ? 1 : -1 });
      out.push({ k: 'trunk', x: T.x - 7, y: T.base - 40 - Math.random() * 30, f: 1 }, { k: 'trunk', x: T.x + 7, y: T.base - 30 - Math.random() * 30, f: -1 });
      for (let i = 0; i < 3; i++) out.push({ k: 'lawn', x: 30 + Math.random() * (this.S - 80), y: this.F + 24 + Math.random() * (this.st.h - this.F - 50), f: Math.random() < 0.5 ? 1 : -1 });
      return out;
    }
    tickBirds() {
      const X = this.st.x, Yo = this.st.y, W = this.st.w, nt = this.night(), B = this.birds;
      const sq = this.squirrel, sqAtFeeder = sq && sq.st === 'sit' && Math.abs(sq.x - this.feeder.x) < 14;
      if (!nt && B.length < 3 && --this.birdWait <= 0) {
        const kinds = this.birdKinds(), tot = kinds.reduce((a, k) => a + k.w, 0); let r = Math.random() * tot, kind = kinds[0]; for (const k of kinds) { r -= k.w; if (r <= 0) { kind = k; break; } }
        const used = new Set(B.map((b) => b.slot && b.slot.k + ':' + Math.round(b.slot.x))), slots = this.birdSlots().filter((s) => kind.perch.includes(s.k) && !used.has(s.k + ':' + Math.round(s.x)) && !(sqAtFeeder && s.k !== 'lawn' && s.k !== 'trunk'));
        if (slots.length) { const slot = slots[Math.floor(Math.random() * slots.length)], fromLeft = Math.random() < 0.5; B.push({ kind, slot, st: 'in', t: 0, x: fromLeft ? -10 : W + 10, y: Math.random() * 30, stay: (kind.slow ? 700 : 350) + Math.random() * 500, f: slot.f, k: Math.random().toString(36).slice(2, 6), hop: 0 }); }
        this.birdWait = 200 + Math.random() * 500;
      }
      for (const b of B) {
        b.t++;
        if (b.st === 'in') { const dx = b.slot.x - b.x, dy = b.slot.y - b.y, d = Math.hypot(dx, dy); if (d < 3) { b.st = 'perch'; b.t = 0; b.x = b.slot.x; b.y = b.slot.y; b.f = b.slot.f; } else { const v = Math.min(3.2, 0.6 + d * 0.06); b.x += (dx / d) * v; b.y += (dy / d) * v - (d > 40 ? 0.4 : 0); b.f = dx > 0 ? 1 : -1; } }
        else if (b.st === 'perch') {
          const c = this.w.nearestCat(X + b.x, Yo + b.y, (q) => !q.asleep && !q.hidden), near = c && dist(c.x, c.y, X + b.x, Yo + b.y) < (b.slot.k === 'lawn' || b.slot.k === 'ground' ? 64 : 44) * this.w.size;
          const bossed = B.some((o) => o !== b && o.kind.boss && o.st === 'in' && b.slot.k === 'tray');
          if (b.t > b.stay || near || (sqAtFeeder && b.slot.k !== 'lawn' && b.slot.k !== 'trunk') || bossed) { b.st = 'out'; b.t = 0; b.vx = (Math.random() < 0.5 ? -1 : 1) * 2.4; b.f = b.vx > 0 ? 1 : -1; }
          else if (b.kind.hops && b.t % 50 === 0 && Math.random() < 0.7) { b.hop = 8; b.hx = (Math.random() - 0.5) * 16; } // the robin: a few hops, a listen, a tug at the lawn
          if (b.hop > 0) { b.hop--; b.x += (b.hx || 0) / 8; b.x = Math.max(10, Math.min(this.S - 30, b.x)); }
        }
        else if (b.st === 'out') { b.x += b.vx; b.y -= 1.4 + b.t * 0.02; if (b.x < -14 || b.x > W + 14 || b.y < -10) b.gone = true; }
      }
      this.birds = B.filter((b) => !b.gone);
    }
    drawBirds(ctx, X, Yo) {
      for (const b of this.birds) {
        const K = b.kind, s = K.size * 1.25, x = Math.round(X + b.x), y = Math.round(Yo + b.y), f = b.f, fly = b.st !== 'perch', up = fly && ((b.t >> 1) & 1), cling = K.cling && b.st === 'perch', hd = K.headDown && cling;
        const peck = b.st === 'perch' && (b.slot.k === 'ground' || b.slot.k === 'lawn' || b.slot.k === 'tray') && b.t % 90 > 70 && !K.slow;
        if (!fly && !cling) ell(ctx, x, y + 1, 3.5 * s, 1, 'rgba(20,14,6,0.18)');
        if (cling) { // flat against the pole or the trunk, head up (or down, for the nuthatch)
          const d = hd ? 1 : -1; ell(ctx, x, y, 2.2 * s, 3.6 * s, K.body); ell(ctx, x, y + d * 3 * s, 2 * s, 2 * s, K.head); if (K.cheek) px(ctx, x + f, y + d * 3 * s, K.cheek);
          px(ctx, x + f * 1.5, y + d * 2.5 * s, '#111'); if (K.nape) px(ctx, x - f, y + d * 4 * s, K.nape); for (let i = -1; i <= 1; i++) px(ctx, x + i, y - d * 1 * s, K.bar || K.wing); BZ.drawThin(ctx, x + f * 2 * s, y + d * 4 * s, x + f * 3.5 * s, y + d * 4.5 * s, K.bill); continue;
        }
        const bl = 3.6 * s, bh = (fly ? 2.2 : 2.6) * s, hy = y - (peck ? 0.5 : 2.6) * s, hx = x + f * (peck ? 3.4 : 2.6) * s;
        BZ.drawThin(ctx, x - f * 3 * s, y, x - f * (K.tailUp ? 5 : 6.5) * s, y - (K.tailUp ? 3.5 : 0.6) * s, K.wing); // tail
        ell(ctx, x, y - 0.5, bl, bh, K.body); ell(ctx, x + f * 0.5, y + 0.3, bl * 0.75, bh * 0.75, K.breast); // body, breast
        if (K.streak) for (let i = -2; i <= 2; i += 2) px(ctx, x + i, y + 1, K.streak);
        if (K.flank) px(ctx, x - f * 1.5, y + 0.8, K.flank); if (K.spot) px(ctx, x - f * 1.5, y - 1, K.spot);
        if (up) { BZ.drawThin(ctx, x, y - 1, x - f * 1 * s, y - 5.5 * s, K.wing); BZ.drawThin(ctx, x + 1, y - 1, x + 1 - f * 1 * s, y - 5.5 * s, K.wing); } // wings up
        else { ell(ctx, x - f * 0.8 * s, y - 1.2 * s, bl * 0.62, bh * 0.55, K.wing); if (K.bar) for (let i = 0; i < 3; i++) px(ctx, x - f * (0.5 + i) * s, y - 1 * s + (i & 1), K.bar); } // the folded wing, a wing bar
        ell(ctx, hx, hy, 1.9 * s, 1.8 * s, K.head); // head
        if (K.mask) { px(ctx, hx + f * 1, hy, K.mask); px(ctx, hx + f * 1, hy + 1, K.mask); } if (K.cheek) px(ctx, hx, hy + 0.5, K.cheek); if (K.bib) px(ctx, hx - f * 0.5, hy + 1.5, K.bib);
        if (K.brow) BZ.drawThin(ctx, hx - f * 1.5, hy - 1, hx + f * 1.5, hy - 1, K.brow); if (K.cap) px(ctx, hx - f * 0.5, hy - 1.5 * s, K.cap); if (K.necklace) BZ.drawThin(ctx, hx - 1.5, hy + 1.6, hx + 1.5, hy + 1.6, K.necklace); if (K.eyering) px(ctx, hx + f * 0.5, hy - 0.5, K.eyering);
        if (K.crest) { px(ctx, hx - f * 0.5, hy - 2 * s, K.head); px(ctx, hx - f * 1, hy - 2.6 * s, K.head); } // the crest
        px(ctx, hx + f * 0.8, hy - 0.3, '#111'); BZ.drawThin(ctx, hx + f * 1.8 * s, hy + (peck ? 0.6 : 0.1), hx + f * 3 * s, hy + (peck ? 1.2 : 0.3), K.bill); // eye, bill
      }
    }
    // ── Juno: on her bed, watching the yard. She looks at whatever moves, dozes with her chin on her paws, sleeps, and
    // reacts to a hand: ears soften, eyes squint, the tail thumps the bed. Bunny sometimes curls up at the foot of the bed. ──
    tickDog() {
      const d = this.dog, w = this.w, X = this.st.x, Yo = this.st.y, size = w.size, nt = this.night(), p = w.pointer;
      d.t++; if (d.T == null) d.T = 700;
      if (d.liftT > 0) d.liftT--; if (d.wake > 0) d.wake--;
      const set = (st, T) => { d.st = st; d.t = 0; d.T = T; };
      const headAt = (c) => (c.screen ? [c.screen[BZ.IDX.head][0], c.screen[BZ.IDX.head][1]] : [c.x, c.y - 20 * size]);
      // what's worth a look: a bird landing, the squirrel, a cat moving nearby, your hand close to her, the thing you're carrying
      const bird = this.birds.find((b) => b.st === 'in' && b.t < 3), q = this.squirrel, sq = q && (q.st === 'out' || q.st === 'sit' || q.st === 'home');
      const mover = w.nearestCat(d.x, d.y, (c) => !c.hidden && !c.asleep && (c.gait || c.state === 'held')), moverD = mover ? dist(mover.x, mover.y, d.x, d.y) : 1e9;
      const hand = p.inside && dist(p.x, p.y, d.x, d.y - 20 * size) < 110 * size, held = w.heldCat;
      const bo = w.cats.find((c) => c.isBo && !c.hidden && !c.asleep && !c.inBed), boD = bo ? dist(bo.x, bo.y, d.x, d.y) : 1e9;
      const busyPet = d.liftT > 0 && d.leanT > 0;
      if (d.leanT > 0) { d.leanT--; if (d.leanT === 0) d.leanTo = 0; }
      const awake = d.st !== 'sleep';
      if (awake && !busyPet) {
        if (sq && !(d.sqT > 0)) { d.look = [X + q.x, Yo + q.y]; d.browT = 60; d.browTo = 0.9; d.earT = 60; d.earTo = 0.9; d.sqT = 90; d.liftT = 160; if (d.st !== 'watch') set('watch', 400); if (Math.random() < 0.4) d.mouthT = 12; } // the squirrel: that's the one thing that still gets a boof
        else if (bird) { d.look = [X + bird.x, Yo + bird.y]; d.earT = 40; d.earTo = 0.6; d.browT = 40; d.browTo = 0.5; d.liftT = 120; }
        else if (held && Math.random() < 0.03) { d.look = [held.x, held.y - 10]; d.browT = 30; d.browTo = 0.7; d.liftT = 90; } // a cat in the air: eyebrows
        else if (mover && moverD < 190 * size && d.t % 12 === 0) { d.look = headAt(mover); d.liftT = Math.max(d.liftT, 60); if (moverD < 70 * size && Math.random() < 0.2) { d.earT = 30; d.earTo = 0.5; } }
        else if (hand && d.t % 8 === 0) { d.look = [p.x, p.y]; d.liftT = Math.max(d.liftT, 40); }
      }
      if (d.sqT > 0) d.sqT--;
      // Bo too close: she just watches Bo, eyebrows up, a little hopeful. Bo is the one who minds (see Cat.s_skeptic)
      if (bo && boD < 85 * size && !(bo.cool.dog > 0) && !bo.asleep && !bo.inBed && !BZ.BUSY.includes(bo.state) && bo.state !== 'toBed' && bo.state !== 'nap') { bo.setState('skeptic'); bo.skepT = (70 + Math.random() * 90) | 0; bo.skepAt = d; bo.cool.dog = 700; if (awake) { d.look = headAt(bo); d.browT = 80; d.browTo = 0.8; d.liftT = 120; d.wag = 50; } }
      // Bunny arriving on the bed: a tail thump and a look, then back to resting her chin
      const bedCat = w.cats.find((c) => c.inBed && c.inBed.type === 'dogbed');
      if (bedCat && !d.hadCat) { d.hadCat = true; d.wag = 90; d.look = headAt(bedCat); d.liftT = 150; d.browT = 60; d.browTo = 0.6; if (d.st === 'sleep') set('doze', 600); }
      if (!bedCat) d.hadCat = false;
      switch (d.st) {
        case 'watch': { d.anim = 'sphinx';
          if (d.t % 110 === 50 && !(d.liftT > 0) && !hand) d.look = Math.random() < 0.55 ? null : [d.x + (Math.random() - 0.3) * 260 * size, d.y - 20 - Math.random() * 90]; // an idle glance around the yard
          if (d.t % 160 === 80 && Math.random() < 0.35) { d.earT = 20; d.earTo = Math.random() < 0.5 ? 0.4 : -0.2; }
          if (d.t > d.T && !(d.liftT > 0)) { if (Math.random() < 0.35) d.yawnT = 40; set('doze', (nt ? 500 : 900) + Math.random() * 1100); d.look = null; }
          break; }
        case 'doze': { d.anim = d.liftT > 0 ? 'sphinx' : 'chin'; if (d.t % 90 === 30 && d.liftT === 0 && Math.random() < 0.25) { d.earT = 16; d.earTo = -0.1; } // an ear flicks
          if (d.t > d.T && !(d.liftT > 0)) { if (Math.random() < (nt ? 0.75 : 0.45)) set('sleep', (nt ? 3000 : 1800) + Math.random() * 2600); else set('watch', 500 + Math.random() * 900); }
          break; }
        case 'sleep': { d.anim = d.wake > 0 ? 'chin' : 'sleep'; d.look = null; if (d.t % 200 === 100 && Math.random() < 0.3) { d.earT = 10; d.earTo = -0.3; } // a dream twitch
          const loud = w.cats.some((c) => c.state === 'brawl' && dist(c.x, c.y, d.x, d.y) < 120 * size) || (sq && dist(X + q.x, Yo + q.y, d.x, d.y) < 90 * size);
          if (d.t > d.T || loud || d.wake > 0 && d.wake < 2) { set('doze', 400 + Math.random() * 600); d.wake = 0; d.liftT = loud ? 120 : 0; if (loud) { d.look = sq ? [X + q.x, Yo + q.y] : null; d.earT = 40; d.earTo = 0.7; } }
          break; }
        default: set('watch', 700);
      }
      d.animate();
    }
    // what's moving out here that a cat could care about
    stimuli() {
      const X = this.st.x, Yo = this.st.y, out = [];
      this.bflies.forEach((b) => { if (b.z < 34) out.push({ key: 'bfly' + b.k, x: X + b.x, y: Yo + b.y, air: b.z, vx: b.vx, vy: b.vy, speed: Math.hypot(b.vx, b.vy) * 1.3 + 0.3, wand: true }); }); // only when it dips low enough to bother with
      for (const l of this.leaves) if (l.z < 30 && l.t < 600) out.push({ key: 'leaf' + l.k, x: X + l.x, y: Yo + l.y, air: l.z, vx: Math.sin(l.t * 0.06 + l.ph) * 0.7, vy: 0, speed: l.z > 0 ? 1.6 : 0.3 });
      const q = this.squirrel; if (q && (q.st === 'out' || q.st === 'sit' || q.st === 'home')) out.push({ key: 'squirrel', x: X + q.x, y: Yo + q.y, vx: 0, vy: 0, speed: q.st === 'sit' ? 0.6 : 3.2 });
      for (const b of this.birds) if (b.st === 'perch' && (b.slot.k === 'lawn' || b.slot.k === 'ground')) out.push({ key: 'bird' + b.k, x: X + b.x, y: Yo + b.y, vx: 0, vy: 0, speed: b.hop > 0 ? 1.8 : 0.5 }); // a bird on the ground: something to stalk
      return out;
    }
    birdSpot() { const b = this.birds.find((o) => o.st === 'perch'); if (b) return [this.st.x + b.x, this.st.y + b.y - 2]; const q = this.squirrel; if (!q || q.st === 'up' || (q.st === 'down' && q.y < 40)) return null; return [this.st.x + q.x, this.st.y + q.y - 6]; }
    drawLife(ctx, X, Yo, t) {
      this.drawBirds(ctx, X, Yo);
      for (const l of this.leaves) { const x = X + l.x, y = Yo + l.y - l.z, a = l.t * 0.15 + l.ph; if (l.z > 0) ell(ctx, X + l.x, Yo + l.y, 2, 0.8, 'rgba(20,14,6,0.12)'); ctx.globalAlpha = Math.min(1, (l.life - l.t) / 120); px(ctx, x, y, l.col); px(ctx, x + Math.cos(a), y + Math.sin(a) * 0.5, l.col); px(ctx, x - Math.cos(a), y - Math.sin(a) * 0.5, mix(l.col, '#000000', 0.25)); ctx.globalAlpha = 1; }
      for (const b of this.bflies) { const x = X + b.x, y = Yo + b.y - b.z, up = (b.t >> 1) & 1; ell(ctx, X + b.x, Yo + b.y, 1.5, 0.6, 'rgba(20,14,6,0.12)'); px(ctx, x, y, '#2a2420'); px(ctx, x - 1, y - (up ? 1 : 0), b.col); px(ctx, x + 1, y - (up ? 1 : 0), b.col); if (up) { px(ctx, x - 2, y - 2, b.col); px(ctx, x + 2, y - 2, b.col); } else { px(ctx, x - 1, y + 1, b.col); px(ctx, x + 1, y + 1, b.col); } }
      const q = this.squirrel;
      if (q) {
        const x = X + q.x, y = Yo + q.y, onTrunk = q.st === 'down' || q.st === 'up', run = q.st !== 'sit' && (q.t >> 2) & 1, f = q.st === 'home' ? -1 : 1, body = '#8a8276', dark = '#5e584e', belly = '#d8d2c4';
        if (onTrunk) { const d = q.st === 'down' ? 1 : -1; ell(ctx, x, y, 2.2, 3.6, body); ell(ctx, x, y + d * 4, 2, 2, body); px(ctx, x, y + d * 5, '#1a1612'); BZ.drawLine(ctx, x, y - d * 3, 2, x + 2, y - d * 8, 3, dark, null, 0); }
        else { ell(ctx, x, y, 2, 0.8, 'rgba(20,14,6,0.15)'); ell(ctx, x, y - 3 - run, 3.4, 2.4, body); ell(ctx, x + f * 3, y - 5 - run, 2, 2, body); px(ctx, x + f * 4, y - 6 - run, '#1a1612'); px(ctx, x + f * 2, y - 7 - run, dark); px(ctx, x + f, y - 2, belly); BZ.drawLine(ctx, x - f * 3, y - 3, 2.4, x - f * 4, y - 10 - (q.st === 'sit' ? Math.sin(q.t * 0.3) : 0), 3.4, dark, null, 0); ell(ctx, x - f * 4, y - 10, 2.6, 2.6, body); if (q.st === 'sit' && (q.t >> 4) & 1) px(ctx, x + f * 4, y - 4, '#b88a4a'); }
      }
      if (this.night()) for (const f of this.ffl) { const on = Math.sin(t * 0.04 + f.p * 3) > 0.55; if (on) { ctx.fillStyle = 'rgba(220,240,120,0.28)'; ctx.fillRect(Math.round(X + f.x) - 1, Math.round(Yo + f.y) - 1, 3, 3); px(ctx, X + f.x, Yo + f.y, '#f2ff9a'); } }
    }
    drawPools(ctx, t) {
      if (this.night()) return; const P = PHASES[this.phase], tint = this.phase === 'dusk' ? '255,190,130' : '255,236,170';
      for (const p of this.pools) { for (let k = 3; k >= 1; k--) BZ.ellipse(ctx, p.x + Math.sin(t * 0.01 + k) * 0.6, p.y, p.rx * (0.6 + k * 0.17), p.ry * (0.6 + k * 0.17), `rgba(${tint},${0.07 * P.beam})`); }
    }
    drawBack(ctx) {
      const X = this.st.x, Yo = this.st.y, t = this.w.frame || 0;
      if (t % 900 === 0 && phaseNow() !== this.phase) this.paint();
      this.tick();
      ctx.drawImage(this.bg, X, Yo);
      this.drawDoors(ctx, X, Yo);
      const sx = Math.round(Math.sin(t * 0.021) * 1.2), sy = Math.round(Math.sin(t * 0.017 + 1) * 0.6); // the leaves move; the light through them shimmers
      ctx.globalAlpha = 0.6; ctx.drawImage(this.dap, X + sx, Yo + sy); ctx.drawImage(this.dap, X - sx, Yo); ctx.globalAlpha = 1;
      this.drawPools(ctx, t);
    }
    drawFront(ctx) {
      const X = this.st.x, Yo = this.st.y, t = this.w.frame || 0;
      this.drawLife(ctx, X, Yo, t);
      ctx.drawImage(this.fg, X + Math.round(Math.sin(t * 0.013) * 1), Yo);
      const tint = { night: 'rgba(14,22,58,0.34)', dusk: 'rgba(120,60,40,0.10)', dawn: 'rgba(230,170,170,0.07)' }[this.phase];
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(X, Yo, this.st.w, this.st.h); }
    }
    sunSpots() { const s = this.w.size; return this.pools.map((p) => ({ item: null, yard: true, slots: [[p.x - 15 * s, p.y], [p.x + 16 * s, p.y - 2]], has: (x, y) => ((x - p.x) / (p.rx + 6)) ** 2 + ((y - p.y) / (p.ry + 4)) ** 2 < 1 })); }
  }
  BZ.Yard = Yard;
  BZ.Jungle = Jungle; BZ.PHASES = PHASES; BZ.phaseNow = phaseNow;
})();
