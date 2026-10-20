# The game design document ("Bo 95")

Live: https://jalulia.github.io/bo/ (GitHub Pages, from `index.html` at the repo root). Also published as a private artifact: https://claude.ai/artifact/1pQ1vEAJshbkc8B429Yeo8. v1.1: a neutral, class-structured document (v1.0 was a Win95-desktop presentation; Julia asked for the information to lead).

Modeled on the Mad Money Tycoon design document (the chaptered one, not the Win95 artifact): eight chapters with a section index, plates with figure ids and notes, question-column tables, bindings and a claim record; four reference pages.

| Chapter | What it holds |
|---|---|
| 01 Game | player role, experience goals (her words → systems → how measured), the three places, non-goals, design decisions (rule / reason) |
| 02 First session | the fifteen-minute path, attention states (one stimulus, two cats), photo-to-pose bindings |
| 03 Objects & systems | relationship model, object definitions (object / essential relationships / what it becomes on screen), places and fixtures, operating loop, economy (system / player input / consequence / hard boundary), affordance matrix and flags |
| 04 Behavior & character | the state machine (36 states, flags, entries, exits), decision weights, attention and naps, events (event / reaction / purpose), the dog, cast and voice |
| 05 Interface | three views, the hand's complete verb table, toy box vocabulary, readouts, accessibility |
| 06 Art & sound | character construction (exploded skeleton), references, painting rules, scale and material (live ramps), component kit (engine-drawn icons), scenes, the live build, motion and sound |
| 07 Build & test | architecture, the frame, data (save v4), hosts and deploy, production sequence (gates), acceptance tests (test / setup / failure means), decisions, change record |
| 08 Evidence | what has been used, source classes, feedback bindings (her words → change), cast and authority, non-negotiable distinctions, open issues, claim record |
| A–D | machine-readable specs + the thing registry; recipes; moving pictures; document history |

Repo: https://github.com/jalulia/bo

## Rebuild and republish

```sh
python3 docs/gdd/build.py site              # -> index.html + play/index.html at the repo root; commit and push: Pages serves it
node docs/gdd/shots.js docs/gdd/img         # room/yard day + night shots (run from the repo root) when the scenes change
node test/juno.js docs/gdd/img/juno-sheet.png; node test/moments.js docs/gdd/img/moments.png   # if they changed
python3 docs/gdd/build.py artifact dist/gdd # a self-contained copy (engine copies, img, gif) for publishing as an artifact
```
The site build loads the engine from `src/` directly, images from `docs/gdd/img/` and GIFs from `gifs/`, so nothing is duplicated in the repo. The prose in `template.html` quotes live engine values only where it reads them from `BZ` (portraits, personalities, icons, ramps, item flags); the transcribed tables (states, `pickActivity`, bed weights, verbs, systems) must be re-checked against `world.js` when those change.
