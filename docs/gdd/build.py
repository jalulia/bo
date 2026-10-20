#!/usr/bin/env python3
# Builds the Desktop Bo game design document from docs/gdd/template.html + the two specs in docs/.
#   python3 docs/gdd/build.py site            -> index.html + play/index.html at the repo root, for GitHub Pages
#                                                (scripts load src/ directly; images from docs/gdd/img; GIFs from gifs/)
#   python3 docs/gdd/build.py artifact [dir]  -> a self-contained folder (default dist/gdd) with engine copies, for publishing as an artifact
import os, shutil, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
G = os.path.join(R, 'docs', 'gdd')
mode = sys.argv[1] if len(sys.argv) > 1 else 'site'
spec = open(os.path.join(R, 'docs', 'desktop-bo-spec.json')).read(); ballz = open(os.path.join(R, 'docs', 'ballz-technique.json')).read()
page = open(os.path.join(G, 'template.html')).read().replace('/*__SPEC__*/', spec).replace('/*__BALLZ__*/', ballz)
play = open(os.path.join(G, 'play', 'index.html')).read()
GIFS = { 'doors.gif': 'gifs/doors.gif', 'knock.gif': 'gifs/knock.gif', 'swing.gif': 'gifs/swing.gif' }
for f in ('room-dusk-cubby.gif', 'room-night-lamp.gif', 'yard-dawn-feeder.gif', 'yard-day-yard.gif', 'yard-dusk-doors.gif', 'yard-night-yard.gif'): GIFS[f] = 'gifs/2026-10-12/' + f
SKEL = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n%s\n</head>\n<body>\n%s\n</body>\n</html>\n'

if mode == 'site':
    # the page: a full document at the root; engine from src/, images from docs/gdd/img/, GIFs from gifs/
    p = page.replace('src="engine/', 'src="src/').replace('src="img/', 'src="docs/gdd/img/')
    for k, v in GIFS.items(): p = p.replace('src="gif/' + k + '"', 'src="' + v + '"')
    head_end = p.index('</style>') + len('</style>')
    open(os.path.join(R, 'index.html'), 'w').write(SKEL % (p[:head_end], p[head_end:]))
    os.makedirs(os.path.join(R, 'play'), exist_ok=True)
    open(os.path.join(R, 'play', 'index.html'), 'w').write(play.replace('src="engine/', 'src="../src/'))
    open(os.path.join(R, '.nojekyll'), 'w').write('')
    print('wrote index.html, play/index.html (GitHub Pages: https://jalulia.github.io/bo/)')
else:
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'dist', 'gdd')
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'index.html'), 'w').write(page)  # no skeleton: the artifact service adds one
    for dst in ('engine', os.path.join('play', 'engine')):
        d = os.path.join(out, dst); shutil.rmtree(d, ignore_errors=True); shutil.copytree(os.path.join(R, 'src'), d)
    open(os.path.join(out, 'play', 'index.html'), 'w').write(play)
    shutil.rmtree(os.path.join(out, 'img'), ignore_errors=True); shutil.copytree(os.path.join(G, 'img'), os.path.join(out, 'img'))
    os.makedirs(os.path.join(out, 'gif'), exist_ok=True)
    for k, v in GIFS.items(): shutil.copy(os.path.join(R, v), os.path.join(out, 'gif', k))
    print('wrote', out, '- publish index.html with every other file under it at its own path')
