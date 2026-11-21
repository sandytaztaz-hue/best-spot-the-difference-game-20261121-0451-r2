// world.js — game state and rules. Screens: "title" -> "play" -> "win".
// The state holds the found set, score, timer, accuracy, hint state and the
// transient wrong-click flash. All rule changes go through here so the
// renderer only ever draws state, never decides it.

import {
  DIFFS,
  POINTS_FOUND,
  POINTS_WRONG,
  POINTS_HINT,
  HINT_MS,
  MARK_MS,
} from "./config.js";

export function createState() {
  return {
    screen: "title",
    found: new Set(),
    score: 0,
    clicks: 0,
    correctClicks: 0,
    startAt: 0, // performance.now() when play began
    elapsedMs: 0,
    best: 0,
    focusIndex: 0, // keyboard focus: which difference zone is focused
    focusVisible: false,
    hintId: null,
    hintUntil: 0,
    wrongFlash: null, // { x, y, until } in canvas coords, or null
    markFlash: null, // { id, until } briefly pulses a fresh marker
    winAt: 0,
    message: "Click a difference — or press Tab to move, Enter to mark",
    seed: 1,
  };
}

export function startGame(state, now) {
  state.screen = "play";
  state.found = new Set();
  state.score = 0;
  state.clicks = 0;
  state.correctClicks = 0;
  state.startAt = now;
  state.elapsedMs = 0;
  state.focusIndex = 0;
  state.focusVisible = false;
  state.hintId = null;
  state.wrongFlash = null;
  state.markFlash = null;
  state.winAt = 0;
  state.message = "Click a difference — or press Tab to move, Enter to mark";
}

export function toTitle(state) {
  state.screen = "title";
  state.found = new Set();
  state.score = 0;
  state.elapsedMs = 0;
  state.hintId = null;
  state.wrongFlash = null;
}

// The player clicked at picture-relative (rx, ry) on either picture.
// Returns the difference id found, or null for a miss.
export function clickAt(state, rx, ry, now) {
  if (state.screen !== "play") return null;
  state.clicks += 1;
  for (const d of DIFFS) {
    const dx = rx - d.x;
    const dy = ry - d.y;
    if (dx * dx + dy * dy <= d.r * d.r && !state.found.has(d.id)) {
      state.found.add(d.id);
      state.correctClicks += 1;
      state.score += POINTS_FOUND;
      state.markFlash = { id: d.id, until: now + MARK_MS };
      state.message = `Found: ${d.name}! (${state.found.size} / ${DIFFS.length})`;
      if (state.found.size === DIFFS.length) {
        state.screen = "win";
        state.winAt = now;
        state.elapsedMs = now - state.startAt;
        if (state.score > state.best) state.best = state.score;
      }
      return d.id;
    }
  }
  // Miss: small penalty, grey X flash at the click point.
  state.score += POINTS_WRONG;
  state.wrongFlash = { rx, ry, until: now + 700 };
  state.message = "Not quite — look closer!";
  return null;
}

// Mark the keyboard-focused zone (Enter / Space).
export function markFocused(state, now) {
  if (state.screen !== "play") return null;
  const d = DIFFS[state.focusIndex % DIFFS.length];
  if (state.found.has(d.id)) return null;
  state.clicks += 1;
  state.correctClicks += 1;
  state.found.add(d.id);
  state.score += POINTS_FOUND;
  state.markFlash = { id: d.id, until: now + MARK_MS };
  state.message = `Found: ${d.name}! (${state.found.size} / ${DIFFS.length})`;
  if (state.found.size === DIFFS.length) {
    state.screen = "win";
    state.winAt = now;
    state.elapsedMs = now - state.startAt;
    if (state.score > state.best) state.best = state.score;
  }
  return d.id;
}

export function moveFocus(state, delta) {
  state.focusVisible = true;
  state.focusIndex =
    (state.focusIndex + delta + DIFFS.length) % DIFFS.length;
  return DIFFS[state.focusIndex];
}

// Hint: highlight one unfound difference for HINT_MS, costs 50 points.
export function useHint(state, now) {
  if (state.screen !== "play") return null;
  const remaining = DIFFS.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintId = pick.id;
  state.hintUntil = now + HINT_MS;
  state.score += POINTS_HINT;
  state.message = `Hint: ${pick.hint}`;
  return pick.id;
}

export function accuracy(state) {
  if (state.clicks === 0) return 100;
  return Math.round((state.correctClicks / state.clicks) * 100);
}

export function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Rule note: the timer only runs while screen === "play"; the win screen
// freezes elapsedMs at the moment the seventh difference was found.
