// N-06: POST /api/agent end to end in-process (no server, no network). The route returns the engine result.
import { describe, expect, it } from "vitest";
import { createGame } from "../../../engine";
import type { AgentTurnResponse } from "../../../lib/ai";
import { isAgentTurnResponse, postAgentTurn } from "../../../components/narrative/agent-client";
import { POST } from "./route";

async function call(body: unknown): Promise<{ status: number; data: AgentTurnResponse }> {
  const res = await POST(
    new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  const data: unknown = await res.json();
  if (!isAgentTurnResponse(data)) throw new Error("malformed reply");
  return { status: res.status, data };
}

describe("N-06 POST /api/agent", () => {
  it("serialized state + text → engine counter 30 %, then accept applies C1 in the returned state", async () => {
    const state = createGame("demo");
    const first = await call({ state, agent: "klient_a", message: "Czy możemy prosić o 50% zaliczki?" });
    expect(first.status).toBe(200);
    expect(first.data.ok).toBe(true);
    if (!first.data.ok) return;
    expect(first.data.lineId).toBe("a.advance.counter");
    expect(first.data.result.counterPercent).toBe(30);
    expect(first.data.text).toContain("15\u00a0000 zł do 3 grudnia");

    const second = await call({ state: first.data.result.state, agent: "klient_a", intent: "accept_counter" });
    expect(second.data.ok).toBe(true);
    if (!second.data.ok) return;
    expect(second.data.result.appliedCardId).toBe("C1");
    expect(second.data.result.state.core.played.map((p) => p.cardId)).toEqual(["C1"]);
  });

  it("an invalid body or state gives the deterministic fallback with buttons", async () => {
    const noState = await call({ agent: "klient_a", message: "50%" });
    expect(noState.status).toBe(400);
    expect(noState.data.ok).toBe(false);
    expect(noState.data.lineId).toBe("a.fallback");
    expect(noState.data.quickReplies.length).toBeGreaterThan(0);

    const bad = await call({ state: { schemaVersion: 2 }, agent: "bank", intent: "ask_overdraft" });
    expect(bad.status).toBe(400);
    expect(bad.data.lineId).toBe("bank.fallback");
  });

  it("a finished lap: 409 with the fallback line and no quick replies", async () => {
    const s = createGame("demo");
    const done = await call({ state: { ...s, core: { ...s.core, status: "completed" } }, agent: "klient_a", message: "50%" });
    expect(done.status).toBe(409);
    expect(done.data.ok).toBe(false);
    expect(done.data.quickReplies).toEqual([]);
  });
});

describe("N-06 browser client", () => {
  it("returns null on a network error or after the 3 s budget, so the UI shows buttons", async () => {
    const failing: typeof fetch = async () => {
      throw new Error("offline");
    };
    expect(await postAgentTurn({ state: createGame("demo"), agent: "klient_a", message: "x" }, failing)).toBeNull();

    const hanging: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      });
    expect(await postAgentTurn({ state: createGame("demo"), agent: "klient_a", message: "x" }, hanging, 20)).toBeNull();
  });

  it("posts to /api/agent only", async () => {
    const urls: string[] = [];
    const recording: typeof fetch = async (input, init) => {
      urls.push(String(input));
      const body = typeof init?.body === "string" ? init.body : "";
      return POST(new Request("http://localhost/api/agent", { method: "POST", body }));
    };
    const r = await postAgentTurn({ state: createGame("demo"), agent: "bank", intent: "ask_overdraft" }, recording);
    expect(urls).toEqual(["/api/agent"]);
    expect(r?.ok).toBe(true);
  });
});
