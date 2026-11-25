// Sizzle & Serve — boot and the one loop.
// Clicks land on a station (bin, grill, board, plate, serve, trash, hand) and
// become a kitchen action; keys do the same. ?shot=start|play|serve|end stages
// a scene for screenshots, ?seed=N fixes the orders.

import { BIN_ORDER, CANVAS_HEIGHT, CANVAS_WIDTH, LAYOUT, STEP } from './config.js';
import { makeRandom, seedFromQuery } from './random.js';
import { makeSoundBoard } from './audio.js';
import { makeInput } from './input.js';
import { createKitchen } from './kitchen.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const sound = makeSoundBoard();
const input = makeInput(canvas);
const random = makeRandom(seedFromQuery());
const kitchen = createKitchen(random, sound);

let paused = false;
let last = performance.now();

function inside(point, rect) {
  return point && point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function binAt(point) {
  const zone = LAYOUT.bins;
  if (!inside(point, zone)) return null;
  const binW = (zone.w - 24) / BIN_ORDER.length;
  const index = Math.floor((point.x - zone.x - 12) / binW);
  if (index < 0 || index >= BIN_ORDER.length) return null;
  return BIN_ORDER[index];
}

function grillSlotAt(point) {
  const zone = LAYOUT.grill;
  if (!inside(point, zone)) return -1;
  const left = zone.x + 40;
  const right = zone.x + zone.w - 40;
  if (point.x < left || point.x > right || point.y < zone.y + 40 || point.y > zone.y + 160) return -1;
  return point.x < (left + right) / 2 ? 0 : 1;
}

function handleClick(point) {
  sound.unlock();
  const state = kitchen.state;
  if (state.screen === 'title') {
    kitchen.startShift();
    return;
  }
  if (state.screen === 'over') {
    kitchen.startShift();
    return;
  }
  if (inside(point, LAYOUT.serve)) { kitchen.clickServe(); return; }
  if (inside(point, LAYOUT.trash)) { kitchen.clickTrash(); return; }
  if (inside(point, LAYOUT.hand)) { kitchen.clickHand(); return; }
  if (inside(point, LAYOUT.plate)) { kitchen.clickPlate(); return; }
  if (inside(point, LAYOUT.board)) { kitchen.clickBoard(); return; }
  const slot = grillSlotAt(point);
  if (slot >= 0) { kitchen.clickGrill(slot); return; }
  const kind = binAt(point);
  if (kind) kitchen.pickBin(kind);
}

function handleKeys() {
  if (input.pressedOnce('m')) {
    const muted = sound.toggleMute();
    status.textContent = muted ? 'Sound off' : 'Sound on';
  }
  const state = kitchen.state;
  if (state.screen === 'title' && (input.pressedOnce(' ') || input.pressedOnce('enter'))) {
    kitchen.startShift();
    return;
  }
  if (state.screen === 'over' && input.pressedOnce('r')) {
    kitchen.startShift();
    return;
  }
  if (state.screen !== 'play') return;
  if (input.pressedOnce('p')) {
    paused = !paused;
    return;
  }
  if (paused) return;
  if (input.pressedOnce(' ')) { kitchen.clickServe(); return; }
  if (input.pressedOnce('t')) { kitchen.clickTrash(); return; }
  if (input.pressedOnce('g')) {
    if (state.hand && state.hand.raw && state.hand.kind === 'patty') {
      const free = state.grill.findIndex((slot) => slot.stage === 'empty');
      if (free >= 0) kitchen.clickGrill(free);
    } else {
      const done = state.grill.findIndex((slot) => slot.stage === 'done');
      if (done >= 0) kitchen.clickGrill(done);
    }
    return;
  }
  if (input.pressedOnce('c')) { kitchen.clickBoard(); return; }
  for (const kind of BIN_ORDER) {
    const key = { bun: '1', patty: '2', cheese: '3', lettuce: '4', tomato: '5', onion: '6' }[kind];
    if (input.pressedOnce(key)) {
      if (state.hand && state.hand.kind === kind) kitchen.clickHand();
      else kitchen.pickBin(kind);
      return;
    }
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const click = input.takeClick();
  if (click) handleClick(click);
  handleKeys();
  if (!paused) {
    let left = dt;
    while (left > 0) {
      const step = Math.min(STEP, left);
      kitchen.update(step);
      left -= step;
    }
  }
  const state = kitchen.state;
  status.textContent = state.screen === 'play'
    ? `Score ${state.score}, ${state.served} served, ${Math.ceil(kitchen.timeLeft())} seconds left in the shift.`
    : state.screen === 'over'
      ? `Shift over. Final score ${state.score}, ${state.served} dishes served.`
      : 'Sizzle and Serve. Press Space to start your shift.';
  render(ctx, kitchen, input.mouse(), paused);
  input.endFrame();
  requestAnimationFrame(frame);
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    const staged = stageShot(shot, kitchen);
    kitchen.state.screen = staged.screen;
    render(ctx, kitchen, input.mouse(), false);
    return;
  }
  kitchen.reset();
  requestAnimationFrame(frame);
}

boot();
