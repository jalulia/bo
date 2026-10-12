// UX walkthroughs at phone / tablet / desktop sizes, touch or mouse: node test/ux.js [phone|tablet|desktop] [out.png]
const { chromium, devices } = require('playwright');
(async () => { const [kind, out] = [process.argv[2] || 'phone', process.argv[3] || 'test/ux.png'];
  const ctxOpts = kind === 'phone' ? { ...devices['iPhone 13'] } : kind === 'tablet' ? { ...devices['iPad (gen 7)'] } : { viewport: { width: 1280, height: 800 } };
  const b = await chromium.launch(); const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/web/playpen.src.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const touch = kind !== 'desktop';
  const tapAt = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  const log = [];
  const tab = async (name) => { const t = await p.$(`.bo-tabs button:has-text("${name}")`); touch ? await t.tap() : await t.click(); await p.waitForTimeout(150); };
  const pick = async (label) => { const t = await p.$(`.bo-tile[title^="${label}"]`); await t.scrollIntoViewIfNeeded(); touch ? await t.tap() : await t.click(); await p.waitForTimeout(350); };
  const state = () => p.evaluate(() => ({ cats: world.cats.map((c) => c.name + ':' + c.state), carrying: world.carrying, tool: world.tool, items: world.items.filter((i) => !i.fixed).map((i) => i.type), open: document.getElementById('dock').classList.contains('open'), stage: world.stage, mode: world.mode }));
  // 1 open the sheet (phone) and put out a pillow
  const barTap = async () => { const r = await p.$eval('#sheetbar', (e) => e.getBoundingClientRect()); await tapAt(r.x + r.width / 2, r.y + r.height / 2); await p.waitForTimeout(350); };
  if (touch && kind === 'phone') { await barTap(); log.push('sheet open: ' + (await state()).open); }
  await tab('Comfort'); await pick('Pillow');
  let s = await state(); log.push('carrying: ' + s.carrying + ' sheet open: ' + s.open);
  const st = s.stage; await tapAt((st.x + st.w * 0.5) * 2, (st.y + st.h * 0.8) * 2); await p.waitForTimeout(200);
  s = await state(); log.push('placed: ' + s.items.join(',') + ' carrying: ' + s.carrying);
  // 2 pet Bo: press and stroke
  const bo = await p.evaluate(() => { const c = world.cats[0]; return { x: (c.x - world.cam.x) * 2, y: (c.y - 14) * 2 }; });
  if (touch) { await p.touchscreen.tap(bo.x, bo.y); } else { await p.mouse.move(bo.x, bo.y); await p.mouse.down(); for (let i = 0; i < 8; i++) { await p.mouse.move(bo.x + i * 3, bo.y, { steps: 2 }); await p.waitForTimeout(40); } await p.mouse.up(); }
  await p.waitForTimeout(300); s = await state(); log.push('after touch: ' + s.cats.join(' '));
  // 3 laser: tool on, drag around the stage, tool off
  if (kind === 'phone') await barTap();
  await tab('Play'); await pick('Laser');
  s = await state(); log.push('tool: ' + s.tool + ' sheet open: ' + s.open + ' hand strip: ' + (await p.$eval('.bo-hand', (e) => e.classList.contains('on'))));
  if (touch) { const cdp = await ctx.newCDPSession(p); const x0 = 60, y0 = (st.y + st.h * 0.6) * 2; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] }); for (let i = 1; i <= 20; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + i * 8, y: y0 + Math.sin(i / 3) * 20 }] }); await p.waitForTimeout(40); } const mid = await p.evaluate(() => ({ inside: world.pointer.inside, on: world.laser.on, x: world.laser.x })); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(100); log.push('laser while touching: ' + JSON.stringify(mid) + ' after lift inside=' + (await p.evaluate(() => world.pointer.inside))); }
  else { for (let i = 0; i < 20; i++) { await p.mouse.move(60 + i * 8, (st.y + st.h * 0.6) * 2 + Math.sin(i / 3) * 20); await p.waitForTimeout(40); } log.push('laser: ' + JSON.stringify(await p.evaluate(() => ({ inside: world.pointer.inside, on: world.laser.on })))); }
  if (kind === 'phone' && !(await state()).open) await barTap();
  const drop = await p.$('.bo-drop'); touch ? await drop.tap() : await drop.click(); await p.waitForTimeout(200); s = await state(); log.push('put down: tool=' + s.tool);
  // 4 switch to the yard and back
  const yard = await p.$('.bo-seg button[data-scene="yard"]'); await yard.scrollIntoViewIfNeeded(); touch ? await yard.tap() : await yard.click(); await p.waitForTimeout(600);
  s = await state(); log.push('yard: items=' + s.items.length + ' cats=' + s.cats.join(' '));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out });
  console.log(log.join('\n')); console.log(errs.join('\n') || 'no page errors'); await b.close(); })();
