#!/usr/bin/env python3
# Assembles the Desktop Bo game design document ("Bo 95") into a publish folder.
#   python3 docs/gdd/build.py [out_dir]      (default: dist/gdd)
# The page is docs/gdd/template.html with the two machine-readable specs from docs/ inlined; the engine is copied
# from src/ twice (engine/ for the page's live portraits, icons and ramps; play/engine/ for the PLAYPEN.EXE iframe);
# the images come from docs/gdd/shots.js + the pose sheet, moments sheet, times-of-day sheet and refs; the GIFs from gifs/.
# Publish out_dir/index.html as the artifact with every other file in out_dir as a supporting file (same path).
import os, shutil, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
G = os.path.join(R, 'docs', 'gdd'); out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'dist', 'gdd')
os.makedirs(out, exist_ok=True)
spec = open(os.path.join(R, 'docs', 'desktop-bo-spec.json')).read(); ballz = open(os.path.join(R, 'docs', 'ballz-technique.json')).read()
tpl = open(os.path.join(G, 'template.html')).read()
open(os.path.join(out, 'index.html'), 'w').write(tpl.replace('/*__SPEC__*/', spec).replace('/*__BALLZ__*/', ballz))
for dst in ('engine', os.path.join('play', 'engine')):
    d = os.path.join(out, dst); shutil.rmtree(d, ignore_errors=True); shutil.copytree(os.path.join(R, 'src'), d)
shutil.copy(os.path.join(G, 'play', 'index.html'), os.path.join(out, 'play', 'index.html'))
os.makedirs(os.path.join(out, 'img'), exist_ok=True); os.makedirs(os.path.join(out, 'gif'), exist_ok=True)
refs = { 'ref-bo-pillow.jpg': 'refs/bo/bo-pillow-arm-hanging.jpg', 'ref-bo-cube.jpg': 'refs/bo/bo-felt-cube-arm-out.jpg', 'ref-bo-sill.jpg': 'refs/bo/bo-sill-under-monstera.jpg',
         'ref-poppy.jpg': 'refs/furniture/chair-poppy-with-bo.jpg', 'ref-dragonfly.jpg': 'refs/furniture/chair-dragonfly-damask.jpg', 'ref-daybed.jpg': 'refs/furniture/daybed-burl-sleigh.jpg',
         'ref-studio.jpg': 'refs/scenes/yard-studio-patio.jpg', 'ref-juno.jpg': 'refs/juno/juno-dog-bed-sombrero.jpg', 'ref-both-lamp.jpg': 'refs/together/both-sweaters-lamp-1.jpg', 'ref-both-adk.jpg': 'refs/together/both-adirondack-mat.jpg' }
for dst, src in refs.items():
    p = os.path.join(R, src)
    if not os.path.exists(p): print('missing ref', src, '(find it in refs/refs.json and update this map)'); continue
    try:
        from PIL import Image; im = Image.open(p); im.thumbnail((600, 600)); im.convert('RGB').save(os.path.join(out, 'img', dst), quality=82)
    except ImportError: shutil.copy(p, os.path.join(out, 'img', dst))
gifs = { 'doors.gif': 'gifs/doors.gif', 'knock.gif': 'gifs/knock.gif', 'swing.gif': 'gifs/swing.gif' }
for f in os.listdir(os.path.join(R, 'gifs', '2026-10-12')): gifs[f] = 'gifs/2026-10-12/' + f
for dst, src in gifs.items():
    p = os.path.join(R, src)
    if os.path.exists(p) and dst in ('doors.gif', 'knock.gif', 'swing.gif', 'room-dusk-cubby.gif', 'room-night-lamp.gif', 'yard-dawn-feeder.gif', 'yard-day-yard.gif', 'yard-dusk-doors.gif', 'yard-night-yard.gif'): shutil.copy(p, os.path.join(out, 'gif', dst))
print('wrote', out, '- now: node docs/gdd/shots.js', os.path.join(out, 'img'), '(room/yard day+night), and copy juno-sheet.png, moments.png, times-of-day.png into img/')
