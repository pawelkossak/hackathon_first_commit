// lib/reminders/push-client.ts - Client-side push & demo reminder management (N-11 / D-14)
// Defaults come from push-config.ts; every fallback sentence comes from getCopy.
import { getCopy, getLocale } from '../../narrative';
import { DEMO_REMINDER, resumeLink } from './push-config';

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
  const delaySeconds = options?.delaySeconds ?? DEMO_REMINDER.delaySeconds;
  const targetWeek = options?.targetWeek ?? DEMO_REMINDER.targetWeek;
  const locale = getLocale();
  const copy = (id: string, extra?: Record<string, string | number>) =>
    getCopy(id, undefined, 'female', 'female', extra, locale);

  let responseData: Partial<DemoReminderResult> = {};

  try {
    const res = await fetch('/api/push/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delaySeconds, targetWeek, locale }),
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
    title: responseData.title || copy('push.title'),
    body: responseData.body || copy('push.body', { week: targetWeek }),
    deepLink: responseData.deepLink || resumeLink(targetWeek),
    message: responseData.message || copy('push.scheduled', { seconds: delaySeconds }),
    fallbackNotice: copy('push.fallback_notice'),
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
