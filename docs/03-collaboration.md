# 03 · Collaboration and documentation protocol

## Roles

- **Julia**: creative director and the cats' person. She decides what it should feel like. Her references are ground truth for how Bo and Bunny look and move.
- **Builder (an AI session)**: designs, builds, tests, deploys and keeps the record. Owns quality: she should never be the one to find a crash or a sunken leg.

## How she works

- She sends requests in bursts, often mid-build, with screenshots or photos. Treat every message as a backlog item; acknowledge briefly and keep going.
- She looks at the running app on her Mac and the published playpen. She doesn't run scripts.
- Short replies from her mean "keep going," not "stop."

## How to talk to her

- Lead with the thing she can see. Concise. US English. Show, don't tell: screenshots, GIFs, contact sheets.
- No litotes. Never tell her to go to bed.
- When you take a judgment call (e.g. her "bee pattern" chair turned out to be dragonflies in the photo), say so in one line.

## Where the project lives

- **Canonical source**: `~/Developer/desktop-bo` on Julia's Mac, a git repository. Cloud sessions are temporary: bring the repo in, work, write it back and commit before the session ends.
- **Installed app**: `/Applications/Desktop Bo.app` (engine at `Contents/Resources/app/engine/`).
- **Shareable page**: the published playpen artifact (one URL, updated in place each round).
- **claude.ai Project "Boz"**: holds copies of `AGENTS.md`, the brief, the process, this protocol, the backlog and the changelog, so any chat in the project starts informed. Refresh those copies when they change; don't churn them otherwise.

## Documentation protocol (every round)

| When | Update |
|---|---|
| A request arrives | `docs/backlog.md`: new row, her words, date, status `open`. |
| A reference arrives | `refs/<category>/<slug>.<ext>`, a row in `refs/README.md`, an entry in `refs/refs.json`. Photos: 2000px JPEG q88. Video: 720p H.264, no audio. Screenshots of the app go to `refs/app-feedback/` with the note she sent. |
| A choice that someone might later undo by accident | `docs/decisions.md`: date, decision, why, what it rules out. |
| Technique changes (proportions, poses, rendering rules) | `docs/desktop-bo-spec.json` (bump `version`). |
| Something ships | `docs/changelog.md` (round, date, what she can see), backlog status `shipped`, then commit with a message naming the round. |

Commit messages: `round <date><letter>: <what she can see>`, e.g. `round 2026-10-10e: backyard, garden, chairs, cubby`.

## References

- Filing names: `<subject>-<what>-<detail>`, lowercase, hyphens (`bo-felt-cube-arm-out.jpg`).
- Categories: `bo`, `bunny`, `together`, `motion` (video), `furniture`, `plants`, `scenes`, `technique`, `app-feedback`.
- Each entry says what it **shows** and what it **informs** (which feature or pose it is the reference for).

## Files on her computer

Never delete. To clean up, move into `_quarantine/<YYYY-MM-DD>/` beside the originals with a `MANIFEST.txt` listing what moved and why.

## When something breaks on her side

1. Reproduce in the playpen with a soak or a staged scene.
2. Fix, verify with the same harness, and add the case to a test.
3. Deploy with a fresh zip name; verify the hash and grep the installed engine for a marker unique to the fix.
4. Tell her what was wrong in one sentence.
