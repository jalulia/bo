const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    clearInterval(world.timer); world.adopt('bunny');
    const [bo, bu] = world.cats, st = world.stage; bo.x = st.x + st.w * 0.45; bo.y = world.floorTop + 90; bu.x = bo.x + 120; bu.y = bo.y + 6;
    bo.setState('idle'); bo.mood.play = 0.9; bo.needs.energy = 80; bu.needs.energy = 90;
    bu.setState('brawl'); bu.fight = { a: bu, b: bo, phase: 'approach', t: 0, rounds: 2 }; bu.mate = bo;
    const cv = document.querySelector('#stage canvas') || document.querySelector('canvas'); const shots = [], log = [];
    for (let i = 0; i < 400 && shots.length < 24; i++) { world.tick(); if (bu.fight && bu.fight.phase !== 'approach' && i % 5 === 0) { world.render(); shots.push([(bo.x + bu.x) / 2, Math.max(bo.y, bu.y), cv.toDataURL()]); log.push(bu.fight.phase + ':' + bo.anim + '/' + bu.anim); } }
    return { shots, log };
  });
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async ({ shots }) => { const W = 150, H = 100, o = document.getElementById('o'); o.width = W * 6 * 2; o.height = H * Math.ceil(shots.length / 6) * 2; const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let i = 0; i < shots.length; i++) { const [x, y, url] = shots[i]; const im = new Image(); im.src = url; await im.decode(); g.drawImage(im, x - W / 2, y - H + 14, W, H, (i % 6) * W * 2, Math.floor(i / 6) * H * 2, W * 2, H * 2); } }, info);
  await (await p.$('#o')).screenshot({ path: 'test/brawl.png' });
  console.log(info.log.join(' | ')); console.log(errs.join('\n') || 'no errors'); await b.close(); })();
