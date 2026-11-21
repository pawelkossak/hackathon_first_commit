import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";
import { checkReferences, gameData, rawDataFiles } from "./data";
import {
  AgentsFileSchema,
  EngineEventTypeSchema,
  FutureScriptFileSchema,
  Level1FileSchema,
  Level2FileSchema,
  PersonaFileSchema,
  ReactionsFileSchema,
} from "./schema";

const DATA_DIR = join(__dirname, "..", "data");

const schemas: Record<string, ZodType> = {
  "persona.json": PersonaFileSchema,
  "level1.json": Level1FileSchema,
  "agents.json": AgentsFileSchema,
  "future-script.json": FutureScriptFileSchema,
  "reactions.json": ReactionsFileSchema,
  "level2.json": Level2FileSchema,
};

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

describe("data/*.json schemas", () => {
  it("every data file has a schema and is loaded by the engine", () => {
    expect(files.sort()).toEqual(Object.keys(schemas).sort());
    expect(Object.keys(rawDataFiles).sort()).toEqual(files.sort());
  });

  it.each(files)("%s validates with Zod", (file) => {
    const json: unknown = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    const result = schemas[file].safeParse(json);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("cross-file references are consistent", () => {
    expect(checkReferences(gameData)).toEqual([]);
  });

  it("D-18 reactions.json maps every engine event type once; fraudRevealed → exasperated rx.fraud", () => {
    const events = gameData.reactions.reactions.map((r) => r.event);
    expect([...events].sort()).toEqual([...EngineEventTypeSchema.options].sort());
    const fraud = gameData.reactions.reactions.find((r) => r.event === "fraudRevealed");
    expect(fraud?.steps).toEqual([{ emotion: "exasperated", lineIdPrefix: "rx.fraud" }]);
  });

  it("a reactions.json without a mapping for an event type fails the cross-check", () => {
    const reactions = { ...gameData.reactions, reactions: gameData.reactions.reactions.filter((r) => r.event !== "fraudRevealed") };
    expect(checkReferences({ ...gameData, reactions })).toEqual(["reactions: no mapping for fraudRevealed"]);
  });

  it("a broken file is rejected", () => {
    const broken = structuredClone(rawDataFiles["level1.json"]) as { cards: { cost: { fixed: number } }[] };
    broken.cards[0].cost.fixed = 1.5;
    expect(Level1FileSchema.safeParse(broken).success).toBe(false);
  });

  it("ledger rows match the specification table (ENGINE-DATA-AND-TESTS §2.2)", () => {
    const rows = gameData.persona.ledger.map((l) => [l.id, l.date, l.amount]);
    expect(rows).toEqual([
      ["L01", "2026-11-25", -4300],
      ["L02", "2026-11-30", 7380],
      ["L03", "2026-12-07", -12800],
      ["L04", "2026-12-10", -2900],
      ["L05", "2026-12-14", 9225],
      ["L06", "2026-12-15", -2900],
      ["L07", "2026-12-21", -4100],
      ["L08", "2026-12-22", -35700],
      ["L09", "2026-12-28", -4300],
      ["L10", "2026-12-30", 7380],
      ["L11", "2027-01-08", 20295],
    ]);
    expect(gameData.persona.account.openingBalance).toBe(38000);
  });

  it("card costs match the specification table (ENGINE-DATA-AND-TESTS §3.1)", () => {
    const costs = Object.fromEntries(gameData.level1.cards.map((c) => [c.id, c.cost.fixed]));
    expect(costs).toEqual({ C1: 0, C2: 406, C3: 0, C4: 150, C5: 2400, C6: 304 });
  });

  it("E-11 level2.json matches FIRST-EMPLOYEE-SCENARIO.md (opening balance, base ledger, choice amounts)", () => {
    const l2 = gameData.level2;
    expect(l2.openingBalance).toBe(8000);
    expect(l2.period).toEqual({ start: "2027-02-01", end: "2027-02-21" });
    expect(l2.storageKey).toBe("pilot.employee.v1");
    expect(l2.ledger.map((l) => [l.date, l.amount])).toEqual([
      ["2027-02-01", -2900],
      ["2027-02-12", 9000],
      ["2027-02-15", -4100],
      ["2027-02-17", 3000],
      ["2027-02-19", -4300],
    ]);
    const effects = Object.fromEntries(l2.choices.map((c) => [c.id, c.effects]));
    expect(effects.hire).toEqual([
      expect.objectContaining({ date: "2027-02-10", amount: -6000 }),
      expect.objectContaining({ date: "2027-02-15", amount: -1200 }),
    ]);
    expect(effects.advance).toEqual([
      expect.objectContaining({ date: "2027-02-08", amount: 3000 }),
      { type: "set_ledger_amount", ledgerId: "B2", amount: 6000 },
    ]);
    expect(effects.reserve).toEqual([{ type: "reserve", amount: 4300, releasedByLedgerId: "B5" }]);
    expect([effects.defer, effects.wait, effects.common]).toEqual([[], [], []]);
  });

  it("E-11 a level2.json whose advance breaks revenue conservation fails the cross-check", () => {
    const level2 = structuredClone(gameData.level2);
    const advance = level2.choices.find((c) => c.id === "advance");
    const reduce = advance?.effects.find((e) => e.type === "set_ledger_amount");
    if (!reduce || reduce.type !== "set_ledger_amount") throw new Error("fixture");
    reduce.amount = 5000;
    expect(checkReferences({ ...gameData, level2 })).toEqual(["level2: advance does not conserve B2 revenue"]);
  });
});
