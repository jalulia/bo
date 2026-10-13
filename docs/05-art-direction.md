# 05 · Art direction

## The two influences

1. **PF Magic Ballz** (*Catz*, *Dogz*, 1995–99) for the cats: bodies built from shaded balls and tapered lines, outlined, sorted far to near, re-posed every frame rather than drawn as sprites. Details in `docs/ballz-technique.json`.
2. **RollerCoaster Tycoon era sprite art** for the places: every material is a short shade ramp mixed with a 4×4 ordered (Bayer) dither instead of smooth gradients; one light source; dense, specific, slightly alive detail.

## Rules

- **Light** comes from the upper right (the room's window, the yard's sun). Top and right edges catch it; bottom and left edges shade.
- **Ramps** are 5–8 steps. Pick a ramp per material (`R` and `Y` in `jungle.js`, the constants in `items.js`), never ad hoc colors.
- **Dither** with `rampAt(ramp, L, x, y)` / `ramp()` (Bayer 4×4). Per-pixel shading goes through `shadePoly(ctx, pts, fn)`.
- **Big things are cached**: furniture painted once per size with `cached(key, w, h, ox, oy, paint)`.
- **Specific over generic**: these are Julia's actual things (the carved coffee table, the burl daybed, the poppy chair, the dragonfly chair, the felt cube, her studio). Paint from the reference in `refs/`, and keep the details that make them hers.
- **Alive, quietly**: clouds drift, curtains sway, dust turns in the sunbeam, a pigeon visits; out back the dapple shimmers, leaves let go, butterflies dip, a squirrel visits. Nothing loud.
- **Time of day**: `dawn`, `day`, `dusk`, `night` phases from the clock change skies, light and tints.

## Characters

| | Bo | Bunny | Juno |
|---|---|---|---|
| Coat | seal point & white: dark seal mask, ears, tail; cream body; white chest, legs, muzzle | all white | sable saddle over cream; white chest, legs, muzzle; a white blaze up the face; golden ears (`JUNO` palette in `cat.js`) |
| Eyes | `boblue`: bright, light, shiny teal-blue | `gold`: gold/yellow | dark brown, almond, in tan patches; eyebrows as short dark lines that lift |
| Build | small, long legs, tucked waist, huge ears, Roman nose, marcel waves | tinier, older | 1.28x the cats; narrow domed skull, long muzzle to a small black nose; ears hang beside the face, perk at rest, lift like flags when alert, lie back along the neck when her chin is down |
| Carriage | low-energy, languid, deliberate walk; tail low with an S and the tip up | brisk; tail up with a hook | lying only: forelegs poured out and crossed, a hind leg flopped to the side, the plumed tail along the bed; the head does the talking |

Body proportions and leg geometry are in `docs/desktop-bo-spec.json` (`body`, `gait`). Do not shorten the legs: "munchkin", "stuck in the ground", "crawling on elbows" and "stumpy" were all past regressions.

## Readability tests

- At actual size (`PX = 2`, size M), can you tell what it is in under a second?
- Does the silhouette alone say the pose? (The blanket lump needed ears poking up and a face peeking out before it read.)
- Is it hers? Compare side by side with the reference photo.
