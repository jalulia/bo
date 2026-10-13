# 04 · Architecture

## Runtime shape

- One global namespace `BZ`. Files are plain scripts loaded in order: `font-data, raster, rex, cat, items, sound, world, jungle, panel`. The Electron app loads them from `engine/`; the playpen inlines them.
- Low-res canvas: the world draws at `PX = 2` (one art pixel = 2 screen pixels), `imageSmoothingEnabled = false`. A second full-res overlay canvas carries the hover name tag.
- `World.tick()` runs every 33 ms: items, stimuli, relationships, each cat's `think()` + `animate()`, then `render()`.

## Cats (`src/cat.js`, `src/world.js`)

(Juno the dog is `BZ.Dog` at the end of `cat.js`: a lying dog in the same Ballz vocabulary (poses `sphinx`, `chin`, `sleep`; a 3D head that yaws and pitches toward `look`; `pet(region, x, y)`, `tap()`, `at(x, y)` hit test), drawn through the shared `BZ.drawOutlined` pass. Her behavior is `Dog.tickRest(env)` (watch → doze → sleep, reactions); `Yard.tickDog` and `Jungle.tickDog` build `env`. In the room she lies on the daybed's left cushion (`furniture[0].dogOn`). Her bed is the `dogbed` fixture (`items.js`: registry, `bedGeom` with Bunny's spot at the foot, `paintDogbed`). `World.dogAt` routes pointer presses to her; `Cat.s_skeptic` is Bo's reaction.)

- **Skeleton**: balls and tapered lines (`LINES`), placed by `buildSkeleton` from a pose. Front legs: IK 12+12 from the shoulder. Hind legs: thigh 7.5, shank 10.5, hock 11 above the paw. Roll about the spine with a ground-rest lift weighted by `min(1, |roll|/35)`.
- **Poses**: `BZ.POSES` (stand, sit, loaf, sphinx, baguette, crescent, dangle, lounge, flop, crouch, beg, eat, graze, stretch, stretchBack, slink, rear, tussle, wallStretch, bellyup, lunge, crabArch, leap, pin, kick, flinch, held, ...). Keys: hip/chest positions, back lift, head offsets and angles, paw targets `[forward, up, side]` with leg modes `ik | flat | tuck | sit | hide`, tail shape, ears, lids.
- **Gait**: `applyGait` layers flex, girdles, stride and lead yaw onto a base pose; any gait on a base with `hipY < 29` falls back to stand; creep/crouch/slink use the slink pose.
- **Tail**: 15-joint spring chain plus a gesture layer (flick, twitch, curl, hook, swish, thump, wave, shiver) scheduled by state and mood.
- **Behavior**: a state machine. Each state is a method `s_<state>`; `setState` resets per-state fields. `pickActivity()` returns a weighted choice; `BUSY` states can't be interrupted by the world; `NAPPING` states recover energy. Attention: every stimulus has an interest level per cat that must cross her threshold (aloof cats have higher ones).
- **Beds**: anything with `bed: true`. `BZ.bedGeom(it, size)` returns `{ front, spot, rootPx, clip, sortY, face }`: walk to `front`, hop to `spot`, sit `rootPx` above it, optionally clipped to an ellipse (pod, felt cube), sorted at `sortY`. `planBed` decides what she does there first (watch, peek, knead, burrow, knock things off).

## Places, items, fixtures, surfaces (`src/world.js`)

- **Input**: pointer events (mouse, pen, touch). On touch, a lifted finger means no pointer (the laser dot goes away, cats stop staring at it). A finger dragged on empty ground pans the camera when there is one.
- **Camera**: when the host passes `minW` in the stage rect and the window is narrower, the stage becomes `minW` wide and `World.view` holds the window; `cam.x` follows the awake cats (or the thing you're holding), with a hold after a manual pan. Rendering clips to the view and translates by `-cam.x`; input adds `cam.x`.
- **Places**: `room`, `yard`, `desk`. `World.sets[place]` holds each place's placeable items; `swapPlace` stashes and restores them. `sceneKey` is room or yard; the habitat window shows that scene; roam mode is `desk`.
- **Items**: `BZ.ITEMS` (registry), one per type per place. Flags: `bed`, `soft`, `burrow`, `box`, `ball`, `tool`, `snack`, `consumable`, `plant`, `garden`, `fixed`, `places` (where the toy box offers it).
- **Fixtures**: objects a scene provides that aren't saved or dragged (`fixed: true`): window ledges, the daybed's second seat, the room's daybed and coffee table, the felt cube, the yard's steps, potting-shelf perch, tire swing, Adirondack chair, Juno's bed. `syncFixtures()` rebuilds them on layout and keeps the same objects so a cat sitting on one isn't knocked off. Fixtures with `draw: true` render through `drawItem`.
- **Surfaces**: raised places small things can sit (`World.surfaces()`): sill, bookcase top, two shelves, coffee table; yard shelf top, shelf middle, wire stand, landing. Items on a surface carry `surf`, `su` (position along it) and `lift`. Cats on a bed with a surface may knock things off (`knockOff`); falling things use `z`/`vz`.
- **Sweaters**: `cat.sweater = { bow }` (saved with the cat). `drawCatRaw` draws the torso balls and the topline and upper-foreleg lines in the `knit` ramp with the `knit` ball texture, and adds a bow item at the throat (front views only). Toggle with the `sweater` tool (`World.dress`).
- **Garden**: plots and slots come from `BZ.Yard`; plants are `sprout` items with `kind, plot, slot, g (growth seconds), water`. `BZ.growSprout` sets `stage` 0–3. Growth continues while the app is closed (capped).

## Scenes (`src/jungle.js`)

Both scenes implement: `layout(stage)`, `paint()`, `drawBack(ctx)`, `drawFront(ctx)`, `floorY`, `fixtures()`, `surfaces()`, `birdSpot()`, and optionally `sunSpots()`, `props()` (things sorted with the cats: the tree trunk, the stone bunny, Juno, the easel, the kick wheel), `stimuli()` (butterflies, leaves, the squirrel, ground birds), `plotSlot()`, `slotPos()`. Static art is painted once into offscreen canvases and repainted when the time-of-day phase changes (`BZ.hourOverride` pins the hour for renders). At night the room draws a dim with the lamp pools cut out (`Jungle.drawNight`). Scenery is drawn with the item technique: `shade(g, pts, fn)` (per-pixel polygon fill), `rampAt` (ramp + ordered dither), `ellPts`, `leafPts`; the yard's painters are `paintRhodo`, `paintHydrangea`, `paintFeeder`, `paintStudioStuff` (easel, wheel; cached), `paintSandbox`.

## Save format (v4)

```json
{ "cats": [...], "sets": { "room": [...], "yard": [...], "desk": [...] }, "scene": "room|yard",
  "rels": {...}, "size": 1.2, "sound": true, "v": 4, "savedAt": 0 }
```
Older saves (`items`, v3) load into both `room` and `desk`. The daybed and coffee table are dropped from room/yard sets because the room owns them.

## Hosts

- `web/playpen.src.html`: desktop layout (window + toy box beside it), phone layout (window on top, toy box as a bottom sheet that drops when you pick a thing), portrait-tablet layout (window on top, toy box open below). Media queries: `(max-width: 820px), (max-height: 560px)` is small; `(min-width: 600px) and (max-aspect-ratio: 4/5)` is the tablet case.
- `desktop/`: the Electron app, unchanged in shape; the toy box popover uses the same `BZ.Panel`.

## Testing

| Harness | Use |
|---|---|
| `node test/ux.js phone|tablet|desktop out.png` | A scripted walkthrough (pick, place, pet, laser, put down, switch to the yard) with touch or mouse; prints what happened. |
| `node test/juno.js out.png` | Juno's pose sheet (resting, looking, alert, chin, asleep, petted). |
| `node test/junoyard.js out.png` | Juno in the yard: Bunny on the bed, a hand on her head, Bo's look (three screenshots). |
| `node test/gifs2.js <scenario> out.gif` | The art-directed GIF set by time of day (`dawn-room`, `day-laser`, `dusk-cubby`, `night-lamp`, `day-yard`, `dawn-feeder`, `dusk-doors`, `night-yard`); sets `BZ.hourOverride`. |
| `xvfb-run -a npx electron --no-sandbox test/electron-smoke.js` | Boots the Mac app's windows headlessly and screenshots them. |
| `node test/one.js "t=<type>&s=1.6&px=4" out.png` | Close-up of one item (`&lump=1&peek=30` for the blanket lump). |
| `node test/scene.js room|yard out.png [ticks] [w] [h]` | The habitat window after N ticks. |
| `node test/moments.js out.png` | Staged contact sheet of key behaviors. |
| `node test/soak4.js N yard|room` | Long run with tools, surfaces and the garden; prints a state histogram and errors. |
| `node test/soak3.js N habitat|roam` | The original all-items soak. |
| `test/strip.html`, `test/sample.js` | Filmstrips and pose contact sheets. |

## Build

`python3 build.py` copies `src/*.js` to `desktop/engine/` and writes `web/desktop-bo.html`. Copy it to `web/playpen.html` and publish that file as the artifact (same path keeps the same URL).

## Deploy

The installed app is `/Applications/Desktop Bo.app`. Only the engine changes between rounds:

1. `rm -rf dist/update/engine && cp -r desktop/engine dist/update/engine`
2. `cd dist && zip -qr DesktopBo-update-<MMDD><letter>.zip update` (a **new name every time**; a stale zip once cost a whole round) and record its `sha256sum`.
3. Copy the zip to the Mac (`~/Applications/`), check `shasum -a 256` matches.
4. `ditto -x -k` it into a fresh folder and run `zsh <folder>/update/update.sh` (quits the app, swaps the engine, re-signs ad hoc, relaunches).
5. Grep the installed engine (`/Applications/Desktop Bo.app/Contents/Resources/app/engine/*.js`) for markers unique to this round.

Changes to `desktop/main.js`, `index.html`, `renderer.js` or `preload.js` need a full app rebuild (`@electron/packager`) and reinstall, not the engine swap.
