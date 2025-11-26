// Global AudioContext that persists across all sounds (required for iOS)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContext;
  } catch (error) {
    console.error("Error creating AudioContext:", error);
    return null;
  }
}

// Initialize and unlock audio on first user interaction
export function initAudio() {
  if (typeof window === "undefined") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume AudioContext (required for iOS)
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

export async function playBeep(frequency: number = 800, duration: number = 200) {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // CRITICAL: Resume AudioContext before playing (required for iOS)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Oscillateur pour générer le son
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configuration
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Enveloppe d'amplitude pour éviter les clics
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration / 1000
    );

    // Démarrer et arrêter
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);

    // Note: Don't close the AudioContext, we reuse it
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

export function playIntervalTransition() {
  playBeep(800, 200);
}

export function playCycleComplete() {
  playBeep(600, 150);
  setTimeout(() => playBeep(800, 150), 200);
}

export function playSessionComplete() {
  playBeep(600, 150);
  setTimeout(() => playBeep(800, 150), 200);
  setTimeout(() => playBeep(1000, 300), 400);
}

export function playCountdownBeep() {
  playBeep(600, 100);
}
