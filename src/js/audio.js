/**
 * Audio Module — Data Heist
 * All game audio is synthesised with the Web Audio API — no audio files needed.
 * Oscillator wave shapes (sawtooth, square, sine) are used throughout to
 * achieve a neon-cyberpunk aesthetic.
 *
 * Exported API
 * ────────────
 *  initAudio()           — must be called from a user-gesture handler
 *  playSpinSound()       — looping electric-reel noise during a spin
 *  stopSpinSound()       — fades out and stops the spin loop
 *  playWinSound(level)   — 'small' | 'medium' | 'big' fanfare
 *  playClickSound()      — short digital UI blip
 *  playBonusSound()      — glitchy "ACCESS GRANTED" stinger
 *  setMuted(bool)        — global mute toggle
 *
 * @module audio
 */

// ─── Module-level state ──────────────────────────────────────────────────────

/** @type {AudioContext|null} Lazily-created shared AudioContext */
let ctx = null;

/** @type {GainNode|null} Master gain node — the single mute point */
let masterGain = null;

/** @type {boolean} Persisted mute state, applied on context creation */
let muted = false;

/**
 * @typedef {Object} SpinNodes
 * @property {OscillatorNode[]} oscs    Active oscillators (stopped on cleanup)
 * @property {GainNode}         busGain Shared gain node controlling spin volume
 */

/** @type {SpinNodes|null} Active spin-sound graph; null when idle */
let spinNodes = null;

// ─── Context initialisation ─────────────────────────────────────────────────

/**
 * Initialises the Web Audio API context on the first call.
 * Browsers require a user gesture before audio can start; call this function
 * inside any click/keydown handler.  Subsequent calls are no-ops and always
 * return the same instance.
 *
 * @returns {AudioContext} The shared AudioContext.
 */
export function initAudio() {
  if (!ctx) {
    // Safari still ships a prefixed constructor
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }

  // Resume if the page was hidden and the context auto-suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  return ctx;
}

// ─── Private helpers ─────────────────────────────────────────────────────────

/**
 * Returns the shared AudioContext, initialising it if needed.
 * @returns {AudioContext}
 * @private
 */
function _ctx() {
  return initAudio();
}

/**
 * Creates a GainNode wired directly into the master bus.
 *
 * @param {number} [initialGain=0] Starting gain value.
 * @returns {GainNode}
 * @private
 */
function _makeGain(initialGain = 0) {
  const g = _ctx().createGain();
  g.gain.value = initialGain;
  g.connect(masterGain);
  return g;
}

/**
 * Creates, connects, and starts an OscillatorNode.
 *
 * @param {OscillatorType} type   Wave shape: 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number}         freq   Frequency in Hz
 * @param {AudioNode}      dest   Destination node
 * @param {number}         [start] Context time to start; defaults to `ctx.currentTime`
 * @param {number}         [stop]  Context time to stop; omit for manual stop
 * @returns {OscillatorNode}
 * @private
 */
function _osc(type, freq, dest, start, stop) {
  const ac = _ctx();
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.connect(dest);
  o.start(start !== undefined ? start : ac.currentTime);
  if (stop !== undefined) {
    o.stop(stop);
  }
  return o;
}

// ─── Spin sound ──────────────────────────────────────────────────────────────

/**
 * Starts the looping electric-reel spin sound.
 *
 * Consists of two layers:
 * - **Buzz**: a 75 Hz sawtooth oscillator frequency-modulated by a 14 Hz
 *   square LFO (±18 Hz depth) to produce a rhythmic digital-mechanical chatter.
 * - **Whirr**: a quieter 220 Hz square oscillator that adds a high-frequency
 *   digital edge.
 *
 * The sound fades in over 100 ms to avoid a hard click on start.
 * Has no effect if already playing.
 *
 * @returns {void}
 */
export function playSpinSound() {
  if (spinNodes) return;

  const ac = _ctx();
  const now = ac.currentTime;
  const busGain = _makeGain(0);

  // ── Buzz layer (sawtooth + LFO frequency modulation) ─────────────────
  const buzz = ac.createOscillator();
  buzz.type = 'sawtooth';
  buzz.frequency.value = 75;

  const lfo = ac.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 14;

  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 18; // ±18 Hz modulation depth
  lfo.connect(lfoDepth);
  lfoDepth.connect(buzz.frequency);
  buzz.connect(busGain);

  // ── Whirr layer (quieter high square) ────────────────────────────────
  const whirrAtten = ac.createGain();
  whirrAtten.gain.value = 0.38;
  whirrAtten.connect(busGain);

  const whirr = ac.createOscillator();
  whirr.type = 'square';
  whirr.frequency.value = 220;
  whirr.connect(whirrAtten);

  buzz.start(now);
  lfo.start(now);
  whirr.start(now);

  // Short fade-in to prevent a click artifact
  busGain.gain.setValueAtTime(0, now);
  busGain.gain.linearRampToValueAtTime(0.18, now + 0.1);

  spinNodes = { oscs: [buzz, lfo, whirr], busGain };
}

/**
 * Stops the looping spin sound with a short fade-out.
 * Has no effect if the spin sound is not currently playing.
 *
 * @returns {void}
 */
export function stopSpinSound() {
  if (!spinNodes) return;

  const ac = _ctx();
  const now = ac.currentTime;
  const fadeMs = 0.08;

  // Time-constant ramp silences within ~3 × 25 ms
  spinNodes.busGain.gain.setTargetAtTime(0, now, 0.025);
  spinNodes.oscs.forEach((o) => {
    try { o.stop(now + fadeMs); } catch (_) { /* osc may already be stopped */ }
  });

  spinNodes = null;
}

// ─── Win sounds ──────────────────────────────────────────────────────────────

/**
 * Plays a cyberpunk win fanfare whose complexity scales with the win tier.
 *
 * | `winLevel` | Sound character                                          |
 * |------------|----------------------------------------------------------|
 * | `'small'`  | 2-note ascending sawtooth blip (A4 → E5)                 |
 * | `'medium'` | 4-note square + sawtooth arpeggio with octave shimmer     |
 * | `'big'`    | 5-note detuned sawtooth chord sequence + finale chord hit |
 *
 * Each note uses its own isolated GainNode so envelope automation on one
 * note never interferes with another.
 *
 * @param {'small'|'medium'|'big'} winLevel - The tier of the win.
 * @returns {void}
 */
export function playWinSound(winLevel) {
  const ac = _ctx();
  const now = ac.currentTime;

  if (winLevel === 'small') {
    _smallWin(ac, now);
  } else if (winLevel === 'medium') {
    _mediumWin(ac, now);
  } else {
    _bigWin(ac, now);
  }
}

/**
 * Small win: 2-note ascending sawtooth blip.
 * @param {AudioContext} ac
 * @param {number} now AudioContext timestamp
 * @private
 */
function _smallWin(ac, now) {
  const notes = [440, 660]; // A4 → E5
  const dur = 0.1;

  notes.forEach((freq, i) => {
    const t = now + i * dur;
    const g = _makeGain(0);
    _osc('sawtooth', freq, g, t, t + dur);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
  });
}

/**
 * Medium win: 4-note square-wave arpeggio with a sawtooth octave shimmer.
 * @param {AudioContext} ac
 * @param {number} now AudioContext timestamp
 * @private
 */
function _mediumWin(ac, now) {
  const notes = [330, 440, 660, 880]; // E4 → A4 → E5 → A5
  const dur = 0.13;

  notes.forEach((freq, i) => {
    const t = now + i * dur;
    const g = _makeGain(0);

    // Square wave fundamental
    _osc('square', freq, g, t, t + dur);

    // Sawtooth octave-up shimmer at 30% relative volume
    const shimAtten = ac.createGain();
    shimAtten.gain.value = 0.3;
    shimAtten.connect(g);
    _osc('sawtooth', freq * 2, shimAtten, t, t + dur);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
  });
}

/**
 * Big win: 5-note detuned sawtooth chord sequence with a held finale chord.
 * Three oscillators per note (0, +4, −4 cents) produce the thick, slightly
 * chorused neon-synth texture characteristic of a big cyberpunk payoff.
 * @param {AudioContext} ac
 * @param {number} now AudioContext timestamp
 * @private
 */
function _bigWin(ac, now) {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4 → E4 → G4 → C5 → E5
  const dur = 0.16;
  const step = 0.10; // notes overlap slightly for a driving feel

  notes.forEach((freq, i) => {
    const t = now + i * step;
    const g = _makeGain(0);

    // Detuned triad for thick synth texture
    [-4, 0, 4].forEach((cents) => {
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = cents;
      o.connect(g);
      o.start(t);
      o.stop(t + dur * 1.6);
    });

    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.5);
  });

  // Finale: full C-major chord power hit after the arpeggio
  const finaleT = now + notes.length * step + 0.06;
  const finaleG = _makeGain(0);
  [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
    _osc('sawtooth', freq, finaleG, finaleT, finaleT + 0.75);
  });
  finaleG.gain.setValueAtTime(0.28, finaleT);
  finaleG.gain.exponentialRampToValueAtTime(0.001, finaleT + 0.70);
}

// ─── Click sound ─────────────────────────────────────────────────────────────

/**
 * Plays a short, sharp digital click for UI button feedback.
 * A 1050 Hz square-wave burst with a ~45 ms exponential decay.
 *
 * @returns {void}
 */
export function playClickSound() {
  const ac = _ctx();
  const now = ac.currentTime;
  const g = _makeGain(0);

  _osc('square', 1050, g, now, now + 0.05);
  g.gain.setValueAtTime(0.28, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
}

// ─── Bonus sound ─────────────────────────────────────────────────────────────

/**
 * Plays the "ACCESS GRANTED" scatter bonus stinger.
 * Three sequential phases create a glitchy cyberpunk alarm feel:
 *
 * 1. **Glitch burst** — seven rapid square-wave blips at random-ish frequencies
 *    (220 → 440 → 110 → 330 → 880 → 165 → 660 Hz) simulate digital
 *    interference / data corruption.
 * 2. **Siren sweep** — a sawtooth oscillator sweeps 200 → 800 Hz over 350 ms,
 *    evoking a security alarm.
 * 3. **Power chord** — a sustained A2 sawtooth power chord ([110, 165, 220, 330] Hz)
 *    resolves the stinger with an "access confirmed" feel.
 *
 * @returns {void}
 */
export function playBonusSound() {
  const ac = _ctx();
  const now = ac.currentTime;

  // ── Phase 1: Glitch burst ─────────────────────────────────────────────
  const glitchFreqs = [220, 440, 110, 330, 880, 165, 660];
  const blipDur = 0.05;

  glitchFreqs.forEach((freq, i) => {
    const t = now + i * blipDur;
    const g = _makeGain(0);
    _osc('square', freq, g, t, t + blipDur);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + blipDur * 0.9);
  });

  // ── Phase 2: Siren sweep ──────────────────────────────────────────────
  const sweepT = now + glitchFreqs.length * blipDur;
  const sweepG = _makeGain(0);
  const sweep = ac.createOscillator();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(200, sweepT);
  sweep.frequency.exponentialRampToValueAtTime(800, sweepT + 0.35);
  sweep.connect(sweepG);
  sweep.start(sweepT);
  sweep.stop(sweepT + 0.38);
  sweepG.gain.setValueAtTime(0.22, sweepT);
  sweepG.gain.exponentialRampToValueAtTime(0.001, sweepT + 0.36);

  // ── Phase 3: Power chord resolution ──────────────────────────────────
  const chordT = sweepT + 0.42;
  const chordG = _makeGain(0);
  [110, 165, 220, 330].forEach((freq) => {          // A2 power chord
    _osc('sawtooth', freq, chordG, chordT, chordT + 0.75);
  });
  chordG.gain.setValueAtTime(0.30, chordT);
  chordG.gain.exponentialRampToValueAtTime(0.001, chordT + 0.70);
}

// ─── Global mute ─────────────────────────────────────────────────────────────

/**
 * Globally mutes or unmutes all game audio.
 *
 * Adjusts the master gain with a short 20 ms time-constant ramp to avoid
 * audible clicks.  The mute flag is persisted so that if the AudioContext
 * has not yet been created (first interaction hasn't happened), the correct
 * gain is applied as soon as {@link initAudio} runs.
 *
 * @param {boolean} shouldMute - `true` to mute, `false` to unmute.
 * @returns {void}
 */
export function setMuted(shouldMute) {
  muted = Boolean(shouldMute);
  if (masterGain) {
    masterGain.gain.setTargetAtTime(
      muted ? 0 : 1,
      _ctx().currentTime,
      0.02,
    );
  }
}
