// All sound is synthesized with WebAudio — no audio files, no network.
// A small blip synth: pick a wave, slide the pitch, fade out. Mute with M.

export function makeSoundBoard() {
  let context = null;
  let muted = false;
  let sizzleTimer = null;

  function ensure() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function blip(freqStart, freqEnd, seconds, type, gainValue) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + seconds);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + seconds + 0.02);
  }

  function noiseBurst(seconds, gainValue, filterFreq) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || ctx.state === 'suspended') return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    pick() { blip(520, 640, 0.07, 'sine', 0.12); },
    place() { blip(300, 220, 0.09, 'triangle', 0.14); },
    chop() { noiseBurst(0.08, 0.25, 1800); blip(180, 90, 0.08, 'square', 0.08); },
    grill() { noiseBurst(0.25, 0.12, 900); },
    ding() { blip(880, 880, 0.12, 'sine', 0.14); blip(1320, 1320, 0.18, 'sine', 0.1); },
    serve() {
      blip(523, 523, 0.1, 'triangle', 0.16);
      setTimeout(() => blip(659, 659, 0.1, 'triangle', 0.16), 90);
      setTimeout(() => blip(784, 784, 0.16, 'triangle', 0.16), 180);
    },
    wrong() { blip(220, 140, 0.25, 'sawtooth', 0.12); },
    expire() { blip(330, 180, 0.3, 'square', 0.1); },
    tick() { blip(980, 980, 0.05, 'sine', 0.07); },
    startSizzle() {
      if (sizzleTimer) return;
      sizzleTimer = setInterval(() => noiseBurst(0.4, 0.03, 2400), 380);
    },
    stopSizzle() {
      if (!sizzleTimer) return;
      clearInterval(sizzleTimer);
      sizzleTimer = null;
    },
  };
}
