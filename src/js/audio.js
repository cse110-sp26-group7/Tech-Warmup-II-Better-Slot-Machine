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
function getCtx() {
  return initAudio();
}

/**
 * Creates a GainNode wired directly into the master bus.
 *
 * @param {number} [initialGain=0] Starting gain value.
 * @returns {GainNode}
 * @private
 */
function makeGain(initialGain = 0) {
  const gainNode = getCtx().createGain();
  gainNode.gain.value = initialGain;
  gainNode.connect(masterGain);
  return gainNode;
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
function startOsc(type, freq, dest, start, stop) {
  const audioCtx = getCtx();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  oscillator.connect(dest);
  oscillator.start(start !== undefined ? start : audioCtx.currentTime);
  if (stop !== undefined) {
    oscillator.stop(stop);
  }
  return oscillator;
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

  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const busGain = makeGain(0);

  // ── Buzz layer (sawtooth + LFO frequency modulation) ─────────────────
  const buzz = audioCtx.createOscillator();
  buzz.type = 'sawtooth';
  buzz.frequency.value = 75;

  const lfo = audioCtx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 14;

  const lfoDepth = audioCtx.createGain();
  lfoDepth.gain.value = 18; // ±18 Hz modulation depth
  lfo.connect(lfoDepth);
  lfoDepth.connect(buzz.frequency);
  buzz.connect(busGain);

  // ── Whirr layer (quieter high square) ────────────────────────────────
  const whirrAtten = audioCtx.createGain();
  whirrAtten.gain.value = 0.38;
  whirrAtten.connect(busGain);

  const whirr = audioCtx.createOscillator();
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

  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const fadeMs = 0.08;

  // Time-constant ramp silences within ~3 × 25 ms
  spinNodes.busGain.gain.setTargetAtTime(0, now, 0.025);
  spinNodes.oscs.forEach((oscillator) => {
    try { oscillator.stop(now + fadeMs); } catch (_) { /* osc may already be stopped */ }
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
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;

  if (winLevel === 'small') {
    smallWin(now);
  } else if (winLevel === 'medium') {
    mediumWin(audioCtx, now);
  } else {
    bigWin(audioCtx, now);
  }
}

/**
 * Small win: 2-note ascending sawtooth blip.
 * @param {number} now AudioContext timestamp
 * @private
 */
function smallWin(now) {
  const notes = [440, 660]; // A4 → E5
  const dur = 0.1;

  notes.forEach((freq, noteIndex) => {
    const noteStart = now + noteIndex * dur;
    const gainNode = makeGain(0);
    startOsc('sawtooth', freq, gainNode, noteStart, noteStart + dur);
    gainNode.gain.setValueAtTime(0.22, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + dur * 0.9);
  });
}

/**
 * Medium win: 4-note square-wave arpeggio with a sawtooth octave shimmer.
 * @param {AudioContext} audioCtx
 * @param {number} now AudioContext timestamp
 * @private
 */
function mediumWin(audioCtx, now) {
  const notes = [330, 440, 660, 880]; // E4 → A4 → E5 → A5
  const dur = 0.13;

  notes.forEach((freq, noteIndex) => {
    const noteStart = now + noteIndex * dur;
    const gainNode = makeGain(0);

    // Square wave fundamental
    startOsc('square', freq, gainNode, noteStart, noteStart + dur);

    // Sawtooth octave-up shimmer at 30% relative volume
    const shimAtten = audioCtx.createGain();
    shimAtten.gain.value = 0.3;
    shimAtten.connect(gainNode);
    startOsc('sawtooth', freq * 2, shimAtten, noteStart, noteStart + dur);

    gainNode.gain.setValueAtTime(0.2, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + dur * 0.95);
  });
}

/**
 * Big win: 5-note detuned sawtooth chord sequence with a held finale chord.
 * Three oscillators per note (0, +4, −4 cents) produce the thick, slightly
 * chorused neon-synth texture characteristic of a big cyberpunk payoff.
 * @param {AudioContext} audioCtx
 * @param {number} now AudioContext timestamp
 * @private
 */
function bigWin(audioCtx, now) {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4 → E4 → G4 → C5 → E5
  const dur = 0.16;
  const step = 0.10; // notes overlap slightly for a driving feel

  notes.forEach((freq, noteIndex) => {
    const noteStart = now + noteIndex * step;
    const gainNode = makeGain(0);

    // Detuned triad for thick synth texture
    [-4, 0, 4].forEach((cents) => {
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = freq;
      oscillator.detune.value = cents;
      oscillator.connect(gainNode);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + dur * 1.6);
    });

    gainNode.gain.setValueAtTime(0.22, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + dur * 1.5);
  });

  // Finale: full C-major chord power hit after the arpeggio
  const finaleStart = now + notes.length * step + 0.06;
  const finaleGain = makeGain(0);
  [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
    startOsc('sawtooth', freq, finaleGain, finaleStart, finaleStart + 0.75);
  });
  finaleGain.gain.setValueAtTime(0.28, finaleStart);
  finaleGain.gain.exponentialRampToValueAtTime(0.001, finaleStart + 0.70);
}

// ─── Click sound ─────────────────────────────────────────────────────────────

/**
 * Plays a short, sharp digital click for UI button feedback.
 * A 1050 Hz square-wave burst with a ~45 ms exponential decay.
 *
 * @returns {void}
 */
export function playClickSound() {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const gainNode = makeGain(0);

  startOsc('square', 1050, gainNode, now, now + 0.05);
  gainNode.gain.setValueAtTime(0.28, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
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
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;

  // ── Phase 1: Glitch burst ─────────────────────────────────────────────
  const glitchFreqs = [220, 440, 110, 330, 880, 165, 660];
  const blipDur = 0.05;

  glitchFreqs.forEach((freq, blipIndex) => {
    const blipStart = now + blipIndex * blipDur;
    const gainNode = makeGain(0);
    startOsc('square', freq, gainNode, blipStart, blipStart + blipDur);
    gainNode.gain.setValueAtTime(0.2, blipStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, blipStart + blipDur * 0.9);
  });

  // ── Phase 2: Siren sweep ──────────────────────────────────────────────
  const sweepStart = now + glitchFreqs.length * blipDur;
  const sweepGain = makeGain(0);
  const sweep = audioCtx.createOscillator();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(200, sweepStart);
  sweep.frequency.exponentialRampToValueAtTime(800, sweepStart + 0.35);
  sweep.connect(sweepGain);
  sweep.start(sweepStart);
  sweep.stop(sweepStart + 0.38);
  sweepGain.gain.setValueAtTime(0.22, sweepStart);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, sweepStart + 0.36);

  // ── Phase 3: Power chord resolution ──────────────────────────────────
  const chordStart = sweepStart + 0.42;
  const chordGain = makeGain(0);
  [110, 165, 220, 330].forEach((freq) => {          // A2 power chord
    startOsc('sawtooth', freq, chordGain, chordStart, chordStart + 0.75);
  });
  chordGain.gain.setValueAtTime(0.30, chordStart);
  chordGain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.70);
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
      getCtx().currentTime,
      0.02,
    );
  }
}
