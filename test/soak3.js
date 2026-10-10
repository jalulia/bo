const { chromium } = require('playwright');
(async () => { const N = +(process.argv[2] || 24000), mode = process.argv[3] || 'habitat';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  if (mode === 'roam') { await p.click('.bo-seg button[data-mode="roam"]'); await p.waitForTimeout(800); }
  const r = await p.evaluate((N) => {
    clearInterval(world.timer); world.adopt('bunny');
    const st = world.stage; const put = (t, fx, fy) => { world.carrying = t; world.pointer.x = st.x + st.w * fx; world.pointer.y = world.floorTop + (st.y + st.h - world.floorTop) * fy; world.onDown(); };
    put('daybed', 0.3, 0.25); put('ctable', 0.62, 0.55); put('box', 0.85, 0.75); put('pillow', 0.15, 0.85); put('blanket', 0.45, 0.85); put('albo', 0.92, 0.3); put('fern', 0.1, 0.4); put('cactus', 0.7, 0.9); put('lavender', 0.3, 0.6); put('silvervine', 0.55, 0.3); put('sun', 0.5, 0.5); put('mouse', 0.4, 0.6); put('fiddle', 0.05, 0.6);
    const seen = {}, err = [];
    for (let i = 0; i < N; i++) {
      const ph = i % 6000;
      if (ph === 1000) world.cmd('carry', 'brush'); if (ph === 2000) world.cmd('carry', 'wand'); if (ph === 3000) world.cmd('carry', 'wand'); if (ph === 4000) world.cmd('carry', 'laser'); if (ph === 4800) world.cmd('carry', 'laser');
      const tgt = world.cats[(i >> 8) & 1];
      if (ph > 1000 && ph < 2000 && tgt) { world.pointer.x = tgt.x + Math.sin(i / 6) * 8; world.pointer.y = tgt.y - 18; world.pointer.inside = true; world.onMove(); }
      else { world.pointer.x = st.x + st.w * (0.5 + 0.4 * Math.sin(i / 90)); world.pointer.y = world.floorTop - 30 + 120 * (0.5 + 0.5 * Math.sin(i / 41)); world.pointer.inside = (i % 3000) < 2000; world.onMove(); }
      try { world.tick(); } catch (e) { err.push(i + ' ' + e.message + ' ' + world.cats.map(c => c.name + ':' + c.state + '/' + c.anim).join(' ')); if (err.length > 3) break; }
      for (const c of world.cats) { const k = c.state + (c.state === 'bed' && c.bedItem ? ':' + c.bedItem.type + (c.burrowed ? '*' : '') : '') + (c.state === 'engage' ? ':' + c.mode : ''); seen[k] = (seen[k] || 0) + 1;
        if (!isFinite(c.x) || !isFinite(c.pose.hipY) || !isFinite(c.pose.headYaw)) { err.push(i + ' NaN ' + c.name + ' ' + c.state + '/' + c.anim); } }
    }
    return { seen: Object.entries(seen).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + '=' + v).join('  '), err, fx: world.fx.length, scratches: (world.items.find(i => i.type === 'box') || {}).scratches };
  }, N);
  console.log(r.seen); console.log('errors:', r.err.join('\n') || 'none', '| fur', r.fx, '| box scratches', r.scratches); console.log(errs.slice(0, 5).join('\n') || 'no page errors'); await b.close(); })();
