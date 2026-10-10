const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n').slice(1,3).join(' ')));
  await p.goto('file://' + process.cwd() + '/web/desktop-bo.html'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    clearInterval(world.timer); const R = world.render.bind(world); world.render = () => {}; world.updateInteractive = () => {};
    world.adopt('tortie'); world.adopt('redwhite');
    for (const t of ['catnip','spider','yarn','bowl']) { world.carrying = t; world.pointer.x = world.stage.x + 80 + Math.random()*world.stage.w*0.6; world.pointer.y = world.floorTop + 40 + Math.random()*80; world.onDown(); }
    const seen = {}, moods = {};
    for (let i = 0; i < 15000; i++) {
      world.pointer.x = world.stage.x + world.stage.w * (0.5 + 0.4 * Math.sin(i / 300)); world.pointer.y = world.floorTop + 60; world.pointer.inside = i % 2000 < 1000;
      if (i === 5000) world.cmd('carry', 'laser'); if (i === 6500) world.cmd('carry', 'laser');
      if (i === 8000) world.call();
      world.tick();
      for (const c of world.cats) { seen[c.state] = (seen[c.state] || 0) + 1; moods[c.mood] = (moods[c.mood] || 0) + 1; }
    }
    return { seen, moods: Object.keys(moods), needs: world.cats.map(c => c.name + ' ' + JSON.stringify(c.needs, (k, v) => typeof v === 'number' ? Math.round(v) : v)), items: world.items.map(i => i.type + ':' + (i.servings ?? '')) };
  });
  console.log(JSON.stringify(r, null, 1)); console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close();
})();
