# Desktop Bo: read this first

You are joining a running collaboration between **Julia** (creative director, owner) and an AI builder. This file is the entry point. Read it fully, then open the docs it points to before changing anything.

## What this is

A Mac desktop pet starring Julia's real cats, drawn the way PF Magic drew *Catz*/*Dogz* ("Ballz": every body part is a shaded ball or a tapered line, sorted far to near, outlined). Two cats:

- **Bo**: seal point & white Cornish Rex, 19. Aloof, sleepy, loves grass. Eyes bright, light, shiny teal-blue. Watches the laser but rarely bothers.
- **Bunny**: all white Cornish Rex, tinier and older, gold eyes, feisty. Wallops and body-slams Bo; they chase and brawl, but mostly nap and chill together.

Three places they live (Julia picks in the toy box under "Where she lives"):

1. **Bo's Jungle** (`room`): a habitat window, an RCT-quality pixel room.
2. **Backyard** (`yard`): outside Julia's green art studio, with a garden you plant.
3. **My desktop** (`desk`): the cats roam over the whole screen.

Each place keeps its own things. The toy box (the panel) puts out furniture, plants, toys, treats and tools.

## Where everything is

| Path | What |
|---|---|
| `src/` | The engine. Plain browser JS, no bundler, one global `BZ`. Load order: `font-data, raster, rex, cat, items, sound, world, jungle, panel`. |
| `src/raster.js` | Pixel primitives: balls, tapered lines, ellipses, polygons. |
| `src/rex.js` | Coats (palettes, masks), personalities. |
| `src/cat.js` | The skeleton, poses (`BZ.POSES`), IK legs, tail springs, drawing a cat. |
| `src/world.js` | `Cat` behavior (state machine `s_<state>`, `pickActivity`, attention), `World` (places, items, fixtures, surfaces, input, tick, render, save/load). |
| `src/items.js` | Everything placeable: registry `BZ.ITEMS`, plants `BZ.PLANTS`, garden `BZ.GARDEN`, bed geometry `BZ.bedGeom`, all item painters. |
| `src/jungle.js` | The two scenes: `BZ.Jungle` (room) and `BZ.Yard` (backyard). |
| `src/panel.js` | The toy box UI. |
| `desktop/` | The Electron app (`main.js`, `renderer.js`, `index.html`, `preload.js`, `panel.html`). `desktop/engine/` is a build copy of `src/`. |
| `web/playpen.src.html` | Browser harness that loads `src/` directly (use it for every test). |
| `web/desktop-bo.html` / `web/playpen.html` | Built single-file page; `playpen.html` is what gets published as the shareable artifact. |
| `build.py` | Copies `src/` into `desktop/engine/` and inlines it into `web/desktop-bo.html`. |
| `dist/update/` | The update payload: `engine/` + `update.sh` (swaps the engine inside the installed app, re-signs, relaunches). |
| `test/` | Playwright harnesses: contact sheets, soaks, close-ups. See `docs/04-architecture.md#testing`. |
| `docs/` | The record. Start with `docs/01-brief.md`. |
| `refs/` | Every reference Julia has sent, filed and described. `refs/README.md` is the index. |

## The docs, in reading order

1. `docs/01-brief.md`: the product and the cats, in Julia's words where possible.
2. `docs/02-design-process.md`: how a request becomes a shipped feature, and the quality bar.
3. `docs/03-collaboration.md`: how to work with Julia, and the documentation protocol (what to update every round).
4. `docs/04-architecture.md`: how the engine fits together; testing; build and deploy.
5. `docs/05-art-direction.md`: palettes, light, dither, the Ballz technique, character specs.
6. `docs/backlog.md`: open requests and ideas, with status. **Check it before starting work.**
7. `docs/changelog.md`: what shipped, by round.
8. `docs/decisions.md`: why things are the way they are.
9. `docs/desktop-bo-spec.json` and `docs/ballz-technique.json`: machine-readable specs.

## Ground rules (Julia's standing preferences)

- Be concise; lead with the thing. Show, don't tell (screens, GIFs, contact sheets).
- US English only.
- Never delete her files. Clean up by moving to a dated quarantine folder with a `MANIFEST`.
- Causal claims: give the caveat or source first.
- If she's terse, keep working productively rather than asking.
- She does not run payloads herself: build, deploy to her Mac, and verify it landed.
- If a git push fails, hand over a `.bundle` and the two commands to apply it.
- Never tell her to go to bed. Don't speak in litotes ("not bad", "not unlike").

## The one-minute workflow

```sh
python3 build.py                                   # src -> desktop/engine + web/desktop-bo.html
cp web/desktop-bo.html web/playpen.html            # the shareable page
node test/scene.js room out.png 200                # look at the room (or: yard)
node test/soak4.js 12000 yard                      # behavior soak: must print "errors: none"
node test/soak3.js 24000 habitat                   # the older full soak
```

Deploying to Julia's Mac is in `docs/04-architecture.md#deploy`. Always verify with a hash and a grep of the installed engine.
