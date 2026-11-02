## Feature

<!-- One sentence: what the player can do now that they couldn't before. -->

## Commit plan

<!-- Paste the agreed plan. Systems first, feature last. Tick each one as it lands. -->

- [ ] 1.
- [ ] 2.
- [ ] 3.

## Checklist

- [ ] Every commit passes `bun run check && bun run test`
- [ ] New apps/scams/systems are new files only (`bun run new:<kind> <id>`); no edits to another feature's files
- [ ] Shared files touched (list them, or "none"): `core/state.ts`, `core/events.ts`, `client/*`
- [ ] Each new scam has `redFlags`, `fitTags` (victim weakness tags) and a 3-line `whatToSpot` card
- [ ] No new dependencies (or: reason, exact version, lockfile committed)
- [ ] Dead code removed
- [ ] Consistency: no second way to do something [docs/consistency.md](../docs/consistency.md) already covers
