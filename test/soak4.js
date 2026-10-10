// yard + surfaces soak: node test/soak4.js [N] [yard|room]
const { chromium } = require('playwright');
(async () => { const N = +(process.argv[2] || 12000), where = process.argv[3] || 'yard';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  if (where === 'yard') { await p.click('.bo-seg button[data-scene="yard"]'); await p.waitForTimeout(300); }
  const r = await p.evaluate(([N, where]) => {
    clearInterval(world.timer); world.adopt('bunny');
    const st = world.stage, seen = {}, err = [];
    const put = (t, x, y) => { world.carrying = t; world.pointer.x = x; world.pointer.y = y; world.onDown(); };
    for (const s of world.surfaces()) put(['fern', 'yarn', 'succulent', 'mouse', 'pilea'][Math.floor(Math.random() * 5)], (s.x0 + s.x1) / 2, s.y - 6);
    put('box', st.x + st.w * 0.8, st.y + st.h * 0.8); put('pillow', st.x + st.w * 0.5, st.y + st.h * 0.9);
    if (where === 'yard') { world.cmd('carry', 'seed_catmint'); for (const pl of world.scene.plots) for (const [x, y] of pl.slots) { world.pointer.x = x; world.pointer.y = y; world.onDown(); world.onUp(); } world.cmd('carry', 'seed_catmint'); }
    for (let i = 0; i < N; i++) {
      const ph = i % 4000;
      if (where === 'yard') {
        if (ph === 500) world.cmd('carry', 'can'); if (ph > 500 && ph < 900) { world.pointer.x = st.x + st.w * (0.2 + 0.6 * ((i % 400) / 400)); world.pointer.y = world.floorTop + 30; world.pointer.inside = true; world.pointer.down = true; if (ph === 501) world.onDown(); world.onMove(); }
        if (ph === 900) { world.onUp(); world.cmd('carry', 'can'); }
        if (ph === 1500) { world.cmd('carry', 'trowel'); const sp = world.items.find((q) => q.type === 'sprout'); if (sp) { world.pointer.x = sp.x; world.pointer.y = sp.y - 3; world.onDown(); world.onUp(); } world.cmd('carry', 'trowel'); }
        if (ph === 2000) for (const it of world.items) if (it.type === 'sprout') it.g = (it.g || 0) + 200;
      }
      if (!(where === 'yard' && ph > 500 && ph < 900)) { world.pointer.x = st.x + st.w * (0.5 + 0.4 * Math.sin(i / 90)); world.pointer.y = world.floorTop - 30 + 120 * (0.5 + 0.5 * Math.sin(i / 41)); world.pointer.inside = (i % 3000) < 2000; world.onMove(); }
      try { world.tick(); } catch (e) { err.push(i + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1] + ' ' + world.cats.map(c => c.name + ':' + c.state + '/' + c.anim).join(' ')); if (err.length > 3) break; }
      for (const c of world.cats) { const k = c.state + (c.state === 'bed' && c.bedItem ? ':' + c.bedItem.type + (c.knock ? '!' : '') : '') + (c.state === 'engage' ? ':' + (c.eng || '').replace(/[0-9a-z]{4}$/, '') : '') + (c.state === 'plantPlay' && c.food ? ':' + (c.food.kind || c.food.type) : ''); seen[k] = (seen[k] || 0) + 1;
        if (!isFinite(c.x) || !isFinite(c.pose.hipY) || !isFinite(c.pose.headYaw)) { err.push(i + ' NaN ' + c.name + ' ' + c.state + '/' + c.anim); break; } }
    }
    const knocked = world.items.filter((i) => i.knocked).length, sprouts = world.items.filter((i) => i.type === 'sprout').map((i) => i.kind + i.stage).join(',');
    return { seen: Object.entries(seen).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + '=' + v).join('  '), err, knocked, sprouts };
  }, [N, where]);
  console.log(r.seen); console.log('knocked off:', r.knocked, '| garden:', r.sprouts); console.log('errors:', r.err.join('\n') || 'none'); console.log(errs.slice(0, 5).join('\n') || 'no page errors'); await b.close(); })();
