import { test, expect } from '@playwright/test';
import { createGame, forecast } from '../engine';

/**
 * End-to-end Playwright specification for Pilot Płynności 90-second demo path (N-07).
 * Target viewport: Desktop 1440x900 (GAME-DESIGN.md §9, §10, DEMO-REQUIREMENTS.md).
 *
 * Covered now (no UI route exists on this branch yet, see docs/team/handoffs/N-07.md): the server side of
 * steps 4 and 8 (/api/agent counter → accept plays C1; /api/push/demo; /api/push/subscribe) and the engine
 * effect of step 5 (the 28 XII minimum after C1). Steps 1–3, 6, 7 and the clicks of 4, 5 and 8 wait for the
 * ui lane's /gra/1 route; they are not written as skipped tests.
 *
 * Full click-path:
 * 1. Intro & Szefowa greeting (G05-G08) -> skip to map (G09)
 * 2. Board (G10): December route, storm 28 XII "-12 395 zł", HUD 38 000 zł, Dane syntetyczne
 * 3. T1 event (G11): changed account number -> "Sprawdź i zadzwoń"
 * 4. T1 negotiation (G14): "50% zaliczki?" -> counter 30% (15 000 zł do 3 XII) -> accept
 * 5. 28 XII node (G30, Cash Flow drilldown): before -12 395 zł, after +2 605 zł
 * 6. T2-T7 resolve -> summary (G18): end 9 985 zł, "Unikasz 2 400 zł"
 * 7. "Zapisz plan" (G22) -> Time travel 2 weeks (21 XI -> 5 XII) -> "Zaliczka dotarła" (G23)
 * 8. Reminder opt-in (G34): "Wyślij próbę (30 s)" -> demo reminder scheduled
 */

test.describe('N-07: Demo-path E2E (Desktop 1440x900)', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
  });

  test.describe('Backend Service APIs', () => {
    test('POST /api/agent returns the engine counter-offer 30% for 50% advance, then accept plays C1', async ({ request }) => {
      const response = await request.post('/api/agent', {
        data: {
          state: createGame('demo'),
          agent: 'klient_a',
          message: 'Czy możemy prosić o 50% zaliczki na start projektu?',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.lineId).toBe('a.advance.counter');
      expect(data.result.outcome).toBe('counter');
      expect(data.result.counterPercent).toBe(30);
      expect(data.text.replace(/\u00a0/g, ' ')).toContain('15 000 zł do 3 grudnia');

      const accept = await request.post('/api/agent', {
        data: { state: data.result.state, agent: 'klient_a', intent: 'accept_counter' },
      });
      expect(accept.ok()).toBeTruthy();
      const accepted = await accept.json();
      expect(accepted.result.appliedCardId).toBe('C1');
      expect(accepted.result.state.core.played.map((p: { cardId: string }) => p.cardId)).toEqual(['C1']);

      // Step 5 (engine side): the forecast minimum moves above zero after C1 (−12 395 zł → +2 605 zł).
      const before = forecast(createGame('demo')).minimum;
      const after = forecast(accepted.result.state).minimum;
      expect(before.balance).toBe(-12395);
      expect(after.balance).toBe(2605);
      expect(after.date).toBe(before.date);
    });

    test('POST /api/push/demo schedules 30 s stage reminder without bank promotion', async ({ request }) => {
      const response = await request.post('/api/push/demo', {
        data: {
          delaySeconds: 30,
          targetWeek: 3,
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.scheduled).toBe(true);
      expect(data.delaySeconds).toBe(30);
      expect(data.deepLink).toBe('/gra/1?resume=T3');
      expect(data.body).toContain('Tydzień 3 czeka');

      // Ethical check: no credit or factoring promotion in push payload
      const jsonStr = JSON.stringify(data).toLowerCase();
      expect(jsonStr).not.toContain('kredyt');
      expect(jsonStr).not.toContain('faktoring');
      expect(jsonStr).not.toContain('pożyczk');
    });

    test('POST and DELETE /api/push/subscribe handle Web Push subscription lifecycle', async ({ request }) => {
      const subRes = await request.post('/api/push/subscribe', {
        data: {
          subscription: {
            endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/demo-sub-77',
            keys: { p256dh: 'key1', auth: 'auth1' },
          },
          playerId: 'player-e2e',
        },
      });
      expect(subRes.ok()).toBeTruthy();
      const subData = await subRes.json();
      expect(subData.registered).toBe(true);

      const delRes = await request.delete(
        '/api/push/subscribe?endpoint=https://updates.push.services.mozilla.com/wpush/v2/demo-sub-77'
      );
      expect(delRes.ok()).toBeTruthy();
      const delData = await delRes.json();
      expect(delData.removed).toBe(true);
    });
  });
});
