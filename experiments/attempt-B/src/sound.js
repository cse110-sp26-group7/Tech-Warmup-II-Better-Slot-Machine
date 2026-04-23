// experiments/attempt-B/src/sound.js
// Synthesized slot machine sounds via Web Audio API. No external audio files.
// AudioContext is lazily created on first play so browser autoplay policies
// (which require a user gesture) are satisfied naturally: the first sound
// plays during the SPIN click handler, which IS a user gesture.

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new window.AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

/**
 * Play a fixed-pitch tone with an exponential decay envelope.
 * @param {number} freq  Hz
 * @param {number} duration  seconds
 * @param {OscillatorType} [type]
 * @param {number} [volume]  peak gain 0..1
 * @param {number} [delay]  seconds from now
 */
function tone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
  const c = getCtx();
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/**
 * Play a pitch sweep from `fromFreq` to `toFreq` over `duration`.
 * @param {number} fromFreq
 * @param {number} toFreq
 * @param {number} duration
 * @param {OscillatorType} [type]
 * @param {number} [volume]
 */
function sweep(fromFreq, toFreq, duration, type = 'sawtooth', volume = 0.1) {
  const c = getCtx();
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromFreq, t0);
  osc.frequency.exponentialRampToValueAtTime(toFreq, t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// ----- public sound effects -----

export function playSpin() {
  sweep(200, 600, 0.4, 'sawtooth', 0.08);
}

/** Regular win — short C-E-G arpeggio, delayed so grid drop finishes first. */
export function playWin() {
  const d = 0.7;
  tone(523.25, 0.2, 'sine', 0.14, d);
  tone(659.25, 0.25, 'sine', 0.14, d + 0.08);
  tone(783.99, 0.35, 'sine', 0.14, d + 0.16);
}

/** Big win — ascending C major arpeggio with octave doubling. */
export function playBigWin() {
  const d = 0.7;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
  notes.forEach((f, i) => {
    tone(f, 0.3, 'sine', 0.18, d + i * 0.12);
    tone(f * 2, 0.3, 'triangle', 0.06, d + i * 0.12);
  });
}

/** Unlucky pity bonus — gentle descending major arpeggio, smaller volume. */
export function playPity() {
  const d = 0.3;
  // G4 → E4 → C4, consolation-feel (descending major thirds)
  tone(392.00, 0.25, 'triangle', 0.09, d);
  tone(329.63, 0.25, 'triangle', 0.09, d + 0.12);
  tone(261.63, 0.35, 'triangle', 0.09, d + 0.24);
}

/** Mega win — triadic progression plus sustained bass. */
export function playMegaWin() {
  const d = 0.7;
  const chords = [
    [261.63, 329.63, 392.00], // C major
    [349.23, 440.00, 523.25], // F major
    [392.00, 493.88, 587.33], // G major
    [523.25, 659.25, 783.99], // C major (octave up)
  ];
  chords.forEach((chord, i) => {
    chord.forEach(f => {
      tone(f, 0.45, 'sine', 0.11, d + i * 0.35);
      tone(f * 2, 0.45, 'triangle', 0.05, d + i * 0.35);
    });
  });
  tone(130.81, 1.8, 'sine', 0.09, d);
}
