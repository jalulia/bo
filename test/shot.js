const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'test/desk.png' });
  // pose sheet: freeze cats in poses, big pixels
  await p.evaluate(() => {
    clearInterval(world.timer);
    const W = world;
    W.cats.length = 0;
    const poses = ['stand','sit','loaf','sleep','crouch','beg','groom','stretch','held','flinch'];
    const breeds = Object.keys(BZ.BREEDS);
    let i = 0;
    for (const br of breeds) for (const th of [0, Math.PI/2]) {
      const c = new BZ.Cat({ name:'x', breed: br, born: Date.now()-1e12, x: 70 + (i%5)*120, y: 120 + Math.floor(i/5)*130, theta: th }, W);
      c.anim = poses[i % poses.length]; c.state='idle'; c.think = ()=>{};
      W.cats.push(c); i++;
    }
    for (let k=0;k<30;k++) for (const c of W.cats) { c.t++; c.animate(); }
    W.render();
  });
  await p.screenshot({ path: 'test/poses.png', clip: {x:0,y:0,width:1280,height:560} });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
