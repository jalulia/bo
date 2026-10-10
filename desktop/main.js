// Desktop Bo — Mac host. Two homes for the cats (Bo's Jungle window, or the
// whole desktop as a click-through overlay) and a toy-box panel that drops
// down from the menu bar.
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('Desktop Bo');
if (!app.requestSingleInstanceLock()) app.quit();

let cats = null, panel = null, tray = null, interactive = false, quitting = false;
let mode = 'habitat', lastState = null;
const file = (n) => path.join(app.getPath('userData'), n);
const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
const writeJSON = (p, d) => { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(d)); } catch (e) {} };

function loadSettings() { const s = readJSON(file('settings.json')); if (s && s.mode) mode = s.mode; }
function saveSettings() { writeJSON(file('settings.json'), { mode }); }
function loadState() {
  let s = readJSON(file('state.json'));
  if (!s) { // carry Bo over from the old Ballz Catz build
    const old = readJSON(path.join(app.getPath('appData'), 'Ballz Catz', 'cats.json'));
    if (old && old.cats) s = { cats: old.cats.filter((c) => c.breed === 'bo').map((c) => ({ id: c.id, name: c.name, coat: 'bo', x: c.x, y: c.y })) };
  }
  return s;
}

const webPrefs = { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false };
function send(cmd, arg) { if (cats && !cats.isDestroyed()) cats.webContents.send('cmd', cmd, arg); }

function closeWithSave(w) {
  let saved = false;
  w.on('close', (e) => { if (saved || quitting) return; e.preventDefault(); saved = true; w.webContents.send('cmd', 'save'); setTimeout(() => { if (!w.isDestroyed()) w.destroy(); }, 200); });
  w.on('closed', () => { if (cats === w) cats = null; });
}
function createHabitat() {
  cats = new BrowserWindow({
    width: 900, height: 600, minWidth: 520, minHeight: 360, title: "Bo's Jungle", backgroundColor: '#3a3030',
    titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 14, y: 12 }, show: false, fullscreenable: false, webPreferences: webPrefs,
  });
  cats.loadFile(path.join(__dirname, 'index.html'), { query: { mode: 'habitat' } });
  cats.once('ready-to-show', () => { cats.show(); app.focus({ steal: true }); });
  closeWithSave(cats);
}
function createOverlay() {
  cats = new BrowserWindow({
    show: false, transparent: true, frame: false, hasShadow: false, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, alwaysOnTop: true, backgroundColor: '#00000000', roundedCorners: false, webPreferences: webPrefs,
  });
  placeOverlay();
  cats.setAlwaysOnTop(true, 'floating');
  cats.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  cats.setIgnoreMouseEvents(true, { forward: true });
  cats.loadFile(path.join(__dirname, 'index.html'), { query: { mode: 'roam' } });
  cats.once('ready-to-show', () => cats.showInactive());
  closeWithSave(cats);
}
function placeOverlay() { if (cats && !cats.isDestroyed() && mode === 'roam') { const wa = screen.getPrimaryDisplay().workArea; cats.setBounds({ x: wa.x, y: wa.y, width: wa.width, height: wa.height }); } }
function openMode(m) {
  mode = m; saveSettings(); interactive = false;
  const old = cats; cats = null;
  const go = () => (mode === 'habitat' ? createHabitat() : createOverlay());
  if (old && !old.isDestroyed()) { old.once('closed', go); old.close(); } else go();
}

// ── toy box panel ──
function createPanel() {
  panel = new BrowserWindow({
    width: 372, height: 640, show: false, frame: false, transparent: true, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false, backgroundColor: '#00000000', webPreferences: webPrefs,
  });
  panel.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  panel.loadFile(path.join(__dirname, 'panel.html'));
  panel.on('blur', () => { if (!panel.webContents.isDevToolsOpened()) panel.hide(); });
}
function showPanel(anchor) {
  if (!panel) createPanel();
  const [w, h] = panel.getSize();
  let x, y;
  if (anchor === 'habitat' && cats && !cats.isDestroyed()) { const b = cats.getBounds(); x = b.x + b.width - w - 8; y = b.y + 44; }
  else { const t = tray.getBounds(); const d = screen.getDisplayNearestPoint({ x: t.x, y: t.y }).workArea; x = Math.min(Math.max(d.x + 8, Math.round(t.x + t.width / 2 - w / 2)), d.x + d.width - w - 8); y = d.y + 4; }
  panel.setPosition(Math.round(x), Math.round(y));
  if (lastState) panel.webContents.send('state', lastState, mode);
  panel.show(); panel.focus();
}
function togglePanel(anchor) { if (panel && panel.isVisible()) panel.hide(); else showPanel(anchor); }

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'trayTemplate.png'));
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Desktop Bo');
  tray.on('click', () => togglePanel('tray'));
  tray.on('right-click', () => tray.popUpContextMenu(Menu.buildFromTemplate([
    { label: 'Open the toy box', click: () => showPanel('tray') },
    { label: mode === 'habitat' ? "Show Bo's Jungle" : 'Let them back on the desktop', click: () => openMode(mode) },
    { type: 'separator' },
    { label: 'Quit Desktop Bo', click: () => { send('save'); setTimeout(() => app.quit(), 150); } },
  ])));
  loadSettings();
  createPanel();
  mode === 'habitat' ? createHabitat() : createOverlay();
  screen.on('display-metrics-changed', placeOverlay);
});

ipcMain.handle('load', () => loadState());
ipcMain.on('save', (_e, d) => writeJSON(file('state.json'), d));
ipcMain.on('interactive', (_e, on) => {
  interactive = !!on;
  if (!cats || cats.isDestroyed() || mode !== 'roam') return;
  if (interactive) cats.setIgnoreMouseEvents(false); else cats.setIgnoreMouseEvents(true, { forward: true });
});
ipcMain.on('summary', (_e, s) => { lastState = s; if (panel && !panel.isDestroyed() && panel.isVisible()) panel.webContents.send('state', s, mode); });
ipcMain.on('toggle-panel', () => togglePanel('habitat'));
ipcMain.on('panel-size', (_e, h) => { if (panel) panel.setSize(372, Math.min(900, Math.ceil(h))); });
ipcMain.handle('login-item', () => app.getLoginItemSettings().openAtLogin);
ipcMain.on('panel-cmd', (_e, name, arg) => {
  if (name === 'mode') { if (arg !== mode) openMode(arg); return; }
  if (name === 'quit') { send('save'); setTimeout(() => app.quit(), 150); return; }
  if (name === 'login') { app.setLoginItemSettings({ openAtLogin: !!arg }); return; }
  send(name, arg);
  if (name === 'carry' && arg !== 'laser') { panel.hide(); if (mode === 'habitat' && cats) { cats.show(); cats.focus(); } }
});
// cursor polling keeps the eyes and the laser tracking over other apps
setInterval(() => {
  if (!cats || cats.isDestroyed() || interactive || mode !== 'roam') return;
  const p = screen.getCursorScreenPoint(), b = cats.getBounds();
  cats.webContents.send('cursor', p.x - b.x, p.y - b.y);
}, 33);
app.on('window-all-closed', (e) => e.preventDefault());
// opening the app again (Finder, Spotlight, Dock) brings the cats back instead of doing nothing
app.on('second-instance', () => openMode(mode));
app.on('activate', () => openMode(mode));
app.on('before-quit', () => { quitting = true; });
