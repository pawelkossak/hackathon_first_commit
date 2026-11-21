// POST /api/push/demo (D-14, BACKEND-SERVICES.md §4.2): schedules the stage trial reminder.
// Defaults come from lib/reminders/push-config.ts; every sentence of the payload comes from getCopy.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { gameData } from '../../../../engine';
import { getCopy } from '../../../../narrative';
import {
  DEMO_REMINDER,
  DEMO_REMINDER_MAX_DELAY_SECONDS,
  resumeLink,
} from '../../../../lib/reminders/push-config';

const DemoPushSchema = z.object({
  playerId: z.string().optional(),
  delaySeconds: z.number().int().min(0).max(DEMO_REMINDER_MAX_DELAY_SECONDS).default(DEMO_REMINDER.delaySeconds),
  variant: z.string().optional(),
  targetWeek: z.number().int().min(1).max(gameData.level1.weeks.length).default(DEMO_REMINDER.targetWeek),
  locale: z.enum(['pl', 'en']).default('pl'),
});

export async function POST(req: NextRequest) {
  let rawBody: unknown = {};
  try {
    rawBody = await req.json();
  } catch {
    // An empty body is allowed: the defaults of push-config.ts are used.
  }

  const parsed = DemoPushSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: getCopy('push.invalid'), details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { delaySeconds, targetWeek, locale } = parsed.data;
    const copy = (id: string, extra?: Record<string, string | number>) =>
      getCopy(id, undefined, 'female', 'female', extra, locale);
    const now = new Date();
    const firesAt = new Date(now.getTime() + delaySeconds * 1000);

    return NextResponse.json({
      scheduled: true,
      delaySeconds,
      trigger: 'demo',
      title: copy('push.title'),
      body: copy('push.body', { week: targetWeek }),
      deepLink: resumeLink(targetWeek),
      scheduledAt: now.toISOString(),
      firesAt: firesAt.toISOString(),
      message: copy('push.scheduled', { seconds: delaySeconds }),
      fallbackNotice: copy('push.fallback_notice'),
    });
  } catch {
    return NextResponse.json({ error: getCopy('push.failed') }, { status: 500 });
  }
}
