// render.js — draws everything: the garden scene (twice, with the 7
// differences applied to the right picture), gold ring markers, header,
// footer, title screen and win screen. All art is canvas vector drawing —
// shapes and gradients, no external images.

import {
  CANVAS_W,
  CANVAS_H,
  PIC_W,
  PIC_H,
  LEFT_X,
  RIGHT_X,
  PIC_Y,
  MESSAGE_Y,
  DOTS_Y,
  FOOTER_Y,
  COLOURS,
  DIFFS,
} from "./config.js";
import { makeFireflies, fireflyAt } from "./random.js";
import { formatTime, accuracy } from "./world.js";

// Hint button hit area (canvas coords), shared with input.js.
export const HINT_BTN = { x: 1124, y: 12, w: 116, h: 40 };

const flies = makeFireflies(1, 9, PIC_W, PIC_H);
const stars = makeFireflies(7, 26, PIC_W, 200).map((s) => ({
  x: s.bx,
  y: 12 + (s.phase / (Math.PI * 2)) * 150,
  r: 0.8 + ((s.phase * 7) % 1) * 1.1,
}));

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

// One paper lantern. `gold` picks the paper colour; `lit` adds a warm glow.
function drawLantern(ctx, x, y, w, h, gold, lit, t) {
  const flicker = lit ? 0.85 + 0.15 * Math.sin(t * 3 + x) : 0.55;
  if (lit) {
    const g = ctx.createRadialGradient(x, y, 4, x, y, 70);
    g.addColorStop(0, "rgba(255, 205, 110, 0.5)");
    g.addColorStop(1, "rgba(255, 205, 110, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 70, y - 70, 140, 140);
  }
  ctx.fillStyle = gold ? COLOURS.lanternGold : COLOURS.lanternRed;
  ctx.globalAlpha = flicker;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, w * 0.32);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Paper ribs.
  ctx.strokeStyle = "rgba(120, 20, 20, 0.35)";
  ctx.lineWidth = 2;
  for (const dx of [-w * 0.22, 0, w * 0.22]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y - h / 2 + 3);
    ctx.quadraticCurveTo(x + dx * 1.35, y, x + dx, y + h / 2 - 3);
    ctx.stroke();
  }
  // Caps and tassel.
  ctx.fillStyle = "#7a2d12";
  ctx.fillRect(x - 10, y - h / 2 - 5, 20, 7);
  ctx.fillRect(x - 10, y + h / 2 - 2, 20, 7);
  ctx.strokeStyle = "#f5b942";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2 + 5);
  ctx.lineTo(x, y + h / 2 + 18);
  ctx.stroke();
  ctx.fillStyle = "#f5b942";
  ctx.beginPath();
  ctx.arc(x, y + h / 2 + 21, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoon(ctx, x, y, r, crescent) {
  ctx.fillStyle = COLOURS.moon;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (crescent) {
    ctx.fillStyle = "#232a4a";
    ctx.beginPath();
    ctx.arc(x + r * 0.55, y - r * 0.15, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(190, 165, 120, 0.55)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.arc(x + r * 0.35, y + r * 0.3, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x, y, r, x, y, r * 2.1);
  g.addColorStop(0, "rgba(247, 234, 208, 0.28)");
  g.addColorStop(1, "rgba(247, 234, 208, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 2.1, y - r * 2.1, r * 4.2, r * 4.2);
}

function drawFirefly(ctx, x, y, glow) {
  const g = ctx.createRadialGradient(x, y, 0.5, x, y, 12);
  g.addColorStop(0, `rgba(255, 240, 140, ${0.9 * glow})`);
  g.addColorStop(0.4, `rgba(200, 230, 90, ${0.45 * glow})`);
  g.addColorStop(1, "rgba(200, 230, 90, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - 12, y - 12, 24, 24);
  ctx.fillStyle = "#ffe98a";
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx, x, y, petals, big) {
  const R = big ? 26 : 12;
  const petalLen = big ? 30 : 13;
  ctx.fillStyle = "#f27ba7";
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * petalLen * 0.62;
    const py = y + Math.sin(a) * petalLen * 0.62;
    ctx.beginPath();
    ctx.ellipse(px, py, petalLen * 0.52, petalLen * 0.34, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffd76a";
  ctx.beginPath();
  ctx.arc(x, y, R * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8a13c";
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y + 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawCat(ctx, x, y) {
  ctx.fillStyle = "#17141d";
  // Body (sitting).
  ellipse(ctx, x, y + 12, 15, 20);
  ctx.fill();
  // Head.
  ctx.beginPath();
  ctx.arc(x, y - 12, 12, 0, Math.PI * 2);
  ctx.fill();
  // Ears.
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 18);
  ctx.lineTo(x - 13, y - 30);
  ctx.lineTo(x - 3, y - 22);
  ctx.closePath();
  ctx.moveTo(x + 10, y - 18);
  ctx.lineTo(x + 13, y - 30);
  ctx.lineTo(x + 3, y - 22);
  ctx.closePath();
  ctx.fill();
  // Tail curling up.
  ctx.strokeStyle = "#17141d";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 13, y + 28);
  ctx.quadraticCurveTo(x + 30, y + 22, x + 26, y + 2);
  ctx.stroke();
  // Eyes.
  ctx.fillStyle = "#ffd76a";
  ctx.beginPath();
  ctx.arc(x - 4.5, y - 13, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 4.5, y - 13, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFish(ctx, x, y, t) {
  const wig = Math.sin(t * 4 + x) * 2;
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail.
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 24, y - 8 + wig);
  ctx.lineTo(x - 24, y + 8 + wig);
  ctx.closePath();
  ctx.fill();
  // Fin + eye.
  ctx.fillStyle = "#e56b1f";
  ctx.beginPath();
  ctx.ellipse(x + 2, y - 6, 5, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1a26";
  ctx.beginPath();
  ctx.arc(x + 9, y - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

// The garden scene. `right` = true draws the right picture with the 7
// differences applied. `allLit` (win screen) lights every lantern gold.
export function drawGarden(ctx, ox, oy, right, t, allLit) {
  ctx.save();
  ctx.translate(ox, oy);
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PIC_H);
  sky.addColorStop(0, COLOURS.skyTop);
  sky.addColorStop(0.55, COLOURS.skyMid);
  sky.addColorStop(1, COLOURS.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PIC_W, PIC_H);
  // Stars.
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  for (const s of stars) {
    ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t + s.x));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Moon (full left, crescent right).
  drawMoon(ctx, 482, 58, 26, right);
  // Distant hills.
  ctx.fillStyle = "#1e2b45";
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(140, 250, 300, 292);
  ctx.quadraticCurveTo(430, 322, 560, 282);
  ctx.lineTo(560, 460);
  ctx.lineTo(0, 460);
  ctx.closePath();
  ctx.fill();
  // Trees at the edges.
  drawTree(ctx, 34, 330, 1.05, t);
  drawTree(ctx, 528, 322, 0.95, t);
  // Lantern string.
  ctx.strokeStyle = "#3a2f22";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, 34);
  ctx.quadraticCurveTo(280, 78, 552, 34);
  ctx.stroke();
  // Lanterns: left small, middle big, right small.
  drawLantern(ctx, 92, 92, 44, 54, allLit ? true : false, true, t);
  drawLantern(ctx, 280, 100, 58, 70, allLit ? true : right, true, t);
  drawLantern(ctx, 466, 92, 44, 54, false, true, t);
  // Firefly near the top-left lantern — left picture only.
  if (!right) drawFirefly(ctx, 118, 52, 0.85 + 0.15 * Math.sin(t * 2.4));
  // Grass.
  const grass = ctx.createLinearGradient(0, 380, 0, PIC_H);
  grass.addColorStop(0, COLOURS.grass);
  grass.addColorStop(1, COLOURS.grassDark);
  ctx.fillStyle = grass;
  ctx.fillRect(0, 396, PIC_W, PIC_H - 396);
  // Bushes.
  ctx.fillStyle = "#26512a";
  ellipse(ctx, 60, 408, 70, 26);
  ctx.fill();
  ellipse(ctx, 500, 412, 76, 24);
  ctx.fill();
  // Stone fence (right side, behind the cat).
  ctx.fillStyle = COLOURS.fence;
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, 392 + i * 42, 318, 40, 26, 5);
    ctx.fill();
  }
  ctx.fillStyle = COLOURS.fenceDark;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(392 + i * 42, 340, 40, 4);
  }
  // Cat on the fence — left picture only.
  if (!right) drawCat(ctx, 472, 296);
  // Pond.
  const pond = ctx.createLinearGradient(0, 350, 0, 445);
  pond.addColorStop(0, COLOURS.pondLight);
  pond.addColorStop(1, COLOURS.pond);
  ctx.fillStyle = pond;
  ctx.beginPath();
  ctx.ellipse(280, 392, 205, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  for (const [ry, rx] of [[378, 120], [396, 150], [412, 110]]) {
    ctx.beginPath();
    ctx.ellipse(280, ry, rx, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Fish — left picture only.
  if (!right) drawFish(ctx, 196, 386, t);
  // Stepping stones across the pond's front edge.
  drawStone(ctx, 180, 432, false);
  drawStone(ctx, 282, 432, right); // round left, square right
  drawStone(ctx, 384, 432, false);
  // Big pink flower, bottom-left: 6 petals left, 5 right.
  drawFlower(ctx, 82, 382, right ? 5 : 6, true);
  ctx.strokeStyle = "#2e6b34";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(82, 408);
  ctx.quadraticCurveTo(78, 430, 70, 446);
  ctx.stroke();
  // Small flowers scattered.
  drawFlower(ctx, 150, 420, 5, false);
  drawFlower(ctx, 440, 428, 5, false);
  drawFlower(ctx, 520, 404, 5, false);
  // Drifting fireflies over the garden.
  for (const f of flies) {
    const p = fireflyAt(f, t);
    drawFirefly(ctx, p.x, p.y, p.glow);
  }
  // Frame.
  ctx.strokeStyle = "rgba(253, 246, 227, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, PIC_W - 3, PIC_H - 3);
  ctx.restore();
}

function drawTree(ctx, x, baseY, s, t) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(s, s);
  ctx.fillStyle = "#4a3220";
  ctx.fillRect(-7, -90, 14, 90);
  ctx.fillStyle = "#1f4d2a";
  const sway = Math.sin(t * 0.8 + x) * 2;
  for (const [cx, cy, r] of [[-26, -110, 34], [24, -108, 32], [0, -140, 40]]) {
    ctx.beginPath();
    ctx.arc(cx + sway, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2a6b35";
  ctx.beginPath();
  ctx.arc(-14 + sway, -128, 22, 0, Math.PI * 2);
  ctx.arc(14 + sway, -122, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStone(ctx, x, y, square) {
  ctx.fillStyle = "#b9b0a0";
  ctx.strokeStyle = "#8d8578";
  ctx.lineWidth = 2;
  if (square) {
    roundRect(ctx, x - 24, y - 13, 48, 26, 5);
  } else {
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 14, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.ellipse(x - 6, y - 4, 10, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Markers, header, footer, screens ----

function drawGoldRing(ctx, x, y, r, pulse) {
  const pr = r + (pulse ? Math.sin(pulse * 6) * 2 : 0);
  ctx.save();
  ctx.shadowColor = "rgba(255, 215, 106, 0.9)";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, pr - 4, 0, Math.PI * 2);
  ctx.stroke();
  // Little sparkle ticks.
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 2.5;
  for (const a of [0.5, 2.1, 3.7, 5.3]) {
    const x1 = x + Math.cos(a) * (pr + 5);
    const y1 = y + Math.sin(a) * (pr + 5);
    const x2 = x + Math.cos(a) * (pr + 11);
    const y2 = y + Math.sin(a) * (pr + 11);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWrongX(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = COLOURS.wrong;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 11);
  ctx.lineTo(x + 11, y + 11);
  ctx.moveTo(x + 11, y - 11);
  ctx.lineTo(x - 11, y + 11);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(ctx, state, now) {
  ctx.fillStyle = "#14121f";
  ctx.fillRect(0, 0, CANVAS_W, 64);
  ctx.fillStyle = "rgba(255, 215, 106, 0.16)";
  ctx.fillRect(0, 62, CANVAS_W, 2);
  ctx.fillStyle = COLOURS.cream;
  ctx.font = "bold 28px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("🏮 Lantern Garden", 24, 32);
  // Counter.
  ctx.font = "bold 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillStyle = COLOURS.gold;
  ctx.fillText(
    `Found ${state.found.size} / ${DIFFS.length}`,
    620,
    32
  );
  // Timer + score.
  const elapsed =
    state.screen === "play" ? now - state.startAt : state.elapsedMs;
  ctx.fillStyle = COLOURS.cream;
  ctx.font = "20px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText(`⏱ ${formatTime(elapsed)}    ★ ${state.score}`, 1100, 32);
  // Hint button.
  const hov = state.screen === "play";
  ctx.fillStyle = hov ? "#3a2f5e" : "#2a2636";
  roundRect(ctx, HINT_BTN.x, HINT_BTN.y, HINT_BTN.w, HINT_BTN.h, 9);
  ctx.fill();
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 1.5;
  roundRect(ctx, HINT_BTN.x, HINT_BTN.y, HINT_BTN.w, HINT_BTN.h, 9);
  ctx.stroke();
  ctx.fillStyle = COLOURS.gold;
  ctx.font = "bold 17px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("💡 Hint −50", HINT_BTN.x + HINT_BTN.w / 2, HINT_BTN.y + 21);
}

function drawFooter(ctx, state) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOURS.cream;
  ctx.font = "18px Georgia, serif";
  ctx.fillText(state.message, CANVAS_W / 2, MESSAGE_Y);
  // 7 progress dots.
  const gap = 34;
  const x0 = CANVAS_W / 2 - (DIFFS.length - 1) * gap * 0.5;
  DIFFS.forEach((d, i) => {
    const x = x0 + i * gap;
    ctx.beginPath();
    ctx.arc(x, DOTS_Y, 9, 0, Math.PI * 2);
    if (state.found.has(d.id)) {
      ctx.fillStyle = COLOURS.gold;
      ctx.fill();
      ctx.fillStyle = "#14121f";
      ctx.font = "bold 11px Georgia, serif";
      ctx.fillText("✓", x, DOTS_Y + 0.5);
    } else {
      ctx.fillStyle = "rgba(253,246,227,0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(253,246,227,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
  ctx.fillStyle = COLOURS.muted;
  ctx.font = "15px Georgia, serif";
  ctx.fillText("M: mute  ·  R: restart  ·  H: hint  ·  Tab / ← →: move focus  ·  Enter: mark", CANVAS_W / 2, FOOTER_Y);
}

function drawMarkers(ctx, state, now) {
  for (const d of DIFFS) {
    if (!state.found.has(d.id)) continue;
    const pulse = state.markFlash && state.markFlash.id === d.id && now < state.markFlash.until;
    drawGoldRing(ctx, LEFT_X + d.x, PIC_Y + d.y, d.r, pulse ? now / 1000 : 0);
    drawGoldRing(ctx, RIGHT_X + d.x, PIC_Y + d.y, d.r, pulse ? now / 1000 : 0);
  }
  // Hint pulse on one unfound difference (both pictures).
  if (state.hintId && now < state.hintUntil) {
    const d = DIFFS.find((x) => x.id === state.hintId);
    if (d && !state.found.has(d.id)) {
      const a = 0.45 + 0.35 * Math.sin(now / 130);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = COLOURS.gold;
      ctx.lineWidth = 4;
      for (const px of [LEFT_X, RIGHT_X]) {
        ctx.beginPath();
        ctx.arc(px + d.x, PIC_Y + d.y, d.r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // Keyboard focus ring (dashed white, on the left picture).
  if (state.screen === "play" && state.focusVisible) {
    const d = DIFFS[state.focusIndex % DIFFS.length];
    if (!state.found.has(d.id)) {
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(LEFT_X + d.x, PIC_Y + d.y, d.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  // Wrong-click X flash (drawn on both pictures at the same spot).
  if (state.wrongFlash && now < state.wrongFlash.until) {
    const fade = 1 - (now - (state.wrongFlash.until - 700)) / 700;
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    drawWrongX(ctx, LEFT_X + state.wrongFlash.rx, PIC_Y + state.wrongFlash.ry);
    drawWrongX(ctx, RIGHT_X + state.wrongFlash.rx, PIC_Y + state.wrongFlash.ry);
    ctx.restore();
  }
}

function drawTitle(ctx, state, t) {
  // Dimmed garden preview behind.
  drawGarden(ctx, LEFT_X, PIC_Y, false, t, false);
  drawGarden(ctx, RIGHT_X, PIC_Y, true, t, false);
  ctx.fillStyle = "rgba(12, 10, 24, 0.72)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOURS.gold;
  ctx.font = "bold 64px Georgia, 'Times New Roman', serif";
  ctx.fillText("Lantern Garden", CANVAS_W / 2, 190);
  ctx.fillStyle = COLOURS.cream;
  ctx.font = "italic 28px Georgia, serif";
  ctx.fillText("— Spot the Difference —", CANVAS_W / 2, 248);
  ctx.font = "20px Georgia, serif";
  ctx.fillStyle = "#e8e2f2";
  ctx.fillText("Two gardens hang side by side under the lanterns.", CANVAS_W / 2, 316);
  ctx.fillText("Seven small things changed in the right one. Find them all!", CANVAS_W / 2, 346);
  ctx.fillText("Click a difference, or Tab to move and Enter to mark it.", CANVAS_W / 2, 376);
  const blink = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.globalAlpha = blink;
  ctx.fillStyle = COLOURS.gold;
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillText("Click or press Enter to start", CANVAS_W / 2, 452);
  ctx.globalAlpha = 1;
  if (state.best > 0) {
    ctx.fillStyle = COLOURS.cream;
    ctx.font = "18px Georgia, serif";
    ctx.fillText(`Best score: ${state.best}`, CANVAS_W / 2, 500);
  }
  ctx.fillStyle = COLOURS.muted;
  ctx.font = "15px Georgia, serif";
  ctx.fillText("M: mute  ·  R: restart  ·  H: hint (−50 pts)", CANVAS_W / 2, 560);
}

function drawWin(ctx, state, t) {
  // All lanterns lit gold behind the win panel.
  drawGarden(ctx, LEFT_X, PIC_Y, false, t, true);
  drawGarden(ctx, RIGHT_X, PIC_Y, true, t, true);
  // Firefly confetti.
  for (let i = 0; i < 26; i++) {
    const fx = (i * 173.3 + t * 40) % CANVAS_W;
    const fy = 90 + ((i * 97.7 + t * 26) % 480);
    drawFirefly(ctx, fx, fy, 0.7 + 0.3 * Math.sin(t * 3 + i));
  }
  ctx.fillStyle = "rgba(12, 10, 24, 0.66)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Solid-ish backdrop so the win text stays readable over the gold rings.
  ctx.fillStyle = "rgba(12, 10, 24, 0.82)";
  roundRect(ctx, 330, 150, 620, 380, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 215, 106, 0.45)";
  ctx.lineWidth = 2;
  roundRect(ctx, 330, 150, 620, 380, 18);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOURS.gold;
  ctx.font = "bold 58px Georgia, 'Times New Roman', serif";
  ctx.fillText("The garden glows!", CANVAS_W / 2, 210);
  ctx.fillStyle = COLOURS.cream;
  ctx.font = "24px Georgia, serif";
  ctx.fillText("You found all 7 differences.", CANVAS_W / 2, 272);
  ctx.font = "22px Georgia, serif";
  ctx.fillText(`Time  ${formatTime(state.elapsedMs)}`, CANVAS_W / 2, 336);
  ctx.fillText(`Score  ${state.score}`, CANVAS_W / 2, 372);
  ctx.fillText(`Accuracy  ${accuracy(state)}%   (${state.correctClicks}/${state.clicks} clicks)`, CANVAS_W / 2, 408);
  const blink = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.globalAlpha = blink;
  ctx.fillStyle = COLOURS.gold;
  ctx.font = "bold 24px Georgia, serif";
  ctx.fillText("Press R to play again", CANVAS_W / 2, 478);
  ctx.globalAlpha = 1;
}

// Main entry: draw the current screen. `now` is performance.now() ms,
// `t` is seconds (fixed for screenshots, live otherwise).
export function render(ctx, state, now, t) {
  ctx.fillStyle = "#14121f";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.screen === "title") {
    drawTitle(ctx, state, t);
    return;
  }
  if (state.screen === "win") {
    drawHeader(ctx, state, now);
    drawWin(ctx, state, t);
    drawMarkers(ctx, state, now);
    return;
  }
  // Play screen.
  drawHeader(ctx, state, now);
  drawGarden(ctx, LEFT_X, PIC_Y, false, t, false);
  drawGarden(ctx, RIGHT_X, PIC_Y, true, t, false);
  ctx.fillStyle = COLOURS.muted;
  ctx.font = "italic 16px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Left — original", LEFT_X + PIC_W / 2, PIC_Y + PIC_H + 18);
  ctx.fillText("Right — 7 things changed", RIGHT_X + PIC_W / 2, PIC_Y + PIC_H + 18);
  drawMarkers(ctx, state, now);
  drawFooter(ctx, state);
}
