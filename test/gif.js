// gameplay GIFs: node test/gif.js <scenario> <out.gif>   scenarios: doors | garden | knock | swing | cubby
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
(async () => { const [sc, out] = [process.argv[2], process.argv[3]]; const tmp = fs.mkdtempSync('/tmp/gif-');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const setup = await p.evaluate((sc) => {
    clearInterval(world.timer); world.adopt('bunny'); const [bo, bu] = world.cats, st = world.stage, P = world.pointer;
    const rest = (c, x, y, th) => { c.x = x; c.y = y; c.theta = th || 0; c.setState('idle'); c.act = { kind: 'perch', T: 99999 }; };
    window.__crop = [st.x, st.y, st.w, st.h]; window.__scale = 2; window.__script = () => {};
    if (sc === 'doors') { world.cmd('scene', 'yard'); world.scene.bflies.length = 0; for (let i = 0; i < 3; i++) world.tick(); }
    if (sc === 'garden') { world.cmd('scene', 'yard'); for (const c of world.cats) c.hidden = false; for (let i = 0; i < 200; i++) world.tick();
      const pl = world.scene.plots.find((q) => q.key === 'lawnBed'), gg = world.items.find((i) => i.kind === 'catgrass');
      rest(bu, st.x + st.w * 0.62, st.y + st.h * 0.86, Math.PI); bo.setState('plantPlay'); bo.food = gg; bo.pp = { kind: BZ.GARDEN.catgrass, T: 9999 }; bo.needs.greens = 90; bo.x = gg.x - 34; bo.y = gg.y + 2; bo.arrived = true;
      window.__crop = [pl.cx - 100, pl.cy - 70, 220, 112]; window.__scale = 2.5; bu.x = pl.cx + 60; bu.y = pl.cy + 14; bo.x = pl.cx - 200; bo.setState('idle'); bo.act = { kind: 'loaf', T: 99999 }; bu.act = { kind: 'perch', T: 99999 };
      const free = pl.slots.map((s, i) => [s, i]).filter(([s, i]) => !world.items.some((q) => q.type === 'sprout' && q.plot === pl.key && q.slot === i));
      let f = 0; window.__script = () => { f++; P.inside = true;
        if (f === 1) world.cmd('carry', 'seed_poppy'); const k = Math.floor((f - 1) / 26);
        if (f < 26 * Math.min(3, free.length) + 1 && free[k]) { const [s] = free[k], u = ((f - 1) % 26) / 26; P.x = s[0] - 30 * (1 - u); P.y = s[1] - 20 * (1 - u); world.onMove(); if ((f - 1) % 26 === 24) { world.onDown(); world.onUp(); } }
        if (f === 82) { world.cmd('carry', 'seed_poppy'); world.cmd('carry', 'can'); }
        if (f > 84 && f < 150) { P.x = pl.cx - 50 + (f - 84) * 1.4; P.y = pl.cy - 26; world.onMove(); if (f === 86) { P.down = true; world.onDown(); } }
        if (f === 150) { world.onUp(); P.down = false; world.cmd('carry', 'can'); }
        if (f > 150) { for (const it of world.items) if (it.type === 'sprout' && it.plot === 'lawnBed') it.g = Math.min(400, (it.g || 0) + 3); } }; }
    if (sc === 'knock') { const T = world.items.find((i) => i.type === 'ctable'), sf = world.surfaces().find((q) => q.key === 'ctable');
      bo.placeInBed(T); bo.placedT = 0; bo.bedPlan = { end1: 0, end2: 0, it: T }; bo.napStyle = 'loaf'; bo.st = 70;
      world.carrying = 'pilea'; P.x = bo.x + 22; P.y = sf.y - 6; world.onDown(); rest(bu, T.x + 70, T.y + 30, Math.PI);
      window.__crop = [T.x - 80, T.y - 90, 190, 130]; window.__scale = 3; P.x = T.x - 60; P.y = T.y + 40; P.inside = true;
      let f = 0; window.__script = () => { f++; if (f === 8) { const it = world.items.find((i) => i.surf === 'ctable'); bo.knock = { it, t: 0, side: it.x < bo.x ? -1 : 1 }; } }; }
    if (sc === 'sweaters') { world.removeItem(world.items.find((i) => i.type === 'pod')); world.carrying = 'lamptable'; P.x = st.x + st.w * 0.3; P.y = st.y + st.h * 0.66; world.onDown(); const lt = world.items.find((i) => i.type === 'lamptable'), seat = world.items.find((i) => i.type === 'seat' && i.parent === lt);
      rest(bo, lt.x - 34, lt.y + 22, 0.2); rest(bu, lt.x + 42, lt.y + 26, Math.PI - 0.3); world.cmd('carry', 'sweater'); P.inside = true;
      window.__crop = [lt.x - 85, lt.y - 105, 190, 145]; window.__scale = 3;
      let f = 0; window.__script = () => { f++; const tgt = f < 40 ? bo : bu; P.x = tgt.x + 2; P.y = tgt.y - 16; world.onMove();
        if (f === 14) world.dress(bo); if (f === 44) world.dress(bu); if (f === 60) world.cmd('carry', 'sweater');
        if (f === 64) { lt.occupant = bo.id; bo.setState('toBed'); bo.bedItem = lt; } if (f === 80) { seat.occupant = bu.id; bu.setState('toBed'); bu.bedItem = seat; } }; }
    if (sc === 'juno') { world.cmd('scene', 'yard'); for (const c of world.cats) c.hidden = false; const Y = world.scene; for (let i = 0; i < 40; i++) world.tick();
      rest(bo, st.x + st.w * 0.62, st.y + st.h * 0.7, Math.PI); rest(bu, st.x + st.w * 0.7, st.y + st.h * 0.85, 0.3); Y.dog.x = Y.dogHome[0] + 20; Y.dog.y = Y.dogHome[1] + 10; Y.dog.st = 'rest'; Y.dog.t = 340; Y.dog.T = 9999; Y.dog.anim = 'chin'; Y.dog.cool = 0; Y.birdWait = 1e9; Y.squirrel = null; Y.sqWait = 24;
      window.__crop = [st.x, st.y + Y.F - 60, Math.min(st.w, 300), 170]; window.__scale = 3; }
    if (sc === 'swing') { world.cmd('scene', 'yard'); for (const c of world.cats) c.hidden = false; for (let i = 0; i < 60; i++) world.tick();
      const T = world.items.find((i) => i.type === 'tire'); bu.placeInBed(T); bu.placedT = 0; bu.bedPlan = { watch: 0, end1: 0, end2: 0, it: T }; bu.napStyle = 'loaf'; T.ang = 0.14; T.av = 0; for (const c of world.cats) c.hidden = false;
      const A = world.items.find((i) => i.type === 'adk'), S = world.items.find((i) => i.type === 'seat' && i.parent === A); bo.placeInBed(A); bo.placedT = 0; bo.bedPlan = { end1: 0, end2: 0, it: A }; bo.napStyle = 'dangle'; bo.st = 300;
      window.__crop = [T.x - 70, st.y + 6, 220, Math.min(st.h - 6, A.y - st.y + 30)]; window.__scale = 3; }
    if (sc === 'cubby') { const cub = world.items.find((i) => i.type === 'cubby'); bo.placeInBed(cub); bo.placedT = 0; bo.bedPlan = { end1: 0, end2: 0, it: cub }; bo.napStyle = 'dangle'; bo.st = 200;
      world.carrying = 'blanket'; P.x = cub.x + 70; P.y = cub.y + 40; world.onDown(); const bl = world.items.find((i) => i.type === 'blanket'); bu.placeInBed(bl); bu.placedT = 0; bu.bedPlan = { burrow: true, end1: 0, end2: 0, it: bl }; bu.st = 50;
      window.__crop = [cub.box.x0 - 70, cub.box.y0 - 40, 230, 130]; window.__scale = 3; let f = 0; window.__script = () => { f++; if (f % 60 === 30 && bl.lump) bl.lump.peek = 45; }; }
    window.__grab = () => { const [x, y, w, h] = window.__crop.map(Math.round), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(world.cv, x, y, w, h, 0, 0, w, h); return c.toDataURL('image/png'); };
    return 'ok';
  }, sc);
  const N = { doors: 120, garden: 190, knock: 110, swing: 120, cubby: 120, sweaters: 150, juno: 170 }[sc] || 120;
  for (let i = 0; i < N; i++) { const url = await p.evaluate(() => { window.__script(); world.tick(); window.__script(); world.tick(); return window.__grab(); }); fs.writeFileSync(path.join(tmp, String(i).padStart(4, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64')); }
  const sc2 = await p.evaluate(() => window.__scale); await b.close();
  execSync(`ffmpeg -v error -y -framerate 15 -i ${tmp}/%04d.png -vf "scale=iw*${sc2}:ih*${sc2}:flags=neighbor,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none" -loop 0 ${out}`);
  console.log(setup, out, fs.statSync(out).size); })();
