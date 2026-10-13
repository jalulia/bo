// Juno on her bed: watching, Bunny joining her, petting, Bo's skeptical look. node test/junoyard.js out.png
const { chromium } = require('playwright');
(async () => { const out = process.argv[2] || 'test/junoyard.png';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const shots = [];
  const snap = async (name) => { const r = await p.evaluate(() => { const e = document.getElementById('hab').getBoundingClientRect(); return { x: e.left, y: e.top, width: e.width, height: e.height }; }); const f = out.replace('.png', '-' + name + '.png'); await p.screenshot({ path: f, clip: r }); shots.push(f); };
  await p.evaluate(() => { clearInterval(world.timer); if (!world.cats.some(c => c.coatKey === 'bunny')) world.adopt('bunny'); world.cmd('scene', 'yard'); for (let i = 0; i < 200; i++) world.tick(); });
  // 1. Bunny takes the foot of the bed
  const r1 = await p.evaluate(() => { const bed = world.items.find(i => i.type === 'dogbed'), bun = world.cats.find(c => c.coatKey === 'bunny'); bed.occupant = bun.id; bun.setState('toBed'); bun.bedItem = bed; for (let i = 0; i < 900; i++) world.tick(); return [bun.state, world.scene.dog.st, world.scene.dog.anim, !!world.scene.dog.hadCat]; });
  await snap('bunny');
  // 2. a hand on her head
  const d = await p.evaluate(() => { const S = world.scene.dog.screen, h = S.head; const cx = (h[0] - world.cam.x) * 2 + world.view_off_x; return [h[0], h[1]]; }).catch(() => null);
  const hd = await p.evaluate(() => { const h = world.scene.dog.screen.head, st = document.getElementById('stage').getBoundingClientRect(); return [h[0] * 2 - (world.cam ? world.cam.x * 2 : 0), h[1] * 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down();
  for (let i = 0; i < 24; i++) { await p.mouse.move(hd[0] + Math.sin(i) * 10, hd[1] + (i % 2) * 3); await p.evaluate(() => { world.tick(); world.tick(); }); }
  const r2 = await p.evaluate(() => { const d = world.scene.dog; return [d.anim, d.wag, d.liftT, d.lean.toFixed(2), d.pose.lid.toFixed(2)]; });
  await snap('pet'); await p.mouse.up();
  // 3. Bo walks past the bed
  const r3 = await p.evaluate(() => { const bo = world.cats.find(c => c.isBo), d = world.scene.dog; bo.setState('idle'); bo.x = d.x + 60 * world.size; bo.y = d.y + 30; bo.cool.dog = 0; for (let i = 0; i < 40; i++) world.tick(); return [bo.state, bo.pose.earBack.toFixed(2), d.look ? 'looks' : 'no-look']; });
  await snap('skeptic');
  console.log(errs.join('\n') || 'ok', JSON.stringify({ bunny: r1, pet: r2, bo: r3 })); await b.close(); })();
