/** Asks the browser for notification permission if not yet decided. */
export function requestNotificationPermission(): void {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch {
    // Notifications not supported
  }
}

/** Fires a native desktop notification if permission is granted. */
export function sendNotification(title: string, body: string): void {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    // Notifications not supported or blocked
  }
}
