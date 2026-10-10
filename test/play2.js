const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(() => { world.adopt('bunny'); world.cmd && 0; });
  await p.waitForTimeout(500);
  // sunbeam + both napping in it
  await p.evaluate(() => {
    world.carrying = 'sun'; const st = world.stage; world.pointer.x = st.x + st.w * 0.35; world.pointer.y = world.floorTop + 70; world.onDown();
    const [bo, bu] = world.cats; bo.needs.energy = 20; bu.needs.energy = 30;
    const sp = world.sunSpots().find(s => s.item); const sl = sp.slots;
    bo.x = sl[0][0]; bo.y = sl[0][1]; bo.startNap(sl[0], 'flop'); bo.napPhase = 'sleep'; bo.napLen = 1e9;
    bu.x = sl[0][0] + 30; bu.y = sl[0][1] + 2; bu.startNap(null); 
  });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(700); const s = await p.evaluate(() => world.cats.map(c => c.state + '/' + c.napPhase + '/' + c.anim).join(' ')); if (/sleep.*sleep/.test(s)) break; }
  await p.waitForTimeout(1500); await p.screenshot({ path: 'test/p-sun.png' });
  console.log(await p.evaluate(() => world.cats.map(c => c.name + ':' + c.state + '/' + c.anim + ' ' + c.moodLabel + ' sun=' + world.inSun(c.x, c.y)).join(' | ')));
  // hold Bunny over the pod
  await p.evaluate(() => { const bu = world.cats[1]; bu.setState('idle'); world.heldCat = bu; bu.setState('held'); const pod = world.items.find(i => i.type === 'pod'); const g = BZ.bedGeom(pod, world.size); world.pointer.x = g.spot[0]; world.pointer.y = g.spot[1] - 20; });
  await p.waitForTimeout(600); await p.screenshot({ path: 'test/p-hold.png' });
  await p.evaluate(() => world.onUp()); await p.waitForTimeout(3500); await p.screenshot({ path: 'test/p-drop.png' });
  console.log(await p.evaluate(() => world.cats.map(c => c.name + ':' + c.state + '/' + c.anim + ' ' + c.moodLabel).join(' | ')));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
