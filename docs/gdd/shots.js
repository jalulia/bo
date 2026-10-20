// full-frame day shots of both places, furnished, for the GDD
const { chromium } = require('playwright');
(async () => { const out = process.argv[2];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const rect = async () => p.evaluate(() => { const e = document.getElementById('hab').getBoundingClientRect(); return { x: e.left, y: e.top, width: e.width, height: e.height }; });
  await p.evaluate(() => { clearInterval(world.timer); BZ.hourOverride = 11; world.adopt('bunny'); const st = world.stage, P = world.pointer;
    const find = (t) => world.items.find((i) => i.type === t), put = (type, x, y) => { world.carrying = type; P.x = st.x + x; P.y = st.y + y - 6; world.onDown(); return find(type); };
    world.removeItem(find('grass')); const pod = find('pod'); pod.x = st.x + 40; pod.y = st.y + 246;
    put('poppy', 104, 324); put('dfly', 330, 322); put('lamptable', 400, 298); put('grass', 150, 352); { const CT = find('ctable'); put('orchid', CT.x - st.x + 12, CT.y - st.y - 27.5 * world.size * 0.95); }
    world.scene.paint(); for (let i = 0; i < 400; i++) world.tick(); });
  await p.screenshot({ path: out + '/room-day.png', clip: await rect() });
  await p.evaluate(() => { BZ.hourOverride = 13; world.cmd('scene', 'yard'); for (const c of world.cats) c.hidden = false; world.scene.paint(); for (let i = 0; i < 500; i++) world.tick(); });
  await p.screenshot({ path: out + '/yard-day.png', clip: await rect() });
  await p.evaluate(() => { BZ.hourOverride = 22.5; world.scene.paint(); for (let i = 0; i < 200; i++) world.tick(); });
  await p.screenshot({ path: out + '/yard-night.png', clip: await rect() });
  await p.evaluate(() => { BZ.hourOverride = 22; world.cmd('scene', 'room'); world.scene.paint(); for (let i = 0; i < 300; i++) world.tick(); });
  await p.screenshot({ path: out + '/room-night.png', clip: await rect() });
  await b.close(); console.log('ok'); })();
