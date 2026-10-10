// filmstrip of Bo waking from each nap style, in the real world, through the stretch and the first walk
const { chromium } = require('playwright');
(async () => { const style = process.argv[2] || 'flop', out = process.argv[3] || 'test/wake.png';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  const info = await p.evaluate((style) => {
    clearInterval(world.timer); const c = world.cats[0], st = world.stage; c.x = st.x + st.w * 0.45; c.y = world.floorTop + 100;
    c.startNap([c.x, c.y], style); c.napPhase = 'sleep'; c.napStyle = style; c.napLen = 1e9;
    for (let i = 0; i < 200; i++) world.tick();
    c.needs.energy = 99; c.setState('wake');
    const cv = document.querySelector('#stage canvas') || document.querySelector('canvas'), shots = [];
    for (let i = 0; i < 480; i++) { world.tick(); if (i % 12 === 0) { world.render(); shots.push([c.x, c.y, cv.toDataURL(), i + ' ' + c.state + '/' + c.anim + '/' + (c.gait || '-') + ' h' + c.pose.hipY.toFixed(0) + ' c' + c.pose.chestY.toFixed(0) + ' r' + c.pose.roll.toFixed(0) + ' y' + c.pose.rootY.toFixed(1)]); } }
    return { shots };
  }, style);
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async ({ shots }) => { const W = 120, H = 80, S = 2, C = 8, o = document.getElementById('o'); o.width = W * C * S; o.height = H * Math.ceil(shots.length / C) * S; const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let i = 0; i < shots.length; i++) { const [x, y, url, lab] = shots[i]; const im = new Image(); im.src = url; await im.decode(); const X = (i % C) * W * S, Y = Math.floor(i / C) * H * S;
      g.drawImage(im, x - W / 2, y - H + 10, W, H, X, Y, W * S, H * S); g.fillStyle = '#000a'; g.fillRect(X, Y, W * S, 14); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(lab, X + 3, Y + 11); } }, info);
  await (await p.$('#o')).screenshot({ path: out });
  console.log(errs.join('\n') || 'no errors'); await b.close(); })();
