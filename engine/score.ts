// Lap-end score (needed by the ET-C star column; E-06 owns the full ET-S verification).
// Stars of level1.json §3.4: Przetrwanie, Tanio (cost of money incl. overdraft interest, Relacje),
// Pilot (lowest own balance ≥ 0 and a played decision saved as the plan; pending until then).
import { gameData } from "./data";
import type { Forecast, GameCore, Pln, StarId, StarStatus } from "./types";

const { level1 } = gameData;

export interface LapScore {
  stars: Record<StarId, StarStatus>;
  /** Fixed card costs plus the overdraft interest of the lap (C4). */
  costOfMoney: Pln;
  /** 2 400 − cost of money; null after a crash. */
  avoidedCost: Pln | null;
  level2Unlocked: boolean;
}

function starRule(id: StarId) {
  const rule = level1.stars.find((s) => s.id === id);
  if (!rule) throw new Error(`star ${id} missing in level1.json`);
  return rule;
}

/** Score of a finished lap from its forecast. `planSaved`: a played decision is saved as the plan. */
export function lapScore(core: GameCore, f: Forecast, planSaved: boolean): LapScore {
  const costOfMoney = core.costOfMoney + f.overdraftInterest;
  if (f.crash !== null || f.low === null) {
    return {
      stars: { przetrwanie: "missed", tanio: "missed", pilot: "missed" },
      costOfMoney,
      avoidedCost: null,
      level2Unlocked: false,
    };
  }
  const tanioRule = starRule("tanio");
  const pilotRule = starRule("pilot");
  const tanio =
    costOfMoney <= (tanioRule.maxCostOfMoney ?? Number.POSITIVE_INFINITY) &&
    core.relations === (tanioRule.requiredRelations ?? core.relations);
  const ownBalanceOk = f.low.balance >= (pilotRule.minOwnBalance ?? Number.NEGATIVE_INFINITY);
  const stars: Record<StarId, StarStatus> = {
    przetrwanie: "earned",
    tanio: tanio ? "earned" : "missed",
    pilot: ownBalanceOk ? (planSaved ? "earned" : "pending") : "missed",
  };
  const earned = (Object.keys(stars) as StarId[]).filter((k) => stars[k] === "earned").length;
  return {
    stars,
    costOfMoney,
    avoidedCost: level1.rules.defaultCostOfMoney - costOfMoney,
    level2Unlocked: earned >= level1.unlock.minStars,
  };
}
