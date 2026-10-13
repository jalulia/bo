// Art-directed gameplay GIFs by time of day: node test/gifs2.js <scenario> <out.gif>
// room: dawn-room (full) | day-laser | dusk-cubby | night-lamp      yard: day-yard (full) | dawn-feeder | dusk-doors | night-yard
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
(async () => { const [sc, out] = [process.argv[2], process.argv[3]]; const tmp = fs.mkdtempSync('/tmp/gif2-');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const setup = await p.evaluate((sc) => {
    clearInterval(world.timer); world.adopt('bunny'); const [bo, bu] = world.cats, st = world.stage, P = world.pointer, SZ = world.size;
    const HOUR = { 'dawn-room': 6.6, 'day-laser': 11, 'dusk-cubby': 18.4, 'night-lamp': 22, 'day-yard': 13, 'dawn-feeder': 7, 'dusk-doors': 19, 'night-yard': 22.5 }[sc];
    BZ.hourOverride = HOUR;
    const rest = (c, x, y, th, kind) => { c.x = x; c.y = y; c.theta = th || 0; c.setState('idle'); c.act = { kind: kind || 'perch', T: 99999 }; };
    const bed = (c, it, style, st) => { it.occupant = c.id; c.placeInBed(it); c.placedT = 0; c.bedPlan = { end1: 0, end2: 0, it }; c.napStyle = style || 'loaf'; c.st = st || 200; };
    const find = (t) => world.items.find((i) => i.type === t);
    const put = (type, x, y) => { world.carrying = type; P.x = st.x + x; P.y = st.y + y - 6; world.onDown(); return find(type); };
    const settle = (n) => { for (let i = 0; i < n; i++) world.tick(); };
    window.__crop = [st.x, st.y, st.w, st.h]; window.__scale = 2; window.__script = () => {}; P.inside = false;
    const room = sc.endsWith('room') || sc === 'day-laser' || sc === 'dusk-cubby' || sc === 'night-lamp';
    if (room) { // the living room, furnished: the lamp table, the floral chair, the dragonfly chair, the orchid on the sill, Juno on the daybed
      world.removeItem(find('grass')); const pod = find('pod'); pod.x = st.x + 58; pod.y = st.y + 256;
      put('lamptable', 372, 250); put('floral', 100, 320); put('dfly', 326, 324); put('grass', 240, 344); put('orchid', 293, world.scene.win.y1 + 2);
      world.scene.paint(); const J = world.scene.dog; settle(60);
      const DB = find('daybed'), SEAT = world.items.find((i) => i.type === 'seat' && i.parent === DB), DF = find('dfly'), FL = find('floral'), LT = find('lamptable'), LS = world.items.find((i) => i.type === 'seat' && i.parent === LT), CUB = find('cubby');
      if (sc === 'dawn-room') { // full frame: first light. Bo asleep in the dragonfly chair, an arm over the edge; Bunny on the sill as the pigeon lands; Juno lifts her head to it
        bed(bo, DF, 'dangle', 400); const L = world.items.find((i) => i.type === 'ledge' && i.key === 'ledgeL'); bed(bu, L, 'loaf', 100); bu.bedPlan = { watch: 9999, end1: 0, end2: 0, it: L };
        J.st = 'doze'; J.t = 100; J.T = 9999; J.anim = 'chin'; for (let i = 0; i < 40; i++) J.animate(); world.scene.birdWait = 1e9;
        let f = 0; window.__script = () => { f++; if (f === 80) world.scene.birdWait = 1; };
      }
      if (sc === 'day-laser') { // the laser over the rug: Bunny chases, Bo keeps her seat in the floral chair and watches
        bed(bo, FL, 'loaf', 60); bo.bedPlan = { watch: 9999, end1: 0, end2: 0, it: FL }; rest(bu, st.x + 250, st.y + 300, Math.PI); bu.excitement = 80; bu.needs.energy = 95;
        J.st = 'watch'; J.t = 10; J.T = 9999; world.cmd('carry', 'laser'); window.__crop = [st.x + 50, st.y + 215, 300, 140]; window.__scale = 2.5;
        let f = 0; window.__script = () => { f++; P.inside = true; const u = f / 240 * Math.PI * 2; P.x = st.x + 200 + Math.sin(u * 2) * 95; P.y = st.y + 300 + Math.cos(u) * 28; world.onMove(); };
      }
      if (sc === 'dusk-cubby') { // dusk: Bo in the felt cube with an arm hanging out; Bunny under the blanket in front, peeking
        bed(bo, CUB, 'dangle', 200); const bl = put('blanket', CUB.x + 62, CUB.y + 30); bed(bu, bl, 'crescent', 50); bu.bedPlan = { burrow: true, end1: 0, end2: 0, it: bl };
        J.st = 'doze'; J.t = 100; J.T = 9999; window.__crop = [CUB.box.x0 - 30, CUB.box.y0 - 6, 236, 126]; window.__scale = 3;
        let f = 0; window.__script = () => { f++; if (f % 70 === 40 && bl.lump) bl.lump.peek = 45; };
      }
      if (sc === 'night-lamp') { // night: the lamp's pool of light, both cats up on the table, Bo in her sweater; a hand on Bo
        world.dress(bo); bed(bu, LS, 'crescent', 100); bu.needs.energy = 10; bu.napLen = 99999; bu.nextShift = 99999; rest(bo, LT.x - 40 * SZ, LT.y + 26, Math.PI / 2 + 0.2, 'stare'); J.st = 'sleep'; J.t = 10; J.T = 9999; J.anim = 'sleep';
        window.__crop = [st.x + 236, st.y + 150, 200, 134]; window.__scale = 3;
        let f = 0; window.__script = () => { f++;
          if (f === 90) { P.inside = true; P.x = bo.screen[BZ.IDX.head][0] + 40; P.y = bo.screen[BZ.IDX.head][1] + 30; }
          if (f > 90 && f < 260) { const u = Math.min(1, (f - 90) / 30), H = bo.screen[BZ.IDX.head]; P.x = H[0] + 40 * (1 - u) + Math.sin(f * 0.35) * 6 * u; P.y = H[1] + 30 * (1 - u) - 4 * u + (f & 1); world.onMove(); if (f === 122) world.onDown(); }
          if (f === 260) { world.onUp(); P.inside = false; } };
      }
    } else {
      world.cmd('scene', 'yard'); for (const c of world.cats) c.hidden = false; const Y = world.scene, J = Y.dog, T = Y.tree, X = st.x, Yo = st.y; Y.paint(); settle(sc === 'dusk-doors' ? 0 : 160);
      const kinds = Y.birdKinds(), kind = (k) => kinds.find((q) => q.k === k) || kinds[0], slots = Y.birdSlots(), slot = (k, i) => slots.filter((s) => s.k === k)[i || 0];
      const land = (k, sk, si, key) => { const K = kind(k), S = slot(sk, si); if (!K || !S) return; Y.birds.push({ kind: K, slot: S, st: 'perch', t: 0, x: S.x, y: S.y, stay: 4000, f: S.f, k: key, hop: 0 }); };
      const raid = () => { Y.squirrel = { st: 'down', x: T.x + 4, y: 30, t: 0, gx: Y.feeder.x - 2, gy: Y.feeder.base + 4 }; };
      const ADK = world.items.find((i) => i.type === 'adk'), TIRE = world.items.find((i) => i.type === 'tire'), DOGBED = world.items.find((i) => i.type === 'dogbed');
      if (sc === 'day-yard') { // full frame, midday: Bunny in the tire swing, Bo grazing the cat grass, birds at the feeder, Juno watching; then the squirrel raids and everyone reacts
        const pl = Y.plots.find((q) => q.key === 'lawnBed'), sl = pl.slots[2]; const gg = Object.assign(BZ.newItem('sprout', sl[0], sl[1]), { kind: 'catgrass', plot: pl.key, slot: 2, g: 9999, water: 0.8, stage: 3, servings: 9 }); world.items.push(gg); BZ.growSprout(gg, world);
        const pp = Y.plots.find((q) => q.key === 'wallBed'); [['poppy', 1], ['lavender', 3]].forEach(([k, i]) => { const s = pp.slots[i], it = Object.assign(BZ.newItem('sprout', s[0], s[1]), { kind: k, plot: pp.key, slot: i, g: 9999, water: 0.8, stage: 3 }); world.items.push(it); BZ.growSprout(it, world); });
        bed(bu, TIRE, 'loaf', 200); TIRE.ang = 0.12; TIRE.av = 0;
        bo.setState('plantPlay'); bo.food = gg; bo.pp = { kind: BZ.GARDEN.catgrass, T: 9999 }; bo.needs.greens = 90; bo.x = gg.x - 30 * SZ; bo.y = gg.y + 3; bo.arrived = true; bo.theta = 0;
        land('cardinal', 'tray', 0, 'c1'); land('chickadee', 'side', 1, 'c2'); land('robin', 'lawn', 1, 'c3'); Y.birdWait = 1e9; Y.sqWait = 1e9;
        J.st = 'watch'; J.t = 10; J.T = 9999; J.look = [bo.x, bo.y - 20];
        let f = 0; window.__script = () => { f++; if (f === 150) raid(); };
      }
      if (sc === 'dawn-feeder') { // dawn at the tree line: cardinals and a chickadee at the feeder, a robin on the lawn, Bo watching from the chair; the squirrel comes down and they scatter
        const PT = world.items.find((i) => i.key === 'potTop'); bed(bo, PT, 'loaf', 100); bo.bedPlan = { watch: 9999, end1: 0, end2: 0, it: PT }; rest(bu, X + Y.S + 150, Yo + Y.F + 120, Math.PI);
        land('cardinal', 'tray', 0, 'c1'); land('cardinalF', 'ground', 1, 'c2'); land('chickadee', 'side', 0, 'c3'); land('robin', 'lawn', 0, 'c4'); Y.birdWait = 1e9; Y.sqWait = 1e9;
        J.st = 'doze'; J.t = 100; J.T = 9999; J.anim = 'chin';
        window.__crop = [X + T.x + 8, Yo + Y.F - 108, 236, 128]; window.__scale = 2.5;
        let f = 0; window.__script = () => { f++; if (f === 50) raid(); if (f === 30 || f === 90) { const r = Y.birds.find((q) => q.k === 'c4'); if (r) { r.hop = 8; r.hx = 10; } } if (Y.squirrel && Y.squirrel.st === 'sit') { bo.lookAt = [X + Y.squirrel.x, Yo + Y.squirrel.y - 4]; if (f % 30 === 0) bo.say('chatter'); } };
      }
      if (sc === 'dusk-doors') { // dusk: the porch light comes on; the cats come out through the French doors one after the other; Bo takes the steps
        J.st = 'watch'; J.t = 10; J.T = 9999; Y.birdWait = 1e9; Y.sqWait = 1e9; Y.bflies.length = 0; bo.enterDelay = 10; bu.enterDelay = 70;
        window.__crop = [X + Y.S + 64, Yo + Y.F - 76, 176, 136]; window.__scale = 3;
        const stoop = world.items.find((i) => i.type === 'stoop'); let f = 0; window.__script = () => { f++; if (f === 170 && !bo.inBed && bo.state !== 'toBed') { stoop.occupant = bo.id; bo.setState('toBed'); bo.bedItem = stoop; } };
      }
      if (sc === 'night-yard') { // night: fireflies over the lawn, Juno asleep, Bunny curled against her, Bo in the Adirondack with an arm over the edge, the studio windows lit
        bed(bo, ADK, 'dangle', 500); bed(bu, DOGBED, 'crescent', 500); J.st = 'sleep'; J.t = 10; J.T = 9999; J.anim = 'sleep'; J.hadCat = true; Y.birdWait = 1e9; Y.sqWait = 1e9;
        for (let i = 0; i < 40; i++) J.animate(); window.__crop = [X + 4, Yo + Y.F - 6, 236, 128]; window.__scale = 2.5;
        let f = 0; window.__script = () => { f++; if (f === 200) { P.inside = true; } if (f > 200 && f < 330) { const u = Math.min(1, (f - 200) / 30), H = J.screen.head; P.x = H[0] + 30 * (1 - u) + Math.sin(f * 0.4) * 5 * u; P.y = H[1] + 24 * (1 - u) - 2 * u; world.onMove(); if (f === 236) world.onDown(); } if (f === 330) { world.onUp(); P.inside = false; } };
      }
    }
    window.__grab = () => { const [x, y, w, h] = window.__crop.map(Math.round), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(world.cv, x, y, w, h, 0, 0, w, h); return c.toDataURL('image/png'); };
    return 'ok ' + sc + ' hour ' + HOUR;
  }, sc);
  const N = { 'dawn-room': 110, 'day-laser': 140, 'dusk-cubby': 130, 'night-lamp': 150, 'day-yard': 150, 'dawn-feeder': 140, 'dusk-doors': 150, 'night-yard': 170 }[sc] || 130;
  for (let i = 0; i < N; i++) { const url = await p.evaluate(() => { window.__script(); world.tick(); window.__script(); world.tick(); return window.__grab(); }); fs.writeFileSync(path.join(tmp, String(i).padStart(4, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64')); if (process.env.TRACE && i % 20 === 0) console.log(i, await p.evaluate(() => world.cats.map((c) => c.name + ':' + c.state + (c.inBed ? '/' + c.inBed.type : '') + '@' + Math.round(c.x) + ',' + Math.round(c.y)).join(' ') + ' J:' + world.scene.dog.st + '/' + world.scene.dog.anim + ' birds:' + ((world.scene.birds || []).length) + (world.scene.bird ? ' pigeon:' + world.scene.bird.st : ''))); }
  const sc2 = await p.evaluate(() => window.__scale); await b.close();
  execSync(`ffmpeg -v error -y -framerate 15 -i ${tmp}/%04d.png -vf "scale=iw*${sc2}:ih*${sc2}:flags=neighbor,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none" -loop 0 ${out}`);
  console.log(setup, out, fs.statSync(out).size); })();
