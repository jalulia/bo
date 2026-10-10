# Decisions

Short records of choices someone might later undo by accident. Newest first.

**2026-10-10 · Each place keeps its own things.** Room, yard and desktop have separate item sets (`World.sets`). Why: the daybed and coffee table are permanent in the room but still placeable on the desktop; a yard full of indoor furniture would be odd. Rules out: one shared item list.

**2026-10-10 · The daybed and coffee table are room fixtures.** Julia asked for them to be permanent in the room and still available on the desktop. They're `furniture` fixtures in `BZ.Jungle` and carry `places: ['desk']` in the toy box. Saved copies are dropped from room/yard sets on load.

**2026-10-10 · The "bee" chair is dragonflies.** Julia called it the blue chair with the bee pattern; the photo (`refs/furniture/chair-dragonfly-damask.jpg`) shows gold dragonflies on checked damask. Painted as dragonflies; label "Dragonfly chair."

**2026-10-10 · The poppy chair is tall.** Taller than the generic armchairs (seat at 27 units, back at 68) to match the reference; it gets its own `bedGeom` seat height.

**2026-10-10 · The pod is 20% smaller.** Scaled inside `BZ.podGeom` so drawing, hit test and bed geometry stay consistent.

**2026-10-10 · Garden growth is real time.** Seconds of growth, faster when watered, continuing while the app is closed (capped at 2 hours). Why: something to come back to without being a chore. Nothing wilts or dies.

**2026-10-10 · No new engine files.** The Electron `index.html` lists engine scripts; the update payload swaps only the engine folder. New code goes into existing files (the backyard lives in `jungle.js`).

**2026-10-09 · Roll residual can't lift the body.** Ground-rest lift is weighted by `min(1, |roll|/35)` and pose lerp snaps within 0.01. This fixed "stuck in the ground" after wakes, stretches and brawls. Don't reintroduce unweighted roll lift.

**2026-10-09 · Unique update zip names, verified by hash.** A stale zip once meant a fix never reached the Mac.

**2026-10-08 · Hind leg is short thigh, long shank.** Thigh 7.5, shank 10.5, hock 11 above the paw. Earlier proportions read as munchkin or stumpy.
