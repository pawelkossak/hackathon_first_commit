// lib/reminders/push-client.ts - Client-side push & demo reminder management (N-11 / D-14)

export interface DemoReminderResult {
  scheduled: boolean;
  delaySeconds: number;
  title: string;
  body: string;
  deepLink: string;
  message: string;
  fallbackNotice: string;
}

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

export async function scheduleDemoReminder(options?: {
  delaySeconds?: number;
  targetWeek?: number;
  onFallbackTrigger?: () => void;
}): Promise<DemoReminderResult> {
  const delaySeconds = options?.delaySeconds ?? 30;
  const targetWeek = options?.targetWeek ?? 3;

  let responseData: Partial<DemoReminderResult> = {};

  try {
    const res = await fetch('/api/push/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delaySeconds, targetWeek }),
    });
    if (res.ok) {
      responseData = await res.json();
    }
  } catch {
    // Local / offline fallback
  }

  const result: DemoReminderResult = {
    scheduled: true,
    delaySeconds,
    title: responseData.title || 'Pilot Płynności',
    body: responseData.body || `Tydzień ${targetWeek} czeka. Wrócisz za stery?`,
    deepLink: responseData.deepLink || `/gra/1?resume=T${targetWeek}`,
    message: responseData.message || `Próbne przypomnienie przyjdzie za ${delaySeconds} sekund.`,
    fallbackNotice: 'Baner powrotu nadal działa w grze.',
  };

  // 1. If service worker is active, instruct it to show notification after delay
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_DEMO_REMINDER',
      delaySeconds,
      payload: {
        title: result.title,
        body: result.body,
        data: { url: result.deepLink },
      },
    });
  }

  // 2. Client-side fallback timer (e.g. for return banner update or UI simulation)
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      // In-app fallback trigger
      if (options?.onFallbackTrigger) {
        options.onFallbackTrigger();
      }
    }, delaySeconds * 1000);
  }

  return result;
}
