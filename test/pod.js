const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + e.stack));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html');
  await p.waitForTimeout(800);
  await p.evaluate(() => { world.cats.splice(1); const bo = world.cats[0]; const pod = world.scene.pod; bo.x = pod.front[0] + 60; bo.y = pod.front[1]; pod.occupant = bo.id; bo.setState('toPod'); });
  for (let i = 0; i < 25; i++) { await p.waitForTimeout(700); const s = await p.evaluate(() => world.cats[0].state); if (s === 'pod') break; }
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => { const e = document.getElementById('stage').getBoundingClientRect(); return [e.left, e.top, e.width, e.height]; });
  await p.screenshot({ path: 'test/pod.png', clip: { x: r[0], y: r[1], width: r[2], height: r[3] } });
  console.log(await p.evaluate(() => world.cats.map(c => c.name + ':' + c.state)), errs.join('\n') || 'no errors'); await b.close();
})();
