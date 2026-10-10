// filmstrip of a cat inside the real world: state forced, frames cropped around her
const { chromium } = require('playwright');
(async () => { const [state, out, coat] = [process.argv[2] || 'wander', process.argv[3] || 'test/live.png', process.argv[4] || 'bo'];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const info = await p.evaluate(([state, coat]) => {
    clearInterval(world.timer); if (coat !== 'bo') world.adopt(coat);
    const c = world.cats[world.cats.length - 1]; for (const o of world.cats) if (o !== c) world.sendHome(o.id);
    c.needs.energy = 80; c.setState(state === 'stalk' ? 'idle' : state);
    if (state === 'stalk') { world.cmd('carry', 'laser'); world.pointer.inside = true; }
    const cv = document.querySelector('#stage canvas') || document.querySelector('canvas');
    const shots = [], log = [];
    for (let i = 0; i < 160; i++) {
      if (state === 'stalk') { world.pointer.x = c.x + 160 + 30 * Math.sin(i / 9); world.pointer.y = c.y + 10; }
      world.tick(); 
      if (i >= 40 && i % 6 === 0) { world.render(); const r = cv.getBoundingClientRect(), sx = cv.width / r.width; shots.push([c.x, c.y, cv.toDataURL()]); log.push(c.state + '/' + c.anim + '/' + (c.gait || '-') + '/' + (c.mode || '')); }
    }
    return { shots: shots.slice(0, 18), log, px: cv.width / cv.getBoundingClientRect().width };
  }, [state, coat]);
  // compose crops
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async ({ shots, px }) => { const W = 120, H = 90, o = document.getElementById('o'); o.width = W * 6 * 3; o.height = H * Math.ceil(shots.length / 6) * 3; const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let i = 0; i < shots.length; i++) { const [x, y, url] = shots[i]; const im = new Image(); im.src = url; await im.decode(); const sx = x / 1 - W / 2, sy = y - H + 12; g.drawImage(im, sx, sy, W, H, (i % 6) * W * 3, Math.floor(i / 6) * H * 3, W * 3, H * 3); } }, info);
  await (await p.$('#o')).screenshot({ path: out });
  console.log(info.log.slice(0, 18).join(' | ')); console.log(errs.join('\n') || 'no errors'); await b.close(); })();
