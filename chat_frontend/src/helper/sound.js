/**
 * Self-contained Web Audio API synthesizer for modern message sound notifications.
 * Zero external audio files required, zero network latency.
 */
let soundEnabled = true;

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
  try {
    localStorage.setItem('chat_sound_enabled', enabled ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
};

export const getSoundEnabled = () => {
  try {
    const saved = localStorage.getItem('chat_sound_enabled');
    if (saved !== null) return saved === 'true';
  } catch (e) {
    // ignore
  }
  return soundEnabled;
};

export const playIncomingMessageSound = () => {
  if (!getSoundEnabled()) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Pleasant two-tone chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

    osc2.frequency.setValueAtTime(329.63, now);
    osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (error) {
    // AudioContext might be blocked until first user interaction
  }
};

export const playSentMessageSound = () => {
  if (!getSoundEnabled()) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (error) {
    // ignore
  }
};
