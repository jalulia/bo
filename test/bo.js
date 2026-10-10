const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 640 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html');
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    clearInterval(world.timer); const W = world; W.cats.length = 0; W.setSize(1.6);
    const set = [['stand',0],['stand',Math.PI/2+0.4],['sit',Math.PI/2+0.3],['loaf',0.3],['sleep',Math.PI/2],['crouch',0],['beg',Math.PI/2],['stand',-Math.PI/2+0.6]];
    set.forEach(([a,th],i) => { const c = new BZ.Cat({ name:'Bo', breed:'bo', born:0, x: 80 + (i%4)*150, y: 150 + Math.floor(i/4)*150, theta: th }, W); c.anim=a; c.state='idle'; c.think=()=>{}; W.cats.push(c); });
    for (let k=0;k<40;k++) for (const c of W.cats) { c.t++; c.animate(); }
    W.render();
  });
  await p.screenshot({ path: 'test/bo.png' });
  console.log(errs.join('\n') || 'ok'); await b.close();
})();
