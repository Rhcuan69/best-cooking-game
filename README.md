[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Rhcuan69/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Rhcuan69/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Sizzle & Serve — Rush Hour Kitchen

An original 2D canvas cooking game, built for the make.fun bounty
"Make the best cooking game" (best-cooking-game-20261125-0137):
https://make.fun/bounty/best-cooking-game-20261125-0137

Run one 150-second lunch shift in a little diner kitchen. Orders land on
the order board with a patience timer; each one names a dish to stack exactly
as written. Pick ingredients off the counter — buns and cheese are ready at
once, patties have to be grilled (4 seconds, and they burn if you forget
them), lettuce, tomato and onion have to be chopped — build the dish on the
plate and hit SERVE. A correct dish pays its base price plus a tip for the
patience left on the ticket, and serving three in a row without a mistake
builds a combo multiplier up to x2. A wrong dish costs 30 points, an order
that walks out costs 25. Score 1000 or more in the shift to earn the Chef's
Star. The rush grows: orders arrive faster and the last 30 seconds tick down
in red.

Mouse: click bins, grill, chopping board, plate, SERVE and TRASH. Keyboard:
1–6 pick an ingredient, G grill, C chop, Space serve, T trash, P pause,
M mute, R cook again. All art is drawn in canvas (grill, board, plates,
food); all sounds are synthesized WebAudio. No network requests, no
external assets, plays offline from static files.

## Play

```sh
node main.ts            # writes game/ + screenshots/ + dossier.json to /output
# or serve the game locally with any static server, e.g. from game/:
python3 -m http.server 8080   # then open http://localhost:8080
```

`?seed=N` fixes the shift's orders. `?shot=start|play|serve|end&seed=N`
stages a scene (title, mid-play, dish mid-assembly, shift over) by playing
the real rules forward with an autopilot.

## Files

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` (Node 22, standard library only).
- `game/index.html`, `game/src/` — the game itself, vanilla JavaScript:
  `config.js` (tuning, recipes, layout), `random.js` (seeded RNG),
  `audio.js` (synthesized sounds), `input.js` (keyboard/mouse),
  `kitchen.js` (orders, grill, board, plate, scoring), `render.js`
  (canvas drawing: kitchen, order board, food), `shots.js` (staged scenes,
  autopilot), `main.js` (boot and the one loop).
- `screenshots/` — 4 real renders of the game's own code: title, live play
  with orders and a dish mid-assembly, a plate ready to serve, shift over.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Entry for make.fun by @rhcuan28 — https://make.fun/r/nx2h6gdz
