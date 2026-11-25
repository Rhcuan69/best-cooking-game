// Sizzle & Serve — tuning, recipes and the kitchen layout.
// Everything the rules need lives here so the rest of the game reads like a menu,
// not a spreadsheet.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const STEP = 1 / 60;

export const SHIFT_SECONDS = 150;
export const TARGET_SCORE = 1000;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 50;
export const FIRST_ORDER_AT = 2;
export const SPAWN_EARLY_SECONDS = 14;
export const SPAWN_LATE_SECONDS = 9;
export const SPAWN_LATE_AFTER = 90;

export const GRILL_COOK_SECONDS = 4;
export const GRILL_BURN_SECONDS = 5;
export const GRILL_SLOTS = 2;
export const CHOP_SECONDS = 1.8;

export const WRONG_SERVE_PENALTY = 30;
export const EXPIRED_ORDER_PENALTY = 25;
export const MAX_TIP = 50;
export const COMBO_STEP = 0.1;
export const COMBO_CAP = 2;

// An ingredient's journey: some are ready to plate, some need a station first.
export const INGREDIENTS = {
  bun: { name: 'Bun', key: '1', prep: 'ready', colour: '#e8a54b', dark: '#b97a26' },
  patty: { name: 'Patty', key: '2', prep: 'grill', colour: '#8a5a3b', dark: '#5f3a22' },
  cheese: { name: 'Cheese', key: '3', prep: 'ready', colour: '#ffc93c', dark: '#e0a100' },
  lettuce: { name: 'Lettuce', key: '4', prep: 'chop', colour: '#7ed957', dark: '#4da32e' },
  tomato: { name: 'Tomato', key: '5', prep: 'chop', colour: '#ff5a4e', dark: '#c22e24' },
  onion: { name: 'Onion', key: '6', prep: 'chop', colour: '#e8d8f0', dark: '#a98bc2' },
};
export const BIN_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'];

// Every dish on the menu: a name, the exact stack it needs, and its base pay.
export const RECIPES = [
  { name: 'Classic Stack', needs: ['bun', 'patty', 'lettuce', 'tomato'], base: 100 },
  { name: 'Cheesy Melt', needs: ['bun', 'patty', 'cheese', 'cheese'], base: 110 },
  { name: 'Garden Fresh', needs: ['bun', 'lettuce', 'tomato', 'onion'], base: 90 },
  { name: 'Double Trouble', needs: ['bun', 'patty', 'patty', 'cheese', 'lettuce'], base: 150 },
  { name: 'Onion Special', needs: ['bun', 'patty', 'onion', 'onion', 'tomato'], base: 130 },
  { name: 'Sunrise Stack', needs: ['bun', 'patty', 'cheese', 'tomato', 'lettuce'], base: 120 },
];

// Where everything sits on the 1280x720 counter.
export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 104 },
  orders: { x: 300, y: 12, w: 660, h: 84 },
  shift: { x: 1000, y: 12, w: 260, h: 84 },
  grill: { x: 36, y: 150, w: 330, h: 210 },
  board: { x: 400, y: 150, w: 300, h: 210 },
  plate: { x: 740, y: 150, w: 330, h: 210 },
  hand: { x: 1104, y: 150, w: 140, h: 210 },
  serve: { x: 740, y: 384, w: 160, h: 56 },
  trash: { x: 916, y: 384, w: 154, h: 56 },
  bins: { x: 36, y: 500, w: 1208, h: 190 },
  hint: { x: 36, y: 462, w: 1208, h: 26 },
};

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
