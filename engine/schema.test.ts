import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";
import { checkReferences, gameData, rawDataFiles } from "./data";
import {
  AgentsFileSchema,
  FutureScriptFileSchema,
  Level1FileSchema,
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
});
