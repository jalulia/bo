// film forced play modes: each row one mode, in-world
const { chromium } = require('playwright');
(async () => { const out = process.argv[2] || 'test/play3.png', modes = (process.argv[3] || 'kick,toss,crab,swat,wall,stalk').split(','), coat = process.argv[4] || 'bunny';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  const info = await p.evaluate(([modes, coat]) => {
    clearInterval(world.timer); if (coat !== 'bo') world.adopt(coat); const c = world.cats[world.cats.length - 1]; for (const o of [...world.cats]) if (o !== c) world.sendHome(o.id);
    const st = world.stage; world.carrying = 'mouse'; world.pointer.x = st.x + st.w * 0.5; world.pointer.y = world.floorTop + 110; world.onDown();
    const mouse = world.items.find(i => i.type === 'mouse'); const cv = document.querySelector('#stage canvas') || document.querySelector('canvas'); const rows = [];
    for (const mode of modes) {
      mouse.x = st.x + st.w * 0.5; mouse.y = world.floorTop + 110; mouse.vx = mouse.vy = mouse.vz = mouse.z = 0;
      c.x = mouse.x - 30 * c.petScale; c.y = mouse.y + 2; c.theta = 0; c.needs.energy = 90; c.mood.play = 0.9;
      if (mode === 'wall') { world.cmd('carry', 'laser'); world.pointer.inside = true; world.pointer.x = c.x + 40; world.pointer.y = world.floorTop - 70; } else if (world.laser.on) { world.cmd('carry', 'laser'); world.pointer.inside = false; }
      world.tick(); const key = mode === 'wall' ? 'laser' : world.stimuli.find(s => s.item === mouse).key;
      c.setState('engage'); c.eng = key; c.interest[key] = 0.95; c.noticed[key] = true; c.mode = mode; c.modeT = 400; c.st = 0; c.wiggle = 0;
      const shots = [];
      for (let i = 0; i < 120; i++) { if (mode === 'wall') { world.pointer.x = c.x + 20 + 10 * Math.sin(i / 10); world.pointer.y = world.floorTop - 70; }
        world.tick(); c.interest[key] = 0.95; if (c.state === 'engage' && c.mode !== mode && i < 60) { c.mode = mode; c.modeT = 400; }
        if (i % 15 === 0) { world.render(); shots.push([c.x, c.y, cv.toDataURL(), mode + ' ' + i + ' ' + c.state + '/' + c.anim + (mouse.z ? ' z' + mouse.z.toFixed(0) : '') + (c.hopY ? ' h' + c.hopY.toFixed(0) : '')]); } }
      rows.push(shots);
    }
    return { rows };
  }, [modes, coat]);
  await p.setContent('<canvas id=o></canvas>');
  await p.evaluate(async ({ rows }) => { const W = 120, H = 96, S = 2, C = 8, o = document.getElementById('o'); o.width = W * C * S; o.height = H * rows.length * S; const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r].length && i < C; i++) { const [x, y, url, lab] = rows[r][i]; const im = new Image(); im.src = url; await im.decode(); const X = i * W * S, Y = r * H * S;
      g.drawImage(im, x - W / 2 + 10, y - H + 14, W, H, X, Y, W * S, H * S); g.fillStyle = '#000a'; g.fillRect(X, Y, W * S, 13); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(lab, X + 2, Y + 10); } }, info);
  await (await p.$('#o')).screenshot({ path: out });
  console.log(errs.slice(0, 4).join('\n') || 'no errors'); await b.close(); })();
