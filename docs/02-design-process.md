# 02 · Design process

How a request from Julia becomes something she can see on her Mac. Every round follows these stages; skip none.

## 1. Intake

- Copy the request into `docs/backlog.md` the moment it arrives, in her words, with the date. Mid-work messages are new backlog items, not interruptions to drop.
- File every reference she sends into `refs/` (see `docs/03-collaboration.md#references`) before designing from it.
- If a request is ambiguous but cheap to redo, make the best reading and say which reading you took. Ask only when a wrong guess is expensive.

## 2. Look before designing

- Open the relevant references. For motion, extract a frame sheet from the video (`ffmpeg -vf "fps=1.5,scale=320:-1,tile=6x3"`).
- Write down, in the backlog item, the two or three observable facts the work must hit. Example (the dangle nap): *curled body; one foreleg poured out long; the paw hangs over an edge, toe beans down.*

## 3. Design the behavior, not just the pose

A feature is a pose or a picture **plus** when it happens and what it means:

- **Trigger**: what in the world makes a cat choose it (a weight in `pickActivity`, a bed type in `startNap`, a stimulus).
- **Personality**: who does it more (Bo vs Bunny). Bo is aloof and sleepy; Bunny is feisty and curious.
- **Shape**: the pose keys in `BZ.POSES` (body, head, paws, tail) and any gesture.
- **Exit**: how it ends naturally (a nap shift, a groom, a startle).
- **Interplay**: what the other cat does about it (join, ambush, ignore).

## 4. Build

- Match the art direction in `docs/05-art-direction.md`: short ramps, ordered dither, light from the upper right, dense specific detail. Big painted things go through `cached()` so they cost nothing per frame.
- Put things where they belong (see `docs/04-architecture.md`). No new engine files without updating `desktop/index.html`, `build.py` and the update script; prefer adding to an existing file.
- Keep the save format backward compatible. Bump `v` in `World.save()` and migrate in `World.load()` when it changes.

## 5. Verify (the quality bar)

Nothing ships until all of these pass:

- **Look**: a close-up (`test/one.js`) for any new item, a scene shot (`test/scene.js`) for any scene change, and a staged contact sheet (`test/moments.js`) for any new behavior. Actually look at the images; fix what reads wrong.
- **Soak**: `node test/soak4.js 12000 yard`, `node test/soak4.js 12000 room` and `node test/soak3.js 24000 habitat` all print `errors: none` and no page errors. Check the state histogram for anything that never happens or happens far too much.
- **Legs**: no cat sinks into the floor, crawls, or goes stumpy after naps, wakes or brawls (the history of leg bugs is in `docs/changelog.md`).
- **Readability test**: would Julia recognize it at actual size, at a glance? If it needs explaining, redraw it.

## 6. Ship

- Build, publish the playpen, package the update with a **unique zip name**, deploy to the Mac, verify the hash and grep markers in the installed engine (`docs/04-architecture.md#deploy`).
- Record GIFs or a contact sheet of the new things for her.

## 7. Record

Same round, before reporting: update `docs/changelog.md`, `docs/backlog.md` statuses, `docs/decisions.md` for anything non-obvious, `docs/desktop-bo-spec.json` for technique changes, `refs/` for new references, then commit.

## 8. Report

Lead with what she can now see. A sentence or two per thing, a GIF if it moves. Name anything left undone and what's next. No step-by-step recaps.
