# The game design document ("Bo 95")

Published: https://claude.ai/artifact/1pQ1vEAJshbkc8B429Yeo8 (private to Julia until shared). v1.1: a neutral, class-structured document (v1.0 was a Win95-desktop presentation; Julia asked for the information to lead).

| § | Section | What it holds |
|---|---|---|
| 1 | Overview | concept, experience goals (her words → systems), pillars, non-goals, player role and loop, the build running live, glossary |
| 2 | Ontology | class diagram, class table, affordance matrix (who can do what to which class) |
| 3 | Agents | Cat (personality, needs/moods, 36 states, `pickActivity` weights, attention, naps × beds, relationships, voice), Dog (Juno's rest machine, inputs), Wildlife (13 birds, squirrel, pigeon, butterflies, leaves, fireflies), Cast |
| 4 | Things | affordance flags, the catalogue (generated from `BZ.ITEMS`, engine-drawn icons), the bed contract, fixtures and surfaces |
| 5 | Places | place table, both scenes by day and night, layout anchors, time of day |
| 6 | Interactions | the hand's complete verb table: input, target, precondition, effect, feedback |
| 7 | Systems | each system with rule, parameters, status chip, source |
| 8 | Presentation | Ballz (exploded cat), painting rules, live palette, character sheets, readability gates, motion principles |
| 9 | Technical | architecture, frame pipeline, save v4, hosts, tests, build and deploy |
| 10 | Production | a round, feature status, rounds as a playtest log, backlog, decisions, references |
| 11 | Recipes | run it; add a thing / nap pose / behavior / scenery / bird; record a GIF; ship; update this document |
| A–D | Appendices | desktop-bo-spec.json, ballz-technique.json (both with Copy), GIFs, document history |

Repo: https://github.com/jalulia/bo

## Rebuild and republish

```sh
python3 docs/gdd/build.py dist/gdd          # page + engine copies + refs + GIFs into dist/gdd
node docs/gdd/shots.js dist/gdd/img         # room/yard day + night shots (run from the repo root)
node test/juno.js dist/gdd/img/juno-sheet.png; node test/moments.js dist/gdd/img/moments.png   # if they changed
# times-of-day.png is the 8-frame sheet from test/gifs2.js frames (see gifs/2026-10-12/)
```
Then publish `dist/gdd/index.html` to the URL above with every other file under `dist/gdd` as a supporting file at the same path. The prose in `template.html` quotes live engine values only where it reads them from `BZ` (portraits, personalities, icons, ramps, item flags); the weight tables and bed weights are typed in and must be re-checked against `world.js` when those change.
