const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html');
  await p.waitForTimeout(3500);
  const st = () => p.evaluate(() => world.cats.map(c => `${c.name}:${c.state}/${c.anim}`).join('  '));
  console.log('start', await st());
  // pose sheet again
  // pet the first cat: find a body ball
  const pt = await p.evaluate(() => { const c = world.cats[0]; const h = c.hits.find(h=>h.region==='back')||c.hits[0]; return [h.x*2, h.y*2]; });
  await p.mouse.move(pt[0], pt[1]); await p.mouse.down();
  for (let i=0;i<40;i++){ await p.mouse.move(pt[0]+ (i%2?6:-6), pt[1]+(i%3)); await p.waitForTimeout(45); }
  console.log('petting', await st());
  await p.screenshot({ path: 'test/pet.png' });
  await p.mouse.up();
  // scruff: press on cat and drag away
  const q = await p.evaluate(() => { const c = world.cats[1]; const h = c.hits.find(h=>h.region==='head')||c.hits[0]; return [h.x*2, h.y*2]; });
  await p.mouse.move(q[0], q[1]); await p.mouse.down();
  for (let i=1;i<=15;i++){ await p.mouse.move(q[0]+i*8, q[1]-i*14); await p.waitForTimeout(45); }
  await p.waitForTimeout(500);
  console.log('scruff', await st());
  await p.screenshot({ path: 'test/held.png' });
  await p.mouse.up(); await p.waitForTimeout(300);
  console.log('dropped', await st());
  // laser
  await p.evaluate(() => world.toy('laser'));
  for (let i=0;i<60;i++){ await p.mouse.move(400+i*8, 600-i*3); await p.waitForTimeout(45); }
  await p.waitForTimeout(1500);
  console.log('laser', await st());
  await p.screenshot({ path: 'test/laser.png' });
  await p.evaluate(() => world.toy('laser'));
  // treat
  await p.mouse.move(640, 500);
  await p.evaluate(() => world.toy('treat'));
  await p.waitForTimeout(5000);
  console.log('treat', await st());
  await p.screenshot({ path: 'test/beg.png' });
  await p.mouse.down(); await p.mouse.up();
  await p.waitForTimeout(4000);
  console.log('after treat', await st(), await p.evaluate(()=>world.items.length));
  // ball
  await p.evaluate(() => { world.toy('ball'); world.toy('bowl'); world.cats.forEach(c=>c.hunger=80); });
  await p.waitForTimeout(6000);
  console.log('ball', await st());
  await p.screenshot({ path: 'test/ball.png' });
  await p.waitForTimeout(8000);
  console.log('later', await st(), await p.evaluate(()=>world.items.map(i=>i.type+':'+(i.servings??'')).join(',')));
  await p.screenshot({ path: 'test/later.png' });
  // poke face
  const f = await p.evaluate(() => { const c = world.cats[0]; const h = c.hits.find(h=>h.region==='face'); return h?[h.x*2,h.y*2]:null; });
  if (f) { await p.mouse.click(f[0], f[1]); await p.waitForTimeout(200); console.log('poke', await st()); await p.screenshot({ path: 'test/poke.png' }); }
  // catnip
  await p.evaluate(() => { world.putAway(); world.toy('catnip'); world.cats.forEach(c=>{ if(c.state==='idle'||c.state==='wander'){c.setState('nip'); c.toy=world.items[0];} }); });
  await p.waitForTimeout(6000);
  console.log('nip', await st());
  await p.screenshot({ path: 'test/nip.png' });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
