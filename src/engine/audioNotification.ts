// Web Audio API Synthesizer & Native Notification Utilities
// Guarantees zero external network dependencies, offline functionality, and instant acoustic feedback

export function playAcousticChime(type: "complete" | "start" | "break" = "complete") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "complete") {
      // Harmonic Triad (C5 -> E5 -> G5 -> C6) with soft sine envelope
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.3);
      });
    } else if (type === "start") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === "break") {
      const now = ctx.currentTime;
      const notes = [783.99, 659.25, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.14);

        gain.gain.setValueAtTime(0, now + i * 0.14);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 1.0);
      });
    }
  } catch (e) {
    console.warn("Web Audio API not allowed yet by user gesture:", e);
  }
}

export async function requestSystemNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    console.error("Error requesting notification permission:", e);
    return "denied";
  }
}

export function sendSystemNotification(title: string, body: string, icon = "/favicon.ico") {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      requireInteraction: true,
      tag: "natal-pomodoro-timer",
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn("Failed to create system notification:", e);
  }
}
