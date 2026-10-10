const { chromium } = require('playwright');
(async () => { const out = process.argv[2] || 'test/moments.png';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const shots = await p.evaluate(() => {
    clearInterval(world.timer); world.adopt('bunny'); const [bo, bu] = world.cats, st = world.stage, cv = document.querySelector('#stage canvas') || document.querySelector('canvas');
    const put = (t, fx, fy) => { world.carrying = t; world.pointer.x = st.x + st.w * fx; world.pointer.y = world.floorTop + (st.y + st.h - world.floorTop) * fy; world.onDown(); return world.items.find(i => i.type === t); };
    const reset = () => { for (const c of world.cats) { c.setState('idle'); c.act = { kind: 'perch', T: 99999 }; c.x = st.x + 30; c.y = st.y + st.h - 10; } world.cmd('away'); for (const it of [...world.items]) if (!it.fixed && it.type !== 'pod') world.removeItem(it); world.pointer.inside = false; world.tool = null; world.laser.on = false; };
    const snap = (x, y, w, h, lab) => { world.render(); return [x, y, w, h, cv.toDataURL(), lab]; };
    const run = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); world.tick(); } };
    const S = [];
    // 1 ledge watch + pigeon
    reset(); world.scene.bird = null; world.scene.birdWait = 1; const L = world.items.find(i => i.type === 'ledge'); bo.placeInBed(L); bo.placedT = 0; bo.bedPlan = null; run(240); const gl = BZ.bedGeom(L, world.size); S.push(snap(gl.spot[0], gl.spot[1] - gl.rootPx + 10, 150, 100, 'ledge: watching the pigeon'));
    // 2 box periscope
    reset(); const bx = put('box', 0.5, 0.6); bu.placeInBed(bx); bu.placedT = 0; bu.bedPlan = null; run(120); S.push(snap(bx.x, bx.y + 8, 110, 90, 'box: periscope'));
    // 3 knead on pillow
    reset(); const pl = put('pillow', 0.4, 0.6); bo.placeInBed(pl); bo.placedT = 0; bo.bedPlan = null; run(40); S.push(snap(pl.x, pl.y + 8, 110, 90, 'pillow: biscuits'));
    // 4 burrowed under the blanket
    reset(); const bl = put('blanket', 0.45, 0.7); bu.placeInBed(bl); bu.placedT = 0; bu.bedPlan = { burrow: true, end1: 0, end2: 0, it: bl }; run(30); bl.lump && (bl.lump.peek = 50); run(5); S.push(snap(bl.x, bl.y + 10, 130, 80, 'blanket: a lump with ears'));
    // 5 both on the daybed
    reset(); const db = put('daybed', 0.45, 0.45); world.syncFixtures(); const seat = world.items.find(i => i.type === 'seat'); bo.placeInBed(db); bu.placeInBed(seat); for (const c of [bo, bu]) { c.placedT = 0; c.bedPlan = { end1: 0, end2: 0, it: c.bedItem }; c.napStyle = 'crescent'; c.needs.energy = 20; } run(400); S.push(snap(db.x, db.y + 8, 170, 110, 'daybed: room for two'));
    // 6 coffee table: Bo on top, Bunny lurking under
    reset(); const ct = put('ctable', 0.5, 0.5); bo.placeInBed(ct); bo.placedT = 0; bo.bedPlan = { end1: 0, end2: 0, it: ct }; bo.napStyle = 'loaf'; bu.setState('lurk'); bu.lurkAt = ct; bu.lurkPos = [ct.x + 10, ct.y - 4]; bu.lurkT = 9999; bu.x = ct.x + 10; bu.y = ct.y - 4; bu.arrived = true; run(160); S.push(snap(ct.x, ct.y + 8, 130, 100, 'coffee table: on top / under'));
    // 7 wall stretch
    reset(); bo.x = st.x + st.w * 0.45; bo.y = world.floorTop + 4; bo.setState('scratch'); bo.scr = { spot: [bo.x, bo.y], face: -Math.PI / 2 + 0.55, item: null, T: 9999 }; bo.arrived = true; run(70); S.push(snap(bo.x, bo.y + 8, 110, 110, 'wall stretch + scratch'));
    // 8 groom variants
    for (const gk of ['paw', 'cello', 'flank']) { reset(); bu.x = st.x + st.w * 0.5; bu.y = world.floorTop + 70; bu.theta = 0.4; bu.act = { kind: 'groom', T: 9999 }; bu.groomFor = bu.act; bu.groomKind = gk; run(gk === 'paw' ? 60 : 50); S.push(snap(bu.x, bu.y + 8, 100, 80, 'groom: ' + gk)); }
    // 9 belly-up roll
    reset(); bo.x = st.x + st.w * 0.5; bo.y = world.floorTop + 70; bo.setState('sunroll'); run(50); S.push(snap(bo.x, bo.y + 8, 110, 70, 'belly-up roll'));
    // 10 brushing: back strokes, elevator butt, fur
    reset(); bo.x = st.x + st.w * 0.5; bo.y = world.floorTop + 70; bo.theta = 0; world.cmd('carry', 'brush'); world.pointer.inside = true; run(90, (i) => { world.pointer.x = bo.x - 6 + Math.sin(i / 4) * 7; world.pointer.y = bo.y - 30; world.onMove(); }); S.push(snap(bo.x, bo.y + 8, 110, 90, 'brushing: elevator butt + fur'));
    // 11 Bunny belly up under the brush
    reset(); bu.x = st.x + st.w * 0.5; bu.y = world.floorTop + 70; world.cmd('carry', 'brush'); world.pointer.inside = true; bu.petBase = 'bellyup'; run(80, (i) => { world.pointer.x = bu.x + Math.sin(i / 4) * 6; world.pointer.y = bu.y - 10; world.onMove(); if (bu.state === 'petted') bu.petBase = 'bellyup'; }); S.push(snap(bu.x, bu.y + 8, 110, 80, 'Bunny: belly up for the brush'));
    // 12 feather wand leap
    reset(); bu.x = st.x + st.w * 0.5; bu.y = world.floorTop + 70; world.cmd('carry', 'wand'); world.pointer.inside = true; world.pointer.x = bu.x + 8; world.pointer.y = bu.y - 70; run(3); world.tick(); bu.setState('engage'); bu.eng = 'wand'; bu.interest.wand = 0.95; bu.noticed.wand = true; bu.mode = 'wall'; bu.modeT = 999; let best = null; run(120, (i) => { world.pointer.x = bu.x + 8 + Math.sin(i / 7) * 10; bu.interest.wand = 0.95; if (bu.mode !== 'wall') { bu.mode = 'wall'; bu.modeT = 999; } if (bu.hopY > 8 && !best) best = 1; }); S.push(snap(bu.x, bu.y + 8, 110, 120, 'feather wand: the leap'));
    // 13 batting the fern, 14 albo in the room
    reset(); const fe = put('fern', 0.5, 0.6); bo.x = fe.x - 34; bo.y = fe.y + 2; bo.setState('plantPlay'); bo.food = fe; bo.pp = { kind: BZ.PLANTS.fern, T: 9999 }; bo.needs.greens = 0; bo.arrived = true; bo.st = 70; run(40); S.push(snap(fe.x - 14, fe.y + 8, 120, 90, 'batting the fern'));
    reset(); const al = put('albo', 0.5, 0.4); bu.setState('lurk'); bu.lurkAt = al; bu.lurkPos = [al.x + 8, al.y - 4]; bu.lurkT = 9999; bu.x = al.x + 8; bu.y = al.y - 4; bu.arrived = true; run(60); S.push(snap(al.x, al.y + 8, 140, 130, 'albo: lurking behind it'));
    return S;
  });
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async (S) => { const C = 5, CW = 180, CH = 140, Sx = 2, o = document.getElementById('o'); o.width = C * CW * Sx; o.height = Math.ceil(S.length / C) * CH * Sx; const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#222'; g.fillRect(0, 0, o.width, o.height);
    for (let i = 0; i < S.length; i++) { const [x, y, w, h, url, lab] = S[i]; const im = new Image(); im.src = url; await im.decode(); const sc = Math.min(CW / w, (CH - 12) / h), X = (i % C) * CW * Sx, Y = Math.floor(i / C) * CH * Sx;
      g.drawImage(im, x - w / 2, y - h, w, h, X, Y + 12 * Sx, w * sc * Sx, h * sc * Sx); g.fillStyle = '#fff'; g.font = '20px monospace'; g.fillText(lab, X + 6, Y + 20); } }, shots);
  await (await p.$('#o')).screenshot({ path: out }); console.log(errs.join('\n') || 'no errors'); await b.close(); })();
