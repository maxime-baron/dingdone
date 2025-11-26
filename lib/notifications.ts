function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export async function requestNotificationPermission(): Promise<boolean> {
  // Disable notifications on iOS
  if (isIOS()) {
    return false;
  }

  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function checkNotificationPermission(): boolean {
  // Disable notifications on iOS
  if (isIOS()) {
    return false;
  }

  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

export function sendNotificationViaServiceWorker(
  title: string,
  body: string,
  delay: number = 0,
  id?: string
): void {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn("Service Worker not active");
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: delay > 0 ? "SCHEDULE_NOTIFICATION" : "SHOW_NOTIFICATION_NOW",
    title,
    body,
    delay,
    tag: "dingdone-timer", // Use consistent tag for all timer notifications
    id: id || `notif-${Date.now()}-${Math.random()}`,
  });
}

export function cancelAllNotifications(): void {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn("Service Worker not active");
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: "CANCEL_ALL_NOTIFICATIONS",
  });
}
