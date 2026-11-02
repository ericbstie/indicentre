# Game feel for IndiCentre

One page. Sources are the usual juice references (Jonasson and Purho's "Juice it or lose it", Swink's _Game Feel_, Vlambeer's screen-shake talk) and what the desk-sim crowd actually does: Papers Please (a stamp thunk, a paper rustle, the room getting darker as money runs out), Hypnospace Outlaw (every click on its fake OS has a sound and a short window animation), Jalopy and the Kenney-asset jam games (footsteps and a little light do most of the work in an empty low-poly room).

## What carries over to us

Our game is half walking around a small room and half clicking a fake PC. Juice that fits an action game (screen shake, hit-stop, particles on every number) turns into noise in a desk sim. What works in desk sims is _diegetic_ feedback: the room itself shows how the day is going, and sound stands in for touch. The rule we follow: every touch answers a question the player already has ("am I moving?", "how late is it?", "how hot is this?"), or we cut it.

## Ranked by impact per line of code

| #   | Touch                                                                                          | Answers                                                                                   | Cost            | Risk of noise                                                            |
| --- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------ |
| 1   | **Footsteps** tied to distance walked (soft filtered noise thump, slight pitch jitter)         | "am I moving, how fast?" An empty room with silent movement feels like floating.          | ~20 lines       | Low if quiet and spaced by distance, not time                            |
| 2   | **Ease the camera** when sitting down / standing up (~0.35 s, ease-out) instead of teleporting | Ties the 3D room to the PC; the teleport is the most jarring cut in the game              | ~25 lines       | None; skipped under reduced motion                                       |
| 3   | **Shift light**: tubes drift from cool morning white to warm late-afternoon as the clock runs  | "how late is it?" without reading the HUD; Papers Please uses room light for the same job | ~20 lines       | None, it is slow                                                         |
| 4   | **Heat flicker**: above high heat, a tube light dips now and then (slow dips, not strobes)     | "how hot is this?" the room gets nervous with you                                         | ~25 lines       | Medium: rare, dim dips only, off under reduced motion                    |
| 5   | **Office room tone**: sparse keyboard clatter from coworker desks, louder the closer you stand | Makes the call center feel staffed; walking past a desk sounds like walking past a desk   | ~30 lines       | Medium: keep it sparse and quiet, sfx bus so M mutes it                  |
| 6   | Head bob while walking                                                                         | Pairs with footsteps                                                                      | ~10 lines       | High: many players get motion sick; footsteps already do the job. Skip.  |
| 7   | Hover highlight on interactables (emissive pulse)                                              | "can I use this?" The HUD label already answers it                                        | ~30 lines       | Medium; shared Kenney materials make it fiddly. Later, if playtests ask. |
| 8   | Coin ticks while bucks count up                                                                | "how much did I make?" The success stinger already covers it                              | ~25 lines (HUD) | High: stacks with the stinger                                            |
| 9   | Screen shake / red vignette on a failed scam                                                   | Fail is already a sound and a result page                                                 | ~20 lines       | High: punishing feedback in a learning game reads as scolding            |
| 10  | Day-end lights-out fade before the report card                                                 | Nice beat, but the modal already pauses the game                                          | ~25 lines       | Low; candidate for a later pass                                          |

## What becomes noise

- Anything on a timer instead of an action (ambient loops that never vary, constant bobbing).
- Two cues for one event (coin ticks on top of the success stinger).
- Feedback that punishes: shake or red flashes on failure make the lesson feel like a slap.
- Fast flicker: photosensitivity risk. Dips stay slow and rare.

## Applied in this pass

1 to 5, one commit each, smallest first. All sounds go through the existing sfx bus, so **M** mutes them. Camera ease and heat flicker turn off under `prefers-reduced-motion`. No new assets, no new dependencies, no settings menu.
