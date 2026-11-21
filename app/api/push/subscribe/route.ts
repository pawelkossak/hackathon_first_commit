import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.record(z.string(), z.string()).optional(),
  }),
  playerId: z.string().optional(),
  userAgent: z.string().optional(),
});

// In-memory store for demo / offline environment
interface StoredSubscription {
  endpoint: string;
  keys?: Record<string, string>;
  playerId?: string;
  createdAt: string;
}

const activeSubscriptions = new Map<string, StoredSubscription>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { subscription, playerId } = parsed.data;
    activeSubscriptions.set(subscription.endpoint, {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      playerId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      registered: true,
      activeCount: activeSubscriptions.size,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      activeSubscriptions.delete(endpoint);
    }

    return NextResponse.json({
      success: true,
      removed: true,
      activeCount: activeSubscriptions.size,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
