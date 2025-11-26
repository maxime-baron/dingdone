let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (!("wakeLock" in navigator)) {
    console.warn("Wake Lock API not supported");
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");

    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock released");
    });

    console.log("Wake Lock acquired");
    return true;
  } catch (err) {
    console.error("Failed to acquire Wake Lock:", err);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake Lock released manually");
    } catch (err) {
      console.error("Failed to release Wake Lock:", err);
    }
  }
}

export function isWakeLockSupported(): boolean {
  return "wakeLock" in navigator;
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released;
}
