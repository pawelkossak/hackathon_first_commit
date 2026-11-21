// E-11 level 2 „Pierwszy pracownik”. Expected values are the literals of FIRST-EMPLOYEE-SCENARIO.md.
import { describe, expect, it } from "vitest";
import {
  EMPLOYEE_STORAGE_KEY,
  RuleError,
  chooseEmployeeAction,
  createEmployeeGame,
  employeeForecast,
  employeeScore,
  resolveEmployeeWeek,
  restoreEmployeeGame,
  rewindEmployeeGame,
  type EmployeeChoiceId,
  type EmployeeState,
  type RuleErrorCode,
} from "./index";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}

/** Choose and settle one week. */
function step(state: EmployeeState, choice: EmployeeChoiceId): EmployeeState {
  return resolveEmployeeWeek(chooseEmployeeAction(state, choice)).state;
}

function play(...choices: EmployeeChoiceId[]): EmployeeState {
  return choices.reduce(step, createEmployeeGame());
}

function codeOf(fn: () => unknown): RuleErrorCode | null {
  try {
    fn();
  } catch (e) {
    if (e instanceof RuleError) return e.code;
    throw e;
  }
  return null;
}

describe("E-11 level 2 engine", () => {
  it("starts on 1 II with 8 000 PLN and the storage key pilot.employee.v1", () => {
    const s = createEmployeeGame();
    expect(s).toMatchObject({ level: 2, week: 1, status: "playing", balance: 8000, reserved: 0, crash: null });
    expect(s.emitted).toEqual([{ type: "lapStart", week: 1 }]);
    expect(EMPLOYEE_STORAGE_KEY).toBe("pilot.employee.v1");
    expect(employeeForecast(s).points[0].date).toBe("2027-02-01");
    expect(employeeForecast(s).points.at(-1)?.date).toBe("2027-02-21");
  });

  it("hire + wait crashes on 10 II with a 900 PLN shortfall", () => {
    const afterHire = play("hire");
    expect(afterHire.status).toBe("playing");
    expect(employeeForecast(afterHire).crash).toMatchObject({ date: "2027-02-10", shortfall: 900 });

    const res = resolveEmployeeWeek(chooseEmployeeAction(afterHire, "wait"));
    expect(res.crash).toEqual({ week: 2, date: "2027-02-10", transactionId: "H-SALARY", shortfall: 900 });
    expect(res.endBalance).toBeNull();
    expect(res.state.status).toBe("crashed");
    expect(res.events).toEqual([{ type: "crash", week: 2, crash: res.crash }]);
    expect(res.state.booked.some((t) => t.id === "H-SALARY")).toBe(false);
    expect(employeeScore(res.state)).toMatchObject({ status: "crashed", stars: 0, finalBalance: null });
    expect(codeOf(() => resolveEmployeeWeek(res.state))).toBe("not_playing");
    expect(codeOf(() => chooseEmployeeAction(res.state, "advance"))).toBe("not_playing");
  });

  it("rewind week 2 → advance; hire + advance + reserve completes with 1 500 PLN and three stars", () => {
    const crashed = play("hire", "wait");
    const rewound = rewindEmployeeGame(crashed, 2);
    expect(rewound).toMatchObject({ week: 2, status: "playing", crash: null, weeksResolved: [1] });
    expect(rewound.choices).toEqual({ hiring: "hire", invoice: null, tax: null });

    const done = step(step(rewound, "advance"), "reserve");
    expect(done.status).toBe("completed");
    expect(done.balance).toBe(1500);
    expect(employeeScore(done)).toEqual({
      status: "completed",
      stars: 3,
      maxStars: 3,
      finalBalance: 1500,
      hired: true,
      reserveFunded: true,
      crash: null,
    });
    const f = employeeForecast(done);
    expect(f.endBalance).toBe(1500);
    expect(f.crash).toBeNull();
    expect(f.reserve).toEqual({ target: 4300, fundedBeforeTax: 4300, fullyFunded: true, releasedOn: "2027-02-19" });
  });

  it("defer + wait + unreserved completes with 8 700 PLN and two stars; not hiring is valid", () => {
    const done = play("defer", "wait", "common");
    expect(done.status).toBe("completed");
    expect(employeeScore(done)).toMatchObject({ stars: 2, finalBalance: 8700, hired: false, reserveFunded: false });
    expect(done.booked.some((t) => t.choiceId === "defer")).toBe(false);
    expect(done.booked.map((t) => t.id)).toEqual(["B1", "B2", "B3", "B4", "B5"]);
  });

  it("the advance conserves total client revenue (3 000 on 8 II + 6 000 on 12 II = 9 000)", () => {
    const withAdvance = employeeForecast(chooseEmployeeAction(play("defer"), "advance"));
    const without = employeeForecast(chooseEmployeeAction(play("defer"), "wait"));
    const clientIn = (f: typeof without, ids: string[]) =>
      f.points.flatMap((p) => p.transactions).filter((t) => ids.includes(t.id)).reduce((s, t) => s + t.amount, 0);
    const adv = withAdvance.points.flatMap((p) => p.transactions);
    expect(adv.find((t) => t.id === "A-ADVANCE")).toMatchObject({ date: "2027-02-08", amount: 3000 });
    expect(adv.find((t) => t.id === "B2")).toMatchObject({ date: "2027-02-12", amount: 6000 });
    expect(clientIn(withAdvance, ["A-ADVANCE", "B2"])).toBe(9000);
    expect(clientIn(without, ["B2"])).toBe(9000);
    expect(withAdvance.endBalance).toBe(without.endBalance);
  });

  it("hire adds 6 000 gross on 10 II and 1 200 employer costs on 15 II; deferral adds neither", () => {
    const hired = employeeForecast(chooseEmployeeAction(createEmployeeGame(), "hire")).points.flatMap((p) => p.transactions);
    expect(hired.filter((t) => t.source === "choice").map((t) => [t.id, t.date, t.amount])).toEqual([
      ["H-SALARY", "2027-02-10", -6000],
      ["H-EMPLOYER", "2027-02-15", -1200],
    ]);
    const deferred = employeeForecast(chooseEmployeeAction(createEmployeeGame(), "defer")).points.flatMap((p) => p.transactions);
    expect(deferred.filter((t) => t.source === "choice")).toEqual([]);
  });

  it("the tax is paid once; the reserve creates no income and no second debit; released on 19 II", () => {
    const done = play("hire", "advance", "reserve");
    const taxRows = done.booked.filter((t) => t.date === "2027-02-19");
    expect(taxRows.map((t) => [t.id, t.amount])).toEqual([["B5", -4300]]);
    const total = done.booked.reduce((s, t) => s + t.amount, 0);
    expect(8000 + total).toBe(1500);
    const f = employeeForecast(done);
    const day = (d: string) => f.points.find((p) => p.date === d);
    // Funded only up to cash: 2 800 cash after 15 II debits, then the full 4 300 from 17 II.
    expect(day("2027-02-14")).toMatchObject({ reserved: 0 });
    expect(day("2027-02-15")).toMatchObject({ balance: 2800, reserved: 2800, available: 0 });
    expect(day("2027-02-17")).toMatchObject({ balance: 5800, reserved: 4300, available: 1500 });
    expect(day("2027-02-19")).toMatchObject({ balance: 1500, reserved: 0, available: 1500 });
    const common = employeeForecast(play("hire", "advance", "common"));
    expect(common.endBalance).toBe(1500);
    expect(common.reserve).toBeNull();
    expect(employeeScore(play("hire", "advance", "common")).stars).toBe(2);
  });

  it("same-day order: inflows before outflows", () => {
    const f = employeeForecast(chooseEmployeeAction(play("hire"), "advance"));
    const feb15 = f.points.find((p) => p.date === "2027-02-15");
    expect(feb15?.transactions.map((t) => t.id)).toEqual(["B3", "H-EMPLOYER"]);
    expect(f.minimum).toEqual({ date: "2027-02-19", balance: 1500 });
  });

  it("immutability: no function mutates a deep-frozen input", () => {
    const s0 = deepFreeze(createEmployeeGame());
    const s1 = deepFreeze(chooseEmployeeAction(s0, "hire"));
    const s2 = deepFreeze(resolveEmployeeWeek(s1).state);
    const crashed = deepFreeze(resolveEmployeeWeek(deepFreeze(chooseEmployeeAction(s2, "wait"))).state);
    const before = JSON.stringify([s0, s1, s2, crashed]);
    employeeForecast(s1);
    employeeScore(crashed);
    const rewound = deepFreeze(rewindEmployeeGame(crashed, 2));
    const done = step(step(rewound, "advance"), "reserve");
    restoreEmployeeGame(deepFreeze(JSON.parse(JSON.stringify(done)) as unknown));
    expect(JSON.stringify([s0, s1, s2, crashed])).toBe(before);
    expect(s0.choices.hiring).toBeNull();
    expect(JSON.parse(JSON.stringify(done))).toEqual(done);
  });

  it("restore rebuilds from validated choices and ignores stored balances", () => {
    const done = play("hire", "advance", "reserve");
    const tampered = { ...JSON.parse(JSON.stringify(done)), balance: 999999, reserved: 1, booked: [] };
    const restored = restoreEmployeeGame(tampered);
    expect(restored).toEqual({ ...done, emitted: [] });
    expect(restored.balance).toBe(1500);

    const pending = restoreEmployeeGame({ schemaVersion: 1, level: 2, choices: { hiring: "hire", invoice: "wait", tax: null }, weeksResolved: [1] });
    expect(pending).toMatchObject({ week: 2, status: "playing", balance: 5100 });
    expect(pending.choices.invoice).toBe("wait");
    const crashed = restoreEmployeeGame({ schemaVersion: 1, level: 2, choices: { hiring: "hire", invoice: "wait", tax: null }, weeksResolved: [1, 2] });
    expect(crashed.crash).toMatchObject({ date: "2027-02-10", shortfall: 900 });
  });

  it("invalid restore throws RuleError invalid_save", () => {
    const base = { schemaVersion: 1, level: 2, choices: { hiring: "hire", invoice: "advance", tax: "reserve" }, weeksResolved: [1, 2, 3] };
    expect(codeOf(() => restoreEmployeeGame(base))).toBeNull();
    const bad: unknown[] = [
      null,
      "x",
      { ...base, schemaVersion: 2 },
      { ...base, level: 1 },
      { ...base, choices: { hiring: "advance", invoice: "advance", tax: "reserve" } },
      { ...base, weeksResolved: [2, 3] },
      { ...base, weeksResolved: [1, 1] },
      { ...base, choices: { hiring: "hire", invoice: null, tax: "reserve" }, weeksResolved: [1, 2] },
      { ...base, choices: { hiring: null, invoice: null, tax: "reserve" }, weeksResolved: [] },
      { ...base, choices: { hiring: "hire", invoice: "wait", tax: "reserve" } },
    ];
    for (const save of bad) expect(codeOf(() => restoreEmployeeGame(save))).toBe("invalid_save");
  });

  it("invalid choice, missing choice and invalid rewind are guarded", () => {
    const s = createEmployeeGame();
    expect(codeOf(() => chooseEmployeeAction(s, "advance"))).toBe("invalid_choice");
    expect(codeOf(() => chooseEmployeeAction(s, ("bogus" as string) as EmployeeChoiceId))).toBe("invalid_choice");
    expect(codeOf(() => resolveEmployeeWeek(s))).toBe("choice_missing");
    expect(codeOf(() => rewindEmployeeGame(s, 2))).toBe("no_snapshot");
    expect(codeOf(() => rewindEmployeeGame(s, (4 as number) as 3))).toBe("invalid_week");
    const done = play("defer", "wait", "common");
    expect(codeOf(() => chooseEmployeeAction(done, "reserve"))).toBe("not_playing");
    expect(rewindEmployeeGame(done, 3)).toMatchObject({ week: 3, status: "playing", balance: 14100 });
    expect(rewindEmployeeGame(done, 1)).toEqual({ ...createEmployeeGame(), emitted: [] });
  });

  it("emits quietWeek for a settled week and lapWon on completion", () => {
    const r1 = resolveEmployeeWeek(chooseEmployeeAction(createEmployeeGame(), "defer"));
    expect(r1.events).toEqual([{ type: "quietWeek", week: 1 }]);
    expect(r1.endBalance).toBe(5100);
    const r3 = resolveEmployeeWeek(chooseEmployeeAction(play("defer", "wait"), "common"));
    expect(r3.events).toEqual([{ type: "lapWon", week: 3, stars: [] }]);
    expect(r3.endBalance).toBe(8700);
  });
});
