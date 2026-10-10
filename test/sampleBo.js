// contact sheet of real frames from a long sim: every awake, non-lying frame sample, labeled
const { chromium } = require('playwright');
(async () => { const out = process.argv[2] || 'test/sample.png', seed = +(process.argv[3] || 1);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  const info = await p.evaluate((seed) => {
    clearInterval(world.timer); world.adopt('bunny');
    const st = world.stage; const put = (t, fx, fy) => { world.carrying = t; world.pointer.x = st.x + st.w * fx; world.pointer.y = world.floorTop + fy; world.onDown(); };
    put('mouse', 0.4, 120); put('sun', 0.7, 60);
    const cv = document.querySelector('#stage canvas') || document.querySelector('canvas');
    const LY = ['loaf', 'sphinx', 'baguette', 'crescent', 'lounge', 'flop', 'tussle', 'pin', 'leap', 'sit', 'groom', 'knead', 'beg', 'eat', 'graze', 'stretch', 'held'];
    const shots = []; let n = 0;
    for (let i = 0; i < 24000 && shots.length < 12; i++) {
      if (i % 4000 === 1000) world.cmd('carry', 'laser');
      world.pointer.x = st.x + st.w * (0.5 + 0.35 * Math.sin(i / 70)); world.pointer.y = world.floorTop + 80 + 30 * Math.sin(i / 23); world.pointer.inside = (i % 4000) > 1000 && (i % 4000) < 2200;
      try { world.tick(); } catch (e) { return { err: e.message, i, cats: world.cats.map(c => ({ n: c.name, st: c.state, an: c.anim, g: c.gait, x: c.x, y: c.y, r: c.pose.rootY, bb: c.bbox, nanPose: Object.keys(c.pose).filter(k => typeof c.pose[k] === 'number' ? !isFinite(c.pose[k]) : Array.isArray(c.pose[k]) && c.pose[k].some(q => !isFinite(q))), nanSkel: c.skel && c.skel.pos.findIndex(v => v && v.some(q => !isFinite(q))), tailNaN: c.tail && c.tail.el.some(q => !isFinite(q)), theta: c.theta, mate: c.mate && c.mate.name, prev: c.prevSt })) }; }
      for (const c of world.cats) c.prevSt = c.state + '/' + c.anim;
      for (const c of world.cats) { if (c.name !== 'Bo' || c.state !== 'wander' || !c.gait) continue; if (++n % 61) continue; world.render(); shots.push([c.x, c.y, cv.toDataURL(), 'th' + c.theta.toFixed(2) + ' k' + (c.strideK||0).toFixed(2) + ' v' + (c.curV||0).toFixed(2) + ' s' + c.petScale.toFixed(2) + ' r' + c.pose.rootY.toFixed(1) + ' cl' + (c.clip ? 1 : 0)]); }
    }
    return { shots };
  }, seed);
  if (info.err) { console.log(JSON.stringify(info, null, 1)); await b.close(); return; }
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async ({ shots }) => { const W = 130, H = 100, S = 3, C = 4, o = document.getElementById('o'); o.width = W * C * S; o.height = H * Math.ceil(shots.length / C) * S; const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let i = 0; i < shots.length; i++) { const [x, y, url, lab] = shots[i]; const im = new Image(); im.src = url; await im.decode(); const X = (i % C) * W * S, Y = Math.floor(i / C) * H * S;
      g.drawImage(im, x - W / 2, y - H + 10, W, H, X, Y, W * S, H * S); g.fillStyle = '#000a'; g.fillRect(X, Y, W * S, 14); g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(lab, X + 3, Y + 11); } }, info);
  await (await p.$('#o')).screenshot({ path: out });
  console.log(info.shots.length, errs.join('\n') || 'no errors'); await b.close(); })();
