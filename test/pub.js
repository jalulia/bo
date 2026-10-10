const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[];
  for (const [w,h,n] of [[1280,800,'pub-desk'],[400,800,'pub-phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e=>errs.push(e.message));
    await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+require('fs').readFileSync('web/playpen.html','utf8')+'</body></html>');
    await p.waitForTimeout(4500); await p.screenshot({ path: 'test/'+n+'.png' }); await p.close(); }
  console.log(errs.join('\n')||'ok'); await b.close(); })();
