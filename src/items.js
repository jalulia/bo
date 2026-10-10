// ─── Placeable things: pod, edible plants, toys, food ──────────────────────
// Drawn in the same raster vocabulary as the cats. Every item stands on a
// ground point (x, y); y sorts it against the cats.
var BZ = window.BZ || (window.BZ = {});
(function () {
  BZ.ITEMS = {
    pod:    { label: 'Pod',          hint: 'her sleeping egg',   r: 21, h: 56, bed: true },
    chair:  { label: 'Armchair',     hint: 'a velvet reading chair', r: 30, h: 52, bed: true, chair: { V: ['#5e2a17', '#7d3920', '#9c4a29', '#b65d34', '#cf7b4c'], wood: '#3b2618' } },
    floral: { label: 'Floral chair', hint: 'dark chintz, tufted',  r: 30, h: 52, bed: true, chair: { V: ['#0d1216', '#161e24', '#1f2a31', '#2b3940', '#3c4e56'], wood: '#1a120c', floral: true } },
    emerald:{ label: 'Wingback',     hint: 'emerald velvet',       r: 30, h: 52, bed: true, chair: { V: ['#0c2a20', '#123d30', '#195242', '#246a57', '#3a8770'], wood: '#2a1a10', wings: true } },
    blush:  { label: 'Slipper chair',hint: 'blush boucle',         r: 30, h: 52, bed: true, chair: { V: ['#7a4a4c', '#94605f', '#ad7a76', '#c4948d', '#dbb3aa'], wood: '#4a3226', boucle: true } },
    poppy:  { label: 'Poppy chair',  hint: 'butter cream, coral poppies, a skirt', r: 28, h: 68, bed: true, chair: { home: true } },
    dfly:   { label: 'Dragonfly chair', hint: 'carved fruitwood, blue damask', r: 30, h: 52, bed: true, chair: { home: true } },
    sun:    { label: 'Sunbeam',      hint: 'a warm spot for two', r: 36, h: 10, floor: true },
    grass:  { label: 'Cat grass',    hint: 'she grazes it',      r: 20, h: 26 },
    catnip: { label: 'Catnip',       hint: 'nibble, then zoom',  r: 11, h: 26 },
    spider: { label: 'Spider plant', hint: 'bat and nibble',     r: 12, h: 30 },
    yarn:   { label: 'Yarn',         hint: 'throw it',           r: 8, h: 14, ball: true },
    mouse:  { label: 'Felt mouse',   hint: 'flick it',           r: 8, h: 10, ball: true },
    laser:  { label: 'Laser',        hint: 'follows your cursor', tool: true },
    brush:  { label: 'Brush',        hint: 'groom them: move it over a cat', tool: true },
    wand:   { label: 'Feather wand', hint: 'dangle it; they leap for it', tool: true },
    pillow: { label: 'Pillow',       hint: 'knead it, curl up on it', r: 18, h: 12, bed: true, soft: true },
    blanket:{ label: 'Blanket',      hint: 'biscuits, naps, burrowing', r: 32, h: 8, bed: true, soft: true, burrow: true },
    box:    { label: 'Cardboard box',hint: 'if she fits, she sits', r: 19, h: 26, bed: true, box: true },
    ledge:  { label: 'Window ledge', hint: '', bed: true, fixed: true, r: 0, h: 0 },
    seat:   { label: 'Daybed seat', hint: '', bed: true, fixed: true, r: 0, h: 0 },
    ctable: { label: 'Coffee table', hint: 'carved antique: nap on it, lurk under it', r: 36, h: 30, bed: true, hide: true },
    daybed: { label: 'Daybed', hint: 'room for two, with woven pillows', r: 50, h: 48, bed: true, soft: true },
    treat:  { label: 'Treat',        hint: 'click to drop',      r: 7, h: 10, consumable: true, snack: true },
    shrimp: { label: 'Shrimp',       hint: 'a fancy snack',      r: 7, h: 10, consumable: true, snack: true },
    bowl:   { label: 'Food',         hint: 'a full bowl',        r: 16, h: 12 },
  };
  // ── more plants (ours): data-driven; `safe` ones get nibbled, the rest get batted, sniffed or lurked behind ──
  BZ.PLANTS = {
    albo:      { label: 'Monstera albo',  hint: 'half-moons and marbling, on a moss pole', kind: 'albo', pot: 'albo', safe: false, r: 24, h: 84, hide: true },
    palm:      { label: 'Parlor palm',    hint: 'cat-safe; she nibbles fronds', kind: 'palm', pot: 'basket', safe: true, r: 17, h: 46 },
    fern:      { label: 'Boston fern',    hint: 'cat-safe and very battable', kind: 'fern', pot: 'terra', safe: true, r: 19, h: 30 },
    snake:     { label: 'Snake plant',    hint: 'stiff swords to sniff', kind: 'snake', pot: 'white', safe: false, r: 12, h: 46 },
    monstera:  { label: 'Monstera',       hint: 'big split leaves to lurk under', kind: 'monstera', pot: 'terra', safe: false, r: 22, h: 54, hide: true },
    fiddle:    { label: 'Fiddle leaf fig',hint: 'tall; good for ambushes', kind: 'fiddle', pot: 'black', safe: false, r: 14, h: 72, hide: true },
    olive:     { label: 'Olive tree',     hint: 'silvery and rustly', kind: 'olive', pot: 'stone', safe: false, r: 16, h: 70, hide: true },
    zz:        { label: 'ZZ plant',       hint: 'glossy and bouncy', kind: 'zz', pot: 'teal', safe: false, r: 14, h: 38 },
    calathea:  { label: 'Calathea',       hint: 'a prayer plant: folds up at night', kind: 'calathea', pot: 'white', safe: true, r: 15, h: 36 },
    pilea:     { label: 'Pilea',          hint: 'coin leaves, cat-safe', kind: 'pilea', pot: 'mustard', safe: true, r: 12, h: 28 },
    orchid:    { label: 'Orchid',         hint: 'cat-safe blooms', kind: 'orchid', pot: 'white', safe: true, r: 11, h: 42 },
    cactus:    { label: 'Cactus',         hint: 'she learns', kind: 'cactus', pot: 'terra', safe: false, r: 9, h: 42, prickly: true },
    succulent: { label: 'Succulents',     hint: 'a little bowl of rosettes', kind: 'succulent', pot: 'bowl', safe: true, r: 14, h: 16 },
    lavender:  { label: 'Lavender',       hint: 'a sniff and a sneeze', kind: 'lavender', pot: 'terra', safe: false, r: 11, h: 32, sneeze: true },
    silvervine:{ label: 'Silvervine',     hint: 'like catnip, only more so', kind: 'silvervine', pot: 'terra', safe: true, r: 12, h: 32, nip: true },
  };
  for (const k in BZ.PLANTS) BZ.ITEMS[k] = Object.assign({ plant: true }, BZ.PLANTS[k]);
  // ── the garden (backyard only): seeds become sprouts become plants; cats graze, roll, sniff and bat them ──
  BZ.GARDEN = {
    catgrass:   { label: 'Cat grass',    hint: 'her favorite thing out here', safe: true, graze: true, r: 9, h: 16, col: '#6fae3c' },
    catmint:    { label: 'Catmint',      hint: 'a roll in it, then zoomies', safe: true, nip: true, r: 9, h: 15, col: '#8a86d0' },
    poppy:      { label: 'Poppies',      hint: 'coral, like the chair', r: 7, h: 22, col: '#e0684a' },
    tulip:      { label: 'Tulips',       hint: 'cups of color', r: 6, h: 18, col: '#e8607a' },
    sunflower:  { label: 'Sunflower',    hint: 'tall; it follows the sun', r: 8, h: 46, col: '#f2c53a' },
    lavender:   { label: 'Lavender',     hint: 'a sniff and a sneeze', r: 8, h: 18, sneeze: true, col: '#9a7ad0' },
    cosmos:     { label: 'Cosmos',       hint: 'feathery and very battable', r: 8, h: 30, col: '#f08ab8' },
    strawberry: { label: 'Strawberries', hint: 'low leaves, red berries', r: 9, h: 9, col: '#d8343a' },
  };
  for (const k in BZ.GARDEN) BZ.ITEMS['seed_' + k] = { label: BZ.GARDEN[k].label, hint: 'seeds: click a bed or a grass patch to plant', tool: true, seed: k, places: ['yard'] };
  Object.assign(BZ.ITEMS, {
    can:    { label: 'Watering can', hint: 'hold the mouse down over the beds', tool: true, places: ['yard'] },
    trowel: { label: 'Trowel', hint: 'dig a plant back up', tool: true, places: ['yard'] },
    sprout: { label: 'Garden plant', hint: '', r: 8, h: 18, garden: true },
    stoop:  { label: 'Steps', hint: '', bed: true, fixed: true, r: 0, h: 0 },
    tire:   { label: 'Tire swing', hint: '', bed: true, fixed: true, r: 0, h: 0 },
    sweater:{ label: 'Sweaters', hint: 'knit, with ribbon bows: click a cat to dress her', tool: true },
    bag:    { label: 'Felted bag', hint: 'hand-knit wool; she climbs in', r: 15, h: 26, bed: true, box: true },
    lamptable: { label: 'Lamp table', hint: 'mahogany, a brass lamp, warm for two', r: 24, h: 74, bed: true },
    cubby:  { label: 'Felt cube', hint: '', bed: true, fixed: true, r: 0, h: 0 },
    adk:    { label: 'Adirondack chair', hint: '', bed: true, fixed: true, soft: true, r: 26, h: 46 },
  });
  BZ.ITEMS.daybed.places = ['desk']; BZ.ITEMS.ctable.places = ['desk']; // in the room they're furniture; on the desktop you can still put them out
  BZ.ITEM_ORDER = ['sun', 'pod', 'pillow', 'blanket', 'box', 'bag', 'lamptable', 'sweater', 'daybed', 'ctable', 'poppy', 'dfly', 'chair', 'floral', 'emerald', 'blush', 'grass', 'catnip', 'spider', ...Object.keys(BZ.PLANTS), 'yarn', 'mouse', 'laser', 'wand', 'brush', 'treat', 'shrimp', 'bowl', ...Object.keys(BZ.GARDEN).map((k) => 'seed_' + k), 'can', 'trowel'];
  BZ.ITEM_GROUPS = [
    ['Comfort', ['sun', 'pod', 'pillow', 'blanket', 'box', 'bag', 'lamptable', 'sweater', 'daybed', 'ctable', 'poppy', 'dfly', 'chair', 'floral', 'emerald', 'blush']],
    ['Plants', ['grass', 'catnip', 'spider', ...Object.keys(BZ.PLANTS)]],
    ['Play', ['yarn', 'mouse', 'laser', 'wand', 'brush']],
    ['Treats', ['treat', 'shrimp', 'bowl']],
    ['Garden', [...Object.keys(BZ.GARDEN).map((k) => 'seed_' + k), 'can', 'trowel'], 'yard'],
  ];
  BZ.isNight = () => { const h = new Date().getHours() + new Date().getMinutes() / 60; return h < 6 || h >= 20.5; };

  BZ.growSprout = function (it) { // growth is in seconds of sun (watered plants get more of them)
    const g = it.g || 0, st = g < 25 ? 0 : g < 110 ? 1 : g < 260 ? 2 : 3;
    if (st >= 3 && !(it.stage >= 3) && BZ.GARDEN[it.kind] && BZ.GARDEN[it.kind].graze) { it.full = 6; if (it.servings == null) it.servings = 6; }
    if (st >= 3 && BZ.GARDEN[it.kind] && BZ.GARDEN[it.kind].safe && !it.full) { it.full = 6; if (it.servings == null) it.servings = 6; }
    it.stage = st; return st;
  };
  BZ.newItem = function (type, x, y) {
    const it = { type, x, y, vx: 0, vy: 0, t: Math.random() * 100 };
    if (type === 'grass') { it.full = 14; it.servings = 14; }
    if (type === 'catnip') { it.full = 9; it.servings = 9; }
    if (type === 'spider') { it.full = 8; it.servings = 8; it.swing = 0; }
    if (type === 'bowl') { it.full = 30; it.servings = 30; }
    if (BZ.PLANTS[type]) { it.full = 10; it.servings = 10; it.swing = 0; it.rustle = 0; }
    if (type === 'box') it.scratches = 0;
    return it;
  };

  // pod geometry (shared by drawing, behavior and the inside-clip)
  BZ.podGeom = function (it, s) {
    const k = s * 0.95 * 0.8, rx = 40 * k, ry = 35 * k, legH = 20 * k; // 20% smaller than it started
    const cy = it.y - legH - ry * 0.85;
    const g = { x: it.x, y: it.y, cx: it.x, cy, rx, ry, ox: it.x, oy: cy + 3 * k, orx: 29 * k, ory: 26 * k, s: k };
    g.inside = [g.ox, g.oy + g.ory * 0.8];
    g.front = [g.x, g.y + 9 * k];
    return g;
  };
  function ell(ctx, cx, cy, rx, ry, col) { BZ.ellipse(ctx, cx, cy, rx, ry, col); }

  // where a cat goes to use a bed: walk to `front`, hop to `spot`, sit at rootPx above it
  BZ.bedGeom = function (it, s) {
    if (it.type === 'pod') { const g = BZ.podGeom(it, s); return { front: g.front, spot: g.inside, rootPx: 0, clip: { cx: g.ox, cy: g.oy, rx: g.orx, ry: g.ory }, sortY: it.y - 0.1, face: Math.PI / 2 + 0.3 }; }
    if (it.type === 'ledge') return { front: [it.x, it.y + 12 * s], spot: [it.x, it.y], rootPx: it.rootPx, clip: null, sortY: it.y - 0.5, face: it.face };
    if (it.type === 'ctable') { const k = s * 0.95; return { front: [it.x + 4 * k, it.y + 12 * k], spot: [it.x - 8 * k, it.y - 2 * k], rootPx: 25 * k, clip: null, sortY: it.y + 0.3, face: Math.PI / 2 + 0.5 }; }
    if (it.type === 'cubby') { const h = it.hole; return { front: [it.x, it.y + 12 * s], spot: [h.cx, it.y], rootPx: it.rootPx, clip: { cx: h.cx, cy: h.cy, rx: h.rx, ry: h.ry }, sortY: it.y - 0.1, face: Math.PI / 2 + 0.12 }; }
    if (it.type === 'stoop') return { front: it.frontPt, spot: [it.x, it.y], rootPx: it.rootPx, clip: null, sortY: it.y - 0.5, face: it.face };
    if (it.type === 'tire') { const T = BZ.tireGeom(it, s); return { front: [it.x + 6 * s, it.y + 13 * s], spot: [T.cx, it.y], rootPx: it.y - (T.cy + T.r * 0.82), clip: null, sortY: it.y + 0.05, face: Math.PI / 2 - 0.15, tire: true }; }
    if (it.type === 'adk' || (it.type === 'seat' && it.parent && it.parent.type === 'adk')) { const P = it.type === 'seat' ? it.parent : it, slot = it.type === 'seat' ? 1 : 0, k = s * 0.95; return { front: [P.x + (slot ? 13 : -13) * k, P.y + 13 * k], spot: [P.x + (slot ? 8 : -9) * k, P.y - 3 * k], rootPx: 15 * k, clip: null, sortY: P.y + 0.3 + slot * 0.01, face: slot ? Math.PI / 2 - 0.55 : Math.PI / 2 + 0.55 }; }
    if (it.type === 'lamptable' || (it.type === 'seat' && it.parent && it.parent.type === 'lamptable')) { const P = it.type === 'seat' ? it.parent : it, slot = it.type === 'seat' ? 1 : 0, k = s * 0.95; return { front: [P.x + (slot ? 12 : -12) * k, P.y + 12 * k], spot: [P.x + (slot ? 9 : -9) * k, P.y - 2 * k], rootPx: 27.5 * k, clip: null, sortY: P.y + 0.3 + slot * 0.01, face: slot ? Math.PI / 2 - 0.4 : Math.PI / 2 + 0.4 }; }
    if (it.type === 'daybed' || it.type === 'seat') { const P = it.type === 'seat' ? it.parent : it, slot = it.type === 'seat' ? 1 : 0, k = s * 0.95; return { front: [P.x + (slot ? 16 : -16) * k, P.y + 13 * k], spot: [P.x + (slot ? 15 : -17) * k, P.y - 3 * k], rootPx: 22 * k, clip: null, sortY: P.y + 0.3 + slot * 0.01, face: slot ? Math.PI / 2 - 0.5 : Math.PI / 2 + 0.5 }; }
    if (it.type === 'pillow') { const k = s * 0.95; return { front: [it.x + 2 * k, it.y + 12 * k], spot: [it.x, it.y - 1 * k], rootPx: 5 * k, clip: null, sortY: it.y + 0.3, face: Math.PI / 2 + 0.4 }; }
    if (it.type === 'blanket') { const k = s * 0.95; return { front: [it.x + 4 * k, it.y + 13 * k], spot: [it.x + 2 * k, it.y - 1 * k], rootPx: 2 * k, clip: null, sortY: it.y + 0.3, face: Math.PI / 2 + 0.5 }; }
    if (it.type === 'bag') { const k = s * 0.95; return { front: [it.x + 3 * k, it.y + 13 * k], spot: [it.x, it.y - 3 * k], rootPx: 1 * k, clip: null, sortY: it.y - 0.1, face: Math.PI / 2 + 0.2, box: true }; }
    if (it.type === 'box') { const k = s * 0.95; return { front: [it.x + 3 * k, it.y + 14 * k], spot: [it.x, it.y - 4 * k], rootPx: 1 * k, clip: null, sortY: it.y - 0.1, face: Math.PI / 2 + 0.25, box: true }; }
    if (it.type === 'poppy') { const k = s * 0.95; return { front: [it.x + 4 * k, it.y + 12 * k], spot: [it.x, it.y - 3 * k], rootPx: 26.5 * k, clip: null, sortY: it.y + 0.3, face: Math.PI / 2 + 0.6 }; }
    if (BZ.ITEMS[it.type] && BZ.ITEMS[it.type].chair) { const k = s * 0.95; return { front: [it.x + 4 * k, it.y + 12 * k], spot: [it.x, it.y - 3 * k], rootPx: 17 * k, clip: null, sortY: it.y + 0.3, face: Math.PI / 2 + 0.6 }; }
    return null;
  };
  // sunbeam: a warm skewed patch on the floor; two nap slots
  BZ.sunSlots = function (it, s) { return [[it.x - 15 * s, it.y + 1], [it.x + 17 * s, it.y - 2]]; };
  BZ.inSun = function (it, x, y, s) { return Math.abs(x - it.x - (y - it.y) * 0.5) < 40 * s && Math.abs(y - it.y) < 12 * s; };
  BZ.drawSun = function (ctx, it, s, t, roam) {
    if (roam) BZ.drawSunWindow(ctx, it, s, t);
    const w = 40 * s, h = 12 * s, x = it.x, y = it.y, sk = 0.5;
    const quad = (k, col) => BZ.fillPoly(ctx, [[x - w * k - h * k * sk, y - h * k], [x + w * k - h * k * sk, y - h * k], [x + w * k + h * k * sk, y + h * k], [x - w * k + h * k * sk, y + h * k]], col);
    quad(1.12, 'rgba(255,214,140,0.10)'); quad(1, 'rgba(255,222,150,0.24)'); quad(0.8, 'rgba(255,236,190,0.16)');
    ctx.fillStyle = 'rgba(255,214,140,0.18)';
    for (let i = 0; i < 4; i++) { const xx = Math.round(x + w * 0.9 - i * 6 * s + h * sk); ctx.fillRect(xx, Math.round(y - h * 5), Math.max(1, Math.round(4 * s)), Math.round(h * 4)); } // shafts
    const r = BZ.rng(9); ctx.fillStyle = 'rgba(255,248,220,0.85)';
    for (let i = 0; i < 9; i++) { const ph = (t * 0.004 + r()) % 1; ctx.fillRect(Math.round(x + (r() - 0.5) * w * 1.6 + Math.sin(t * 0.02 + i) * 3), Math.round(y - ph * h * 5), 1, 1); } // dust motes
  };
  function chair(ctx, it, s) {
    const k = s * 0.95, x = it.x, y = it.y, W = 27 * k, C = BZ.ITEMS[it.type].chair;
    const V = C.V, wood = C.wood, wood2 = C.wood;
    ell(ctx, x, y + 1, W * 1.05, 5 * k, 'rgba(30,20,10,0.18)');
    for (const dx of [-W + 3 * k, W - 3 * k]) { BZ.drawLine(ctx, x + dx, y - 6 * k, 2.2 * k, x + dx + (dx > 0 ? 2 : -2) * k, y, 1.4 * k, wood, null, 0); }
    BZ.drawLine(ctx, x - W * 0.55, y - 7 * k, 1.8 * k, x - W * 0.6, y - 2 * k, 1.2 * k, wood2, null, 0); BZ.drawLine(ctx, x + W * 0.55, y - 7 * k, 1.8 * k, x + W * 0.6, y - 2 * k, 1.2 * k, wood2, null, 0);
    // back: tall rounded, tufted
    BZ.fillPoly(ctx, [[x - W * 0.82, y - 18 * k], [x - W * 0.78, y - 44 * k], [x - W * 0.55, y - 50 * k], [x + W * 0.55, y - 50 * k], [x + W * 0.78, y - 44 * k], [x + W * 0.82, y - 18 * k]], V[1]);
    BZ.fillPoly(ctx, [[x - W * 0.72, y - 19 * k], [x - W * 0.68, y - 42 * k], [x - W * 0.5, y - 47 * k], [x + W * 0.5, y - 47 * k], [x + W * 0.68, y - 42 * k], [x + W * 0.72, y - 19 * k]], V[2]);
    ctx.fillStyle = V[0]; for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) ctx.fillRect(Math.round(x + c * W * 0.36 + (r % 2) * W * 0.18 - W * 0.09), Math.round(y - (40 - r * 7) * k), 1, 1);
    if (C.wings) for (const sd of [-1, 1]) BZ.fillPoly(ctx, [[x + sd * W * 0.7, y - 22 * k], [x + sd * W * 0.98, y - 30 * k], [x + sd * W * 1.0, y - 44 * k], [x + sd * W * 0.74, y - 46 * k]], V[sd < 0 ? 2 : 1]); // wings
    if (C.floral) chintz(ctx, x, y, W, k, 3, 48, 0.68, 41);
    if (C.boucle) { const r = BZ.rng(7); ctx.fillStyle = V[4]; for (let i = 0; i < 70; i++) ctx.fillRect(Math.round(x + (r() - 0.5) * W * 1.4), Math.round(y - (20 + r() * 26) * k), 1, 1); }
    // seat cushion
    BZ.fillPoly(ctx, [[x - W * 0.86, y - 14 * k], [x - W * 0.8, y - 20 * k], [x + W * 0.8, y - 20 * k], [x + W * 0.86, y - 14 * k], [x + W * 0.86, y - 7 * k], [x - W * 0.86, y - 7 * k]], V[2]);
    BZ.fillPoly(ctx, [[x - W * 0.8, y - 19 * k], [x + W * 0.8, y - 19 * k], [x + W * 0.76, y - 16 * k], [x - W * 0.76, y - 16 * k]], V[3]);
    ctx.fillStyle = V[0]; ctx.fillRect(Math.round(x - W * 0.86), Math.round(y - 8 * k), Math.round(W * 1.72), 1);
    if (C.floral) chintz(ctx, x, y, W, k, 8, 19, 0.82, 77);
    // rolled arms
    for (const sd of [-1, 1]) {
      const ax = x + sd * W * 0.92;
      BZ.fillPoly(ctx, [[ax - 5 * k, y - 26 * k], [ax + 5 * k, y - 26 * k], [ax + 5 * k, y - 7 * k], [ax - 5 * k, y - 7 * k]], V[1]);
      ell(ctx, ax, y - 26 * k, 5.5 * k, 3.2 * k, V[3]); ell(ctx, ax, y - 26 * k, 3.2 * k, 1.8 * k, V[4]);
      if (C.floral) bloom(ctx, ax, y - 17 * k, '#b3475f', '#e08aa0');
    }
  }
  // dark chintz: small roses, mustard buds and sage leaves scattered on the upholstery
  function bloom(ctx, x, y, a, b) { x = Math.round(x); y = Math.round(y); ctx.fillStyle = '#4f6b4a'; ctx.fillRect(x - 2, y + 1, 1, 1); ctx.fillRect(x + 2, y - 1, 1, 1); ctx.fillStyle = a; ctx.fillRect(x - 1, y - 1, 3, 3); ctx.fillStyle = b; ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x - 1, y, 1, 1); }
  function chintz(ctx, x, y, W, k, y0, y1, wf, seed) {
    const r = BZ.rng(seed), n = Math.round((y1 - y0) * W * wf / 34);
    for (let i = 0; i < n; i++) {
      const px = x + (r() - 0.5) * 2 * W * wf, py = y - (y0 + r() * (y1 - y0)) * k, q = r();
      if (q < 0.45) bloom(ctx, px, py, '#a33a55', '#d9778f'); else if (q < 0.7) { ctx.fillStyle = '#c99a2e'; ctx.fillRect(Math.round(px), Math.round(py), 2, 1); ctx.fillStyle = '#4f6b4a'; ctx.fillRect(Math.round(px) - 1, Math.round(py) + 1, 1, 1); }
      else { ctx.fillStyle = '#41593f'; ctx.fillRect(Math.round(px), Math.round(py), 2, 1); ctx.fillRect(Math.round(px) + 1, Math.round(py) - 1, 1, 1); }
    }
  }
  function mouse(ctx, it, s) {
    const d = it.vx < -0.2 ? -1 : it.vx > 0.2 ? 1 : (it.face || 1); it.face = d;
    const x = it.x, y = it.y - 4 * s;
    ell(ctx, x, it.y, 8 * s, 2 * s, 'rgba(30,20,10,0.15)');
    BZ.drawThin(ctx, x - d * 6 * s, y + 2 * s, x - d * 13 * s, y + 3 * s + Math.sin((it.spin || 0) * 2) * 2, '#c7a7a0');
    ell(ctx, x, y, 7 * s, 4.2 * s, '#6e6a6a'); ell(ctx, x - d * s, y - s, 5.5 * s, 2.8 * s, '#8d8888');
    ell(ctx, x + d * 6 * s, y + 0.5 * s, 2.6 * s, 2.2 * s, '#8d8888');
    ell(ctx, x + d * 2.5 * s, y - 3.5 * s, 2 * s, 2 * s, '#d9a3a8');
    ctx.fillStyle = '#e46f86'; ctx.fillRect(Math.round(x + d * 8.5 * s), Math.round(y + 0.5 * s), 1, 1);
    ctx.fillStyle = '#1b1414'; ctx.fillRect(Math.round(x + d * 5.5 * s), Math.round(y - 0.5 * s), 1, 1);
  }
  function shrimp(ctx, it, s) {
    const x = it.x, yy = it.y - 4 * s, r = 4.2 * s;
    ell(ctx, x, it.y, 7 * s, 1.6 * s, 'rgba(30,20,10,0.15)');
    for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.22), rr2 = r * (1 - i * 0.07); ell(ctx, x + Math.cos(a) * r, yy - Math.sin(a) * r * 0.9, rr2 * 0.55, rr2 * 0.5, i % 2 ? '#f08a6a' : '#f6a585'); }
    ctx.fillStyle = '#fbe0d2'; ctx.fillRect(Math.round(x - r * 0.2), Math.round(yy - r * 0.9), 2, 1);
    ctx.fillStyle = '#d2553c'; ctx.fillRect(Math.round(x + r * 1.1), Math.round(yy + r * 0.2), 2, 1); ctx.fillRect(Math.round(x + r * 1.4), Math.round(yy + r * 0.5), 1, 1);
  }

  // ── pots ──
  const POTS = {
    terra:   ['#8f4a2a', '#b8643a', '#cf7a50', '#e09068'],
    white:   ['#b9bfca', '#d9dde5', '#eceff3', '#fafbfc'],
    black:   ['#151416', '#232225', '#33323a', '#4a4952'],
    teal:    ['#1f5458', '#2c6f73', '#3f8f92', '#7cc0c0'],
    mustard: ['#8f6a1c', '#b8892a', '#d4a23c', '#ecc66a'],
    stone:   ['#7a766e', '#9a958b', '#b7b2a6', '#d2cdc2'],
  };
  function pot(ctx, x, y, s, style, w, h) {
    w *= s; h *= s;
    if (style === 'basket') { // woven seagrass
      BZ.fillPoly(ctx, [[x - w, y - h], [x + w, y - h], [x + w * 0.86, y], [x - w * 0.86, y]], '#b08a55');
      for (let r = 0; r < h; r += 2) { const ww = w - (r / h) * w * 0.14; ctx.fillStyle = (r / 2) % 2 ? '#c9a46b' : '#9a7444'; for (let c = -ww; c < ww; c += 3) ctx.fillRect(Math.round(x + c + ((r / 2) % 2) * 1.5), Math.round(y - h + r), 2, 1); }
      ell(ctx, x, y - h, w, 2.2 * s, '#d8b77f'); ell(ctx, x, y - h, w - 1.5 * s, 1.5 * s, '#4a3524');
      return y - h;
    }
    if (style === 'bowl') {
      ell(ctx, x, y - 1, w * 1.02, 2.6 * s, 'rgba(30,20,10,0.18)');
      BZ.fillPoly(ctx, [[x - w, y - h], [x + w, y - h], [x + w * 0.7, y], [x - w * 0.7, y]], '#9a958b'); ell(ctx, x, y - h, w, 2.4 * s, '#c7c2b6'); ell(ctx, x, y - h, w - 1.5 * s, 1.7 * s, '#5a4330');
      ctx.fillStyle = '#b7b2a6'; ctx.fillRect(Math.round(x - w * 0.9), Math.round(y - h + 1), Math.round(w * 0.5), 1);
      return y - h;
    }
    const P = POTS[style] || POTS.terra;
    ell(ctx, x + 1, y, w * 1.05, 2.4 * s, 'rgba(30,20,10,0.2)');
    BZ.fillPoly(ctx, [[x - w, y - h], [x + w, y - h], [x + w * 0.8, y], [x - w * 0.8, y]], P[1]);
    BZ.fillPoly(ctx, [[x - w, y - h], [x - w * 0.45, y - h], [x - w * 0.36, y], [x - w * 0.8, y]], P[2]); // lit side
    ctx.fillStyle = P[3]; ctx.fillRect(Math.round(x - w * 0.82), Math.round(y - h + 2), 1, Math.max(1, Math.round(h - 4)));
    BZ.fillPoly(ctx, [[x + w * 0.55, y - h], [x + w, y - h], [x + w * 0.8, y], [x + w * 0.46, y]], P[0]); // shade side
    ctx.fillStyle = P[0]; ctx.fillRect(Math.round(x - w * 0.8), Math.round(y - 1), Math.round(w * 1.6), 1);
    if (style === 'black') { const r = BZ.rng(3); ctx.fillStyle = '#d8d6d0'; for (let i = 0; i < w * h * 0.12; i++) ctx.fillRect(Math.round(x - w * 0.85 + r() * w * 1.7), Math.round(y - h + 1 + r() * (h - 2)), 1, 1); }
    if (style === 'teal') { ctx.fillStyle = '#5aa7a8'; for (let i = 0; i < 4; i++) ctx.fillRect(Math.round(x - w * 0.6 + i * w * 0.4), Math.round(y - h + 2), 1, Math.round(2 + (i % 2) * 2)); }
    ell(ctx, x, y - h, w + 1 * s, 2.6 * s, P[2]); ell(ctx, x, y - h, w - 0.5 * s, 1.8 * s, '#4a3524'); // rim + soil
    ctx.fillStyle = '#6a4c32'; ctx.fillRect(Math.round(x - w * 0.5), Math.round(y - h), 2, 1);
    return y - h;
  }
  // ── foliage, one painter per kind; `sw` = sway (wind + batting), `rn` = per-item rng ──
  function fronds(ctx, x, y, s, n, L0, spread, sw, cols, leaflet, droop, rn) {
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (i / (n - 1) - 0.5) * spread + (rn() - 0.5) * 0.15, L = (L0 * (0.7 + rn() * 0.4)) * s;
      let px = x + (rn() - 0.5) * 3 * s, py = y, ang = a0;
      const seg = 7;
      for (let k = 0; k < seg; k++) {
        ang += (Math.cos(a0) > 0 ? 1 : -1) * droop * (0.6 + k * 0.12) + sw * 0.06 * (k / seg);
        const nx = px + Math.cos(ang) * L / seg, ny = py + Math.sin(ang) * L / seg;
        BZ.drawThin(ctx, px, py, nx, ny, cols[0]);
        if (k > 0) for (const sd of [-1, 1]) { const la = ang + sd * 1.15 + 0.35, ll = leaflet * s * (1 - Math.abs(k - seg * 0.45) / seg); BZ.drawThin(ctx, nx, ny, nx + Math.cos(la) * ll, ny + Math.sin(la) * ll, cols[1 + ((k + sd + i) & 1)]); }
        px = nx; py = ny;
      }
    }
  }
  const PAINT = {
    palm(ctx, x, y, s, t, sw, rn) {
      for (let i = 0; i < 8; i++) { // parlor palm: arching fronds of long paired leaflets
        const a0 = -Math.PI / 2 + (i / 7 - 0.5) * 2.5 + (rn() - 0.5) * 0.15, L = (24 + rn() * 12) * s, dir = Math.cos(a0) > 0 ? 1 : -1;
        let px = x, py = y, ang = a0;
        for (let k = 0; k < 8; k++) {
          ang += dir * (0.07 + k * 0.025) + sw * 0.008 * k; const nx = px + Math.cos(ang) * L / 8, ny = py + Math.sin(ang) * L / 8;
          BZ.drawThin(ctx, px, py, nx, ny, '#4a6a2a');
          if (k > 0) for (const sd of [-1, 1]) { const la = ang + sd * 0.95 + dir * 0.25 + 0.35, ll = (7 - Math.abs(k - 3) * 0.7) * s; BZ.leaf(ctx, nx, ny, ll, 1.1 * s, la, (k + i) % 2 ? '#4f8f3a' : '#5fa045', null, false); }
          px = nx; py = ny;
        }
      }
    },
    fern(ctx, x, y, s, t, sw, rn) { fronds(ctx, x, y, s, 13, 22, 3.3, sw, ['#4d7f2c', '#7ab648', '#62a03a'], 3.2, 0.28, rn); },
    snake(ctx, x, y, s, t, sw, rn) {
      for (let i = 0; i < 6; i++) {
        const bx = x + (i - 2.5) * 2.6 * s, H = (30 + rn() * 14) * s, lean = (i - 2.5) * 0.06 + sw * 0.01, w = 2.6 * s;
        const tip = [bx + Math.sin(lean) * H, y - H];
        BZ.fillPoly(ctx, [[bx - w, y], [bx + w, y], [tip[0] + 0.5, tip[1]], [tip[0] - 0.5, tip[1]]], i % 2 ? '#3f6b3a' : '#4a7a42');
        for (let k = 3; k < H; k += 3) { const u = k / H, cx = bx + Math.sin(lean) * k, ww = w * (1 - u); ctx.fillStyle = '#2b4d2a'; ctx.fillRect(Math.round(cx - ww * 0.8), Math.round(y - k), Math.max(1, Math.round(ww * 1.2)), 1); }
        BZ.drawThin(ctx, bx - w, y, tip[0] - 0.5, tip[1], '#d9c85a'); // yellow margin
      }
    },
    monstera(ctx, x, y, s, t, sw, rn) {
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.62 + (rn() - 0.5) * 0.2 + sw * 0.03, L = (16 + rn() * 10) * s;
        const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L * 0.9;
        BZ.drawThin(ctx, x, y, ex, ey, '#5f8a3a');
        const la = a + (Math.cos(a) > 0 ? 0.7 : -0.7), ll = (15 + rn() * 5) * s, lw = ll * 0.48;
        BZ.leaf(ctx, ex, ey, ll, lw, la, i % 2 ? '#2f6a2f' : '#367a35', '#7fb05e', true);
        for (let k = 0; k < 4; k++) { const u = 0.3 + k * 0.16; for (const sd of [-1, 1]) { const bx = ex + Math.cos(la) * ll * u, by = ey + Math.sin(la) * ll * u, pa = la + sd * 1.45; BZ.drawThin(ctx, bx + Math.cos(pa) * lw * 0.35, by + Math.sin(pa) * lw * 0.35, bx + Math.cos(pa) * lw * 0.95, by + Math.sin(pa) * lw * 0.95, '#173a1c'); } } // the splits
        ctx.fillStyle = '#5fa04e'; ctx.fillRect(Math.round(ex + Math.cos(la) * ll * 0.3), Math.round(ey + Math.sin(la) * ll * 0.3 - 1), 1, 1);
      }
    },
    fiddle(ctx, x, y, s, t, sw, rn) {
      const H = 58 * s; BZ.drawLine(ctx, x, y, 2 * s, x + sw * 0.4, y - H, 1.2 * s, '#6b4a2a', null, 0);
      for (let i = 0; i < 9; i++) {
        const u = 0.28 + i * 0.085, bx = x + sw * 0.4 * u, by = y - H * u - 2 * s, sd = i % 2 ? 1 : -1, a = -Math.PI / 2 + sd * (0.9 - u * 0.5);
        BZ.leaf(ctx, bx, by, (12 + rn() * 3) * s, 5.6 * s, a, i % 3 ? '#2f5d2d' : '#3a6f36', '#8db36a', false);
        ctx.fillStyle = '#5f9a55'; ctx.fillRect(Math.round(bx + Math.cos(a) * 5 * s), Math.round(by + Math.sin(a) * 5 * s - 1), 1, 1);
      }
      BZ.leaf(ctx, x + sw * 0.4, y - H, 11 * s, 5 * s, -Math.PI / 2, '#3a6f36', '#8db36a', false);
    },
    olive(ctx, x, y, s, t, sw, rn) {
      const H = 44 * s; BZ.drawLine(ctx, x, y, 2.2 * s, x - 2 * s, y - H * 0.6, 1.6 * s, '#6e5a46', null, 0); BZ.drawLine(ctx, x - 2 * s, y - H * 0.6, 1.6 * s, x + 1 * s + sw * 0.3, y - H, 1 * s, '#6e5a46', null, 0);
      BZ.drawThin(ctx, x - 1.5 * s, y - H * 0.55, x + 9 * s, y - H * 0.85, '#6e5a46');
      for (let i = 0; i < 70; i++) {
        const cx = x + (rn() - 0.5) * 30 * s + sw * 0.5 * rn(), cy = y - H * 0.62 - rn() * H * 0.62, a = rn() * Math.PI * 2;
        BZ.leaf(ctx, cx, cy, 4 * s, 1 * s, a, ['#8fa37f', '#a7b896', '#6f8562'][i % 3], null, false);
      }
      ctx.fillStyle = '#2a2430'; for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + (rn() - 0.5) * 22 * s), Math.round(y - H * 0.7 - rn() * H * 0.4), 1, 1);
    },
    zz(ctx, x, y, s, t, sw, rn) {
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.34 + sw * 0.02, L = (24 + rn() * 10) * s;
        let px = x, py = y;
        for (let k = 0; k < 9; k++) {
          const ang = a + (Math.cos(a) > 0 ? 1 : -1) * k * 0.035, nx = px + Math.cos(ang) * L / 9, ny = py + Math.sin(ang) * L / 9;
          BZ.drawThin(ctx, px, py, nx, ny, '#3d5f2a');
          if (k > 1) for (const sd of [-1, 1]) { const la = ang + sd * 0.9; ell(ctx, nx + Math.cos(la) * 2.6 * s, ny + Math.sin(la) * 2.6 * s, 2.2 * s, 1.3 * s, k % 2 ? '#2e5f2a' : '#346a2e'); ctx.fillStyle = '#86b86e'; ctx.fillRect(Math.round(nx + Math.cos(la) * 2 * s), Math.round(ny + Math.sin(la) * 2 * s - 1), 1, 1); }
          px = nx; py = ny;
        }
      }
    },
    calathea(ctx, x, y, s, t, sw, rn) {
      const night = BZ.isNight();
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i - 3.5) * (night ? 0.16 : 0.3) + sw * 0.03, L = (10 + rn() * 7) * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
        BZ.drawThin(ctx, x, y, ex, ey, '#5a7a3a');
        const la = a + (Math.cos(a) > 0 ? 1 : -1) * (night ? 0.05 : 0.35), ll = 12 * s, lw = 4.4 * s * (night ? 0.55 : 1);
        BZ.leaf(ctx, ex, ey, ll, lw, la, night ? '#6e3352' : '#2f5a2c', night ? '#9a5a7a' : '#c8deb0', false); // at night the leaves fold up and show their purple undersides
        if (!night) for (let k = 1; k < 5; k++) { const u = k / 5; for (const sd of [-1, 1]) { const bx = ex + Math.cos(la) * ll * u, by = ey + Math.sin(la) * ll * u, pa = la + sd * 1.3; ctx.fillStyle = k % 2 ? '#a8c98a' : '#1f3f1f'; ctx.fillRect(Math.round(bx + Math.cos(pa) * lw * 0.5), Math.round(by + Math.sin(pa) * lw * 0.5), 1, 1); } }
      }
    },
    pilea(ctx, x, y, s, t, sw, rn) {
      BZ.drawThin(ctx, x, y, x + sw * 0.1, y - 9 * s, '#6a8a3a');
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI / 2 + (i - 5) * 0.32 + sw * 0.04, L = (8 + rn() * 7) * s, bx = x, by = y - 7 * s, ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L * 0.8;
        BZ.drawThin(ctx, bx, by, ex, ey, '#7a9a4a'); ell(ctx, ex, ey, 3.6 * s, 3 * s, i % 2 ? '#4f8f3a' : '#5a9a44'); ctx.fillStyle = '#a6cc72'; ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1); ctx.fillStyle = '#3a7030'; ctx.fillRect(Math.round(ex + 1.5 * s), Math.round(ey + 1 * s), 1, 1);
      }
    },
    orchid(ctx, x, y, s, t, sw, rn) {
      for (const [a, l] of [[-0.25, 9], [Math.PI + 0.25, 9], [-0.6, 7]]) BZ.leaf(ctx, x, y, l * s, 3.4 * s, a, '#3a6a32', '#6f9a55', false);
      BZ.drawThin(ctx, x + 1, y, x + 1, y - 26 * s, '#8a7a5a'); // the stake
      let px = x + 1, py = y - 4 * s; const pts = [];
      for (let k = 0; k < 10; k++) { const ang = -Math.PI / 2 + k * 0.13 + sw * 0.01, nx = px + Math.cos(ang) * 3.4 * s, ny = py + Math.sin(ang) * 3.4 * s; BZ.drawThin(ctx, px, py, nx, ny, '#5a6a3a'); px = nx; py = ny; pts.push([nx, ny]); }
      for (let k = 5; k < 10; k++) { const [fx, fy] = pts[k]; const c = k % 2 ? '#f6eef4' : '#f2d6e6'; ell(ctx, fx, fy + 2 * s, 2.8 * s, 2.2 * s, c); ell(ctx, fx, fy + 2 * s, 1.2 * s, 1.2 * s, '#c0397a'); ctx.fillStyle = '#f2d24a'; ctx.fillRect(Math.round(fx), Math.round(fy + 2 * s), 1, 1); }
    },
    cactus(ctx, x, y, s, t, sw, rn) {
      const H = 30 * s, w = 4.5 * s;
      BZ.fillPoly(ctx, [[x - w, y], [x + w, y], [x + w, y - H + w], [x, y - H], [x - w, y - H + w]], '#4f7f3d');
      ctx.fillStyle = '#3d6a30'; for (const dx of [-2, 1.5]) ctx.fillRect(Math.round(x + dx * s), Math.round(y - H + w), 1, Math.round(H - w));
      ctx.fillStyle = '#6f9f52'; ctx.fillRect(Math.round(x - w + 1), Math.round(y - H + w), 1, Math.round(H - w - 1));
      for (const [sd, hy, ah] of [[-1, 0.45, 9], [1, 0.62, 7]]) { const ax = x + sd * w, ay = y - H * hy; BZ.fillPoly(ctx, [[ax, ay], [ax + sd * 5 * s, ay], [ax + sd * 5 * s, ay - ah * s], [ax + sd * 2 * s, ay - ah * s]], '#4a7a3a'); ctx.fillStyle = '#6f9f52'; ctx.fillRect(Math.round(ax + sd * 3 * s), Math.round(ay - ah * s), 1, Math.round(ah * s - 1)); }
      ctx.fillStyle = '#f2efe0'; const r = BZ.rng(12); for (let i = 0; i < 26; i++) ctx.fillRect(Math.round(x + (r() - 0.5) * 2 * w * 1.1), Math.round(y - r() * H), 1, 1); // spines
      ell(ctx, x, y - H - 1, 2.6 * s, 2 * s, '#e37aa0'); ctx.fillStyle = '#f6d24a'; ctx.fillRect(Math.round(x), Math.round(y - H - 1), 1, 1);
    },
    succulent(ctx, x, y, s, t, sw, rn) {
      const cols = [['#8fb3a0', '#b7d1c2', '#5f8a76'], ['#c99aa8', '#e4bfc8', '#9a6a78'], ['#7fa35a', '#a8c97e', '#5a7a3a']];
      for (const [dx, dy, r, ci] of [[-7, 0, 4.5, 0], [6, -1, 4, 1], [0, -2, 5, 2], [-2, 2, 3, 1], [9, 2, 3, 0]]) {
        const cx = x + dx * s, cy = y + dy * s - 1, c = cols[ci];
        for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; BZ.leaf(ctx, cx, cy, r * s, 1.6 * s, a, c[k % 2 ? 0 : 2], null, false); }
        ell(ctx, cx, cy, r * 0.45 * s, r * 0.35 * s, c[1]);
      }
    },
    lavender(ctx, x, y, s, t, sw, rn) {
      for (let i = 0; i < 6; i++) BZ.leaf(ctx, x + (i - 2.5) * 2 * s, y, 7 * s, 1 * s, -Math.PI / 2 + (i - 2.5) * 0.4, '#8f9f86', null, false);
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + (i - 5.5) * 0.09 + sw * 0.02 + Math.sin(t * 0.04 + i) * 0.02, L = (20 + rn() * 9) * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
        BZ.drawThin(ctx, x, y, ex, ey, '#7f8f6a');
        for (let k = 0; k < 6; k++) { const u = 0.72 + k * 0.05; ctx.fillStyle = k % 2 ? '#8a6bbf' : '#a989d8'; ctx.fillRect(Math.round(x + Math.cos(a) * L * u), Math.round(y + Math.sin(a) * L * u), 2, 1); }
      }
    },
    silvervine(ctx, x, y, s, t, sw, rn) {
      BZ.drawThin(ctx, x - 4 * s, y, x - 4 * s, y - 26 * s, '#9a7a4a'); BZ.drawThin(ctx, x + 4 * s, y, x + 4 * s, y - 24 * s, '#9a7a4a');
      let px = x, py = y;
      for (let k = 0; k < 16; k++) { const nx = x + Math.sin(k * 0.9 + sw * 0.1) * 5 * s, ny = y - k * 1.7 * s; BZ.drawThin(ctx, px, py, nx, ny, '#6a5a3a'); if (k % 2) { const la = (k % 4 === 1 ? 0.2 : Math.PI - 0.2); BZ.leaf(ctx, nx, ny, 6 * s, 3 * s, la, '#5a8a3a', null, true); ctx.fillStyle = '#eef2e6'; ctx.fillRect(Math.round(nx + Math.cos(la) * 5 * s), Math.round(ny + Math.sin(la) * 5 * s), 1, 1); } px = nx; py = ny; }
    },
  };
  // ── Monstera deliciosa 'Albo': drawn on its own canvas so the fenestrations can be cut clean through ──
  function albo(ctx, it, s, t) {
    const sw = Math.round((Math.sin(t * 0.045 + it.x * 0.01) * 0.6 + Math.sin(t * 0.7) * (it.rustle || 0) * 4 + (it.swing || 0) * Math.sin(t * 0.5) * 0.8) * 2) / 2;
    const k = s * 0.95, W = 150 * k, H = 150 * k, ox = 75 * k, oy = 146 * k;
    const c = cached('albo' + s + ':' + sw, W, H, ox, oy, (g, X, Y) => paintAlbo(g, X, Y, k, sw));
    ctx.drawImage(c, Math.round(it.x - ox), Math.round(it.y - oy));
  }
  function paintAlbo(g, X, Y, k, sw) {
    const r = BZ.rng(2024), G = ['#1b4322', '#245a2b', '#2f6c33', '#3f7f40', '#57965a'], C = ['#c2c6ae', '#d9dcc6', '#ebecdc', '#f6f6ec', '#fdfdf7'], MINT = '#a7c9a0';
    // caddy + pot: dark gray with a black band
    BZ.fillPoly(g, [[X - 13 * k, Y], [X + 11 * k, Y], [X + 15 * k, Y - 3 * k], [X - 9 * k, Y - 3 * k]], '#d9bb8c'); g.fillStyle = '#b8955e'; g.fillRect(Math.round(X - 13 * k), Math.round(Y - 1), Math.round(24 * k), 1);
    shadePoly(g, [[X - 9 * k, Y - 18 * k], [X + 9 * k, Y - 18 * k], [X + 7.5 * k, Y - 2 * k], [X - 7.5 * k, Y - 2 * k]], (x, y) => ramp(['#1e1e21', '#2a2a2e', '#38383d', '#47474d'], 2.2 - (x - X) / (9 * k) * 1.4, x, y));
    g.fillStyle = '#121214'; g.fillRect(Math.round(X - 8.5 * k), Math.round(Y - 8 * k), Math.round(17 * k), Math.round(2 * k));
    BZ.ellipse(g, X, Y - 18 * k, 9.5 * k, 2.4 * k, '#4a4a50'); BZ.ellipse(g, X, Y - 18 * k, 8 * k, 1.6 * k, '#3a2a1e');
    // moss pole
    const pt = Y - 92 * k; shadePoly(g, [[X - 2.6 * k, Y - 18 * k], [X + 2.6 * k, Y - 18 * k], [X + 2.2 * k + sw * 0.3, pt], [X - 2.2 * k + sw * 0.3, pt]], (x, y) => ['#5a4a32', '#6e5a3e', '#4a5a32', '#7a6a48'][(x * 7 + y * 13 + (x * y)) & 3]);
    // leaves, back to front: [height on pole 0..1, side, length, droop, variegation]
    const L = [[0.97, 1, 30, -0.25, 'half'], [0.9, -1, 33, -0.1, 'white'], [0.76, 1, 36, 0.2, 'marble'], [0.66, -1, 37, 0.3, 'half'], [0.54, 1, 34, 0.5, 'white'], [0.44, -1, 35, 0.55, 'marble'], [0.32, 1, 30, 0.75, 'green'], [0.22, -1, 28, 0.85, 'marble'], [0.12, 1, 22, 1.0, 'half']];
    for (const [hgt, side, len0, droop, kind] of L) {
      const nx = X + sw * 0.3 * hgt, ny = Y - 18 * k - (pt - (Y - 18 * k)) * -hgt, len = len0 * k, wid = len * 0.86;
      const pa = -Math.PI / 2 + side * (0.95 + droop * 0.45), pl = (3 + len0 * 0.12) * k, bx = nx + Math.cos(pa) * pl, by = ny + Math.sin(pa) * pl;
      BZ.drawLine(g, nx, ny, 1.1 * k, bx, by, 0.9 * k, kind === 'white' || kind === 'half' ? '#cfd8b4' : '#4f7f3a', null, 0); // petiole
      const ang = pa + side * (0.4 + droop * 0.5) + sw * 0.02, ca = Math.cos(ang), sa = Math.sin(ang), seed = r() * 10, flip = r() < 0.5 ? 1 : -1;
      const pts = BZ.leafPts(bx, by, len, wid * 0.5, ang, true);
      shadePoly(g, pts, (x, y) => {
        const dx = x - bx, dy = y - by, u = (dx * ca + dy * sa) / len, vv = (-dx * sa + dy * ca) / (wid * 0.5), v = vv * flip;
        const n = Math.sin(u * 4.5 + v * 1.6 + seed) + Math.sin(u * 8.5 - v * 3.2 + seed * 2) * 0.5 + Math.sin(u * 2.2 + v * 6 + seed * 3) * 0.35 + Math.sin(u * 19 + v * 2) * 0.12; // broad sectors, streaky marbling
        const lit = 1.8 - vv * 0.45 - u * 0.5; let col;
        if (kind === 'white') col = n > 1.05 ? ramp(G, lit + 0.5, x, y) : n > 0.75 ? MINT : ramp(C, lit + 1.4, x, y);
        else if (kind === 'half') col = v > 0.04 ? (n > 1.3 ? MINT : ramp(C, lit + 1.3, x, y)) : (n > 0.8 ? ramp(C, lit + 1, x, y) : n > 0.4 ? MINT : ramp(G, lit, x, y));
        else if (kind === 'marble') col = n > 0.85 ? ramp(C, lit + 1.1, x, y) : n > 0.35 ? MINT : ramp(G, lit, x, y);
        else col = n > 1.25 ? ramp(C, lit + 1, x, y) : n > 0.85 ? MINT : ramp(G, lit, x, y);
        return col;
      });
      BZ.drawThin(g, bx, by, bx + ca * len * 0.9, by + sa * len * 0.9, kind === 'green' ? '#7faa6a' : '#eef2df'); // midrib
      // fenestrations: splits from the margin and holes along the midrib, cut clean through
      g.save(); g.globalCompositeOperation = 'destination-out';
      for (let i = 1; i <= 5; i++) for (const sd of [-1, 1]) {
        const u = 0.12 + i * 0.145, cx = bx + ca * len * u, cy = by + sa * len * u, half = wid * 0.5 * Math.pow(Math.sin(Math.PI * u), 0.75);
        const px = -sa * sd, py = ca * sd, back = -len * 0.05, depth = 0.3 + ((i + (sd > 0 ? 1 : 0)) % 2) * 0.14;
        BZ.fillPoly(g, [[cx + px * half * 1.1 - ca * 0.8 * k, cy + py * half * 1.1 - sa * 0.8 * k], [cx + px * half * depth + ca * back, cy + py * half * depth + sa * back], [cx + px * half * 1.1 + ca * 1.7 * k, cy + py * half * 1.1 + sa * 1.7 * k]], '#000');
        if (len0 > 24 && i < 5 && i > 1) BZ.ellipse(g, cx + px * half * 0.17 + ca * 2.5 * k, cy + py * half * 0.17 + sa * 2.5 * k, 1.4 * k, 0.8 * k, '#000');
      }
      g.restore();
    }
  }
  function plant(ctx, it, s, t) {
    if (it.type === 'albo') { albo(ctx, it, s, t); return; }
    const d = BZ.PLANTS[it.type], x = it.x, y = it.y, rn = BZ.rng(d.label.length * 131 + 7);
    const pw = Math.max(6, Math.min(13, d.r * 0.62)), ph = d.pot === 'bowl' ? 5 : Math.max(8, Math.min(14, d.r * 0.68));
    const sw = Math.sin(t * 0.045 + x * 0.01) * 0.6 + Math.sin(t * 0.7) * (it.rustle || 0) * 4 + (it.swing || 0) * Math.sin(t * 0.5) * 0.8;
    const top = pot(ctx, x, y, s, d.pot, pw, ph);
    PAINT[d.kind](ctx, x, top + 1, s, t, sw, rn);
  }

  // ── comfort: pillow, blanket, cardboard box ──
  function pillow(ctx, it, s) {
    const k = s * 0.95, x = it.x, y = it.y, rx = 18 * k, ry = 6.2 * k, th = 4.5 * k, P = ['#8f6a28', '#b0842f', '#c99a45', '#dcb460', '#ebcd86'];
    ell(ctx, x + 1, y + 1, rx * 1.05, ry * 1.05, 'rgba(30,20,10,0.2)');
    for (let i = 0; i < th; i++) ell(ctx, x, y - i, rx, ry, i < 1 ? P[0] : P[1]);
    ell(ctx, x, y - th, rx, ry, P[2]); ell(ctx, x - 3 * k, y - th - 1 * k, rx * 0.72, ry * 0.6, P[3]); ell(ctx, x - 6 * k, y - th - 2 * k, rx * 0.3, ry * 0.25, P[4]);
    BZ.ellRing(ctx, x, y - th + 0.5, rx, ry, P[0]); // piping
    if (it.occupant) ell(ctx, x, y - th + 1, rx * 0.62, ry * 0.5, P[1]); // the dent where she lies
    ell(ctx, x, y - th, 1.4 * k, 1 * k, P[0]); ctx.fillStyle = P[0]; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * 4 * k), Math.round(y - th + Math.sin(a) * 1.6 * k), 1, 1); } // tuft
  }
  function blanketPts(it, k) { k *= 1.3; const x = it.x, y = it.y; return [[x - 30 * k, y - 3 * k], [x - 22 * k, y - 9 * k], [x - 4 * k, y - 10 * k], [x + 14 * k, y - 8 * k], [x + 31 * k, y - 5 * k], [x + 28 * k, y + 4 * k], [x + 10 * k, y + 7 * k], [x - 12 * k, y + 6 * k], [x - 28 * k, y + 4 * k]]; }
  function blanket(ctx, it, s, t) {
    const k = s * 0.95, x = it.x, y = it.y, pts = blanketPts(it, k), L = it.lump;
    BZ.fillPoly(ctx, pts.map(([a, b]) => [a + 1, b + 2]), 'rgba(30,20,10,0.18)');
    const pat = (xx, yy) => { // the woven plaid
      const u = Math.floor((xx - x + 40 + (yy - y) * 0.6) / (3 * k)), v = Math.floor((yy - y + 20) / (2 * k));
      let c = (((u % 6) + 6) % 6 === 0 || ((v % 5) + 5) % 5 === 0) ? '#a85a3c' : (((u % 6) + 6) % 6 === 3) ? '#c9b48e' : ((((v % 5) + 5) % 5) === 2 && (u & 1)) ? '#5f7a6a' : '#d8c3a0';
      if (((u % 6) + 6) % 6 === 0 && ((v % 5) + 5) % 5 === 0) c = '#7f3e2a';
      return c;
    };
    // somebody under there: the blanket is a height field draped over her (body, head, two ear points, a tail ridge)
    const kl = k * 1.3, br = 1 + Math.sin(t * 0.08) * 0.05, peek = L && L.peek > 0, d = L ? L.dir || 1 : 1;
    const lx = L ? L.x - d * 1.5 * kl : 0, ly = L ? L.y - 1 * kl : 0, hx = lx + d * 10 * kl, hy = ly + 0.6 * kl, lift = L ? 1 + (L.hop || 0) / (6 * kl) : 1;
    const H = !L ? null : (xx, yy) => {
      let h = 0; const bx = (xx - lx) / (12 * kl), by = (yy - ly) / (5.2 * kl), b = 1 - bx * bx - by * by; if (b > 0) h = 6.4 * kl * br * Math.sqrt(b);
      const qx = (xx - hx) / (4.6 * kl), qy = (yy - hy) / (3.4 * kl), q = 1 - qx * qx - qy * qy; if (q > 0) h = Math.max(h, (peek ? 3.4 : 8) * kl * Math.sqrt(q));
      if (!peek) for (const e of [-1, 1]) { const ex = (xx - (hx + e * 2.3 * kl)) / (1.5 * kl), ey = (yy - (hy - 0.6 * kl)) / (1.3 * kl), r = 1 - ex * ex - ey * ey; if (r > 0) h = Math.max(h, 7.2 * kl + 3.4 * kl * r); }
      const tx = (xx - (lx - d * 9 * kl)) / (6 * kl), ty = (yy - (ly + 3.8 * kl - Math.abs(xx - (lx - d * 9 * kl)) * 0.25)) / (1.1 * kl), tr = 1 - tx * tx - ty * ty; if (tr > 0) h = Math.max(h, 2.2 * kl * Math.sqrt(tr));
      return h * lift;
    };
    let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let yy = Math.ceil(y0); yy <= y1; yy++) {
      const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + (yy - ay) * (bx - ax) / (by - ay)); }
      xs.sort((a, b) => a - b);
      for (let j = 0; j + 1 < xs.length; j += 2) for (let xx = Math.ceil(xs[j]); xx <= xs[j + 1]; xx++) {
        const h = H ? H(xx, yy) : 0, fold = Math.sin((xx - x) * 0.22 + (yy - y) * 0.4) > 0.86;
        if (h < 0.05) { let c = pat(xx, yy); if (fold) c = mixc(c, '#6a5038', 0.28); ctx.fillStyle = c; ctx.fillRect(xx, yy, 1, 1); continue; }
        const sx = H(xx + 1, yy) - H(xx - 1, yy), sy = H(xx, yy + 1) - H(xx, yy - 1), hn = H(xx, yy + 1);
        let c = pat(xx, yy - h * 0.75); // the weave rides up over her
        const lit = -sx * 0.32 - sy * 0.12 + h / (9 * kl) * 0.25;
        c = lit > 0.32 ? mixc(c, '#fff6e4', 0.32) : lit > 0.12 ? mixc(c, '#fff6e4', 0.14) : lit < -0.3 ? mixc(c, '#3a2414', 0.34) : lit < -0.08 ? mixc(c, '#3a2414', 0.16) : c;
        const top = Math.round(yy - h), bot = Math.max(top + 1, Math.round(yy + 1 - hn));
        ctx.fillStyle = c; ctx.fillRect(xx, top, 1, bot - top);
        if (bot - top > 1) { ctx.fillStyle = mixc(c, '#3a2414', 0.12); ctx.fillRect(xx, top + 1, 1, bot - top - 1); } // the steep front of the mound
      }
    }
    ctx.fillStyle = '#efe2c8'; for (let i = 0; i < 9; i++) { const yy = y - 2 * k + i * 0.9 * k; ctx.fillRect(Math.round(x - 31 * k - (i % 2)), Math.round(yy), 2, 1); ctx.fillRect(Math.round(x + 31 * k), Math.round(yy - 1 * k), 2, 1); } // fringe
    if (!L) return;
    // her tail tip, out the back, twitching
    const tc = L.tail || '#3a302a', tw = Math.sin(t * 0.15) * 1.6 * kl, t0x = lx - d * 13.5 * kl, t0y = ly + 3.4 * kl;
    BZ.drawLine(ctx, t0x, t0y, 1.4 * kl, t0x - d * 4 * kl, t0y - 1 * kl + tw, 1.2 * kl, tc, null, 0); BZ.drawLine(ctx, t0x - d * 4 * kl, t0y - 1 * kl + tw, 1.2 * kl, t0x - d * 6 * kl, t0y - 4 * kl + tw, 1 * kl, tc, null, 0);
    if (peek) { // her face, out from under a hood of blanket
      const fx = hx + d * 1.6 * kl, fy = hy - 2.2 * kl * lift, fc = L.face || '#e8dcc8', ec = L.ear || '#5a4a48';
      ell(ctx, fx, fy + 0.5, 4.3 * kl + 1, 3.5 * kl + 1, mixc(fc, '#2a1a12', 0.45)); ell(ctx, fx, fy, 4.3 * kl, 3.5 * kl, fc); ell(ctx, fx + d * 1.2 * kl, fy + 1.3 * kl, 2.2 * kl, 1.6 * kl, mixc(fc, '#ffffff', 0.15)); // head, muzzle
      const hood = []; for (let i = 0; i <= 10; i++) { const u = i / 10 * 2 - 1; hood.push([fx - d * 1 * kl + u * 5.6 * kl, fy - 1.4 * kl - Math.cos(u * 1.4) * 1.6 * kl]); } // the blanket edge across her forehead, ears poking through
      for (let i = 10; i >= 0; i--) { const u = i / 10 * 2 - 1; hood.push([fx - d * 1 * kl + u * 6.2 * kl, fy - 4.2 * kl - Math.cos(u * 1.4) * 1.2 * kl]); }
      shadePoly(ctx, hood, (xx, yy) => mixc(pat(xx, yy - 6 * kl), yy > fy - 2.4 * kl ? '#3a2414' : '#fff6e4', 0.16));
      for (const e of [-1, 1]) { const ex = fx - d * 0.6 * kl + e * 2.6 * kl, by = fy - 3.2 * kl; BZ.fillPoly(ctx, [[ex - 2.2 * kl, by], [ex + 2.2 * kl, by], [ex + e * 1.2 * kl, by - 6.4 * kl]], ec); BZ.fillPoly(ctx, [[ex - 1 * kl, by - 0.4 * kl], [ex + 1 * kl, by - 0.4 * kl], [ex + e * 0.9 * kl, by - 4.6 * kl]], '#e4a0a8'); } // the big rex ears, through the blanket
      for (const e of [-1, 1]) { const ex = Math.round(fx + e * 1.7 * kl + d * 0.4 * kl), ey = Math.round(fy + 0.2 * kl); ctx.fillStyle = L.eye || '#3ccbdb'; ctx.fillRect(ex - 1, ey, 2, 1); ctx.fillStyle = '#141010'; ctx.fillRect(ex + (d > 0 ? 0 : -1), ey, 1, 1); } // eyes, looking out
      ctx.fillStyle = '#d98a94'; ctx.fillRect(Math.round(fx + d * 1.4 * kl), Math.round(fy + 1.4 * kl), 1, 1);
    }
  }
  function boxPts(it, s) {
    const k = s * 0.95, x = it.x, y = it.y, W = 18 * k, H = 17 * k, dx = 4 * k, dy = -6 * k;
    return { k, x, y, W, H, dx, dy, FTL: [x - W, y - H], FTR: [x + W, y - H], FBL: [x - W, y], FBR: [x + W, y], BTL: [x - W + dx, y - H + dy], BTR: [x + W + dx, y - H + dy], BBR: [x + W + dx, y + dy] };
  }
  const CB = ['#7a5430', '#8f6236', '#a87e4a', '#c49a62', '#d8b47e', '#e8cc9c'];
  BZ.drawBoxBack = function (ctx, it, s) {
    const b = boxPts(it, s), k = b.k;
    BZ.fillPoly(ctx, [b.BTL, [b.BTL[0] + 2 * k, b.BTL[1] - 11 * k], [b.BTR[0] + 2 * k, b.BTR[1] - 11 * k], b.BTR], CB[4]); // back flap, standing up
    BZ.drawThin(ctx, b.BTL[0], b.BTL[1], b.BTR[0], b.BTR[1], CB[1]);
    BZ.fillPoly(ctx, [b.FTL, b.BTL, [b.BTL[0] - 10 * k, b.BTL[1] - 3 * k], [b.FTL[0] - 10 * k, b.FTL[1] - 1 * k]], CB[3]); // left flap, splayed
    BZ.fillPoly(ctx, [b.FTL, b.FTR, b.BTR, b.BTL], CB[0]); // the dark inside
    BZ.fillPoly(ctx, [b.BTL, b.BTR, [b.BTR[0], b.BTR[1] + 6 * k], [b.BTL[0], b.BTL[1] + 6 * k]], CB[1]); // inner back wall
  };
  BZ.drawBoxFront = function (ctx, it, s) {
    const b = boxPts(it, s), k = b.k;
    ell(ctx, b.x + 4 * k, b.y + 1, b.W * 1.15, 3 * k, 'rgba(30,20,10,0.2)');
    BZ.fillPoly(ctx, [b.FTR, b.BTR, b.BBR, b.FBR], CB[1]); // right side, in shade
    BZ.fillPoly(ctx, [b.FTR, b.BTR, [b.BTR[0] + 9 * k, b.BTR[1] + 1 * k], [b.FTR[0] + 9 * k, b.FTR[1] + 3 * k]], CB[2]); // right flap
    BZ.fillPoly(ctx, [b.FTL, b.FTR, b.FBR, b.FBL], CB[3]); // front face
    ctx.fillStyle = CB[4]; ctx.fillRect(Math.round(b.FTL[0]), Math.round(b.FTL[1]), Math.round(b.W * 2), 1); ctx.fillRect(Math.round(b.FTL[0]), Math.round(b.FTL[1]), 1, Math.round(b.H));
    BZ.fillPoly(ctx, [b.FTL, b.FTR, [b.FTR[0] + 1 * k, b.FTR[1] + 6 * k], [b.FTL[0] - 1 * k, b.FTL[1] + 6 * k]], CB[4]); // front flap folded out
    BZ.drawThin(ctx, b.FTL[0] - 1 * k, b.FTL[1] + 6 * k, b.FTR[0] + 1 * k, b.FTR[1] + 6 * k, CB[2]);
    ctx.fillStyle = 'rgba(220,210,180,0.55)'; ctx.fillRect(Math.round(b.x - 3 * k), Math.round(b.FTL[1] + 6 * k), Math.round(6 * k), Math.round(b.H - 6 * k)); // tape
    ctx.fillStyle = '#5a4a3a'; for (const [ax, ay] of [[-12, 10], [-9, 10], [-12, 13]]) ctx.fillRect(Math.round(b.x + ax * k), Math.round(b.y - ay * k), 2, 1); ctx.fillRect(Math.round(b.x + 9 * k), Math.round(b.y - 9 * k), 4, 1); ctx.fillRect(Math.round(b.x + 9 * k), Math.round(b.y - 7 * k), 3, 1); // printed marks: arrows, "this side up"
    const n = Math.min(14, it.scratches || 0), r = BZ.rng(5); // claw marks that pile up
    for (let i = 0; i < n; i++) { const sx = b.FBL[0] + 3 * k + r() * (b.W * 2 - 6 * k), sy = b.FBL[1] - 4 * k - r() * 7 * k; ctx.fillStyle = i % 2 ? CB[1] : '#f0dcb4'; ctx.fillRect(Math.round(sx), Math.round(sy), 1, Math.round(3 * k)); ctx.fillRect(Math.round(sx + 2), Math.round(sy + 1), 1, Math.round(3 * k)); }
  };
  // ── tools in hand ──
  BZ.drawBrush = function (ctx, x, y, s, tilt) { // a wooden paddle brush, bristles down
    const k = s, a = 0.45 + (tilt || 0), c = Math.cos(a), sn = Math.sin(a);
    BZ.drawLine(ctx, x + c * 7 * k, y - sn * 7 * k, 2.2 * k, x + c * 17 * k, y - sn * 17 * k, 1.8 * k, '#8a5a32', null, 0); // handle
    ell(ctx, x, y, 7.5 * k, 3.4 * k, '#a86e3e'); ell(ctx, x - 1 * k, y - 1 * k, 6 * k, 2 * k, '#c9905a'); ctx.fillStyle = '#e2b07a'; ctx.fillRect(Math.round(x - 4 * k), Math.round(y - 2 * k), Math.round(3 * k), 1);
    ctx.fillStyle = '#2a2622'; for (let i = -6; i <= 6; i += 2) ctx.fillRect(Math.round(x + i * k), Math.round(y + 3 * k), 1, Math.max(2, Math.round(2.5 * k))); // bristles
  };
  BZ.drawWand = function (ctx, w, s) {
    const k = s; BZ.drawLine(ctx, w.hx + 10 * k, w.hy + 16 * k, 1.6 * k, w.hx, w.hy, 1.1 * k, '#c9a46b', null, 0);
    BZ.drawThin(ctx, w.hx, w.hy, w.fx, w.fy, '#efe6d4');
    const a = Math.atan2(w.vy || 0.01, w.vx || 0.01) + Math.PI;
    for (const [da, c, L] of [[-0.35, '#2c9a92', 9], [0, '#e2a63c', 11], [0.35, '#d86a8a', 8]]) { BZ.leaf(ctx, w.fx, w.fy, L * k, 2 * k, a + da + Math.PI / 2 * 0.0 + 1.2, c, null, false); }
    ell(ctx, w.fx, w.fy, 1.6 * k, 1.6 * k, '#e8c34a'); ctx.fillStyle = '#fff3c0'; ctx.fillRect(Math.round(w.fx - 1), Math.round(w.fy - 1), 1, 1); // the bell
  };
  // the desktop sunbeam brings its own window
  BZ.drawSunWindow = function (ctx, it, s, t) {
    const k = s, wx = it.x + 30 * k, wy = it.y - 82 * k, W = 22 * k, H = 26 * k, night = BZ.isNight(), h = new Date().getHours();
    const sky = night ? ['#141c3a', '#2b3d66'] : h >= 17 ? ['#6a5d97', '#f0a46e'] : h < 8 ? ['#b0b3d6', '#f8dcbc'] : ['#6fa8d6', '#d6e9f3'];
    // light falling from the panes onto the patch (drawn first, under the frame)
    BZ.fillPoly(ctx, [[wx - W + 2, wy + H], [wx + W - 2, wy + H], [it.x + 40 * k + 6 * k, it.y - 12 * k], [it.x - 40 * k - 6 * k, it.y - 12 * k]], `rgba(255,236,190,${night ? 0.03 : 0.07})`);
    ctx.fillStyle = '#2a2622'; ctx.fillRect(Math.round(wx - W - 3 * k), Math.round(wy - H - 3 * k), Math.round(W * 2 + 6 * k), Math.round(H * 2 + 6 * k));
    for (let yy = 0; yy < H * 2; yy++) { ctx.fillStyle = BZ.mixHex(sky[0], sky[1], yy / (H * 2)); ctx.fillRect(Math.round(wx - W), Math.round(wy - H + yy), Math.round(W * 2), 1); }
    if (!night) { ctx.fillStyle = '#ffffff'; const cx = wx - W + ((t * 0.05) % (W * 2 + 12)) - 6; BZ.ellipse(ctx, cx, wy - H * 0.5, 5 * k, 1.8 * k, '#ffffff'); BZ.ellipse(ctx, cx + 3 * k, wy - H * 0.55, 3 * k, 1.6 * k, '#f2f6f8'); }
    else { ctx.fillStyle = '#e8eefc'; for (const [a, b] of [[0.2, 0.2], [0.7, 0.35], [0.45, 0.1], [0.85, 0.7]]) ctx.fillRect(Math.round(wx - W + a * W * 2), Math.round(wy - H + b * H * 2), 1, 1); }
    ctx.fillStyle = '#f2efe6'; ctx.fillRect(Math.round(wx - 1), Math.round(wy - H), 2, Math.round(H * 2)); ctx.fillRect(Math.round(wx - W), Math.round(wy - 1), Math.round(W * 2), 2);
    ctx.fillStyle = '#f2efe6'; ctx.fillRect(Math.round(wx - W - 3 * k), Math.round(wy - H - 3 * k), Math.round(W * 2 + 6 * k), Math.round(2 * k)); ctx.fillRect(Math.round(wx - W - 3 * k), Math.round(wy - H - 3 * k), Math.round(2 * k), Math.round(H * 2 + 6 * k));
    ctx.fillStyle = '#d8d4c8'; ctx.fillRect(Math.round(wx + W + 1 * k), Math.round(wy - H - 3 * k), Math.round(2 * k), Math.round(H * 2 + 6 * k)); ctx.fillRect(Math.round(wx - W - 5 * k), Math.round(wy + H + 2 * k), Math.round(W * 2 + 10 * k), Math.round(3 * k)); // sill
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; BZ.fillPoly(ctx, [[wx - W + 3 * k, wy + H * 0.2], [wx - W + 7 * k, wy + H * 0.2], [wx - W + 15 * k, wy - H + 1], [wx - W + 11 * k, wy - H + 1]], 'rgba(255,255,255,0.12)');
  };
  BZ.mixHex = function (a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  function mixc(a, b, t) { return BZ.mixHex(a, b, t); }

  // ── carved antique coffee table: speckled carving, inset panels, scalloped apron, cabriole legs, ball-and-claw feet ──
  function carve(ctx, pts, base, cols, seed, dens) { // fill a polygon, then stipple it with carving
    BZ.fillPoly(ctx, pts, base); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const r = BZ.rng(seed), n = Math.round((x1 - x0) * (y1 - y0) * (dens || 0.35));
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!inPoly(pts, x, y)) continue; ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  }
  function inPoly(pts, x, y) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
  function cabriole(ctx, x, top, bot, sd, k, base, hi, lo) { // knee out, ankle in, foot out: an S down the leg
    const pts = [], n = 8; for (let i = 0; i <= n; i++) { const u = i / n, bulge = Math.sin(Math.PI * Math.min(1, u * 1.6)) * 3 * k - Math.sin(Math.PI * Math.max(0, (u - 0.6) / 0.4)) * 1.4 * k; pts.push([x + sd * bulge, top + (bot - top) * u]); }
    for (let i = 0; i < n; i++) BZ.drawLine(ctx, pts[i][0], pts[i][1], (3.4 - i * 0.22) * k, pts[i + 1][0], pts[i + 1][1], (3.2 - (i + 1) * 0.22) * k, base, null, 0);
    for (let i = 0; i < n; i++) BZ.drawThin(ctx, pts[i][0] - sd * 1, pts[i][1], pts[i + 1][0] - sd * 1, pts[i + 1][1], i < 3 ? hi : base);
    const fx = pts[n][0] + sd * 1.2 * k, fy = bot; ell(ctx, fx, fy - 1.6 * k, 2.6 * k, 2 * k, base); ctx.fillStyle = lo; ctx.fillRect(Math.round(fx - 1 * k), Math.round(fy - 3 * k), 1, Math.round(3 * k)); ctx.fillRect(Math.round(fx + 1 * k), Math.round(fy - 3 * k), 1, Math.round(3 * k)); ctx.fillStyle = hi; ctx.fillRect(Math.round(fx - 2 * k), Math.round(fy - 3 * k), 1, 1);
  }
  function ctable(ctx, it, s) {
    const k = s * 0.95, x = it.x, y = it.y, W = 34 * k, T = 22 * k, dx = 6 * k, dy = -11 * k, V = ['#3e2414', '#5a3420', '#73452a', '#8c5838', '#a86e48', '#c58a60'];
    ell(ctx, x + 3 * k, y + 1, W * 1.1, 4 * k, 'rgba(30,20,10,0.22)');
    cabriole(ctx, x - W + dx + 3 * k, y - T + dy + 3 * k, y + dy + 1, -1, k * 0.8, V[1], V[2], V[0]); cabriole(ctx, x + W + dx - 3 * k, y - T + dy + 3 * k, y + dy + 1, 1, k * 0.8, V[1], V[2], V[0]); // back legs
    const top = [[x - W, y - T], [x + W, y - T], [x + W + dx, y - T + dy], [x - W + dx, y - T + dy]];
    carve(ctx, top, V[2], [V[1], V[3], V[0], V[4]], 11, 0.5); // the carved top
    const inset = (m) => [[x - W + m * 1.6, y - T - m * 0.35], [x + W - m * 1.1, y - T - m * 0.35], [x + W + dx - m * 1.6, y - T + dy + m * 0.35], [x - W + dx + m * 1.1, y - T + dy + m * 0.35]];
    BZ.drawThin(ctx, inset(3)[0][0], inset(3)[0][1], inset(3)[1][0], inset(3)[1][1], V[4]); BZ.drawThin(ctx, inset(3)[1][0], inset(3)[1][1], inset(3)[2][0], inset(3)[2][1], V[1]);
    for (const c of [-0.42, 0.28]) { const cx = x + W * c + dx * 0.5, cy = y - T + dy * 0.5; BZ.fillPoly(ctx, [[cx - 8 * k, cy + 2 * k], [cx + 7 * k, cy + 2 * k], [cx + 9 * k, cy - 2 * k], [cx - 6 * k, cy - 2 * k]], '#b98a62'); BZ.drawThin(ctx, cx - 6 * k, cy - 2 * k, cx + 9 * k, cy - 2 * k, V[2]); ctx.fillStyle = '#cfa27a'; ctx.fillRect(Math.round(cx - 5 * k), Math.round(cy), Math.round(8 * k), 1); } // smooth inset panels
    carve(ctx, [[x - W, y - T], [x + W, y - T], [x + W, y - T + 3 * k], [x - W, y - T + 3 * k]], V[3], [V[1], V[4], V[2]], 12, 0.6); // front edge
    ctx.fillStyle = V[5]; ctx.fillRect(Math.round(x - W), Math.round(y - T), Math.round(W * 2), 1);
    const ap = []; for (let i = 0; i <= 24; i++) { const u = i / 24, xx = x - W + 3 * k + u * (W * 2 - 6 * k), sc = Math.abs(Math.sin(u * Math.PI * 4)) * 2.6 * k + 2.4 * k; ap.push([xx, y - T + 3 * k + sc]); }
    carve(ctx, [[x - W + 3 * k, y - T + 3 * k], [x + W - 3 * k, y - T + 3 * k], ...ap.reverse()], V[2], [V[0], V[3], V[1]], 13, 0.6); // scalloped apron
    BZ.fillPoly(ctx, [[x + W, y - T], [x + W + dx, y - T + dy], [x + W + dx, y - T + dy + 3 * k], [x + W, y - T + 3 * k]], V[1]);
    cabriole(ctx, x - W + 3 * k, y - T + 3 * k, y, -1, k, V[2], V[4], V[0]); cabriole(ctx, x + W - 3 * k, y - T + 3 * k, y, 1, k, V[2], V[4], V[0]); // front legs
  }
  // ── per-pixel shading + caching (big furniture is painted once per size, then blitted) ──
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dth = (x, y) => BAY[((y & 3) << 2) | (x & 3)] / 16;
  function shadePoly(ctx, pts, fn) { // fn(x, y) -> css color or null, called per pixel inside the polygon
    let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const sy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) xs.push(a[0] + ((sy - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) { const c = fn(x, y); if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }
    }
  }
  const ramp = (R, L, x, y) => R[Math.max(0, Math.min(R.length - 1, Math.floor(L + dth(x, y))))];
  const CACHE = {};
  function cached(key, w, h, ox, oy, paint) { let c = CACHE[key]; if (!c) { c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); paint(c.getContext('2d'), ox, oy); CACHE[key] = c; } return c; }

  // ── antique sleigh daybed: burl ends sweeping up into rolled scrolls, gray velvet, pleated bolsters, kilim pillows, a woven throw ──
  const BURL = ['#4a1c0c', '#5e2612', '#743118', '#873c1e', '#9a4824', '#ad562c', '#c06a3a'];
  function burlFace(ctx, pts, seed, lightFn) {
    const r = BZ.rng(seed), eyes = [];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let i = 0; i < (x1 - x0) * (y1 - y0) / 26; i++) eyes.push([x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1 + r() * 1.6]);
    shadePoly(ctx, pts, (x, y) => {
      let L = lightFn(x, y);
      // figure: swirling grain, and little burl eyes
      L += Math.sin(x * 0.55 + Math.sin(y * 0.33 + x * 0.12) * 2.2) * 0.55;
      for (const [ex, ey, er] of eyes) { const d = Math.hypot((x - ex) / er, (y - ey) / (er * 0.7)); if (d < 1.15) { L += d < 0.45 ? 1.2 : d < 1.15 ? -1.4 : 0; break; } }
      return ramp(BURL, L, x, y);
    });
  }
  function paintDaybed(ctx, X, Y, k) {
    const W = 48 * k, Dx = 10 * k, Dy = -10 * k, top = 46 * k, railT = 15 * k, matT = 24 * k;
    ctx.fillStyle = 'rgba(30,20,10,0.22)'; BZ.ellipse(ctx, X + 4 * k, Y + 1, W * 1.1, 5 * k, 'rgba(30,20,10,0.22)');
    const flare = (u, dir) => dir * (u < 0.12 ? (0.12 - u) / 0.12 * 3.2 * k : u > 0.4 ? 8.5 * k * Math.pow((u - 0.4) / 0.6, 2) : 0);
    const edge = (ex, dir) => { const a = []; for (let i = 0; i <= 20; i++) { const u = i / 20; a.push([ex + flare(u, dir), Y - u * top]); } return a; };
    const endPanel = (ex, dir, seed) => {
      const fe = edge(ex, dir), be = fe.map(([a, b]) => [a + Dx, b + Dy]).reverse();
      burlFace(ctx, fe.concat(be), seed, (x, y) => { const u = (Y - y) / top, across = ((x - ex - flare(u, dir)) - (y - Y) * (Dx / -Dy) * 0) / Dx; return 2.6 + (dir < 0 ? 0.8 : -0.6) + Math.sin(u * 3.1) * 0.6 + (Math.abs(across - 0.32) < 0.07 ? 1.6 : 0); }); // with a lacquer sheen band
      // the front edge, lit, two pixels thick
      for (let i = 0; i < 20; i++) BZ.drawLine(ctx, fe[i][0], fe[i][1], 1.6 * k, fe[i + 1][0], fe[i + 1][1], 1.6 * k, dir < 0 ? BURL[5] : BURL[3], null, 0);
      for (let i = 0; i < 20; i++) BZ.drawThin(ctx, fe[i][0] - dir * 0.6 * k, fe[i][1], fe[i + 1][0] - dir * 0.6 * k, fe[i + 1][1], dir < 0 ? BURL[6] : BURL[4]);
      // the rolled scroll along the top, and its spiral end
      const tx = fe[20][0] + dir * 1.5 * k, ty = fe[20][1];
      const roll = [[tx - 3.6 * k, ty - 1], [tx + 3.6 * k, ty - 1], [tx + 3.6 * k + Dx, ty - 1 + Dy], [tx - 3.6 * k + Dx, ty - 1 + Dy]];
      shadePoly(ctx, roll, (x, y) => ramp(BURL, 4 + ((y - (ty + Dy * (x - tx + 3.6 * k) / Dx)) < 0 ? 1.2 : -0.4), x, y));
      for (let rr = 4; rr >= 1; rr--) BZ.ellipse(ctx, tx, ty, rr * k, rr * k * 0.95, rr % 2 ? BURL[1] : BURL[4]);
      ctx.fillStyle = BURL[6]; ctx.fillRect(Math.round(tx - 2 * k), Math.round(ty - 3 * k), Math.round(2 * k), 1);
    };
    endPanel(X + W - 4 * k, 1, 41); // the far end first
    // mattress: velvet top (lighter toward the window side), soft front face, piping
    const mx0 = X - W + 5 * k, mx1 = X + W - 5 * k, VEL = ['#7d7f7a', '#8c8e89', '#9b9d98', '#a9aba6', '#b7b9b4', '#c4c6c1', '#d0d2cd'];
    shadePoly(ctx, [[mx0, Y - matT], [mx1, Y - matT], [mx1 + Dx, Y - matT + Dy], [mx0 + Dx, Y - matT + Dy]], (x, y) => ramp(VEL, 4.6 + (x - mx0) / (mx1 - mx0) * 0.8 - ((Y - matT) - y) / -Dy * 0.5 + (((x + y) & 3) === 0 ? 0.25 : 0), x, y));
    shadePoly(ctx, [[mx0, Y - matT], [mx1, Y - matT], [mx1, Y - railT], [mx0, Y - railT]], (x, y) => { const v = (y - (Y - matT)) / (matT - railT); return ramp(VEL, 4.4 - v * 3.2 + (v < 0.12 ? 1 : 0), x, y); });
    ctx.fillStyle = VEL[6]; ctx.fillRect(Math.round(mx0), Math.round(Y - matT), Math.round(mx1 - mx0), 1); ctx.fillStyle = VEL[1]; ctx.fillRect(Math.round(mx0), Math.round(Y - matT + 1.5 * k), Math.round(mx1 - mx0), 1); ctx.fillRect(Math.round(mx0), Math.round(Y - railT - 1), Math.round(mx1 - mx0), 1);
    // bolsters against each end: a pleated rosette on the front, the cylinder running back
    for (const [bx, d] of [[mx0 + 5 * k, -1], [mx1 - 5 * k, 1]]) {
      const by = Y - matT - 4.4 * k, r = 4.6 * k;
      shadePoly(ctx, [[bx - r * 0.2, by - r], [bx + Dx * 0.9 - r * 0.2, by - r + Dy * 0.9], [bx + Dx * 0.9 + r * 0.2, by + r + Dy * 0.9], [bx + r * 0.2, by + r]], (x, y) => ramp(VEL, 5.2 - (y - (by + Dy * 0.45)) / r * 1.4, x, y));
      for (let i = 0; i < 14; i++) { const a0 = (i / 14) * Math.PI * 2, a1 = ((i + 1) / 14) * Math.PI * 2; BZ.fillPoly(ctx, [[bx, by], [bx + Math.cos(a0) * r, by + Math.sin(a0) * r], [bx + Math.cos(a1) * r, by + Math.sin(a1) * r]], i % 2 ? VEL[5] : VEL[3]); }
      BZ.ellipse(ctx, bx, by, 1.4 * k, 1.4 * k, VEL[1]); ctx.fillStyle = VEL[6]; ctx.fillRect(Math.round(bx - 1), Math.round(by - 1), 1, 1);
    }
    // two kilim pillows, puffy, leaning against the left bolster, tassels at the corners
    const kilim = (cx, cy, w, h, lean, A, seed) => {
      const pts = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a); const sq = Math.pow(Math.abs(c), 0.35) * Math.sign(c), sq2 = Math.pow(Math.abs(sn), 0.35) * Math.sign(sn); pts.push([cx + sq * w + sq2 * h * lean, cy + sq2 * h]); }
      shadePoly(ctx, pts, (x, y) => {
        const u = (x - cx - (y - cy) * lean) / w, v = (y - cy) / h, au = Math.abs(u), av = Math.abs(v);
        let c = A[0]; if (au > 0.78 || av > 0.72) c = A[1]; else if (au > 0.66 || av > 0.58) c = A[2];
        else { const dd = Math.abs(u * 2.2) + Math.abs(v * 2.6); c = dd < 0.45 ? A[3] : dd < 0.8 ? A[2] : (Math.floor((u + 1) * 7) + Math.floor((v + 1) * 6)) % 3 === 0 ? A[1] : A[0]; }
        const L = 1 - (u + v) * 0.18; return L > 1.12 ? BZ.mixHex(c, '#ffffff', 0.14) : L < 0.88 ? BZ.mixHex(c, '#000000', 0.18) : c;
      });
      ctx.fillStyle = A[2]; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.fillRect(Math.round(cx + sx * (w + 0.6 * k) + sy * h * lean), Math.round(cy + sy * h), 1, Math.round(2 * k));
    };
    kilim(mx0 + 15 * k, Y - matT - 8 * k + Dy * 0.55, 7.5 * k, 7 * k, 0.28, ['#b5583c', '#3b2c34', '#e6d9bf', '#c9963a'], 1);
    kilim(mx0 + 27 * k, Y - matT - 7 * k + Dy * 0.5, 6.5 * k, 6.5 * k, 0.22, ['#3f6f6a', '#e6d9bf', '#c9963a', '#b5583c'], 2);
    // a woven throw, folded on the right half and spilling over the front, fringed
    const t0 = X + 8 * k, t1 = mx1 - 10 * k, ST = ['#d8c3a0', '#a85a3c', '#d8c3a0', '#5f7a6a', '#c9b48e', '#3b3434'];
    shadePoly(ctx, [[t0 + 2 * k, Y - matT + Dy * 0.7], [t1 + 3 * k, Y - matT + Dy * 0.75], [t1 + 1 * k, Y - matT + 1], [t0 - 1 * k, Y - matT + 1]], (x, y) => { const c = ST[((Math.floor((x - t0) / (2.2 * k)) % ST.length) + ST.length) % ST.length]; return ((x + y) & 1) ? c : BZ.mixHex(c, '#ffffff', 0.12); });
    shadePoly(ctx, [[t0 - 1 * k, Y - matT], [t1 + 1 * k, Y - matT], [t1 + 2 * k, Y - railT + 2 * k], [t0 - 2 * k, Y - railT + 3 * k]], (x, y) => { const c = ST[((Math.floor((x - t0) / (2.2 * k)) % ST.length) + ST.length) % ST.length], v = (y - (Y - matT)) / (matT - railT); return BZ.mixHex(c, '#000000', 0.06 + v * 0.14 + (((x + y) & 1) ? 0 : 0.05)); });
    ctx.fillStyle = '#efe2c8'; for (let xx = t0 - 2 * k; xx < t1 + 2 * k; xx += 2) ctx.fillRect(Math.round(xx), Math.round(Y - railT + 2.5 * k), 1, Math.round(2.5 * k));
    // the front rail: burl with a moulded top edge
    burlFace(ctx, [[X - W + 3 * k, Y - railT], [X + W - 3 * k, Y - railT], [X + W - 3 * k, Y - 5 * k], [X - W + 3 * k, Y - 5 * k]], 43, (x, y) => 2.8 + (Math.abs(y - (Y - railT + 2.5 * k)) < 0.8 ? 1.5 : 0) - (y > Y - 7 * k ? 1 : 0));
    ctx.fillStyle = BURL[6]; ctx.fillRect(Math.round(X - W + 3 * k), Math.round(Y - railT), Math.round(W * 2 - 6 * k), 1); ctx.fillStyle = BURL[0]; ctx.fillRect(Math.round(X - W + 3 * k), Math.round(Y - 5 * k), Math.round(W * 2 - 6 * k), 1);
    endPanel(X - W + 4 * k, -1, 42); // the near end last, in front of everything
  }
  function daybed(ctx, it, s) {
    const k = s * 0.95, w = 120 * k, h = 70 * k, ox = 56 * k, oy = 60 * k;
    const c = cached('daybed' + s, w, h, ox, oy, (g, X, Y) => paintDaybed(g, X, Y, k));
    ctx.drawImage(c, Math.round(it.x - ox), Math.round(it.y - oy));
  }

  // ── two chairs from home ──
  const bounds = (pts) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); } return [x0, y0, x1, y1]; };
  const plotIn = (ctx, pts) => (x, y, c) => { x = Math.round(x); y = Math.round(y); if (inPoly(pts, x + 0.5, y + 0.5)) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } };
  const roundRect = (x0, y0, x1, y1, r) => { const p = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  // the cream one: butter-cream chintz with coral poppies trailing on sage vines; rolled arms, a T-cushion with welting, a dressmaker skirt
  const CREAM = ['#a4936a', '#b6a57a', '#c7b68a', '#d5c699', '#e1d4a8', '#ebe0b7', '#f3eac6', '#f9f2d6'];
  function poppies(ctx, pts, seed, k, dens) {
    const [x0, y0, x1, y1] = bounds(pts), r = BZ.rng(seed), dot = plotIn(ctx, pts), area = (x1 - x0) * (y1 - y0);
    const heads = [], cw = 10.5 * k / Math.sqrt(dens), chh = 9 * k / Math.sqrt(dens); // a fabric repeat: one poppy per jittered cell, a few cells left as ground
    for (let gy = y0 - (y0 % chh); gy < y1; gy += chh) for (let gx = x0 - (x0 % cw) + (((gy / chh) | 0) & 1) * cw * 0.5; gx < x1; gx += cw) if (r() < 0.78) heads.push([gx + r() * cw * 0.7, gy + r() * chh * 0.7, (2.1 + r() * 1.4) * k, r() * 6.28]);
    void area;
    for (const [hx, hy] of heads) { // each poppy trails a thin vine with a few pointed sage leaves
      let x = hx, y = hy, a = r() * 6.28;
      for (let s = 0; s < 11 * k; s++) {
        a += Math.sin(s * 0.5 + hx) * 0.28; x += Math.cos(a); y += Math.sin(a); if (s > 2) dot(x, y, '#a7b892');
        if (s % 4 === 3) { const side = (s >> 2) & 1 ? 1 : -1, la = a + side * 0.9; for (let q = 1; q <= 4; q++) { dot(x + Math.cos(la) * q, y + Math.sin(la) * q, q === 4 ? '#a9bc92' : q === 1 ? '#5f7f4c' : '#7b9864'); if (q === 2) dot(x + Math.cos(la) * q + Math.cos(a), y + Math.sin(la) * q + Math.sin(a), '#86a26d'); } }
      }
    }
    for (const [cx, cy, R, rot] of heads) { // poppies: five ruffled petals, lit top-left, a dark eye
      for (let yy = Math.floor(cy - R - 1); yy <= cy + R + 1; yy++) for (let xx = Math.floor(cx - R - 1); xx <= cx + R + 1; xx++) {
        const dx = xx + 0.5 - cx, dy = yy + 0.5 - cy, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), Re = R * (0.82 + 0.18 * Math.cos(5 * ang + rot));
        if (d > Re) continue;
        const lit = -(dx + dy) / (R * 1.4);
        dot(xx, yy, d < R * 0.28 ? '#6e3326' : lit > 0.35 ? '#f2a585' : lit < -0.35 ? '#b34a34' : d > Re - 0.9 ? '#c85b40' : '#df7456');
      }
    }
    for (let i = 0; i < heads.length; i++) { const bx = x0 + r() * (x1 - x0), by = y0 + r() * (y1 - y0); dot(bx, by, '#e8936f'); dot(bx + 1, by, '#c9604a'); dot(bx, by + 1, '#7d9a66'); } // buds
  }
  function paintPoppyChair(ctx, X, Y, k) { // tall, like the real one: seat high, arms at two-thirds, a tall back
    const W = 26 * k, light = (x, y, base) => base + ((x - X) / W) * 0.35;
    const SK = 17 * k, BP = 21 * k, SF = 27 * k, SB = 32 * k, SCY = 39.5 * k, RB = 46.5 * k, TOP = 68 * k;
    ell(ctx, X + 2 * k, Y + 1, W * 1.08, 5 * k, 'rgba(30,20,10,0.2)');
    // the back: tall, softly rounded corners, a piped roll along the top
    const back = roundRect(X - W * 0.72, Y - TOP, X + W * 0.72, Y - SB + 2 * k, 8 * k).map(([x, y]) => [X + (x - X) * (0.94 + 0.06 * (y - (Y - TOP)) / (TOP - SB)), y]);
    shadePoly(ctx, back, (x, y) => { const u = (x - X) / (W * 0.72), v = (y - (Y - TOP)) / (TOP - SB); return ramp(CREAM, light(x, y, 5.9 - v * 1.4 - u * u * 1.6 + (v < 0.04 ? 1.1 : v < 0.08 ? -0.7 : 0) - (v > 0.85 ? (v - 0.85) * 9 : 0)), x, y); });
    poppies(ctx, back, 21, k, 0.9);
    // rolled arms: the roll receding back to the chair back, the scroll front with its piping, the arm front down to the cushion
    for (const sd of [-1, 1]) {
      const xo = X + sd * W * 1.02, xi = X + sd * W * 0.62, mx = (xo + xi) / 2, rw = Math.abs(xo - xi) / 2, scy = Y - SCY;
      const roll = [[xi + sd * 1 * k, scy], [xi + sd * 1.6 * k, Y - RB], [xo - sd * 2.2 * k, Y - RB], [xo, scy]];
      shadePoly(ctx, roll, (x, y) => { const u = (x - mx) / rw; return ramp(CREAM, light(x, y, 5.2 - u * sd * 0.9 - u * u * 1.2 - (scy - y) / (RB - SCY) * 0.7), x, y); }); poppies(ctx, roll, 30 + sd, k, 0.9);
      const armF = [[xi, scy], [xo, scy], [xo - sd * 0.6 * k, Y - SF], [xi + sd * 0.4 * k, Y - SF]];
      shadePoly(ctx, armF, (x, y) => { const u = (x - mx) / rw, v = (y - scy) / (SCY - SF); return ramp(CREAM, light(x, y, 4.6 - u * u * 0.9 - v * 1.1 + (sd > 0 ? 0.3 : 0)), x, y); }); poppies(ctx, armF, 40 + sd, k, 1.1);
      BZ.drawThin(ctx, xi, scy, xi + sd * 0.4 * k, Y - SF, CREAM[1]); BZ.drawThin(ctx, xo, scy, xo - sd * 0.6 * k, Y - SF, CREAM[2]); // piping
      BZ.drawThin(ctx, xi + sd * 1 * k, scy - 3 * k, xi + sd * 1.6 * k, Y - RB, CREAM[0]); BZ.drawThin(ctx, xi + sd * 1.6 * k, Y - RB, xo - sd * 2.2 * k, Y - RB, CREAM[6]); // the crease against the back, the lit top of the roll
      ell(ctx, mx, scy, rw + 0.5, 5 * k, CREAM[2]); ell(ctx, mx - 0.5 * k, scy - 0.6 * k, rw - 0.6 * k, 4.2 * k, CREAM[5]); ell(ctx, mx - 1.2 * k, scy - 1.4 * k, rw * 0.55, 2.3 * k, CREAM[6]); ell(ctx, mx - 1.6 * k, scy - 2 * k, rw * 0.25, 1 * k, CREAM[7]); // the scroll
      BZ.ellRing(ctx, mx, scy, rw + 0.5, 5 * k, CREAM[1]); BZ.ellRing(ctx, mx + 0.6 * k, scy + 0.5 * k, rw * 0.35, 1.7 * k, CREAM[3]); // its piping and the spiral
      poppies(ctx, [[mx - rw, scy - 4 * k], [mx + rw, scy - 4 * k], [mx + rw, scy + 4 * k], [mx - rw, scy + 4 * k]], 45 + sd, k, 0.5);
    }
    // the seat: cushion top, a T-cushion front that wraps in front of the arms, welting top and bottom
    const seatTop = [[X - W * 0.66, Y - SF], [X + W * 0.66, Y - SF], [X + W * 0.62, Y - SB], [X - W * 0.62, Y - SB]];
    shadePoly(ctx, seatTop, (x, y) => ramp(CREAM, light(x, y, 6.2 - (Y - SF - y) / (SB - SF) * 0.8), x, y)); poppies(ctx, seatTop, 51, k, 0.9);
    const front = [[X - W * 0.98, Y - SF - 0.5 * k], [X + W * 0.98, Y - SF - 0.5 * k], [X + W, Y - BP], [X - W, Y - BP]];
    shadePoly(ctx, front, (x, y) => { const v = (y - (Y - SF)) / (SF - BP); return ramp(CREAM, light(x, y, 5.6 - v * 2 + (v < 0.18 ? 0.8 : 0)), x, y); }); poppies(ctx, front, 52, k, 1);
    ctx.fillStyle = CREAM[7]; ctx.fillRect(Math.round(X - W * 0.98), Math.round(Y - SF - 0.5 * k), Math.round(W * 1.96), 1);
    ctx.fillStyle = CREAM[2]; ctx.fillRect(Math.round(X - W), Math.round(Y - BP), Math.round(W * 2), 1);
    // base panel with a welt, then the skirt to the floor with kick pleats at the corners
    shadePoly(ctx, [[X - W, Y - BP + 1], [X + W, Y - BP + 1], [X + W, Y - SK], [X - W, Y - SK]], (x, y) => ramp(CREAM, light(x, y, 3.7), x, y));
    poppies(ctx, [[X - W, Y - BP + 1], [X + W, Y - BP + 1], [X + W, Y - SK], [X - W, Y - SK]], 55, k, 0.6);
    ctx.fillStyle = CREAM[5]; ctx.fillRect(Math.round(X - W), Math.round(Y - SK), Math.round(W * 2), 1); ctx.fillStyle = CREAM[1]; ctx.fillRect(Math.round(X - W), Math.round(Y - SK) + 1, Math.round(W * 2), 1);
    const skirt = [[X - W, Y - SK + 2], [X + W, Y - SK + 2], [X + W * 1.02, Y - 0.5], [X - W * 1.02, Y - 0.5]];
    shadePoly(ctx, skirt, (x, y) => { const v = (y - (Y - SK)) / SK; return ramp(CREAM, light(x, y, 4.6 - (v < 0.14 ? 1.2 : 0) - v * 0.8), x, y); }); poppies(ctx, skirt, 61, k, 1.1);
    for (const sd of [-1, 1]) { BZ.drawThin(ctx, X + sd * W * 0.93, Y - SK + 2, X + sd * W * 0.95, Y - 1, CREAM[0]); BZ.drawThin(ctx, X + sd * W * 0.9, Y - SK + 2, X + sd * W * 0.92, Y - 1, CREAM[6]); }
    ctx.fillStyle = CREAM[0]; ctx.fillRect(Math.round(X - W * 1.02), Math.round(Y - 1), Math.round(W * 2.04), 1);
  }
  // the blue one: a carved fruitwood bergère, pale blue-gray checked damask woven with gold dragonflies, twisted blue-and-gold cord
  const FRUIT = ['#5a3518', '#744622', '#8e5a2e', '#a66e3a', '#bb844a', '#cf9b5e', '#e0b47a', '#ecca98'];
  const DAM = ['#6c7c86', '#7f8f99', '#92a1aa', '#a4b2ba', '#b5c2c9', '#c4d0d6', '#d2dde1', '#dfe7ea'];
  function damask(ctx, pts, X, Y, k, base, seed) {
    const sq = 6.5 * k, cell = (x, y) => [Math.floor((x - X + 100 * sq) / sq), Math.floor((y - Y + 100 * sq) / sq)];
    shadePoly(ctx, pts, (x, y) => { const [i, j] = cell(x, y), alt = (i + j) & 1; return ramp(DAM, base(x, y) + (alt ? 0.8 : ((y & 1) ? 0.15 : -0.65)), x, y); });
    const [x0, y0, x1, y1] = bounds(pts), dot = plotIn(ctx, pts);
    for (let j = Math.floor((y0 - Y) / sq) - 1; j <= (y1 - Y) / sq + 1; j++) for (let i = Math.floor((x0 - X) / sq) - 1; i <= (x1 - X) / sq + 1; i++) {
      if (((i + j) & 1) === 0) continue;
      const cx = X + (i + 0.5) * sq, cy = Y + (j + 0.5) * sq, g = ['#8a7642', '#b09a5c', '#d1bd80'];
      if (!inPoly(pts, cx, cy)) continue;
      // a dragonfly: head, a long body, two pairs of wings
      const ox = ((j & 1) ? 1.4 : -1.4) * k; // staggered, like the weave
      dot(cx + ox, cy - 2, g[2]); for (let b = -1; b <= 3; b++) dot(cx + ox, cy + b, g[b < 1 ? 1 : 0]);
      for (const sd of [-1, 1]) { dot(cx + ox + sd, cy - 1, g[2]); dot(cx + ox + sd * 2, cy - 1, g[2]); dot(cx + ox + sd * 3, cy - 2, g[1]); dot(cx + ox + sd, cy, g[1]); dot(cx + ox + sd * 2, cy + 1, g[1]); }
      void seed;
    }
  }
  function cord(ctx, pts, step) { // a twisted rope along a polyline: blue and gold strands crossing
    let n = 0;
    for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay); for (let s = 0; s < L; s += step || 1) { const x = ax + (bx - ax) * s / L, y = ay + (by - ay) * s / L, q = n++ % 3; ctx.fillStyle = q === 0 ? '#e2cf92' : q === 1 ? '#a8925a' : '#5d7286'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); } }
  }
  function paintDragonflyChair(ctx, X, Y, k) {
    const W = 27 * k;
    ell(ctx, X + 2 * k, Y + 1, W * 1.05, 4.6 * k, 'rgba(30,20,10,0.2)');
    cabriole(ctx, X - W * 0.72, Y - 13 * k, Y - 2 * k, -1, k * 0.8, FRUIT[2], FRUIT[4], FRUIT[0]); cabriole(ctx, X + W * 0.72, Y - 13 * k, Y - 2 * k, 1, k * 0.8, FRUIT[2], FRUIT[4], FRUIT[0]); // back legs
    // the back: a cartouche with a serpentine top rail and a little carved crest
    const outer = [], inner = [], N = 28;
    const topY = (u) => Y - 45 * k - 5 * k * (1 - u * u) - 2.2 * k * Math.exp(-((u / 0.13) ** 2));
    for (let i = 0; i <= N; i++) { const u = -1 + (2 * i) / N; outer.push([X + u * W * 0.8, topY(u)]); }
    outer.unshift([X - W * 0.8, Y - 21 * k], [X - W * 0.86, Y - 38 * k]); outer.push([X + W * 0.86, Y - 38 * k], [X + W * 0.8, Y - 21 * k]);
    const ib = 2.6 * k; for (let i = 2; i <= N - 2; i++) { const u = -1 + (2 * i) / N; inner.push([X + u * W * 0.8 * (1 - ib / (W * 0.8)), topY(u) + ib + (Math.abs(u) > 0.85 ? (Math.abs(u) - 0.85) * 12 * k : 0)]); }
    inner.unshift([X - W * 0.8 + ib, Y - 21 * k], [X - W * 0.86 + ib, Y - 37 * k]); inner.push([X + W * 0.86 - ib, Y - 37 * k], [X + W * 0.8 - ib, Y - 21 * k]);
    shadePoly(ctx, outer, (x, y) => ramp(FRUIT, 4.2 + (x - X) / W * 0.6 - (y - (Y - 50 * k)) / (30 * k) * 1.2 + Math.sin(x * 0.9 + y * 0.2) * 0.35, x, y));
    damask(ctx, inner, X, Y, k, (x, y) => { const u = (x - X) / (W * 0.8), v = (y - (Y - 48 * k)) / (27 * k); return 4.8 - u * u * 1.2 - v * 1.4 + u * 0.3; }, 1);
    cord(ctx, inner.slice(1, -1));
    for (let i = 0; i < N; i++) BZ.drawThin(ctx, outer[i + 2][0], outer[i + 2][1], outer[i + 3][0], outer[i + 3][1], FRUIT[7]); // a lit top edge
    const cx = X, cy = topY(0) + 1.5 * k; ell(ctx, cx, cy, 2.6 * k, 2 * k, FRUIT[5]); ctx.fillStyle = FRUIT[2]; ctx.fillRect(Math.round(cx), Math.round(cy - 1.5 * k), 1, Math.round(3 * k)); ctx.fillRect(Math.round(cx - 1.5 * k), Math.round(cy), Math.round(3 * k), 1); ctx.fillStyle = FRUIT[7]; ctx.fillRect(Math.round(cx - 1 * k), Math.round(cy - 1 * k), 1, 1); // carved flower
    // arms: a wooden rail curving out from the back, a padded manchette on top, an S-curved post down to the seat rail
    for (const sd of [-1, 1]) {
      const rail = []; for (let i = 0; i <= 6; i++) { const u = i / 6; rail.push([X + sd * W * (0.84 + 0.16 * Math.sin(u * Math.PI / 2)), Y - 34 * k + u * 6 * k]); }
      for (let i = 0; i < 6; i++) BZ.drawLine(ctx, rail[i][0], rail[i][1] + 1.2 * k, 2 * k, rail[i + 1][0], rail[i + 1][1] + 1.2 * k, 2 * k, FRUIT[2], null, 0); // the wooden arm under the pad
      const pad = [...rail.map(([x, y]) => [x, y - 1.8 * k]), ...rail.slice().reverse().map(([x, y]) => [x - sd * 0.4 * k, y + 1 * k])];
      damask(ctx, pad, X, Y, k, (x, y) => 5.4 - (y - (Y - 34 * k)) / (6 * k) * 0.8, 2);
      for (let i = 0; i < 6; i++) BZ.drawThin(ctx, rail[i][0], rail[i][1] - 1.8 * k, rail[i + 1][0], rail[i + 1][1] - 1.8 * k, DAM[7]);
      const post = []; for (let i = 0; i <= 8; i++) { const u = i / 8; post.push([X + sd * (W * 1.0 - Math.sin(u * Math.PI) * 1.6 * k - u * 1.2 * k), Y - 27.5 * k + u * 12.5 * k]); }
      for (let i = 0; i < 8; i++) BZ.drawLine(ctx, post[i][0], post[i][1], (2.3 - i * 0.08) * k, post[i + 1][0], post[i + 1][1], (2.2 - i * 0.08) * k, FRUIT[3], null, 0);
      for (let i = 0; i < 8; i++) BZ.drawThin(ctx, post[i][0] - sd * 1, post[i][1], post[i + 1][0] - sd * 1, post[i + 1][1], i < 4 ? FRUIT[6] : FRUIT[5]);
      ell(ctx, X + sd * W * 1.0, Y - 28 * k, 2.2 * k, 2 * k, FRUIT[4]); ctx.fillStyle = FRUIT[7]; ctx.fillRect(Math.round(X + sd * W - 1), Math.round(Y - 29 * k), 1, 1); // the knuckle
    }
    // the seat: a plump damask cushion, cord along its front edge
    const seatTop = [[X - W * 0.86, Y - 20 * k], [X + W * 0.86, Y - 20 * k], [X + W * 0.78, Y - 25 * k], [X - W * 0.78, Y - 25 * k]];
    damask(ctx, seatTop, X, Y, k, (x, y) => 5.6 - (Y - 20 * k - y) / (5 * k) * 0.8 + (x - X) / W * 0.3, 3);
    const front = [[X - W * 0.9, Y - 20.5 * k], [X + W * 0.9, Y - 20.5 * k], [X + W * 0.9, Y - 15.5 * k], [X - W * 0.9, Y - 15.5 * k]];
    damask(ctx, front, X, Y, k, (x, y) => 4.6 - (y - (Y - 20.5 * k)) / (5 * k) * 1.4, 4);
    cord(ctx, [[X - W * 0.9, Y - 20.5 * k], [X + W * 0.9, Y - 20.5 * k]]);
    // the seat rail: carved, with a scalloped centre and a little shell
    const ap = []; for (let i = 0; i <= 20; i++) { const u = i / 20, xx = X - W * 0.94 + u * W * 1.88; ap.push([xx, Y - 11.5 * k + Math.exp(-(((u - 0.5) / 0.12) ** 2)) * 3 * k - Math.abs(Math.sin(u * Math.PI * 3)) * 0.8 * k]); }
    const apron = [[X - W * 0.94, Y - 15.5 * k], [X + W * 0.94, Y - 15.5 * k], ...ap.reverse()];
    shadePoly(ctx, apron, (x, y) => ramp(FRUIT, 4.4 - (y - (Y - 15.5 * k)) / (4 * k) * 1.3 + (x - X) / W * 0.4 + (((x * 7 + y * 13) % 11) === 0 ? 1.2 : 0), x, y));
    ctx.fillStyle = FRUIT[7]; ctx.fillRect(Math.round(X - W * 0.94), Math.round(Y - 15.5 * k), Math.round(W * 1.88), 1);
    for (let a = -2; a <= 2; a++) BZ.drawThin(ctx, X, Y - 9.5 * k, X + a * 1.1 * k, Y - 12.5 * k, a % 2 ? FRUIT[2] : FRUIT[6]); // the shell
    cabriole(ctx, X - W * 0.88, Y - 11.5 * k, Y, -1, k, FRUIT[3], FRUIT[6], FRUIT[1]); cabriole(ctx, X + W * 0.88, Y - 11.5 * k, Y, 1, k, FRUIT[3], FRUIT[6], FRUIT[1]); // front legs
  }
  function homeChair(ctx, it, s) {
    const k = s * 0.95, w = 70 * k, h = 78 * k, ox = 35 * k, oy = 74 * k, poppy = it.type === 'poppy';
    const c = cached(it.type + s, w, h, ox, oy, (g, X, Y) => (poppy ? paintPoppyChair : paintDragonflyChair)(g, X, Y, k));
    ctx.drawImage(c, Math.round(it.x - ox), Math.round(it.y - oy));
  }

  // ── the Adirondack chair from the deck: white-painted slats, a white plush mat for two ──
  function paintAdk(ctx, X, Y, k) {
    const PA = ['#9e9b91', '#bdbab0', '#d4d2c9', '#e5e3db', '#f2f1eb', '#fbfaf6'], W = 24 * k, GAP = '#7d7a72';
    ell(ctx, X + 3 * k, Y + 1, W * 1.1, 5 * k, 'rgba(20,14,6,0.22)');
    const board = (pts, base) => shadePoly(ctx, pts, (x, y) => ramp(PA, base + (((x * 3 + y * 7) % 19) === 0 ? -0.8 : 0), x, y)); // weathered white paint
    // back legs, then the fan back: five slats spreading as they rise, rounded tops on an arc
    for (const sd of [-1, 1]) board([[X + sd * W * 0.6 - 1.4 * k, Y - 20 * k], [X + sd * W * 0.6 + 1.4 * k, Y - 20 * k], [X + sd * W * 0.66 + 1.4 * k, Y - 1], [X + sd * W * 0.66 - 1.4 * k, Y - 1]], 1.5);
    for (let i = -2; i <= 2; i++) {
      const bx = X + i * 4.6 * k, tx = X + i * 6.4 * k, ty = Y - (50 - Math.pow(Math.abs(i), 1.6) * 3.2) * k, hw = 2.1 * k, by = Y - 15 * k;
      BZ.fillPoly(ctx, [[bx - hw - 0.8 * k, by], [bx + hw + 0.8 * k, by], [tx + hw + 0.8 * k, ty], [tx - hw - 0.8 * k, ty]], GAP); // the gaps read as shadow
      const pts = [[bx - hw, by], [bx + hw, by], [tx + hw, ty]]; for (let q = 0; q <= 6; q++) { const a = (q / 6) * Math.PI; pts.push([tx + Math.cos(a) * hw, ty - Math.sin(a) * hw * 0.9]); } pts.push([tx - hw, ty]);
      shadePoly(ctx, pts, (x, y) => ramp(PA, 3.4 + (x - (bx + (tx - bx) * ((by - y) / (by - ty)))) / hw * 0.9 + i * 0.15 - (y > by - 3 * k ? 0.8 : 0), x, y));
    }
    board([[X - W * 0.7, Y - 37 * k], [X + W * 0.7, Y - 37 * k], [X + W * 0.72, Y - 34 * k], [X - W * 0.72, Y - 34 * k]], 3.8); // the back rail
    ctx.fillStyle = PA[5]; ctx.fillRect(Math.round(X - W * 0.7), Math.round(Y - 37 * k), Math.round(W * 1.4), 1);
    // the seat, low and sloping back, slats side to side
    const seat = [[X - W * 0.72, Y - 12 * k], [X + W * 0.72, Y - 12 * k], [X + W * 0.62, Y - 17 * k], [X - W * 0.62, Y - 17 * k]];
    shadePoly(ctx, seat, (x, y) => ramp(PA, ((Math.round(y) & 1) ? 4.2 : 2.6), x, y));
    // the white plush mat: on the seat, a little up the back, shaggy over the front edge
    const PL = ['#c4c1b8', '#d8d5cc', '#e8e6df', '#f4f3ee', '#fdfdfb'], mat = [];
    for (let i = 0; i <= 18; i++) { const u = i / 18 * 2 - 1; mat.push([X + u * W * 0.64, Y - 9.5 * k + Math.sin(i * 2.7) * 0.8]); }
    for (let i = 18; i >= 0; i--) { const u = i / 18 * 2 - 1; mat.push([X + u * W * 0.5, Y - 26 * k + Math.abs(u) * 2 * k + Math.sin(i * 1.9) * 0.6]); }
    shadePoly(ctx, mat, (x, y) => { const v = (y - (Y - 26 * k)) / (16.5 * k), tuft = Math.sin(x * 1.4 + y * 0.8) * Math.sin(x * 0.6 - y * 1.7); return ramp(PL, 3.2 - Math.max(0, 0.45 - v) * 2.2 - Math.max(0, v - 0.82) * 6 + tuft * 0.8 + (x - X) / W * 0.3, x, y); });
    for (let i = 0; i <= 18; i++) { const [x, y] = mat[i]; ctx.fillStyle = PL[1 + (i % 3)]; ctx.fillRect(Math.round(x), Math.round(y), 1, 2); } // the shag hanging over
    // front legs and the wide flat arms that make it an Adirondack
    for (const sd of [-1, 1]) {
      const fx = X + sd * W * 0.9; board([[fx - 1.6 * k, Y - 23 * k], [fx + 1.6 * k, Y - 23 * k], [fx + 1.6 * k, Y - 1], [fx - 1.6 * k, Y - 1]], sd > 0 ? 3.4 : 2.4);
      const arm = [[X + sd * W * 0.66 - 2.4 * k, Y - 31 * k], [X + sd * W * 0.66 + 2.4 * k, Y - 31 * k], [fx + 3.4 * k, Y - 23 * k], [fx - 3.4 * k, Y - 23 * k]];
      board(arm, 4.8); ctx.fillStyle = PA[1]; ctx.fillRect(Math.round(fx - 3.4 * k), Math.round(Y - 23 * k), Math.round(6.8 * k), Math.round(1.6 * k)); // the plank's front edge
      BZ.drawThin(ctx, arm[0][0], arm[0][1], arm[3][0], arm[3][1], PA[2]);
    }
    board([[X - W * 0.74, Y - 12 * k], [X + W * 0.74, Y - 12 * k], [X + W * 0.74, Y - 9 * k], [X - W * 0.74, Y - 9 * k]], 3); // front rail under the mat's edge
  }
  function adkChair(ctx, it, s) { const k = s * 0.95, w = 64 * k, h = 56 * k, ox = 32 * k, oy = 52 * k; ctx.drawImage(cached('adk' + s, w, h, ox, oy, (g, X, Y) => paintAdk(g, X, Y, k)), Math.round(it.x - ox), Math.round(it.y - oy)); }
  // ── the felt cube in the bookcase: gray felt, a stitched round hole, a little leather tag; a dangling leg if she's left one out ──
  BZ.drawCubbyFront = function (ctx, it, s, t) {
    const b = it.box, h = it.hole, FE = ['#4a4848', '#555353', '#605e5d', '#6b6967', '#777472'], r = BZ.rng(5);
    for (let y = Math.round(b.y0); y < b.y1; y++) for (let x = Math.round(b.x0); x < b.x1; x++) {
      const dx = (x + 0.5 - h.cx) / h.rx, dy = (y + 0.5 - h.cy) / h.ry, d = dx * dx + dy * dy; if (d < 1) continue;
      let L = 2 + Math.sin(x * 2.1 + y * 1.3) * 0.5 + Math.sin(x * 0.7 - y * 2.9) * 0.4 + (x - b.x0) / (b.x1 - b.x0) * 0.8 - (y < b.y0 + 2 ? 0.8 : 0);
      if (Math.abs(Math.sqrt(d) - 1.22) < 0.07) L -= 1.1; // the stitched ring
      if ((Math.abs(x - b.x0 - 3) < 0.6 || Math.abs(x - b.x1 + 4) < 0.6 || Math.abs(y - b.y0 - 3) < 0.6) && (x + y) % 2) L -= 0.9; // border stitching
      ctx.fillStyle = ramp(FE, L, x, y); ctx.fillRect(x, y, 1, 1);
    }
    ctx.fillStyle = '#6a4a32'; ctx.fillRect(Math.round(b.x1 - 8), Math.round(b.y1 - 6), 4, 3); ctx.fillStyle = '#8a6444'; ctx.fillRect(Math.round(b.x1 - 8), Math.round(b.y1 - 6), 4, 1); // leather tag
    for (let i = 0; i < 18; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 18)), x = h.cx + Math.cos(a) * h.rx * 0.95, y = h.cy + Math.sin(a) * h.ry * 0.95; ctx.fillStyle = i % 2 ? '#1a1718' : '#2e2a2c'; ctx.fillRect(Math.round(x), Math.round(y - 1 - (i % 3)), 1, 2 + (i % 3)); } // shag over the lip
    const D = it.dangle; if (D) { // her foreleg, poured out over the lip and hanging down the felt
      const sx = h.cx - 3 * s, sy = h.cy + h.ry * 0.62, sw = Math.sin(t * 0.02) * 0.4, ex = sx - 5 * s + sw, ey = sy + 4.5 * s, px2 = sx - 7 * s + sw, py2 = Math.min(b.y1 - 2, sy + 9 * s);
      BZ.drawLine(ctx, sx, sy, 2.6 * s, ex, ey, 2.2 * s, D.leg, D.outline, 0); BZ.drawLine(ctx, ex, ey, 2.2 * s, px2, py2, 1.9 * s, D.leg, D.outline, 0);
      BZ.ellipse(ctx, px2 - 0.5 * s, py2 + 0.8 * s, 2 * s, 1.5 * s, D.paw); ctx.fillStyle = D.outline; ctx.fillRect(Math.round(px2 - 1.2 * s), Math.round(py2 + 1.8 * s), 1, 1); ctx.fillRect(Math.round(px2 + 0.4 * s), Math.round(py2 + 1.8 * s), 1, 1); // toe beans down
    }
  };
  // ── the felted bag (hand-knit in Reston): burgundy wool, a leather strap, a kraft tag on a clothespin ──
  const FELT = ['#3e1418', '#521c22', '#66262e', '#7a323a', '#8e4048', '#a25058'];
  function bagPts(it, s) { const k = s * 0.95, x = it.x, y = it.y, w = 14 * k, h = 19 * k; return { k, x, y, w, h, mouth: { cx: x, cy: y - h + 1 * k, rx: w * 0.9, ry: 3.2 * k } }; }
  BZ.drawBagBack = function (ctx, it, s) {
    const B = bagPts(it, s), { k, x, y, w, h } = B;
    ell(ctx, x + 2 * k, y + 1, w * 1.15, 3.4 * k, 'rgba(30,20,10,0.2)');
    shadePoly(ctx, [[x - w * 0.9, y - h], [x + w * 0.9, y - h], [x + w * 0.86, y - h + 4 * k], [x - w * 0.86, y - h + 4 * k]], (px, py) => ramp(FELT, 0.6 + Math.sin(px * 2.3 + py * 1.7) * 0.5, px, py)); // the dark inside
    for (const sd of [-1, 1]) { const ax = x + sd * w * 0.75; BZ.drawThin(ctx, ax, y - h + 1, ax + sd * 2 * k, y - h - 9 * k, '#b07a4a'); BZ.drawThin(ctx, ax + sd * 2 * k, y - h - 9 * k, x, y - h - 13 * k, '#b07a4a'); } // the strap, arcing over
    BZ.drawThin(ctx, x - w * 0.75 + 1, y - h + 1, x - w * 0.75 - 2 * k + 1, y - h - 9 * k, '#d8a878');
  };
  BZ.drawBagFront = function (ctx, it, s) {
    const B = bagPts(it, s), { k, x, y, w, h } = B, r = BZ.rng(19);
    const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([x - w + Math.sin(u * Math.PI) * -1.4 * k + u * 0, y - h + 2 * k + u * (h - 2 * k)]); }
    const body = [[x - w * 0.9, y - h + 2.2 * k], [x + w * 0.9, y - h + 2.2 * k], [x + w, y - h * 0.5], [x + w * 0.88, y - 0.5], [x - w * 0.88, y - 0.5], [x - w, y - h * 0.5]];
    shadePoly(ctx, body, (px, py) => { const fuzz = Math.sin(px * 3.1 + py * 2.2) * Math.sin(px * 1.3 - py * 3.7); return ramp(FELT, 3.1 + (px - x) / w * 0.6 - (py - (y - h)) / h * 0.9 + fuzz * 0.7 + (((px * 7 + py * 11) & 15) === 0 ? 1 : 0), px, py); });
    for (let i = 0; i < 22; i++) { const px = x - w + r() * w * 2, py = y - h + 3 * k + r() * (h - 4 * k); ctx.fillStyle = FELT[5]; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } // stray mohair
    ctx.fillStyle = FELT[5]; ctx.fillRect(Math.round(x - w * 0.88), Math.round(y - h + 2.2 * k), Math.round(w * 1.76), 1); // the rolled lip, catching the light
    ell(ctx, x + w * 0.2, y - h + 6 * k, 1.4 * k, 1.4 * k, '#efe6d4'); // a bone button
    const tx = x + w * 0.55, ty = y - h + 1 * k; ctx.fillStyle = '#6a4a2a'; ctx.fillRect(Math.round(tx), Math.round(ty - 3 * k), Math.max(1, Math.round(1.2 * k)), Math.round(4 * k)); // clothespin
    BZ.fillPoly(ctx, [[tx + 1 * k, ty], [tx + 6 * k, ty + 1 * k], [tx + 5 * k, ty + 8 * k], [tx, ty + 7 * k]], '#c9a87a'); ctx.fillStyle = '#7a5a3a'; for (let q = 0; q < 3; q++) ctx.fillRect(Math.round(tx + 1.5 * k), Math.round(ty + (2 + q * 1.8) * k), Math.round(3 * k), 1); // the kraft tag, handwritten
  };
  // ── the mahogany lamp table: round top, a pedestal on three feet, a brass lamp with a dome shade, warm light ──
  function paintLampTable(ctx, X, Y, k) {
    const M = ['#2a120a', '#3e1c10', '#552816', '#6c341e', '#843f26', '#9c4e30', '#b8643e'], BR = ['#5a4416', '#7f6320', '#a8862e', '#cba648', '#e6c870', '#f6e6a8'];
    ell(ctx, X + 2 * k, Y + 1, 15 * k, 3.4 * k, 'rgba(30,20,10,0.22)');
    for (const a of [-0.9, 0.9, Math.PI / 2 + 0.02]) { const fx = X + Math.cos(a) * 12 * k * (a > 1.5 ? 0.2 : 1), fy = Y - (a > 1.5 ? -1.5 * k : 0); BZ.drawLine(ctx, X, Y - 7 * k, 2.4 * k, fx, fy, 1.4 * k, M[2], null, 0); ell(ctx, fx, fy - 0.5, 1.6 * k, 1.1 * k, M[3]); } // tripod feet
    shadePoly(ctx, [[X - 2.2 * k, Y - 25 * k], [X + 2.2 * k, Y - 25 * k], [X + 3 * k, Y - 7 * k], [X - 3 * k, Y - 7 * k]], (x, y) => ramp(M, 2.6 + (x - X) / (3 * k) * 1.4 + Math.sin(y * 0.9) * 0.3, x, y)); // turned pedestal
    for (const yy of [Y - 20 * k, Y - 12 * k]) ell(ctx, X, yy, 3.2 * k, 1.2 * k, M[4]);
    // the lamp: weighted base, a brass column, a gold dome shade (drawn before the top's front edge so it sits on it)
    const lx = X + 1 * k, ly = Y - 30 * k;
    ell(ctx, lx, ly, 4.6 * k, 1.6 * k, '#1a1410'); ell(ctx, lx, ly - 0.6 * k, 4 * k, 1.2 * k, '#2e2620');
    BZ.drawLine(ctx, lx, ly - 1 * k, 1.1 * k, lx, ly - 34 * k, 0.9 * k, BR[3], null, 0); BZ.drawThin(ctx, lx - 0.6, ly - 1 * k, lx - 0.6, ly - 34 * k, BR[5]);
    const sy = ly - 34 * k; shadePoly(ctx, [[lx - 13 * k, sy + 3 * k], [lx + 13 * k, sy + 3 * k], [lx + 9 * k, sy - 3 * k], [lx - 9 * k, sy - 3 * k]], (x, y) => ramp(BR, 2.6 + (x - lx) / (13 * k) * 1.6 + (y < sy - 1 * k ? 1 : 0), x, y));
    ctx.fillStyle = BR[1]; ctx.fillRect(Math.round(lx - 13 * k), Math.round(sy + 3 * k), Math.round(26 * k), 1); ell(ctx, lx, sy - 3.5 * k, 1.6 * k, 1.2 * k, BR[4]); // shade rim, finial
    // the round top: a deep French polish, the lamp's reflection pooled in it
    shadePoly(ctx, Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [X + Math.cos(a) * 19 * k, Y - 27 * k + Math.sin(a) * 6.5 * k]; }), (x, y) => { const dx = (x - (lx + 1 * k)) / (6 * k), dy = (y - (Y - 28 * k)) / (2.4 * k), glare = Math.exp(-(dx * dx + dy * dy)); return ramp(M, 3 + (x - X) / (19 * k) * 0.8 - (y - (Y - 27 * k)) / (6.5 * k) * 0.6 + glare * 3.2, x, y); });
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI; ctx.fillStyle = M[1]; ctx.fillRect(Math.round(X + Math.cos(a) * 19 * k), Math.round(Y - 27 * k + Math.sin(a) * 6.5 * k), 1, Math.max(1, Math.round(2 * k))); } // the apron edge
    // a little silver frame on the table, by the lamp
    ctx.fillStyle = '#9aa0a8'; ctx.fillRect(Math.round(X - 11 * k), Math.round(Y - 34 * k), Math.round(5 * k), Math.round(6 * k)); ctx.fillStyle = '#d8c8a8'; ctx.fillRect(Math.round(X - 10 * k), Math.round(Y - 33 * k), Math.round(3 * k), Math.round(4 * k));
  }
  function lampTable(ctx, it, s, t) {
    const k = s * 0.95, w = 50 * k, h = 82 * k, ox = 25 * k, oy = 78 * k;
    ctx.drawImage(cached('lamptable' + s, w, h, ox, oy, (g, X, Y) => paintLampTable(g, X, Y, k)), Math.round(it.x - ox), Math.round(it.y - oy));
    const glow = BZ.isNight() ? 0.1 : 0.045, lx = it.x + 1 * k, ly = it.y - 58 * k; // warm light pooling under the shade
    for (let r = 1; r <= 4; r++) ell(ctx, lx, ly + 10 * k + r * 2 * k, 12 * k + r * 6 * k, 4 * k + r * 3 * k, `rgba(255,206,130,${glow})`);
    void t;
  }
  BZ.drawSweaterIcon = function (ctx, x, y, s) { // a little folded cream sweater with a green bow
    const K = ['#b8a788', '#cfc0a0', '#e2d6bc', '#efe7d4']; y -= 2 * s;
    BZ.fillPoly(ctx, [[x - 8 * s, y - 7 * s], [x + 8 * s, y - 7 * s], [x + 9 * s, y], [x - 9 * s, y]], K[2]); for (let i = -7; i < 8; i += 2) { ctx.fillStyle = K[1]; ctx.fillRect(Math.round(x + i * s), Math.round(y - 6 * s), 1, Math.round(6 * s)); }
    ctx.fillStyle = K[0]; ctx.fillRect(Math.round(x - 9 * s), Math.round(y - 1 * s), Math.round(18 * s), Math.max(1, Math.round(1 * s)));
    BZ.fillPoly(ctx, [[x, y - 7 * s], [x - 4 * s, y - 10 * s], [x - 4 * s, y - 5 * s]], '#5f7a3a'); BZ.fillPoly(ctx, [[x, y - 7 * s], [x + 4 * s, y - 10 * s], [x + 4 * s, y - 5 * s]], '#5f7a3a'); ell(ctx, x, y - 7 * s, 1.2 * s, 1.2 * s, '#3f5a28');
  };
  // ── the tire swing: rope from the big branch, a black ring you can sit in ──
  BZ.tireGeom = function (it, s) { const k = s * 0.95, R = 17 * k, r = 9.5 * k, L = it.cy - it.ropeY, a = it.ang || 0; return { cx: it.x + Math.sin(a) * L, cy: it.ropeY + Math.cos(a) * L, R, r, k, a }; };
  function tireRing(ctx, T, part) {
    const { cx, cy, R, r } = T, RU = ['#141315', '#1d1c1f', '#28272a', '#343236', '#45434a', '#5a5860'];
    for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy); if (d > R || d < r) continue;
      const front = dy > r * 0.45; if ((part === 'front') !== front) continue;
      const u = (d - r) / (R - r), a = Math.atan2(dy, dx), lit = -Math.cos(a + 0.8) * 1.2 + (1 - Math.abs(u - 0.5) * 2) * 1.2 + ((Math.floor(a * 9) & 1) && u > 0.75 ? -0.7 : 0); // tread blocks on the rim
      ctx.fillStyle = ramp(RU, 2 + lit, x, y); ctx.fillRect(x, y, 1, 1);
    }
  }
  BZ.drawTireBack = function (ctx, it, s) {
    const T = BZ.tireGeom(it, s), k = T.k;
    ell(ctx, T.cx, it.y, T.R * 0.9, 3.2 * k, 'rgba(20,14,6,0.22)');
    const top = [T.cx - Math.sin(T.a) * T.R, T.cy - Math.cos(T.a) * T.R];
    for (const o of [-0.8, 0.8]) BZ.drawThin(ctx, it.x + o, it.ropeY, top[0] + o, top[1], '#b9a57a');
    for (let i = 0; i < 10; i++) { const u = i / 10; ctx.fillStyle = '#8a7650'; ctx.fillRect(Math.round(it.x + (top[0] - it.x) * u), Math.round(it.ropeY + (top[1] - it.ropeY) * u), 1, 1); }
    ell(ctx, top[0], top[1] + 1, 2 * k, 2.4 * k, '#a8946a'); // the knot
    // the inside floor of the hole, where she sits
    for (let x = Math.floor(T.cx - T.r); x <= T.cx + T.r; x++) { const dx = x + 0.5 - T.cx, yb = T.cy + Math.sqrt(Math.max(0, T.r * T.r - dx * dx)); ctx.fillStyle = '#0e0d0f'; ctx.fillRect(x, Math.round(yb - 2 * k), 1, Math.round(2 * k)); }
    tireRing(ctx, T, 'back');
  };
  BZ.drawTireFront = function (ctx, it, s) { tireRing(ctx, BZ.tireGeom(it, s), 'front'); };
  // ── garden plants ──
  BZ.drawSprout = function (ctx, it, s, t) {
    const k = s * 0.95 * 0.9, x = it.x, y = it.y, G = BZ.GARDEN[it.kind] || BZ.GARDEN.catgrass, st = it.stage || 0, wet = (it.water || 0) > 0.25;
    const sw = (h) => Math.sin(t * 0.045 + x * 0.3) * h * 0.06 + Math.sin(t * 0.5 + x) * (it.rustle || 0) * 2 + (it.swing || 0) * Math.sin(t * 0.4) * 0.5;
    ell(ctx, x, y, 4.5 * k, 1.7 * k, wet ? '#2a1c12' : '#4a3524'); ell(ctx, x - 1 * k, y - 0.6 * k, 2.6 * k, 0.9 * k, wet ? '#3b2a1d' : '#5a422e');
    if (st === 0) { // a plant marker: a stick and a little seed-packet label
      BZ.drawThin(ctx, x + 3 * k, y, x + 3 * k, y - 7 * k, '#9a7a4a'); ctx.fillStyle = '#f2ead8'; ctx.fillRect(Math.round(x + 1 * k), Math.round(y - 9 * k), Math.round(4 * k), Math.round(3 * k)); ctx.fillStyle = G.col; ctx.fillRect(Math.round(x + 2 * k), Math.round(y - 8 * k), Math.max(1, Math.round(2 * k)), Math.max(1, Math.round(1.2 * k))); return;
    }
    const L = (len, a) => [Math.cos(a) * len, Math.sin(a) * len];
    if (st === 1) { BZ.drawThin(ctx, x, y, x + sw(4), y - 4 * k, '#7fb14a'); BZ.leaf(ctx, x + sw(4), y - 4 * k, 3 * k, 1.4 * k, -Math.PI / 2 - 0.9, '#8cc456', null, false); BZ.leaf(ctx, x + sw(4), y - 4 * k, 3 * k, 1.4 * k, -Math.PI / 2 + 0.9, '#9fd060', null, false); return; }
    const grown = st >= 3, sc = grown ? 1 : 0.62, H = G.h * k * sc, r = BZ.rng((it.slot || 0) * 31 + (it.plot || '').length * 7 + 3);
    switch (it.kind) {
      case 'catgrass': { const full = grown ? Math.max(0.15, (it.servings ?? 6) / (it.full || 6)) : 1, cols = ['#5a9632', '#6fae3c', '#85c24a', '#4d8a2c', '#9bd25a']; for (let i = 0; i < 16; i++) { const bx = x - 4 * k + r() * 8 * k, bh = (r() > full ? 0.3 : 0.7 + r() * 0.5) * H, lean = (r() - 0.5) * 5 * k + sw(bh); BZ.drawThin(ctx, bx, y, bx + lean * 0.5, y - bh * 0.55, cols[i % 5]); BZ.drawThin(ctx, bx + lean * 0.5, y - bh * 0.55, bx + lean, y - bh, cols[(i + 2) % 5]); } break; }
      case 'catmint': case 'lavender': { const leafC = it.kind === 'lavender' ? ['#7d9a80', '#98b29a'] : ['#7f9a74', '#a2b896']; for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.4, [dx, dy] = L(H * (0.25 + r() * 0.3), a); BZ.leaf(ctx, x + dx * 0.3, y + dy * 0.3 - 1, 3 * k, 1.3 * k, a, leafC[i & 1], null, false); } if (grown) for (let i = 0; i < 6; i++) { const bx = x + (i - 2.5) * 1.6 * k, tip = [bx + (i - 2.5) * 1.4 * k + sw(H), y - H * (0.75 + r() * 0.3)]; BZ.drawThin(ctx, bx, y - 2, tip[0], tip[1] + 4 * k, '#8aa07a'); for (let q = 0; q < 4; q++) { ctx.fillStyle = q & 1 ? G.col : BZ.mixHex(G.col, '#ffffff', 0.3); ctx.fillRect(Math.round(tip[0]), Math.round(tip[1] + q * 1.2 * k), 1, 1); } } break; }
      case 'poppy': { for (let i = 0; i < 5; i++) BZ.leaf(ctx, x + (i - 2) * 1.5 * k, y - 1, 4 * k, 1.6 * k, -Math.PI / 2 + (i - 2) * 0.55, '#7d9a66', null, true); const n = grown ? 3 : 1; for (let i = 0; i < n; i++) { const hx = x + (i - 1) * 3.5 * k + sw(H), hy = y - H * (0.7 + i % 2 * 0.25); BZ.drawThin(ctx, x + (i - 1) * 1.5 * k, y - 2, hx, hy, '#8aa870'); if (grown) { ell(ctx, hx, hy, 2.4 * k, 1.8 * k, '#c84a34'); ell(ctx, hx - 0.5, hy - 0.5, 1.8 * k, 1.2 * k, G.col); ctx.fillStyle = '#f2a585'; ctx.fillRect(Math.round(hx - 1.5 * k), Math.round(hy - 1 * k), 1, 1); ctx.fillStyle = '#2a1a14'; ctx.fillRect(Math.round(hx), Math.round(hy), 1, 1); } else ell(ctx, hx, hy, 1.2 * k, 1.6 * k, '#8aa870'); } break; }
      case 'tulip': { const tc = ['#e8607a', '#f2c53a', '#d8343a', '#f4a0b8'][(it.slot || 0) % 4]; for (const sd of [-1, 1]) BZ.leaf(ctx, x, y - 1, H * 0.7, 2 * k, -Math.PI / 2 + sd * 0.35, '#6f9a6a', '#8ab886', false); if (grown) for (let i = 0; i < 2; i++) { const hx = x + (i ? 2 : -2) * k + sw(H), hy = y - H * (0.85 + i * 0.12); BZ.drawThin(ctx, x + (i ? 1 : -1), y - 2, hx, hy + 2 * k, '#7aa070'); BZ.fillPoly(ctx, [[hx - 2 * k, hy - 2.4 * k], [hx + 2 * k, hy - 2.4 * k], [hx + 1.6 * k, hy + 1 * k], [hx - 1.6 * k, hy + 1 * k]], tc); ctx.fillStyle = BZ.mixHex(tc, '#ffffff', 0.35); ctx.fillRect(Math.round(hx - 1.4 * k), Math.round(hy - 2.4 * k), 1, Math.round(2.6 * k)); ctx.fillStyle = BZ.mixHex(tc, '#000000', 0.2); ctx.fillRect(Math.round(hx), Math.round(hy - 2.6 * k), 1, 1); } break; }
      case 'sunflower': { const hx = x + sw(H) * 0.5, hy = y - H; BZ.drawLine(ctx, x, y, 1.2 * k, hx, hy + 3 * k, 0.9 * k, '#5f8a3a', null, 0); for (let i = 0; i < 3; i++) { const ly = y - H * (0.25 + i * 0.22), sd = i & 1 ? 1 : -1; BZ.leaf(ctx, x + (hx - x) * (ly - y) / (hy - y), ly, 6 * k, 3.2 * k, -Math.PI / 2 + sd * 1.1, '#5f8f3a', '#86b05a', false); } if (grown) { for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ell(ctx, hx + Math.cos(a) * 3.6 * k, hy + Math.sin(a) * 3 * k, 1.5 * k, 1.2 * k, i & 1 ? '#f2c53a' : '#e8a82a'); } ell(ctx, hx, hy, 2.6 * k, 2.2 * k, '#5a3a1a'); ell(ctx, hx - 0.6, hy - 0.6, 1.4 * k, 1.1 * k, '#7a5228'); } else ell(ctx, hx, hy, 2 * k, 1.8 * k, '#7aa04a'); break; }
      case 'cosmos': { for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.8, [dx, dy] = L(H * (0.3 + r() * 0.35), a); BZ.drawThin(ctx, x, y - 1, x + dx + sw(H) * 0.5, y + dy, i & 1 ? '#7fae5a' : '#94c06a'); } if (grown) for (let i = 0; i < 4; i++) { const fx = x + (i - 1.5) * 3.2 * k + sw(H), fy = y - H * (0.7 + (i % 2) * 0.28), fc = ['#f08ab8', '#fbf4f8', '#d8508e', '#f6b4d0'][(i + (it.slot || 0)) % 4]; BZ.drawThin(ctx, x + (i - 1.5) * k, y - 3, fx, fy, '#88b062'); for (let q = 0; q < 6; q++) { const a = (q / 6) * Math.PI * 2 + i; ctx.fillStyle = fc; ctx.fillRect(Math.round(fx + Math.cos(a) * 1.6 * k), Math.round(fy + Math.sin(a) * 1.2 * k), 1, 1); } ctx.fillStyle = '#f2c53a'; ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1); } break; }
      case 'strawberry': { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5, [dx, dy] = L(H * 0.6, a); for (const o of [-0.4, 0, 0.4]) BZ.leaf(ctx, x + dx * 0.6, y + dy * 0.6, 2.6 * k, 1.3 * k, a + o, i & 1 ? '#4f8a3a' : '#5f9a44', null, false); } if (grown) { for (let i = 0; i < 3; i++) { const bx = x + (i - 1) * 3.6 * k, by = y - 1 * k + (i & 1); BZ.fillPoly(ctx, [[bx - 1.4 * k, by - 1.6 * k], [bx + 1.4 * k, by - 1.6 * k], [bx, by + 1.2 * k]], G.col); ctx.fillStyle = '#f6e27a'; ctx.fillRect(Math.round(bx - 0.5), Math.round(by - 1), 1, 1); ctx.fillStyle = '#4f8a3a'; ctx.fillRect(Math.round(bx - 1), Math.round(by - 2 * k), 2, 1); } ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x + 1 * k), Math.round(y - 5 * k), 2, 2); } break; }
    }
  };
  BZ.drawPacket = function (ctx, x, y, s, kind) { // a little seed packet with the flower on it
    const G = BZ.GARDEN[kind] || BZ.GARDEN.catgrass, w = 8 * s, h = 11 * s, x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
    ctx.fillStyle = 'rgba(30,20,10,0.18)'; ctx.fillRect(x0 + 1, y0 + 1, Math.round(w), Math.round(h));
    ctx.fillStyle = '#efe6d2'; ctx.fillRect(x0, y0, Math.round(w), Math.round(h)); ctx.fillStyle = '#d8ccb2'; ctx.fillRect(x0, y0, Math.round(w), Math.max(1, Math.round(2 * s)));
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x0 + 1, Math.round(y0 + 3 * s), Math.round(w - 2), Math.round(5 * s));
    const cx = x0 + w / 2, cy = y0 + 5.5 * s; ctx.fillStyle = kind === 'catgrass' ? '#6fae3c' : '#6f9a5a'; ctx.fillRect(Math.round(cx), Math.round(cy), 1, Math.round(2.5 * s)); ell(ctx, cx, cy, 1.8 * s, 1.5 * s, G.col); if (kind !== 'catgrass') { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(Math.round(cx), Math.round(cy), 1, 1); }
    ctx.fillStyle = '#a89a80'; ctx.fillRect(x0 + 1, Math.round(y0 + 9 * s), Math.round(w - 2), 1);
  };
  BZ.drawCan = function (ctx, x, y, s, tilt, pour) { // a galvanized watering can
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(tilt || 0);
    const G = ['#6e7680', '#8b939c', '#a8b0b8', '#c4cad0'];
    BZ.drawLine(ctx, 5 * s, -3 * s, 1.6 * s, 13 * s, -9 * s, 1.1 * s, G[1], null, 0); ell(ctx, 13.5 * s, -9.5 * s, 1.8 * s, 1.4 * s, G[0]); // spout + rose
    ctx.fillStyle = G[1]; ctx.fillRect(Math.round(-6 * s), Math.round(-8 * s), Math.round(11 * s), Math.round(8 * s)); ctx.fillStyle = G[3]; ctx.fillRect(Math.round(-6 * s), Math.round(-8 * s), Math.round(3 * s), Math.round(8 * s)); ctx.fillStyle = G[0]; ctx.fillRect(Math.round(-6 * s), Math.round(-1 * s), Math.round(11 * s), 1); ctx.fillRect(Math.round(-6 * s), Math.round(-5 * s), Math.round(11 * s), 1);
    BZ.ellRing(ctx, -1 * s, -9 * s, 4 * s, 3 * s, G[0]); // handle
    ctx.restore();
  };
  BZ.drawTrowel = function (ctx, x, y, s) {
    BZ.drawLine(ctx, x - 6 * s, y - 6 * s, 1.8 * s, x - 1 * s, y - 1.5 * s, 1.6 * s, '#9a6a3a', null, 0); ctx.fillStyle = '#c08a50'; ctx.fillRect(Math.round(x - 6 * s), Math.round(y - 7 * s), 1, 1);
    BZ.fillPoly(ctx, [[x - 1.5 * s, y - 2 * s], [x + 1 * s, y - 4 * s], [x + 7 * s, y + 3 * s], [x + 3 * s, y + 4 * s]], '#a8b0b8'); BZ.drawThin(ctx, x, y - 2.5 * s, x + 6 * s, y + 3 * s, '#d4dade');
  };

  BZ.drawPodBack = function (ctx, it, s) {
    const p = BZ.podGeom(it, s), k = p.s;
    BZ.ellRing(ctx, p.x, p.y, 19 * k, 4.4 * k, '#878b91'); BZ.ellRing(ctx, p.x, p.y - 1, 19 * k, 4.4 * k, '#b4b8bd');
    const by = p.cy + p.ry * 0.82;
    for (const dx of [-15, 15, 0]) BZ.drawLine(ctx, p.x + dx * k * 1.25, p.y + (dx ? 1 : -4) * k, 1.6, p.x + dx * k * 0.55, by, 1.6, dx ? '#9a9ea4' : '#7d8187', null, 0);
    ell(ctx, p.cx, p.cy + 1, p.rx + 1, p.ry + 1, '#565a22');
    ell(ctx, p.cx, p.cy, p.rx, p.ry, '#a3a948');
    ell(ctx, p.cx + p.rx * 0.08, p.cy + p.ry * 0.25, p.rx * 0.94, p.ry * 0.74, '#949a3c');
    ell(ctx, p.cx - p.rx * 0.35, p.cy - p.ry * 0.55, p.rx * 0.35, p.ry * 0.16, '#c2c76c');
    ell(ctx, p.ox, p.oy, p.orx + 2, p.ory + 2, '#787d2f');
    ell(ctx, p.ox, p.oy, p.orx, p.ory, '#22231b');
    ell(ctx, p.ox, p.oy - p.ory * 0.25, p.orx * 0.86, p.ory * 0.6, '#2d2f24');
    ell(ctx, p.ox, p.oy + p.ory * 0.55, p.orx * 0.8, p.ory * 0.3, '#4a4c3a'); // cushion
  };
  BZ.drawPodFront = function (ctx, it, s) {
    const p = BZ.podGeom(it, s), lipTop = Math.round(p.oy + p.ory * 0.42);
    ctx.fillStyle = '#a3a948';
    for (let y = lipTop; y <= p.oy + p.ory + 2; y++) { const sp = BZ.ballSpanE(p.cx, p.cy, p.rx, p.ry, y); if (sp) ctx.fillRect(sp[0], y, sp[1] - sp[0], 1); }
    ctx.fillStyle = '#949a3c';
    for (let y = lipTop + 4; y <= p.oy + p.ory + 2; y++) { const sp = BZ.ballSpanE(p.cx + p.rx * 0.08, p.cy + p.ry * 0.25, p.rx * 0.94, p.ry * 0.74, y); if (sp) ctx.fillRect(sp[0], y, sp[1] - sp[0], 1); }
    const sp = BZ.ballSpanE(p.ox, p.oy, p.orx + 2, p.ory + 2, lipTop); if (sp) { ctx.fillStyle = '#c2c76c'; ctx.fillRect(sp[0] + 2, lipTop, sp[1] - sp[0] - 4, 1); }
  };

  function grass(ctx, it, s, t) {
    const w = 19 * s, h = 7 * s, x = it.x, y = it.y;
    // planter: top rim, front face
    BZ.fillPoly(ctx, [[x - w, y - h], [x + w, y - h], [x + w - 1.5 * s, y], [x - w + 1.5 * s, y]], '#c9b593');
    ctx.fillStyle = '#ad9773'; ctx.fillRect(Math.round(x - w + 2 * s), Math.round(y - 2 * s), Math.round(2 * w - 4 * s), 1);
    ell(ctx, x, y - h, w, 3.2 * s, '#e3d4b8'); ell(ctx, x, y - h, w - 2 * s, 2.3 * s, '#4a3524');
    const r = BZ.rng(77), full = it.servings / it.full, rust = it.rustle || 0;
    const cols = ['#5a9632', '#6fae3c', '#85c24a', '#4d8a2c', '#9bd25a'];
    for (let i = 0; i < 42; i++) {
      const u = r(), bx = x - (w - 3 * s) + u * (2 * w - 6 * s), by = y - h + (r() - 0.5) * 3 * s;
      const eaten = r() > full; // nibbled blades are short and blunt
      const bh = (eaten ? 3 + r() * 3 : 11 + r() * 9) * s;
      const sway = Math.sin(t * 0.05 + u * 6) * 1.2 * s + Math.sin(t * 0.6 + i) * rust * 2;
      const lean = (r() - 0.5) * 6 * s + sway;
      BZ.drawThin(ctx, bx, by, bx + lean * 0.5, by - bh * 0.55, cols[i % 5]);
      BZ.drawThin(ctx, bx + lean * 0.5, by - bh * 0.55, bx + lean, by - bh, cols[(i + 2) % 5]);
    }
  }
  function catnip(ctx, it, s, t) {
    const x = it.x, y = it.y;
    BZ.fillPoly(ctx, [[x - 8 * s, y - 10 * s], [x + 8 * s, y - 10 * s], [x + 6 * s, y], [x - 6 * s, y]], '#b8643a');
    ctx.fillStyle = '#9a4f2c'; ctx.fillRect(Math.round(x - 8 * s), Math.round(y - 10 * s), Math.round(16 * s), Math.max(1, Math.round(2 * s)));
    const r = BZ.rng(31), n = 6 + Math.round(it.servings / it.full * 16);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.4, L = (6 + r() * 10) * s, sw = Math.sin(t * 0.06 + i) * 0.08;
      const sx = x + Math.cos(a + sw) * L, sy = y - 10 * s + Math.sin(a + sw) * L;
      BZ.drawThin(ctx, x + (r() - 0.5) * 6 * s, y - 10 * s, sx, sy, '#6c8a55');
      BZ.leaf(ctx, sx, sy, 5 * s, 2.3 * s, a + sw, i % 3 ? '#8aab72' : '#a3c08c', null, true);
    }
    ctx.fillStyle = '#e3d9f2'; for (let i = 0; i < 3; i++) ctx.fillRect(Math.round(x - 3 * s + i * 3 * s), Math.round(y - 25 * s + i * 2 * s), 1, 2);
  }
  function spider(ctx, it, s, t) {
    const x = it.x, y = it.y, sw = (it.swing || 0);
    ell(ctx, x, y - 6 * s, 8 * s, 6 * s, '#efece6'); ell(ctx, x, y - 11 * s, 8 * s, 2 * s, '#d6d2ca'); ell(ctx, x, y - 11 * s, 6.5 * s, 1.3 * s, '#4a3524');
    const r = BZ.rng(55), n = 6 + Math.round(it.servings / it.full * 10);
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, a0 = -Math.PI / 2 + side * (0.2 + r() * 0.9), L = (10 + r() * 12) * s;
      let px = x + (r() - 0.5) * 4 * s, py = y - 11 * s, ang = a0;
      for (let k = 0; k < 6; k++) {
        ang += side * 0.22 + Math.sin(t * 0.05 + i) * 0.02 + sw * 0.05 * side;
        const nx = px + Math.cos(ang) * L / 6, ny = py + Math.sin(ang) * L / 6;
        BZ.drawLine(ctx, px, py, 1.8 * s * (1 - k / 7), nx, ny, 1.6 * s * (1 - (k + 1) / 7), '#4f8a3a', null, 0);
        if (k < 4) BZ.drawThin(ctx, px, py, nx, ny, '#e8efc8');
        px = nx; py = ny;
      }
    }
    // a dangling plantlet on a runner
    const rx = x + 14 * s + sw * 3, ry = y - 2 * s;
    BZ.drawThin(ctx, x + 4 * s, y - 12 * s, rx, ry - 3 * s, '#c9d79a');
    for (let k = 0; k < 4; k++) BZ.leaf(ctx, rx, ry - 3 * s, 5 * s, 1.2 * s, -Math.PI / 2 + (k - 1.5) * 0.5, '#5b9a44', null, false);
  }
  function yarn(ctx, it, s) {
    const d = 13 * s, yy = it.y - d / 2, x = it.x;
    BZ.drawBall(ctx, x, yy, d, '#c9455d', '#5a1424', '#f39aa8', 0, 2);
    const a = it.spin || 0;
    for (let k = 0; k < 3; k++) { const ang = a + k * 1.05, r = d * 0.42; BZ.drawThin(ctx, x - Math.cos(ang) * r, yy - Math.sin(ang) * r * 0.6, x + Math.cos(ang) * r, yy + Math.sin(ang) * r * 0.6, '#8f2238'); }
    BZ.drawBall(ctx, x, yy, d, null, '#5a1424', null, 1, 2);
    BZ.drawThin(ctx, x + d * 0.4, yy + d * 0.3, x + d * 0.9, it.y, '#c9455d');
  }
  function treat(ctx, it, s) {
    const r = 5 * s, x = it.x, yy = it.y - r;
    ell(ctx, x, yy, r * 1.25, r * 0.75, '#7a4a12'); ell(ctx, x, yy, r * 1.15, r * 0.62, '#d99a3a');
    ctx.fillStyle = '#d99a3a';
    for (let i = 0; i < r * 1.2; i++) ctx.fillRect(Math.round(x - r * 1.1 - i * 0.6), Math.round(yy - i * 0.5), 1, Math.max(1, Math.round(i)));
    ctx.fillStyle = '#3b2208'; ctx.fillRect(Math.round(x + r * 0.55), Math.round(yy - r * 0.2), 1, 1);
  }
  function bowl(ctx, it, s) {
    const rx = 15 * s, ry = 4.6 * s, h = 6 * s, x = it.x, y = it.y;
    ell(ctx, x, y - 1, rx * 1.05, ry * 1.05, 'rgba(0,0,0,0.18)');
    for (let i = 0; i < h; i++) ell(ctx, x, y - i, rx - i * 0.15, ry, i === Math.ceil(h) - 1 ? '#3a6f73' : '#4f8f92');
    ell(ctx, x, y - h, rx, ry, '#2c5558');
    const full = Math.max(0, Math.min(1, it.servings / it.full));
    if (full > 0) {
      ell(ctx, x, y - h + 0.5, (rx - 2.5) * (0.5 + full * 0.5), (ry - 1.2) * (0.5 + full * 0.5), '#8a5a2a');
      const r = BZ.rng(7); ctx.fillStyle = '#c08648';
      for (let i = 0; i < 18 * full; i++) ctx.fillRect(Math.round(x + (r() - 0.5) * (rx - 4) * 1.6 * full), Math.round(y - h + (r() - 0.5) * (ry - 2) * 1.4 * full), 1, 1);
    }
  }
  BZ.drawItem = function (ctx, it, s, t) {
    t = t || 0;
    if (it.lift > 0.5) { ctx.save(); ctx.translate(0, -Math.round(it.lift)); const L = it.lift; it.lift = 0; BZ.drawItem(ctx, it, s, t); it.lift = L; ctx.restore(); return; } // up on a shelf / sill / table
    if (it.z > 0.5) { // airborne toy: shadow stays on the floor, the toy rides up
      const sh = Math.max(0.35, 1 - it.z / (40 * s)); ell(ctx, it.x, it.y, 7 * s * sh, 2 * s * sh, 'rgba(30,20,10,0.18)');
      ctx.save(); ctx.translate(0, -Math.round(it.z)); const z = it.z; it.z = 0; BZ.drawItem(ctx, it, s, t); it.z = z; ctx.restore(); return;
    }
    switch (it.type) {
      case 'pod': BZ.drawPodBack(ctx, it, s); BZ.drawPodFront(ctx, it, s); break;
      case 'chair': case 'floral': case 'emerald': case 'blush': chair(ctx, it, s); break;
      case 'poppy': case 'dfly': homeChair(ctx, it, s); break;
      case 'adk': adkChair(ctx, it, s); break;
      case 'sprout': BZ.drawSprout(ctx, it, s, t); break;
      case 'can': BZ.drawCan(ctx, it.x, it.y - 2 * s, s, 0, false); break;
      case 'trowel': BZ.drawTrowel(ctx, it.x - 4 * s, it.y - 2 * s, s); break;
      case 'stoop': case 'tire': break;
      case 'cubby': BZ.drawCubbyFront(ctx, it, s, t); break;
      case 'mouse': mouse(ctx, it, s); break;
      case 'pillow': pillow(ctx, it, s); break;
      case 'ctable': ctable(ctx, it, s); break;
      case 'daybed': daybed(ctx, it, s); break;
      case 'seat': break;
      case 'blanket': blanket(ctx, it, s, t); break;
      case 'box': BZ.drawBoxBack(ctx, it, s); BZ.drawBoxFront(ctx, it, s); break;
      case 'bag': BZ.drawBagBack(ctx, it, s); BZ.drawBagFront(ctx, it, s); break;
      case 'lamptable': lampTable(ctx, it, s, t); break;
      case 'sweater': BZ.drawSweaterIcon(ctx, it.x, it.y, s); break;
      case 'brush': BZ.drawBrush(ctx, it.x, it.y - 6 * s, s, 0); break;
      case 'wand': BZ.drawWand(ctx, { hx: it.x - 8 * s, hy: it.y - 14 * s, fx: it.x + 6 * s, fy: it.y - 2 * s, vx: 1, vy: 2 }, s); break;
      case 'ledge': break;
      case 'shrimp': shrimp(ctx, it, s); break;
      case 'sun': BZ.drawSun(ctx, it, s, t); break;
      case 'grass': grass(ctx, it, s, t); break;
      case 'catnip': catnip(ctx, it, s, t); break;
      case 'spider': spider(ctx, it, s, t); break;
      default: if (BZ.PLANTS[it.type]) plant(ctx, it, s, t); else if (BZ.ITEMS[it.type] && BZ.ITEMS[it.type].seed) BZ.drawPacket(ctx, it.x, it.y, s, BZ.ITEMS[it.type].seed); break;
      case 'yarn': yarn(ctx, it, s); break;
      case 'treat': treat(ctx, it, s); break;
      case 'bowl': bowl(ctx, it, s); break;
      case 'laser': {
        BZ.drawLine(ctx, it.x - 10 * s, it.y - 2 * s, 3 * s, it.x + 6 * s, it.y - 10 * s, 3 * s, '#3a3030', null, 0);
        ctx.fillStyle = '#ff2a2a'; ctx.fillRect(Math.round(it.x + 9 * s), Math.round(it.y - 13 * s), 2, 2);
        ctx.fillStyle = 'rgba(255,40,40,.35)'; ctx.fillRect(Math.round(it.x + 8 * s), Math.round(it.y - 14 * s), 4, 4);
        break;
      }
    }
  };
  // panel icons: draw an item centred in a small pixel canvas
  BZ.drawIcon = function (cv, type) {
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cv.width, cv.height);
    const W = cv.width, H = cv.height;
    const sc = Object.assign({ pillow: 0.62, blanket: 0.42, box: 0.5, ctable: 0.4, daybed: 0.3, brush: 0.9, wand: 0.75 }, Object.fromEntries(Object.keys(BZ.PLANTS).map((k) => [k, Math.min(0.6, 15 / BZ.PLANTS[k].h)])))[type] || { sun: 0.3, chair: 0.3, poppy: 0.24, dfly: 0.3, can: 0.75, trowel: 0.85, bag: 0.5, lamptable: 0.24, sweater: 1, floral: 0.3, emerald: 0.3, blush: 0.3, mouse: 0.95, shrimp: 1.05, pod: 0.26, grass: 0.46, catnip: 0.62, spider: 0.55, yarn: 0.85, laser: 0.7, treat: 1.05, bowl: 0.6 }[type] || 0.6;
    const sc2 = BZ.ITEMS[type].seed ? 1.45 : sc;
    if (sc2 !== sc) { BZ.drawPacket(ctx, W / 2, H * 0.9, sc2, BZ.ITEMS[type].seed); return; }
    const it = BZ.newItem(type, W / 2 + (type === 'spider' ? -3 : 0), H * (BZ.ITEMS[type].bed || BZ.ITEMS[type].plant ? 0.94 : type === 'sun' ? 0.62 : 0.78));
    BZ.drawItem(ctx, it, sc, 0);
  };
  BZ.itemHit = function (it, x, y, s) {
    const d = BZ.ITEMS[it.type]; if (!d || d.tool || d.fixed || it.fixed || d.garden) return false;
    if (it.type === 'pod') { const g = BZ.podGeom(it, s); return Math.abs(x - g.cx) < g.rx && y > g.cy - g.ry && y < g.y + 4; }
    if (it.type === 'sun') return BZ.inSun(it, x, y, s);
    y += it.lift || 0; const r = d.r * s; return Math.abs(x - it.x) < r && y > it.y - d.h * s && y < it.y + 4;
  };
})();
