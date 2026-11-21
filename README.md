# Lantern Garden — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sandytaztaz-hue/best-spot-the-difference-game-20261121-0451-r2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sandytaztaz-hue/best-spot-the-difference-game-20261121-0451-r2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A cozy night garden hides seven small changes. Two pictures hang side by side
under paper lanterns — the left is the original garden, the right has 7 things
different. Find them all before the lanterns burn low. Every pixel of art is
drawn by the game's own canvas code; there are no image files and no network.

Entry for the make.fun bounty: https://make.fun/bounty/best-spot-the-difference-game-20261121-0451

## How to play

- **Click** on a difference in either picture. A correct find earns a glowing
  gold ring on **both** pictures, a chime, and +100 points. A wrong click
  flashes a grey X and costs 10 points.
- **Keyboard:** Tab / arrow keys move the focus ring between the 7 zones,
  Enter or Space marks the focused zone.
- **Hint:** press H or click the Hint button (−50 points) to highlight one
  unfound difference for 3 seconds.
- **M** mutes the sound, **R** restarts.

Find all 7 and the garden glows: the win screen shows your time, score and
accuracy, with the lanterns all lit gold.

## The 7 differences

1. A firefly by the top-left lantern (left only)
2. The middle lantern — red on the left, gold on the right
3. An orange fish in the pond (left only)
4. The big pink flower — 6 petals left, 5 right
5. A black cat on the stone fence (left only)
6. The moon — full left, crescent right
7. The middle stepping stone — round left, square right

## How to run

No build step, no network, no libraries — plain static files.

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` directly in a desktop browser (Chrome).

## Screenshots

Deterministic scenes, rendered from the game's own code with
`?shot=start|play|play2|end&seed=1`:

- `screenshots/1-start.jpg` — title screen
- `screenshots/2-play.jpg` — mid-play, 3 of 7 found
- `screenshots/3-play2.jpg` — late play, 6 of 7 found
- `screenshots/4-end.jpg` — win screen, all 7 found

## Files

- `game/index.html` — the page (1280×720 canvas)
- `game/src/main.js` — boot + game loop
- `game/src/config.js` — layout, colours, the 7 differences
- `game/src/world.js` — state and rules
- `game/src/render.js` — all the canvas art and screens
- `game/src/input.js` — mouse + keyboard
- `game/src/random.js` — seeded RNG for firefly drift
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/audio.js` — WebAudio chime / thud / win arpeggio
- `main.ts` — hand-in program (copies game/ + screenshots/, writes dossier.json)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see `LICENSE`.
