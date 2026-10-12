const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await p.goto('file://' + process.cwd() + '/test/juno.html'); await p.waitForTimeout(300);
  await (await p.$('#c')).screenshot({ path: process.argv[2] || 'test/juno.png' }); console.log(errs.join('\n') || 'ok'); await b.close(); })();
