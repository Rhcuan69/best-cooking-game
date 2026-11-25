// Sizzle & Serve — every pixel of the kitchen, drawn on canvas.
// Warm diner colours, chunky shapes, nothing loaded from disk: the food, the
// counters and the order board are all shapes and gradients drawn here.

import {
  BIN_ORDER, CANVAS_HEIGHT, CANVAS_WIDTH, INGREDIENTS, LAYOUT, SHIFT_SECONDS,
  TARGET_SCORE,
} from './config.js';

const COLOURS = {
  wall: '#f7e8c8',
  wallTile: '#f2dcae',
  floor: '#c98d5f',
  floorDark: '#b57a4e',
  counter: '#8a5a3b',
  counterTop: '#a9714b',
  board: '#d9b380',
  header: '#3b2a1e',
  cream: '#fff8e7',
  ink: '#2e2118',
  muted: '#8a7a68',
  green: '#7ed957',
  red: '#ff5a4e',
  gold: '#ffc93c',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, colour, weight, align) {
  ctx.fillStyle = colour;
  ctx.font = `${weight || '700'} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One ingredient, drawn as a little icon. `size` is the icon's width. */
export function drawIngredient(ctx, kind, x, y, size, opts) {
  const done = !opts || opts.done !== false;
  const s = size / 48;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (kind === 'bun') {
    ctx.fillStyle = '#e8a54b';
    ctx.beginPath();
    ctx.ellipse(0, -8, 22, 13, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f7cf8a';
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 9, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (const dx of [-10, 0, 10]) {
      ctx.beginPath();
      ctx.ellipse(dx, -14, 2.4, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#d18a35';
    ctx.fillRect(-22, -8, 44, 7);
    ctx.fillStyle = '#e8a54b';
    ctx.beginPath();
    ctx.ellipse(0, 1, 22, 6, 0, 0, Math.PI);
    ctx.fill();
  } else if (kind === 'patty') {
    ctx.fillStyle = done ? '#6b4426' : '#a86a52';
    roundRect(ctx, -22, -9, 44, 18, 8);
    ctx.fill();
    ctx.fillStyle = done ? '#5f3a22' : '#96604a';
    for (const dx of [-14, -4, 6, 15]) {
      ctx.beginPath();
      ctx.arc(dx, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!done) {
      ctx.fillStyle = '#c98a72';
      ctx.beginPath();
      ctx.ellipse(0, -6, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.moveTo(-22, -8);
    ctx.lineTo(22, -8);
    ctx.lineTo(22, 6);
    ctx.lineTo(10, 6);
    ctx.lineTo(6, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-10, 6);
    ctx.lineTo(-14, 12);
    ctx.lineTo(-22, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a100';
    for (const dx of [-14, 0, 14]) {
      ctx.beginPath();
      ctx.arc(dx, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'lettuce') {
    ctx.fillStyle = '#7ed957';
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    for (let i = 0; i <= 8; i += 1) {
      const px = -22 + (44 / 8) * i;
      ctx.quadraticCurveTo(px + 2.5, i % 2 === 0 ? -12 : 8, px + 5.5, 0);
    }
    ctx.lineTo(22, 8);
    ctx.lineTo(-22, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4da32e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
  } else if (kind === 'tomato') {
    ctx.fillStyle = '#ff5a4e';
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8a7a';
    ctx.beginPath();
    ctx.arc(-6, -6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb3ab';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4da32e';
    ctx.beginPath();
    ctx.ellipse(0, -17, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'onion') {
    ctx.strokeStyle = '#e8d8f0';
    ctx.lineWidth = 5;
    for (const r of [18, 12, 6]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#a98bc2';
    ctx.lineWidth = 1.5;
    for (const r of [18, 12, 6]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPanel(ctx, rect, fill, stroke) {
  ctx.fillStyle = fill;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawKitchenShell(ctx) {
  ctx.fillStyle = COLOURS.wall;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLOURS.wallTile;
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    for (let y = 110; y < 460; y += 64) {
      if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 62, 62);
    }
  }
  ctx.fillStyle = COLOURS.floor;
  ctx.fillRect(0, 460, CANVAS_WIDTH, CANVAS_HEIGHT - 460);
  ctx.fillStyle = COLOURS.floorDark;
  for (let x = 0; x < CANVAS_WIDTH; x += 96) ctx.fillRect(x, 460, 3, CANVAS_HEIGHT - 460);
  ctx.fillStyle = '#6b4426';
  ctx.fillRect(0, 104, CANVAS_WIDTH, 8);
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const fraction = Math.max(0, order.patience / order.max);
  const urgent = fraction < 0.35;
  drawPanel(ctx, { x, y, w, h }, urgent ? '#ffe3de' : COLOURS.cream, urgent ? '#ff5a4e' : '#d9c9a8');
  text(ctx, order.recipe.name, x + 12, y + 16, 15, COLOURS.ink, '800');
  text(ctx, `$${order.recipe.base}`, x + w - 12, y + 16, 15, '#1d7a34', '800', 'right');
  let ix = x + 14;
  for (const kind of order.recipe.needs) {
    drawIngredient(ctx, kind, ix + 11, y + 44, 22, { done: kind !== 'patty' });
    ix += 26;
  }
  ctx.fillStyle = '#e8ddc4';
  roundRect(ctx, x + 12, y + h - 16, w - 24, 8, 4);
  ctx.fill();
  ctx.fillStyle = fraction > 0.5 ? '#4da32e' : fraction > 0.25 ? '#e0a100' : '#ff5a4e';
  roundRect(ctx, x + 12, y + h - 16, Math.max(8, (w - 24) * fraction), 8, 4);
  ctx.fill();
}

function drawHeader(ctx, kitchen) {
  const state = kitchen.state;
  ctx.fillStyle = COLOURS.header;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 104);
  text(ctx, 'SIZZLE & SERVE', 24, 34, 26, '#ffd93c', '900');
  text(ctx, 'Rush Hour Kitchen', 24, 62, 14, '#f7e8c8', '600');
  text(ctx, `SCORE ${state.score}`, 24, 88, 15, COLOURS.cream, '800');
  text(ctx, `TARGET ${TARGET_SCORE}`, 150, 88, 13, '#ffb3ab', '700');

  const board = LAYOUT.orders;
  ctx.fillStyle = '#2a1d12';
  roundRect(ctx, board.x - 8, board.y - 4, board.w + 16, board.h + 8, 12);
  ctx.fill();
  text(ctx, 'ORDER BOARD', board.x + 8, board.y + 2, 11, '#ffd93c', '800');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', board.x + 14, board.y + 46, 15, '#cbb89a', '600');
  }
  const ticketW = 210;
  state.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, board.x + 6 + i * (ticketW + 8), board.y + 14, ticketW, 64);
  });

  const shift = LAYOUT.shift;
  const left = kitchen.timeLeft();
  const mm = Math.floor(left / 60);
  const ss = Math.floor(left % 60).toString().padStart(2, '0');
  drawPanel(ctx, shift, state.rush ? '#5a1f1a' : '#241a12', state.rush ? '#ff5a4e' : '#4a3826');
  text(ctx, 'SHIFT TIMER', shift.x + 16, shift.y + 16, 11, '#ffd93c', '800');
  text(ctx, `${mm}:${ss}`, shift.x + 16, shift.y + 46, 30, state.rush && Math.floor(left * 2) % 2 === 0 ? '#ff8a7a' : COLOURS.cream, '900');
  text(ctx, `Served ${state.served}  ·  Combo x${Math.min(1 + state.combo * 0.1, 2).toFixed(1)}`, shift.x + 16, shift.y + 70, 12, '#cbb89a', '700');
}

function drawGrill(ctx, kitchen) {
  const zone = LAYOUT.grill;
  drawPanel(ctx, zone, '#3a3a40', '#232327');
  text(ctx, 'GRILL  —  click a patty in, click it out when done', zone.x + 14, zone.y + 18, 12, '#ffd93c', '800');
  ctx.fillStyle = '#1c1c20';
  roundRect(ctx, zone.x + 16, zone.y + 34, zone.w - 32, 120, 10);
  ctx.fill();
  ctx.strokeStyle = '#55555e';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const gy = zone.y + 54 + i * 22;
    ctx.beginPath();
    ctx.moveTo(zone.x + 24, gy);
    ctx.lineTo(zone.x + zone.w - 24, gy);
    ctx.stroke();
  }
  kitchen.state.grill.forEach((slot, i) => {
    const cx = zone.x + 90 + i * 150;
    const cy = zone.y + 94;
    if (slot.stage === 'empty') {
      ctx.fillStyle = '#1c1c20';
      roundRect(ctx, cx - 34, cy - 14, 68, 28, 8);
      ctx.fill();
      text(ctx, 'empty', cx, cy, 13, '#77777f', '700', 'center');
      return;
    }
    drawIngredient(ctx, 'patty', cx, cy, 64, { done: slot.stage !== 'cooking' });
    if (slot.stage === 'cooking') {
      ctx.strokeStyle = '#ffd93c';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * slot.progress);
      ctx.stroke();
      text(ctx, 'sizzling…', cx, cy + 52, 12, '#ffd93c', '700', 'center');
    } else if (slot.stage === 'done') {
      ctx.strokeStyle = '#7ed957';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.stroke();
      text(ctx, 'READY!', cx, cy + 52, 13, '#7ed957', '800', 'center');
    } else if (slot.stage === 'burnt') {
      text(ctx, 'BURNT — click to toss', cx, cy + 52, 12, '#ff8a7a', '800', 'center');
    }
  });
  for (const p of kitchen.state.particles) {
    ctx.fillStyle = `rgba(255, 220, 150, ${1 - p.age / p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'Patties cook in 4s — leave one too long and it burns.', zone.x + 14, zone.y + 186, 12, '#9a9aa2', '600');
}

function drawBoard(ctx, kitchen) {
  const zone = LAYOUT.board;
  drawPanel(ctx, zone, COLOURS.board, '#b98d54');
  text(ctx, 'CHOPPING BOARD', zone.x + 14, zone.y + 18, 12, '#6b4426', '800');
  ctx.fillStyle = '#e8c99a';
  roundRect(ctx, zone.x + 20, zone.y + 40, zone.w - 40, 108, 10);
  ctx.fill();
  const board = kitchen.state.board;
  if (board.stage === 'empty') {
    text(ctx, 'Lettuce, tomato & onion', zone.x + zone.w / 2, zone.y + 84, 13, '#8a6a42', '600', 'center');
    text(ctx, 'come here to be chopped', zone.x + zone.w / 2, zone.y + 106, 13, '#8a6a42', '600', 'center');
  } else {
    drawIngredient(ctx, board.kind, zone.x + zone.w / 2, zone.y + 92, 72, { done: board.stage === 'done' });
    if (board.stage === 'chopping') {
      ctx.fillStyle = '#e8ddc4';
      roundRect(ctx, zone.x + 40, zone.y + 158, zone.w - 80, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#4da32e';
      roundRect(ctx, zone.x + 40, zone.y + 158, (zone.w - 80) * board.progress, 10, 5);
      ctx.fill();
      text(ctx, 'chopping…', zone.x + zone.w / 2, zone.y + 186, 12, '#6b4426', '700', 'center');
    } else {
      text(ctx, 'CHOPPED — ready!', zone.x + zone.w / 2, zone.y + 186, 13, '#2e7a1d', '800', 'center');
    }
  }
}

function drawPlate(ctx, kitchen) {
  const zone = LAYOUT.plate;
  drawPanel(ctx, zone, COLOURS.cream, '#d9c9a8');
  text(ctx, 'PLATE  —  build the dish here', zone.x + 14, zone.y + 18, 12, COLOURS.ink, '800');
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + 132;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 118, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9c9a8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f2ead6';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 84, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  const plate = kitchen.state.plate;
  if (plate.length === 0) {
    text(ctx, 'Empty plate', cx, cy - 6, 14, COLOURS.muted, '600', 'center');
  } else {
    // Stack the dish so every layer peeks out: the last ingredient added sits on top.
    let y = cy + 10;
    for (let i = 0; i < plate.length; i += 1) {
      drawIngredient(ctx, plate[i], cx, y, 58, { done: true });
      y -= 16;
    }
  }
  if (kitchen.plateMatchesAnyOrder() && plate.length > 0) {
    text(ctx, '✓ matches an order — SERVE it!', cx, zone.y + 196, 13, '#1d7a34', '800', 'center');
  } else if (plate.length > 0) {
    text(ctx, 'Does not match any order yet', cx, zone.y + 196, 12, '#8a7a68', '600', 'center');
  }
}

function drawHand(ctx, kitchen) {
  const zone = LAYOUT.hand;
  drawPanel(ctx, zone, '#2a1d12', '#4a3826');
  text(ctx, 'IN HAND', zone.x + 12, zone.y + 18, 12, '#ffd93c', '800');
  const hand = kitchen.state.hand;
  if (!hand) {
    text(ctx, 'Nothing', zone.x + zone.w / 2, zone.y + 90, 14, '#cbb89a', '600', 'center');
    text(ctx, 'Pick an ingredient', zone.x + zone.w / 2, zone.y + 116, 12, '#8a7a68', '600', 'center');
    text(ctx, 'below, then use a', zone.x + zone.w / 2, zone.y + 134, 12, '#8a7a68', '600', 'center');
    text(ctx, 'station or the plate.', zone.x + zone.w / 2, zone.y + 152, 12, '#8a7a68', '600', 'center');
    return;
  }
  drawIngredient(ctx, hand.kind, zone.x + zone.w / 2, zone.y + 84, 64, { done: hand.ready });
  text(ctx, INGREDIENTS[hand.kind].name, zone.x + zone.w / 2, zone.y + 128, 15, COLOURS.cream, '800', 'center');
  text(ctx, hand.ready ? 'ready to plate' : hand.kind === 'patty' ? 'raw — grill it!' : 'raw — chop it!', zone.x + zone.w / 2, zone.y + 150, 12, hand.ready ? '#7ed957' : '#ffd93c', '700', 'center');
  text(ctx, 'click here to toss', zone.x + zone.w / 2, zone.y + 176, 11, '#8a7a68', '600', 'center');
}

function drawButtons(ctx, kitchen, mouse) {
  const serve = LAYOUT.serve;
  const trash = LAYOUT.trash;
  const canServe = kitchen.state.plate.length > 0;
  const hoverServe = mouse.inside && mouse.x >= serve.x && mouse.x <= serve.x + serve.w && mouse.y >= serve.y && mouse.y <= serve.y + serve.h;
  ctx.fillStyle = canServe ? (hoverServe ? '#2e9e4a' : '#1d7a34') : '#6a6a6a';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  text(ctx, 'SERVE  ⏎', serve.x + serve.w / 2, serve.y + serve.h / 2, 20, '#ffffff', '900', 'center');
  const hoverTrash = mouse.inside && mouse.x >= trash.x && mouse.x <= trash.x + trash.w && mouse.y >= trash.y && mouse.y <= trash.y + trash.h;
  ctx.fillStyle = hoverTrash ? '#c22e24' : '#8a3a30';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 12);
  ctx.fill();
  text(ctx, 'TRASH  (T)', trash.x + trash.w / 2, trash.y + trash.h / 2, 16, '#ffffff', '800', 'center');
}

function drawBins(ctx, kitchen, mouse) {
  const zone = LAYOUT.bins;
  drawPanel(ctx, zone, COLOURS.counter, '#6b4426');
  ctx.fillStyle = COLOURS.counterTop;
  roundRect(ctx, zone.x + 8, zone.y + 8, zone.w - 16, 26, 8);
  ctx.fill();
  text(ctx, 'INGREDIENT COUNTER  —  click a bin (or press 1–6) to pick it up', zone.x + 20, zone.y + 21, 13, '#f7e8c8', '800');
  const binW = (zone.w - 24) / BIN_ORDER.length;
  BIN_ORDER.forEach((kind, i) => {
    const x = zone.x + 12 + i * binW;
    const y = zone.y + 44;
    const w = binW - 12;
    const h = zone.h - 58;
    const hover = mouse.inside && mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
    ctx.fillStyle = hover ? '#fff3d6' : COLOURS.cream;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = hover ? '#e0a100' : '#d9c9a8';
    ctx.lineWidth = hover ? 3 : 2;
    ctx.stroke();
    const spec = INGREDIENTS[kind];
    drawIngredient(ctx, kind, x + w / 2, y + 46, 58, { done: kind !== 'patty' });
    text(ctx, spec.name, x + w / 2, y + 92, 16, COLOURS.ink, '800', 'center');
    text(ctx, spec.prep === 'ready' ? 'ready' : spec.prep === 'grill' ? 'needs grill' : 'needs chop', x + w / 2, y + 112, 12, COLOURS.muted, '600', 'center');
    ctx.fillStyle = '#3b2a1e';
    ctx.beginPath();
    ctx.arc(x + w - 20, y + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, spec.key, x + w - 20, y + 20, 13, '#ffd93c', '900', 'center');
  });
}

function drawHint(ctx, kitchen) {
  const zone = LAYOUT.hint;
  const hand = kitchen.state.hand;
  let hint = 'Serve the orders before their patience runs out — fast serves earn bigger tips, and serving 3 in a row builds a combo.';
  if (hand && !hand.ready) hint = hand.kind === 'patty' ? 'Raw patty in hand — click an empty grill slot to cook it.' : 'Raw veggie in hand — click the chopping board.';
  else if (hand) hint = 'Ready ingredient in hand — click the plate to add it to the dish.';
  else if (kitchen.state.plate.length > 0) hint = 'Plate has food — click the plate to keep building, or SERVE when it matches an order.';
  text(ctx, hint, zone.x, zone.y + 8, 14, '#f7e8c8', '600');
}

function drawFloats(ctx, kitchen) {
  for (const item of kitchen.state.floats) {
    const alpha = Math.max(0, 1 - item.age / 1.4);
    ctx.globalAlpha = alpha;
    text(ctx, item.text, item.x, item.y - item.age * 34, 20, item.colour, '900', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, kitchen) {
  ctx.fillStyle = 'rgba(30, 18, 10, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, '🍳', CANVAS_WIDTH / 2, 128, 64, '#ffffff', '400', 'center');
  text(ctx, 'SIZZLE & SERVE', CANVAS_WIDTH / 2, 210, 64, '#ffd93c', '900', 'center');
  text(ctx, 'Rush Hour Kitchen', CANVAS_WIDTH / 2, 262, 26, COLOURS.cream, '700', 'center');
  text(ctx, 'Orders are coming in. Grill the patties, chop the veggies,', CANVAS_WIDTH / 2, 318, 19, '#f7e8c8', '600', 'center');
  text(ctx, 'stack the dishes exactly as ordered — and serve them fast for tips!', CANVAS_WIDTH / 2, 346, 19, '#f7e8c8', '600', 'center');
  text(ctx, `One ${SHIFT_SECONDS}-second shift. Score ${TARGET_SCORE} or more to earn the Chef's Star.`, CANVAS_WIDTH / 2, 388, 17, '#ffd93c', '700', 'center');
  ctx.fillStyle = '#1d7a34';
  roundRect(ctx, CANVAS_WIDTH / 2 - 170, 428, 340, 64, 14);
  ctx.fill();
  text(ctx, 'CLICK OR PRESS SPACE TO START', CANVAS_WIDTH / 2, 460, 20, '#ffffff', '900', 'center');
  text(ctx, 'Mouse: click bins, grill, board, plate, SERVE  ·  Keys: 1–6 pick · G grill · C chop · Space serve · T trash · M mute · P pause', CANVAS_WIDTH / 2, 540, 14, '#cbb89a', '600', 'center');
  text(ctx, 'An original game — no recipes, art or music borrowed from anywhere.', CANVAS_WIDTH / 2, 574, 13, '#8a7a68', '600', 'center');
}

function drawOver(ctx, kitchen) {
  const state = kitchen.state;
  ctx.fillStyle = 'rgba(30, 18, 10, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const won = kitchen.won();
  text(ctx, won ? '🏆 CHEF’S STAR!' : 'SHIFT OVER', CANVAS_WIDTH / 2, 150, 56, won ? '#ffd93c' : COLOURS.cream, '900', 'center');
  text(ctx, won ? `You beat the ${TARGET_SCORE}-point target — the lunch rush is yours!` : `So close — the Chef's Star needs ${TARGET_SCORE} points.`, CANVAS_WIDTH / 2, 208, 19, '#f7e8c8', '600', 'center');
  const rows = [
    ['Final score', `${state.score}`],
    ['Dishes served', `${state.served}`],
    ['Mistakes', `${state.mistakes}`],
    ['Best combo', `x${Math.min(1 + state.bestCombo * 0.1, 2).toFixed(1)} (${state.bestCombo} in a row)`],
  ];
  let y = 268;
  for (const [label, value] of rows) {
    text(ctx, label, CANVAS_WIDTH / 2 - 190, y, 20, '#cbb89a', '700');
    text(ctx, value, CANVAS_WIDTH / 2 + 190, y, 20, COLOURS.cream, '800', 'right');
    y += 44;
  }
  ctx.fillStyle = '#1d7a34';
  roundRect(ctx, CANVAS_WIDTH / 2 - 170, 470, 340, 60, 14);
  ctx.fill();
  text(ctx, 'PRESS R TO COOK AGAIN', CANVAS_WIDTH / 2, 500, 19, '#ffffff', '900', 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30, 18, 10, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'PAUSED — press P to keep cooking', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 32, COLOURS.cream, '900', 'center');
}

/** Draw the whole game for the current state. `mouse` drives button hover. */
export function render(ctx, kitchen, mouse, paused) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawKitchenShell(ctx);
  drawHeader(ctx, kitchen);
  drawGrill(ctx, kitchen);
  drawBoard(ctx, kitchen);
  drawPlate(ctx, kitchen);
  drawHand(ctx, kitchen);
  drawButtons(ctx, kitchen, mouse);
  drawBins(ctx, kitchen, mouse);
  drawHint(ctx, kitchen);
  drawFloats(ctx, kitchen);
  if (kitchen.state.screen === 'title') drawTitle(ctx, kitchen);
  else if (kitchen.state.screen === 'over') drawOver(ctx, kitchen);
  else if (paused) drawPaused(ctx);
}
