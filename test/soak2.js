const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n').slice(1,3).join(' ')));
  await p.goto('file://' + process.cwd() + '/web/desktop-bo.html'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    clearInterval(world.timer); world.render = () => {}; world.updateInteractive = () => {};
    const out = { adoptable: world.adoptable ? world.adoptable() : null };
    world.adopt('bunny');
    for (const t of ['sun', 'yarn', 'catnip', 'chair']) { world.carrying = t; world.pointer.x = world.stage.x + 80 + Math.random()*world.stage.w*0.6; world.pointer.y = world.floorTop + 40 + Math.random()*80; world.onDown(); }
    const brawlEv = {}, perPhase = {}, seen = {}, moods = {}, modes = {}, spin = {}, sunNap = { both: 0 }, track = {};
    for (const c of world.cats) { modes[c.name] = {}; spin[c.name] = 0; track[c.name] = { th: c.theta, x: c.x, y: c.y, acc: 0, n: 0 }; }
    for (let i = 0; i < 20000; i++) {
      world.pointer.x = world.stage.x + world.stage.w * (0.5 + 0.4 * Math.sin(i / 90)); world.pointer.y = world.floorTop + 60 + 30 * Math.sin(i / 37); world.pointer.inside = (i % 3000) < 900;
      if (i === 3000) world.cmd('carry', 'laser'); if (i === 7000) world.cmd('carry', 'laser');
      world.tick(); for (const c of world.cats) if (c.fight && c === c.fight.a) brawlEv[c.fight.phase] = (brawlEv[c.fight.phase] || 0) + 1;
      for (const c of world.cats) {
        seen[c.state] = (seen[c.state] || 0) + 1; const ph = i < 3000 ? 'a' : i < 7000 ? 'laser' : 'late'; (perPhase[c.name + ':' + ph] = perPhase[c.name + ':' + ph] || {})[c.state] = (perPhase[c.name + ':' + ph][c.state] || 0) + 1; moods[c.moodLabel] = (moods[c.moodLabel] || 0) + 1;
        if (i >= 3000 && i < 7000) { const k = c.state + (c.mode ? ':' + c.mode : ''); modes[c.name][k] = (modes[c.name][k] || 0) + 1; }
        const T = track[c.name]; T.acc += Math.abs(((c.theta - T.th + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); T.th = c.theta; T.n++;
        if (T.n === 90) { const moved = Math.hypot(c.x - T.x, c.y - T.y); if (T.acc > 2 * Math.PI && moved < 60) spin[c.name]++; T.acc = 0; T.n = 0; T.x = c.x; T.y = c.y; }
      }
      if (world.cats.every(c => c.asleep && world.inSun(c.x, c.y))) sunNap.both++;
    }
    // drop into pod
    const bo = world.cats[0], pod = world.items.find(i => i.type === 'pod');
    for (const it of world.items) if (it.occupant) it.occupant = null;
    bo.setState('idle'); world.heldCat = bo; bo.setState('held');
    const g = BZ.bedGeom(pod, world.size); world.pointer.x = g.spot[0]; world.pointer.y = g.spot[1] - 20; world.tick(); world.onUp();
    for (let i = 0; i < 120; i++) world.tick();
    out.drop = bo.state + ' inBed=' + !!bo.inBed + ' anim=' + bo.anim + ' label=' + bo.moodLabel;
    return Object.assign(out, { brawlEv, perPhase, seen, moods, modes, spin, sunNap, rels: world.rels, needs: world.cats.map(c => c.name + ' ' + JSON.stringify(c.needs, (k, v) => typeof v === 'number' ? Math.round(v) : v)) });
  });
  console.log(JSON.stringify(r, null, 1)); console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close();
})();
