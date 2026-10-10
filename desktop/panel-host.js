let state = null;
window.host.loginItem().then((login) => {
  const p = BZ.Panel(document.getElementById('root'), {
    get: () => state, modes: true,
    cmd: (n, a) => window.host.panelCmd(n, a),
    extras: [{ label: 'Open at login', cmd: 'login', checkbox: true, checked: login }, { label: 'Quit', cmd: 'quit' }],
  });
  window.host.onState((s, mode) => { state = Object.assign({}, s, { mode }); p.refresh(); });
  const fit = () => window.host.panelSize(document.getElementById('root').getBoundingClientRect().height);
  new ResizeObserver(fit).observe(document.getElementById('root')); fit();
});
