const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('host', {
  setInteractive: (on) => ipcRenderer.send('interactive', on),
  save: (d) => ipcRenderer.send('save', d),
  load: () => ipcRenderer.invoke('load'),
  summary: (s) => ipcRenderer.send('summary', s),
  onCommand: (cb) => ipcRenderer.on('cmd', (_e, c, a) => cb(c, a)),
  onCursor: (cb) => ipcRenderer.on('cursor', (_e, x, y) => cb(x, y)),
  togglePanel: () => ipcRenderer.send('toggle-panel'),
  // panel window
  panelCmd: (n, a) => ipcRenderer.send('panel-cmd', n, a),
  onState: (cb) => ipcRenderer.on('state', (_e, s, mode) => cb(s, mode)),
  panelSize: (h) => ipcRenderer.send('panel-size', h),
  loginItem: () => ipcRenderer.invoke('login-item'),
});
