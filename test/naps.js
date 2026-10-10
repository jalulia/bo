const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { world.cats.slice(1).forEach(c => world.sendHome(c.id)); const bo = world.cats[0]; bo.x = world.stage.x + world.stage.w * 0.55; bo.y = world.stage.y + world.stage.h * 0.75; });
  const shots = [];
  for (const style of ['baguette', 'crescent', 'lounge', 'sphinx', 'loaf', 'graze', 'stand', 'sit']) {
    await p.evaluate((s) => { const bo = world.cats[0]; bo.x = world.stage.x + world.stage.w * 0.55; bo.y = world.stage.y + world.stage.h * 0.75; bo.theta = 0.15;
      if (['graze','stand','sit'].includes(s)) { bo.setState('show'); bo.anim = s; } else { bo.startNap(null, s); bo.napPhase = 'sleep'; bo.napLen = 1e9; bo.nextShift = 1e9; } }, style);
    await p.waitForTimeout(1300);
    const r = await p.evaluate(() => { const bo = world.cats[0]; return { x: world.stage.x * 2 + world.stage.w * 0.55 * 2 - 170, y: world.stage.y * 2 + world.stage.h * 0.75 * 2 - 190 }; });
    await p.screenshot({ path: `test/n-${style}.png`, clip: { x: r.x, y: r.y, width: 340, height: 220 } });
  }
  await b.close();
})();
