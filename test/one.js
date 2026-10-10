const { chromium } = require('playwright');
(async () => { const [qs, out] = [process.argv[2] || '', process.argv[3] || 'test/one.png'];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 500 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/test/one.html?' + qs); await p.waitForTimeout(300);
  await (await p.$('#c')).screenshot({ path: out }); console.log(errs.join('\n') || 'ok'); await b.close(); })();
