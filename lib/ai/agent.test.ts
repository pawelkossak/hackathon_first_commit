import { describe, expect, it } from "vitest";
import { createGame } from "../../engine";
import { classifyIntent, processAgentNegotiation } from "./index";

describe("N-06 Negotiation G14 and /api/agent", () => {
  it("test: PILOT_AI_OFFLINE=1 returns buttons and deterministic replies", async () => {
    process.env.PILOT_AI_OFFLINE = "1";
    const state = createGame("demo");

    // 1. Prośba o 50% zaliczki -> kontroferta 30% (GM-04)
    const res50 = await processAgentNegotiation(
      {
        message: "Chciałbym poprosić o zaliczkę 50% na poczet projektu.",
        agent: "klient_a",
        week: 1,
      },
      state
    );

    expect(res50.intent).toBe("ask_advance");
    expect(res50.outcome).toBe("counter");
    expect(res50.counterPercent).toBe(30);
    expect(res50.reply).toContain("30%");
    expect(res50.reply).toContain("15 000 zł");
    expect(res50.buttons.length).toBeGreaterThan(0);
    expect(res50.buttons.some((b) => b.intent === "accept_counter")).toBe(true);

    // 2. Akceptacja kontroferty 30% -> karta C1 (GM-04)
    const resAccept = await processAgentNegotiation(
      {
        message: "Zgadzam się na 30% zaliczki.",
        agent: "klient_a",
        week: 1,
        counterPending: true,
      },
      state
    );

    expect(resAccept.intent).toBe("accept_counter");
    expect(resAccept.outcome).toBe("accept");
    expect(resAccept.cardId).toBe("C1");
    expect(resAccept.reply).toContain("15 000 zł");
  });

  it("test: no key in response payload or exposed in bundle", async () => {
    const res = await processAgentNegotiation({
      message: "Proszę o zaliczkę 30%",
      agent: "klient_a",
      week: 1,
    });

    const resString = JSON.stringify(res);
    expect(resString).not.toContain("sk-");
    expect(resString).not.toContain("API_KEY");
    expect(resString).not.toContain("secret");
  });

  it("classifies player intentions with free text in Polish", () => {
    expect(classifyIntent("Potrzebuję 50% zaliczki na start").intent).toBe("ask_advance");
    expect(classifyIntent("Czy możemy rozliczyć to ze skontem 2%?").intent).toBe("offer_discount");
    expect(classifyIntent("Zgadzam się na Twoje warunki").intent).toBe("accept_counter");
    expect(classifyIntent("Jesteś oszustem i złodziejem!").intent).toBe("rude");
    expect(classifyIntent("Pogoda dzisiaj jest ładna").intent).toBe("unknown");
  });

  it("refuses advance requests after week 2 per agents.json rules", async () => {
    const resWeek3 = await processAgentNegotiation({
      message: "Chcę zaliczkę 30%",
      agent: "klient_a",
      week: 3,
    });

    expect(resWeek3.outcome).toBe("refuse");
    expect(resWeek3.cardId).toBeNull();
  });
});
