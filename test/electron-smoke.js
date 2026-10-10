const { app, BrowserWindow } = require('electron');
require('../desktop/main.js');
app.whenReady().then(() => setTimeout(async () => {
  for (const w of BrowserWindow.getAllWindows()) {
    const url = w.webContents.getURL().split('/').pop();
    const r = await w.webContents.executeJavaScript(`typeof world !== 'undefined' ? JSON.stringify({mode: world.mode, cats: world.cats.map(c=>c.name+':'+c.coatKey+':'+c.state), items: world.items.map(i=>i.type)}) : (document.querySelector('.bo-panel') ? 'panel ok: ' + document.querySelector('.bo-name').textContent + ' / ' + document.querySelector('.bo-mood').textContent : 'no panel')`);
    console.log('RESULT', url, r);
    if (url.startsWith('panel')) w.show();
    await new Promise(r => setTimeout(r, 400));
    const img = await w.webContents.capturePage(); require('fs').writeFileSync(__dirname + '/el-' + url.split('?')[0].replace('.html','') + (url.includes('habitat') ? '-hab' : '') + '.png', img.toPNG());
  }
  app.exit(0);
}, 5000));
