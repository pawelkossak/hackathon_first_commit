import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as demoPost } from '../../app/api/push/demo/route';
import { POST as subscribePost, DELETE as subscribeDelete } from '../../app/api/push/subscribe/route';
import {
  isNotificationSupported,
  getNotificationPermission,
} from './push-client';

describe('N-11: Push & Demo Reminders', () => {
  it('detects notification support safely in non-browser environment', () => {
    // In node/vitest, window.Notification is not present
    expect(isNotificationSupported()).toBe(false);
    expect(getNotificationPermission()).toBe('unsupported');
  });

  describe('API: /api/push/demo', () => {
    it('schedules demo reminder with 30s delay by default and ethical content', async () => {
      const req = new NextRequest('http://localhost:3000/api/push/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await demoPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.scheduled).toBe(true);
      expect(data.delaySeconds).toBe(30);
      expect(data.trigger).toBe('demo');
      expect(data.title).toBe('Pilot Płynności');
      expect(data.body).toContain('Tydzień 3 czeka');
      expect(data.deepLink).toBe('/gra/1?resume=T3');
      expect(data.fallbackNotice).toBe('Baner powrotu nadal działa w grze.');

      // Hard Rule 3: No bank-product bias / ethics: never mentions loan or factoring
      const fullText = JSON.stringify(data).toLowerCase();
      expect(fullText).not.toContain('faktoring');
      expect(fullText).not.toContain('kredyt');
      expect(fullText).not.toContain('pożyczk');
    });

    it('respects custom delay and target week', async () => {
      const req = new NextRequest('http://localhost:3000/api/push/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delaySeconds: 15, targetWeek: 4 }),
      });

      const res = await demoPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.delaySeconds).toBe(15);
      expect(data.body).toContain('Tydzień 4 czeka');
      expect(data.deepLink).toBe('/gra/1?resume=T4');
    });

    it('rejects invalid delaySeconds outside bounds', async () => {
      const req = new NextRequest('http://localhost:3000/api/push/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delaySeconds: -5 }),
      });

      const res = await demoPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('API: /api/push/subscribe', () => {
    it('registers a valid push subscription', async () => {
      const req = new NextRequest('http://localhost:3000/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-sub-123',
            keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          },
          playerId: 'player-test-1',
        }),
      });

      const res = await subscribePost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.registered).toBe(true);
      expect(data.activeCount).toBeGreaterThan(0);
    });

    it('rejects subscription missing valid endpoint', async () => {
      const req = new NextRequest('http://localhost:3000/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: 'invalid-url',
          },
        }),
      });

      const res = await subscribePost(req);
      expect(res.status).toBe(400);
    });

    it('removes subscription on DELETE', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/push/subscribe?endpoint=https://fcm.googleapis.com/fcm/send/test-sub-123',
        {
          method: 'DELETE',
        }
      );

      const res = await subscribeDelete(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.removed).toBe(true);
    });
  });
});
