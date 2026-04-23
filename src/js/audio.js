/**
 * Audio Module — Data Heist
 * Plays pre-recorded WAV files from res/audio/ for all game sounds.
 *
 * Exported API
 * ────────────
 *  initAudio()           — must be called from a user-gesture handler
 *  playSpinSound()       — looping spin sound during a spin
 *  stopSpinSound()       — stops the spin loop
 *  playWinSound(level)   — 'small' | 'medium' | 'big' fanfare
 *  playClickSound()      — short UI click blip
 *  playBonusSound()      — bonus stinger
 *  setMuted(bool)        — global mute toggle
 *
 * @module audio
 */

let muted = false;

/** @type {HTMLAudioElement|null} */
let spinAudio = null;

const SFX = {
  spin:      'res/audio/Spin.wav',
  smallWin:  'res/audio/SmallWin.wav',
  mediumWin: 'res/audio/MediumWin.wav',
  bigWin:    'res/audio/BigWin.wav',
  click:     'res/audio/UI Click.wav',
  bonus:     'res/audio/BonusSound.wav',
};

/**
 * No-op kept for API compatibility — HTMLAudioElement needs no explicit init.
 * @returns {void}
 */
export function initAudio() {}

/**
 * Starts the looping spin sound. Has no effect if already playing.
 * @returns {void}
 */
export function playSpinSound() {
  if (spinAudio) return;
  spinAudio = new Audio(SFX.spin);
  spinAudio.loop = true;
  spinAudio.muted = muted;
  spinAudio.play().catch(() => {});
}

/**
 * Stops the looping spin sound. Has no effect if not currently playing.
 * @returns {void}
 */
export function stopSpinSound() {
  if (!spinAudio) return;
  spinAudio.pause();
  spinAudio.currentTime = 0;
  spinAudio = null;
}

/**
 * Plays a win fanfare scaled to the win tier.
 * @param {'small'|'medium'|'big'} winLevel
 * @returns {void}
 */
export function playWinSound(winLevel) {
  const src = winLevel === 'small'  ? SFX.smallWin
            : winLevel === 'medium' ? SFX.mediumWin
            : SFX.bigWin;
  const audio = new Audio(src);
  audio.muted = muted;
  audio.play().catch(() => {});
}

/**
 * Plays a short UI click sound.
 * @returns {void}
 */
export function playClickSound() {
  const audio = new Audio(SFX.click);
  audio.muted = muted;
  audio.play().catch(() => {});
}

/**
 * Plays the bonus stinger.
 * @returns {void}
 */
export function playBonusSound() {
  const audio = new Audio(SFX.bonus);
  audio.muted = muted;
  audio.play().catch(() => {});
}

/**
 * Globally mutes or unmutes all game audio.
 * @param {boolean} shouldMute
 * @returns {void}
 */
export function setMuted(shouldMute) {
  muted = Boolean(shouldMute);
  if (spinAudio) spinAudio.muted = muted;
}
