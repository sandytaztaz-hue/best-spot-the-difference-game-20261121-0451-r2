// shots.js — deterministic screenshot scenes. The game reads
// `?shot=start|play|play2|end&seed=1` from the URL; each shot puts the
// state into the exact scene the screenshots must show, with fixed times
// and scores so the renders are stable run after run.
//
//   start — title screen.
//   play  — mid-play: 3 differences found (firefly, lantern, fish),
//           4 still unfound, counter "Found 3 / 7", score 300, 0:47.
//   play2 — late play: 6 found, 1 unfound, "Found 6 / 7", score 600, 1:38.
//   end   — win screen, all 7 found, score 700, time 2:12.

import { DIFFS } from "./config.js";

export const SHOT_TIME = 2.0; // fixed animation time (seconds) for shots

const SHOT_FOUND = {
  play: ["firefly", "lantern", "fish"],
  play2: ["firefly", "lantern", "fish", "flower", "cat", "moon"],
  end: DIFFS.map((d) => d.id),
};

const SHOT_META = {
  play: { score: 300, clicks: 4, correct: 3, elapsedMs: 47000, startAt: 0 },
  play2: { score: 600, clicks: 7, correct: 6, elapsedMs: 98000, startAt: 0 },
  end: { score: 700, clicks: 8, correct: 7, elapsedMs: 132000, startAt: 0 },
};

export function readShotParams() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get("shot") || "";
  const seed = Number.parseInt(q.get("seed") || "1", 10) || 1;
  return { shot, seed };
}

// Apply a shot to a fresh state. Returns the shot name, or "" for none.
// `now` is performance.now(); shots freeze the timer by faking startAt.
export function applyShot(state, shot, now) {
  if (!shot || !(shot in SHOT_FOUND) && shot !== "start") return "";
  state.seed = 1;
  if (shot === "start") {
    state.screen = "title";
    state.best = 700;
    return "start";
  }
  const meta = SHOT_META[shot];
  state.screen = shot === "end" ? "win" : "play";
  state.found = new Set(SHOT_FOUND[shot]);
  state.score = meta.score;
  state.clicks = meta.clicks;
  state.correctClicks = meta.correct;
  state.elapsedMs = meta.elapsedMs;
  state.startAt = now - meta.elapsedMs;
  state.winAt = now;
  state.message =
    shot === "end"
      ? "The garden glows!"
      : `Found: ${DIFFS.find((d) => d.id === SHOT_FOUND[shot][SHOT_FOUND[shot].length - 1]).name}! (${state.found.size} / ${DIFFS.length})`;
  if (shot === "end" && state.score > state.best) state.best = state.score;
  return shot;
}

// Screenshot note: the play shots never call useHint, so no dashed hint
// ring appears — only the gold rings of differences already found.
