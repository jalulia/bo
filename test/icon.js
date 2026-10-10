const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/test/icon.html'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'desktop/assets/icon.png', omitBackground: true, clip:{x:0,y:0,width:1024,height:1024} });
  console.log(errs.join('\n')||'ok'); await b.close(); })();
