const MODE = new URLSearchParams(location.search).get('mode') || 'roam';
const ff = new FontFace('BoPixel', `url(${BZ.FONT_URI})`); ff.load().then((f) => document.fonts.add(f)).catch(() => {});
const world = new BZ.World(document.getElementById('c'), document.getElementById('o'), {
  setInteractive: (on) => window.host.setInteractive(on),
  save: (d) => window.host.save(d),
  onChange: (s) => window.host.summary(s),
});
if (MODE === 'habitat') {
  document.body.classList.add('habitat'); document.title = "Bo's Jungle";
  world.setHabitat(true, () => ({ x: 0, y: 38, w: innerWidth, h: innerHeight - 38 }));
  document.getElementById('toybox').onclick = () => window.host.togglePanel();
}
window.host.onCursor((x, y) => world.moveTo(x, y));
window.host.load().then((d) => world.load(d));
window.host.onCommand((cmd, arg) => world.cmd(cmd, arg));
