// input.js — mouse + keyboard handling. Clicks on either picture are
// mapped to picture-relative coordinates and handed to world.clickAt.
// The Hint button in the header is clickable too. Keyboard: Tab / arrows
// move a focus ring between the 7 zones, Enter / Space marks it, H hints,
// M mutes, R restarts.

import { LEFT_X, RIGHT_X, PIC_Y, PIC_W, PIC_H, DIFFS } from "./config.js";
import {
  startGame,
  clickAt,
  markFocused,
  moveFocus,
  useHint,
  toTitle,
} from "./world.js";
import { HINT_BTN } from "./render.js";

function pictureHit(cx, cy) {
  if (cy < PIC_Y || cy > PIC_Y + PIC_H) return null;
  if (cx >= LEFT_X && cx <= LEFT_X + PIC_W) {
    return { rx: cx - LEFT_X, ry: cy - PIC_Y };
  }
  if (cx >= RIGHT_X && cx <= RIGHT_X + PIC_W) {
    return { rx: cx - RIGHT_X, ry: cy - PIC_Y };
  }
  return null;
}

export function attachInput(canvas, state, sfx, onAction) {
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener("click", (e) => {
    const now = performance.now();
    sfx.unlock();
    const { x, y } = canvasPos(e);
    if (state.screen === "title") {
      startGame(state, now);
      onAction("start");
      return;
    }
    if (state.screen === "win") return;
    // Hint button?
    if (
      x >= HINT_BTN.x && x <= HINT_BTN.x + HINT_BTN.w &&
      y >= HINT_BTN.y && y <= HINT_BTN.y + HINT_BTN.h
    ) {
      const id = useHint(state, now);
      if (id) onAction("hint");
      return;
    }
    const hit = pictureHit(x, y);
    if (!hit) return;
    const found = clickAt(state, hit.rx, hit.ry, now);
    if (found) {
      sfx.chime();
      onAction("found", found);
      if (state.screen === "win") sfx.win();
    } else {
      sfx.thud();
      onAction("miss");
    }
  });

  window.addEventListener("keydown", (e) => {
    const now = performance.now();
    if (e.key === "m" || e.key === "M") {
      const muted = sfx.toggleMute();
      state.message = muted ? "Sound off (M to turn back on)" : "Sound on";
      return;
    }
    if (e.key === "r" || e.key === "R") {
      startGame(state, now);
      onAction("restart");
      return;
    }
    if (state.screen === "title" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      sfx.unlock();
      startGame(state, now);
      onAction("start");
      return;
    }
    if (state.screen === "win") return;
    if (state.screen !== "play") return;
    if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      sfx.unlock();
      moveFocus(state, 1);
      sfx.tick();
      onAction("focus");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      sfx.unlock();
      moveFocus(state, -1);
      sfx.tick();
      onAction("focus");
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      sfx.unlock();
      const found = markFocused(state, now);
      if (found) {
        sfx.chime();
        onAction("found", found);
        if (state.screen === "win") sfx.win();
      }
    } else if (e.key === "h" || e.key === "H") {
      const id = useHint(state, now);
      if (id) onAction("hint");
    }
  });

  // Keep the focus ring honest: hovering a picture hides the keyboard ring
  // until Tab is pressed again (mouse players don't need it).
  canvas.addEventListener("mousemove", () => {
    if (state.screen === "play") state.focusVisible = false;
  });
}
