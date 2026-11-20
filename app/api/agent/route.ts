// Route handler POST /api/agent (ARCHITECTURE.md §6, BACKEND-SERVICES.md §3, DEMO-REQUIREMENTS.md GM-04).
import { NextResponse } from "next/server";
import { z } from "zod";
import { processAgentNegotiation } from "../../../lib/ai";

const RequestSchema = z.object({
  message: z.string().min(1).max(500),
  agent: z.enum(["klient_a", "bank"]),
  week: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
  ]),
  counterPending: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 3 s timeout safety (ARCHITECTURE.md §6): fallback to buttons and cached response if processing exceeds 3 s
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Negotiation timeout 3s")), 3000);
    });

    const response = await Promise.race([
      processAgentNegotiation(parsed.data),
      timeoutPromise,
    ]);

    return NextResponse.json(response);
  } catch {
    // Deterministic fallback on timeout or error
    return NextResponse.json(
      {
        intent: "unknown",
        outcome: "quick_replies",
        reply: "Wybierz jedną z przygotowanych opcji negocjacji:",
        buttons: [
          {
            id: "ask_advance_50",
            label: "Poproś o zaliczkę 50%",
            intent: "ask_advance",
            percent: 50,
          },
          {
            id: "offer_discount_2",
            label: "Zaoferuj skonto 2%",
            intent: "offer_discount",
            percent: 2,
          },
        ],
        cardId: null,
        counterPercent: null,
      },
      { status: 200 }
    );
  }
}
