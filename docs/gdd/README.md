# The game design document ("Bo 95")

Published: https://claude.ai/artifact/1pQ1vEAJshbkc8B429Yeo8 (private to Julia until shared). Modeled on her Mad Money Tycoon GDD: a Win95 desktop whose windows are the chapters, with the real engine running inside PLAYPEN.EXE.

| Window | What it holds |
|---|---|
| PLAYPEN.EXE | the shipping engine in an iframe (`play/index.html`), the CRT readout, hour pins, the real toy box |
| README.TXT | pitch, tone, core loop, player role, places, casting |
| CATZ.EXE | live portraits, personality bars from `BZ.PERSONALITIES`, nap mixes, adoptables, the voice |
| BEHAVIOR.DAT | the state diagram, `pickActivity` weights, needs/moods/relationships, bed weights, Juno's machine |
| CLOSET.EXE | every item with its engine-drawn icon, what cats do with it, flags; fixtures and surfaces |
| PLACES.MAP | both scenes by day and night, the times-of-day sheet, yard life, the desktop mode |
| BALLZ.DOC | the technique, the exploded cat, live ramps, the RCT rules, readability gates, the characters at a glance |
| ENGINE.SYS | files, the frame, save v4, input, hosts, the test harnesses |
| HOWTO.TXT | run it; add a thing / a nap pose / a behavior / scenery / a bird; record a GIF; ship; a round start to end |
| ROUNDS.LOG | the campaign so far, open backlog, decisions |
| REFS · ALBUM · SPEC.JSON | her photos as ground truth; the GIFs; both specs inlined with Copy |

## Rebuild and republish

```sh
python3 docs/gdd/build.py dist/gdd          # page + engine copies + refs + GIFs into dist/gdd
node docs/gdd/shots.js dist/gdd/img         # room/yard day + night shots (run from the repo root)
node test/juno.js dist/gdd/img/juno-sheet.png; node test/moments.js dist/gdd/img/moments.png   # if they changed
# times-of-day.png is the 8-frame sheet from test/gifs2.js frames (see gifs/2026-10-12/)
```
Then publish `dist/gdd/index.html` to the URL above with every other file under `dist/gdd` as a supporting file at the same path. The prose in `template.html` quotes live engine values only where it reads them from `BZ` (portraits, personalities, icons, ramps, item flags); the weight tables and bed weights are typed in and must be re-checked against `world.js` when those change.
