// Sizzle & Serve — the kitchen itself: orders, stations, the plate and the score.
// No drawing here, only rules. Every action a player (or the autopilot) can take
// is a function on the kitchen, so a staged screenshot plays the real game.

import {
  CHOP_SECONDS, GRILL_BURN_SECONDS, GRILL_COOK_SECONDS, GRILL_SLOTS,
  INGREDIENTS, MAX_ORDERS, MAX_TIP, ORDER_PATIENCE, RECIPES, SHIFT_SECONDS,
  SPAWN_EARLY_SECONDS, SPAWN_LATE_AFTER, SPAWN_LATE_SECONDS, TARGET_SCORE,
  WRONG_SERVE_PENALTY, EXPIRED_ORDER_PENALTY, COMBO_CAP, COMBO_STEP,
  FIRST_ORDER_AT,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_OVER = 2;
export const EVENT_WRONG = 4;
export const EVENT_EXPIRED = 8;

function sameStack(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) || 0) + 1);
  for (const item of b) {
    const left = counts.get(item) || 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

export function createKitchen(random, sound) {
  const state = {
    screen: 'title',
    time: 0,
    score: 0,
    served: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    grill: Array.from({ length: GRILL_SLOTS }, () => ({ kind: null, progress: 0, stage: 'empty' })),
    board: { kind: null, progress: 0, stage: 'empty' },
    plate: [],
    hand: null,
    floats: [],
    particles: [],
    spawnIn: FIRST_ORDER_AT,
    nextOrderId: 1,
    rush: false,
    lastTickSecond: -1,
  };

  function float(text, x, y, colour) {
    state.floats.push({ text, x, y, age: 0, colour });
    if (state.floats.length > 12) state.floats.shift();
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const recipe = random.pick(RECIPES);
    state.orders.push({
      id: state.nextOrderId,
      recipe,
      patience: ORDER_PATIENCE,
      max: ORDER_PATIENCE,
    });
    state.nextOrderId += 1;
  }

  function spawnInterval() {
    return state.time >= SPAWN_LATE_AFTER ? SPAWN_LATE_SECONDS : SPAWN_EARLY_SECONDS;
  }

  function anyCooking() {
    return state.grill.some((slot) => slot.stage === 'cooking');
  }

  const kitchen = {
    state,

    reset() {
      state.screen = 'title';
      state.time = 0;
      state.score = 0;
      state.served = 0;
      state.mistakes = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.orders = [];
      state.grill = Array.from({ length: GRILL_SLOTS }, () => ({ kind: null, progress: 0, stage: 'empty' }));
      state.board = { kind: null, progress: 0, stage: 'empty' };
      state.plate = [];
      state.hand = null;
      state.floats = [];
      state.particles = [];
      state.spawnIn = FIRST_ORDER_AT;
      state.nextOrderId = 1;
      state.rush = false;
      state.lastTickSecond = -1;
      sound.stopSizzle();
    },

    startShift() {
      kitchen.reset();
      state.screen = 'play';
      sound.ding();
    },

    // --- the player's hands -------------------------------------------------
    pickBin(kind) {
      if (state.hand || state.screen !== 'play') return false;
      const spec = INGREDIENTS[kind];
      if (!spec) return false;
      state.hand = { kind, ready: spec.prep === 'ready', raw: spec.prep !== 'ready' };
      sound.pick();
      return true;
    },

    clickGrill(slotIndex) {
      if (state.screen !== 'play') return false;
      const slot = state.grill[slotIndex];
      if (!slot) return false;
      if (slot.stage === 'burnt') {
        state.grill[slotIndex] = { kind: null, progress: 0, stage: 'empty' };
        float('Burnt! Tossed', 200, 300, '#ff8a7a');
        sound.wrong();
        return true;
      }
      if (slot.stage === 'cooking' || slot.stage === 'done') {
        if (slot.stage === 'done' && !state.hand) {
          state.hand = { kind: 'patty', ready: true, raw: false };
          state.grill[slotIndex] = { kind: null, progress: 0, stage: 'empty' };
          sound.pick();
          if (!anyCooking()) sound.stopSizzle();
          return true;
        }
        return false;
      }
      if (state.hand && state.hand.kind === 'patty' && state.hand.raw) {
        state.grill[slotIndex] = { kind: 'patty', progress: 0, stage: 'cooking' };
        state.hand = null;
        sound.grill();
        sound.startSizzle();
        return true;
      }
      return false;
    },

    clickBoard() {
      if (state.screen !== 'play') return false;
      const board = state.board;
      if (board.stage === 'done' && !state.hand) {
        state.hand = { kind: board.kind, ready: true, raw: false };
        state.board = { kind: null, progress: 0, stage: 'empty' };
        sound.pick();
        return true;
      }
      if (board.stage === 'empty' && state.hand && state.hand.raw && INGREDIENTS[state.hand.kind].prep === 'chop') {
        state.board = { kind: state.hand.kind, progress: 0, stage: 'chopping' };
        state.hand = null;
        sound.chop();
        return true;
      }
      return false;
    },

    clickPlate() {
      if (state.screen !== 'play') return false;
      if (!state.hand || !state.hand.ready) return false;
      if (state.plate.length >= 6) return false;
      state.plate.push(state.hand.kind);
      state.hand = null;
      sound.place();
      return true;
    },

    clickHand() {
      if (state.screen !== 'play' || !state.hand) return false;
      state.hand = null;
      sound.place();
      return true;
    },

    clickTrash() {
      if (state.screen !== 'play') return false;
      if (state.plate.length === 0) return false;
      state.plate = [];
      sound.wrong();
      return true;
    },

    clickServe() {
      if (state.screen !== 'play' || state.plate.length === 0) return false;
      const match = state.orders.find((order) => sameStack(state.plate, order.recipe.needs));
      if (!match) {
        state.score = Math.max(0, state.score - WRONG_SERVE_PENALTY);
        state.mistakes += 1;
        state.combo = 0;
        state.plate = [];
        float(`Wrong dish! -${WRONG_SERVE_PENALTY}`, 905, 300, '#ff8a7a');
        sound.wrong();
        return EVENT_WRONG;
      }
      const tip = Math.round(MAX_TIP * (match.patience / match.max));
      const multiplier = Math.min(1 + state.combo * COMBO_STEP, COMBO_CAP);
      const earned = Math.round((match.recipe.base + tip) * multiplier);
      state.score += earned;
      state.served += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.orders = state.orders.filter((order) => order.id !== match.id);
      state.plate = [];
      float(`+${earned}  ${match.recipe.name}`, 905, 300, '#8dff9e');
      if (state.combo >= 3) float(`Combo x${multiplier.toFixed(1)}!`, 905, 330, '#ffd93c');
      sound.serve();
      return EVENT_SERVED;
    },

    // --- the clock ----------------------------------------------------------
    update(dt) {
      if (state.screen !== 'play') {
        for (const item of state.floats) item.age += dt;
        state.floats = state.floats.filter((item) => item.age < 1.4);
        return EVENT_NONE;
      }
      let events = EVENT_NONE;
      state.time += dt;
      state.rush = SHIFT_SECONDS - state.time <= 30;
      const wholeSecond = Math.floor(SHIFT_SECONDS - state.time);
      if (state.rush && wholeSecond !== state.lastTickSecond && wholeSecond <= 10 && wholeSecond > 0) {
        state.lastTickSecond = wholeSecond;
        sound.tick();
      }

      state.spawnIn -= dt;
      // Never leave the board empty for long: an idle kitchen gets a new order.
      if (state.orders.length === 0 && state.spawnIn > 3) state.spawnIn = 3;
      if (state.spawnIn <= 0) {
        spawnOrder();
        state.spawnIn = spawnInterval();
      }

      for (const order of state.orders) order.patience -= dt;
      const expired = state.orders.filter((order) => order.patience <= 0);
      if (expired.length > 0) {
        state.orders = state.orders.filter((order) => order.patience > 0);
        state.score = Math.max(0, state.score - EXPIRED_ORDER_PENALTY * expired.length);
        state.mistakes += expired.length;
        state.combo = 0;
        float(`Order walked out! -${EXPIRED_ORDER_PENALTY * expired.length}`, 630, 60, '#ff8a7a');
        sound.expire();
        events |= EVENT_EXPIRED;
      }

      for (const slot of state.grill) {
        if (slot.stage === 'cooking') {
          slot.progress += dt / GRILL_COOK_SECONDS;
          if (slot.progress >= 1) {
            slot.stage = 'done';
            slot.progress = 0;
            sound.ding();
          }
          if (Math.random() < dt * 14) {
            state.particles.push({
              x: 120 + Math.random() * 160, y: 250 + Math.random() * 40,
              vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30,
              age: 0, life: 0.6 + Math.random() * 0.4,
            });
          }
        } else if (slot.stage === 'done') {
          slot.progress += dt / GRILL_BURN_SECONDS;
          if (slot.progress >= 1) {
            slot.stage = 'burnt';
            slot.progress = 0;
            float('Burnt!', 200, 300, '#ff8a7a');
            sound.wrong();
          }
        }
      }
      if (!anyCooking()) sound.stopSizzle();

      if (state.board.stage === 'chopping') {
        state.board.progress += dt / CHOP_SECONDS;
        if (state.board.progress >= 1) {
          state.board.stage = 'done';
          state.board.progress = 0;
          sound.ding();
        }
      }

      for (const item of state.floats) item.age += dt;
      state.floats = state.floats.filter((item) => item.age < 1.4);
      for (const item of state.particles) {
        item.age += dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
      }
      state.particles = state.particles.filter((item) => item.age < item.life);

      if (state.time >= SHIFT_SECONDS) {
        state.screen = 'over';
        sound.stopSizzle();
        events |= EVENT_OVER;
      }
      return events;
    },

    timeLeft() {
      return Math.max(0, SHIFT_SECONDS - state.time);
    },

    won() {
      return state.score >= TARGET_SCORE;
    },

    plateMatchesAnyOrder() {
      return state.orders.some((order) => sameStack(state.plate, order.recipe.needs));
    },
  };
  return kitchen;
}
