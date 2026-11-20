// Score (E-06, GAME-DESIGN §6.3, ENGINE-DATA-AND-TESTS §7.5).
// Stars of level1.json: Przetrwanie (all paid on time), Tanio (cost of money incl. the overdraft
// interest ≤ 500 zł and Relacje not lowered), Pilot (lowest own balance ≥ 0 and a winning decision
// saved as the plan; "pending" at lap end, finalised by savePlan through turn.ts coreAfterPlanSave).
// Competences are milestones 0…3: never lowered, never above 3, products never raise one.
// Level 2 unlocks at lap completion with ≥ 1 earned star. Avoided cost = 2 400 (the loan) − cost.
import { gameData } from "./data";
import type { CardId, CompetenceId, CompetenceLevel, Forecast, GameCore, Pln, StarId, StarStatus } from "./types";

const { level1 } = gameData;

function isCompetenceLevel(n: number): n is CompetenceLevel {
  return n === 0 || n === 1 || n === 2 || n === 3;
}

/**
 * Award a competence milestone: the result keeps the maximum of the current and the awarded level,
 * capped at `competenceMax` (3). Returns a new record; the input is never mutated.
 */
export function awardCompetence(
  competences: Readonly<Record<CompetenceId, CompetenceLevel>>,
  id: CompetenceId,
  level: number,
): Record<CompetenceId, CompetenceLevel> {
  const next = Math.max(0, Math.min(level1.rules.competenceMax, Math.max(competences[id], Math.floor(level))));
  if (!isCompetenceLevel(next)) throw new Error(`competence level ${next} out of range`);
  return { ...competences, [id]: next };
}

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

/**
 * Competence after the plan of `cardId` is validated on the synthetic account (milestone 3).
 * A product card (no competence) changes nothing. Stars and unlock are never touched.
 * advanceAccountClock (matcher.ts) calls this once the plan matcher confirms the plan (`met`).
 */
export function coreAfterValidation(core: GameCore, cardId: CardId): GameCore {
  const card = level1.cards.find((c) => c.id === cardId);
  if (!card?.competence) return core;
  return { ...core, competences: awardCompetence(core.competences, card.competence.id, level1.rules.competenceMax) };
}
