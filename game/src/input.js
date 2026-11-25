// Keyboard and mouse input, translated into the kitchen's language:
// a click point in canvas coordinates, and a set of keys pressed this frame.
// The canvas is drawn at a fixed 1280x720 and scaled to fit the window, so a
// mouse position is scaled back into canvas space before anything reads it.

export function makeInput(canvas) {
  const keysDown = new Set();
  const pressed = new Set();
  let mouse = { x: -1, y: -1, inside: false };
  let click = null;

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    keysDown.add(key);
    pressed.add(key);
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    keysDown.delete(event.key.toLowerCase());
  });
  canvas.addEventListener('mousemove', (event) => {
    mouse = { ...toCanvas(event), inside: true };
  });
  canvas.addEventListener('mouseleave', () => {
    mouse = { x: -1, y: -1, inside: false };
  });
  canvas.addEventListener('mousedown', (event) => {
    click = toCanvas(event);
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    /** The mouse position in canvas coordinates (or off-canvas when outside). */
    mouse() {
      return mouse;
    },
    /** The click point since the last frame, or null. */
    takeClick() {
      const point = click;
      click = null;
      return point;
    },
    /** True only on the frame the key went down. */
    pressedOnce(key) {
      return pressed.has(key.toLowerCase());
    },
    isDown(key) {
      return keysDown.has(key.toLowerCase());
    },
    /** Clear the per-frame pressed set at the end of each update. */
    endFrame() {
      pressed.clear();
    },
  };
}
