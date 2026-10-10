const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + e.stack));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html');
  await p.waitForTimeout(5000);
  await p.screenshot({ path: 'test/hab1.png' });
  // send Bo to the pod
  await p.evaluate(() => { const bo = world.cats[0]; world.scene.pod.occupant = bo.id; bo.setState('toPod'); world.scene.pod.occupant = bo.id; });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(1000); const s = await p.evaluate(() => world.cats[0].state); if (s === 'pod') break; }
  await p.waitForTimeout(3000);
  console.log('bo', await p.evaluate(() => world.cats.map(c=>c.name+':'+c.state).join(' ')));
  await p.screenshot({ path: 'test/hab2.png' });
  // Bo close-up sheet
  await p.evaluate(() => { document.getElementById('hab').hidden = true; world.setHabitat(false); clearInterval(world.timer); world.cats.length = 0; world.setSize(1.7);
    const set = [['stand',0],['stand',Math.PI/2+0.4],['sit',Math.PI/2+0.25],['sit',0.2],['loaf',Math.PI/2],['stand',Math.PI],['beg',Math.PI/2],['stand',-0.5]];
    set.forEach(([a,th],i) => { const c = new BZ.Cat({ name:'Bo', breed:'bo', born:0, x: 110 + (i%4)*150, y: 160 + Math.floor(i/4)*150, theta: th }, world); c.anim=a; c.state='idle'; c.think=()=>{}; world.cats.push(c); });
    for (let k=0;k<40;k++) for (const c of world.cats) { c.t++; c.animate(); }
    world.render(); });
  await p.screenshot({ path: 'test/bo2.png', clip: { x: 0, y: 0, width: 1280, height: 640 } });
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
