// The screenshot scenes behind ?shot=start|play|serve|end.
// Each one plays the real rules forward from a fresh kitchen, steered by a
// simple autopilot that picks ingredients, grills, chops and serves exactly
// the way a player would — so every frame is what a short game really looks
// like, and the same seed always gives the same frame.

import { BIN_ORDER, INGREDIENTS, STEP } from './config.js';
import { EVENT_OVER, EVENT_SERVED } from './kitchen.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './config.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 42;
const SERVE_SECONDS = 60;
const END_LIMIT_SECONDS = 600;
const THINK_SECONDS = 0.12;

/** What the plate still needs to match `order`, as a list of ingredient kinds. */
function missingForPlate(kitchen, order) {
  const plate = [...kitchen.state.plate];
  const missing = [];
  for (const kind of order.recipe.needs) {
    const at = plate.indexOf(kind);
    if (at === -1) missing.push(kind);
    else plate.splice(at, 1);
  }
  return missing;
}

/** One autopilot decision: look at the first order and take the next useful step. */
function autopilot(kitchen) {
  const state = kitchen.state;
  if (state.orders.length === 0) return;
  const order = state.orders[0];
  const missing = missingForPlate(kitchen, order);

  // A full plate that matches an order is served at once.
  if (missing.length === 0 && state.plate.length > 0) {
    kitchen.clickServe();
    return;
  }

  // Finish what is already cooking or chopping before starting something new.
  for (let i = 0; i < state.grill.length; i += 1) {
    if (state.grill[i].stage === 'done' && !state.hand) {
      kitchen.clickGrill(i);
      return;
    }
  }
  if (state.board.stage === 'done' && !state.hand) {
    kitchen.clickBoard();
    return;
  }
  if (state.board.stage === 'empty' && state.hand && state.hand.raw && INGREDIENTS[state.hand.kind].prep === 'chop') {
    kitchen.clickBoard();
    return;
  }
  for (let i = 0; i < state.grill.length; i += 1) {
    if (state.grill[i].stage === 'empty' && state.hand && state.hand.raw && state.hand.kind === 'patty') {
      kitchen.clickGrill(i);
      return;
    }
  }

  // A ready ingredient in hand goes straight on the plate.
  if (state.hand && state.hand.ready) {
    kitchen.clickPlate();
    return;
  }

  // Otherwise fetch the next missing ingredient from its bin.
  if (!state.hand && missing.length > 0) {
    const kind = missing[0];
    // If a patty is already cooking, wait for it instead of starting another.
    if (kind === 'patty' && state.grill.some((slot) => slot.stage === 'cooking')) return;
    if (INGREDIENTS[kind].prep === 'chop' && state.board.stage !== 'empty') return;
    kitchen.pickBin(kind);
  }
}

/**
 * Set `kitchen` to the named scene (start, play, serve or end; any other name
 * is start) and return the screen to draw over it.
 */
export function stageShot(name, kitchen) {
  kitchen.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) kitchen.update(STEP);
    return { screen: SCREEN_TITLE };
  }
  kitchen.startShift();
  const limit = name === 'end' ? END_LIMIT_SECONDS : name === 'serve' ? SERVE_SECONDS : PLAY_SECONDS;
  let thinkIn = 0;
  let servedOnce = false;
  for (let i = 0; i < limit / STEP; i += 1) {
    thinkIn -= STEP;
    if (thinkIn <= 0) {
      thinkIn = THINK_SECONDS;
      autopilot(kitchen);
    }
    const events = kitchen.update(STEP);
    if (events & EVENT_SERVED) servedOnce = true;
    if (name === 'play' && kitchen.state.time >= 15 && kitchen.state.orders.length > 0 && kitchen.state.plate.length >= 1) {
      // A busy mid-play frame: an order on the board and a dish being built.
      return { screen: SCREEN_PLAY };
    }
    if (name === 'serve' && servedOnce && kitchen.state.plate.length >= 3) {
      // A plate mid-assembly for the next order, with the board and grill busy.
      return { screen: SCREEN_PLAY };
    }
    if (events & EVENT_OVER) break;
  }
  const over = kitchen.state.screen === 'over';
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY };
}
