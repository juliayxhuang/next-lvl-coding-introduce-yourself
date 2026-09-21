import confetti from 'canvas-confetti';

export function triggerConfetti(): void {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f43f5e', '#38bdf8', '#fbbf24']
    });

    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f43f5e', '#38bdf8', '#fbbf24']
    });

    // Center micro stars
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['circle'],
        scalar: 0.9,
        colors: ['#a855f7', '#06b6d4', '#e11d48']
      });
    }, 150);
  } catch (err) {
    console.warn('Confetti trigger failed:', err);
  }
}
