// screenshot the habitat in a scene: node test/scene.js [room|yard] [out.png] [ticks] [w] [h]
const { chromium } = require('playwright');
(async () => { const [scene, out, N, W, H] = [process.argv[2] || 'room', process.argv[3] || 'test/scene.png', +(process.argv[4] || 200), +(process.argv[5] || 1280), +(process.argv[6] || 800)];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(([sc, n]) => { clearInterval(world.timer); if (!world.cats.some(c => c.coatKey === 'bunny')) world.adopt('bunny'); if (sc !== 'room') world.cmd('scene', sc); for (let i = 0; i < n; i++) world.tick(); }, [scene, N]);
  const r = await p.evaluate(() => { const e = document.getElementById('hab').getBoundingClientRect(); return { x: e.left, y: e.top, width: e.width, height: e.height }; });
  await p.screenshot({ path: out, clip: r });
  console.log(errs.join('\n') || 'ok', await p.evaluate(() => world.cats.map(c => c.name + ':' + c.state).join(' '))); await b.close(); })();
