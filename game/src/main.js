// main.js — boots Lantern Garden: canvas setup, game loop, screen state
// machine. Reads ?shot=…&seed=… for the deterministic screenshot scenes.

import { CANVAS_W, CANVAS_H } from "./config.js";
import { createState } from "./world.js";
import { render } from "./render.js";
import { attachInput } from "./input.js";
import { SoundFX } from "./audio.js";
import { readShotParams, applyShot, SHOT_TIME } from "./shots.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const state = createState();
const sfx = new SoundFX();
const params = readShotParams();
const activeShot = applyShot(state, params.shot, performance.now());
const shotMode = activeShot !== "";

attachInput(canvas, state, sfx, (action) => {
  // Hook for future analytics; the game needs no action handling here.
  void action;
});

// Expose a tiny handle for play-testing from the console.
window.__lanternGarden = { state, sfx };

function frame(now) {
  // Screenshots freeze the animation clock; live play runs on real time.
  // In shot mode the render clock is frozen too, so the header timer shows
  // the shot's exact time (e.g. 0:47) instead of drifting while we wait.
  const t = shotMode ? SHOT_TIME : now / 1000;
  const renderNow = shotMode ? state.startAt + state.elapsedMs : now;
  render(ctx, state, renderNow, t);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Loop note: requestAnimationFrame keeps running even on the title screen
// so the lantern glow and fireflies stay alive behind the title.
