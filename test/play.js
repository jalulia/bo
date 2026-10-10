const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.waitForTimeout(4000);
  await p.screenshot({ path: 'test/play1.png' });
  const st = () => p.evaluate(() => world.cats.map(c => c.name + ':' + c.state + '/' + c.anim + ' ' + c.mood).join(' | '));
  console.log(await st());
  // force naps of every style on Bo, screenshot each
  for (const style of ['baguette', 'crescent', 'lounge', 'sphinx', 'loaf']) {
    await p.evaluate((s) => { const bo = world.cats[0]; bo.startNap(null, s); bo.napPhase = 'sleep'; bo.napLen = 1e9; bo.nextShift = 1e9; }, style);
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `test/nap-${style}.png` });
  }
  // grass
  await p.evaluate(() => { const bo = world.cats[0]; bo.startGraze('grass'); });
  for (let i = 0; i < 15; i++) { await p.waitForTimeout(800); const s = await p.evaluate(() => world.cats[0].state + ':' + world.cats[0].arrived); if (s.startsWith('graze:true')) break; }
  await p.waitForTimeout(1500); console.log('graze', await st()); await p.screenshot({ path: 'test/graze.png' });
  // pod
  await p.evaluate(() => { const bo = world.cats[0]; const pod = world.items.find(i => i.type === 'pod'); pod.occupant = bo.id; bo.setState('toPod'); pod.occupant = bo.id; });
  for (let i = 0; i < 25; i++) { await p.waitForTimeout(800); const s = await p.evaluate(() => world.cats[0].state); if (s === 'pod') break; }
  await p.waitForTimeout(2500); console.log('pod', await st()); await p.screenshot({ path: 'test/pod.png' });
  // carry + place catnip via panel click then click in stage
  await p.click('.bo-tile[title^="Catnip"]'); await p.mouse.move(500, 600); await p.waitForTimeout(200); await p.mouse.click(500, 600);
  await p.waitForTimeout(300); console.log('items', await p.evaluate(() => world.items.map(i => i.type).join(',')));
  // roam mode
  await p.click('.bo-seg button[data-mode="roam"]'); await p.waitForTimeout(2500); await p.screenshot({ path: 'test/roam.png' });
  console.log(await st());
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
