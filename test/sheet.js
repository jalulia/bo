const { chromium } = require('playwright');
(async () => { const [qs, out] = [process.argv[2] || '', process.argv[3] || 'test/sheet.png'];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 2200 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/test/sheet.html?' + qs); await p.waitForTimeout(400);
  const el = await p.$('#c'); await el.screenshot({ path: out });
  console.log(errs.join('\n') || 'ok'); await b.close(); })();
