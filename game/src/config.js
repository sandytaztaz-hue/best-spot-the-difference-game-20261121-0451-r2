// config.js — layout, colours and the 7 difference definitions.
// Lantern Garden — Spot the Difference. All coordinates are in canvas pixels
// (canvas 1280x720). Each picture is 560x460; the left picture starts at
// (40, 80), the right picture at (680, 80). Difference zones are stored in
// picture-relative coordinates so the same zone maps onto both pictures.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const PIC_W = 560;
export const PIC_H = 460;
export const LEFT_X = 40;
export const RIGHT_X = 680;
export const PIC_Y = 80;

export const HEADER_H = 64;
export const MESSAGE_Y = 582;
export const DOTS_Y = 618;
export const FOOTER_Y = 678;

export const COLOURS = {
  skyTop: "#1b2340",
  skyMid: "#2c2a55",
  skyBottom: "#4a2f5e",
  grass: "#2e5d33",
  grassDark: "#224a28",
  pond: "#2f6f8f",
  pondLight: "#4d97b8",
  fence: "#8d8578",
  fenceDark: "#6e675c",
  lanternRed: "#e23b3b",
  lanternGold: "#f5b942",
  lanternPaper: "#ffe9b0",
  moon: "#f7ead0",
  gold: "#ffd76a",
  goldDim: "#c9a13b",
  cream: "#fdf6e3",
  ink: "#1c1a26",
  muted: "#b9b3c9",
  wrong: "#9aa0b0",
};

// The 7 differences. x/y/r are picture-relative (0..560, 0..460).
// `side` tells which picture differs and how; the render code applies it.
export const DIFFS = [
  {
    id: "firefly",
    name: "Firefly by the lantern",
    x: 118,
    y: 52,
    r: 30,
    hint: "A firefly glows near the top-left lantern on the left only.",
  },
  {
    id: "lantern",
    name: "Middle lantern colour",
    x: 280,
    y: 96,
    r: 34,
    hint: "The middle lantern is red on the left, gold on the right.",
  },
  {
    id: "fish",
    name: "Fish in the pond",
    x: 196,
    y: 386,
    r: 32,
    hint: "An orange fish swims in the pond on the left only.",
  },
  {
    id: "flower",
    name: "Flower petals",
    x: 82,
    y: 382,
    r: 36,
    hint: "The big pink flower has 6 petals on the left, 5 on the right.",
  },
  {
    id: "cat",
    name: "Cat on the fence",
    x: 472,
    y: 296,
    r: 34,
    hint: "A black cat sits on the stone fence on the left only.",
  },
  {
    id: "moon",
    name: "Moon phase",
    x: 482,
    y: 58,
    r: 32,
    hint: "The moon is full on the left, a crescent on the right.",
  },
  {
    id: "stone",
    name: "Stepping stone shape",
    x: 282,
    y: 432,
    r: 30,
    hint: "The middle stepping stone is round on the left, square on the right.",
  },
];

export const POINTS_FOUND = 100;
export const POINTS_WRONG = -10;
export const POINTS_HINT = -50;
export const HINT_MS = 3000;
export const MARK_MS = 900;

// Tuning note: zone radii stay generous (30-36px) so a near miss on a small
// detail still counts — the hunt should feel fair, not pixel-perfect.
