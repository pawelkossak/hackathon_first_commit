import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DemoPushSchema = z.object({
  playerId: z.string().optional(),
  delaySeconds: z.number().int().min(0).max(3600).default(30),
  variant: z.string().optional(),
  targetWeek: z.number().int().min(1).max(7).default(3),
});

export async function POST(req: NextRequest) {
  try {
    let rawBody = {};
    try {
      rawBody = await req.json();
    } catch {
      // Empty body allowed, defaults used
    }

    const parsed = DemoPushSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid demo request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { delaySeconds, targetWeek } = parsed.data;
    const now = new Date();
    const firesAt = new Date(now.getTime() + delaySeconds * 1000);

    // Copy string matching N-01 in notification-copy.pl.json / BACKEND-SERVICES.md §4.2:
    // "Tydzień {week.current} czeka. Wrócisz za stery?"
    const title = 'Pilot Płynności';
    const body = `Tydzień ${targetWeek} czeka. Wrócisz za stery?`;
    const deepLink = `/gra/1?resume=T${targetWeek}`;

    return NextResponse.json({
      scheduled: true,
      delaySeconds,
      trigger: 'demo',
      title,
      body,
      deepLink,
      scheduledAt: now.toISOString(),
      firesAt: firesAt.toISOString(),
      message: `Próbne przypomnienie przyjdzie za ${delaySeconds} sekund.`,
      fallbackNotice: 'Baner powrotu nadal działa w grze.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to schedule demo reminder' },
      { status: 500 }
    );
  }
}
