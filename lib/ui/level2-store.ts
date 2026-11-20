"use client";

import { create } from "zustand";

export type Level2Action = "hire" | "defer" | "advance" | "wait" | "reserve" | "unreserved";

export interface Level2LedgerItem {
  date: string;
  title: string;
  amount: number;
}

export interface Level2State {
  week: 1 | 2 | 3;
  status: "playing" | "crashed" | "completed";
  balance: number;
  choices: {
    week1?: "hire" | "defer";
    week2?: "advance" | "wait";
    week3?: "reserve" | "unreserved";
  };
  crash?: {
    date: string;
    shortfall: number;
  };
  stars: number;
  ledger: Level2LedgerItem[];
}

export interface Level2StoreState {
  game: Level2State;
  chooseAction: (action: Level2Action) => void;
  rewindToWeek: (week: 1 | 2) => void;
  resetGame: () => void;
}

const STORAGE_KEY = "pilot.employee.v1";

export function computeLevel2(choices: Level2State["choices"]): {
  week: 1 | 2 | 3;
  status: "playing" | "crashed" | "completed";
  balance: number;
  crash?: { date: string; shortfall: number };
  stars: number;
  ledger: Level2LedgerItem[];
} {
  const ledger: Level2LedgerItem[] = [];
  let balance = 8000;

  // Base Feb 1
  balance -= 2900;
  ledger.push({ date: "1 II", title: "Czynsz i biuro rachunkowe", amount: -2900 });

  // Week 1 decision
  if (!choices.week1) {
    return { week: 1, status: "playing", balance, stars: 0, ledger };
  }

  // Week 2 decision
  if (!choices.week2) {
    return { week: 2, status: "playing", balance, stars: 0, ledger };
  }

  // If advance chosen in Week 2, received on Feb 8
  if (choices.week2 === "advance") {
    balance += 3000;
    ledger.push({ date: "8 II", title: "Zaliczka od klienta", amount: 3000 });
  }

  // Week 1 effect: Feb 10 payroll
  if (choices.week1 === "hire") {
    balance -= 6000;
    ledger.push({ date: "10 II", title: "Wynagrodzenie pracownika (brutto)", amount: -6000 });

    if (balance < 0) {
      return {
        week: 2,
        status: "crashed",
        balance,
        crash: { date: "10 II", shortfall: Math.abs(balance) },
        stars: 0,
        ledger,
      };
    }
  }

  // Feb 12 invoice
  const invoiceAmount = choices.week2 === "advance" ? 6000 : 9000;
  balance += invoiceAmount;
  ledger.push({ date: "12 II", title: "Faktura od klienta", amount: invoiceAmount });

  // Feb 15 obligations
  balance -= 4100;
  ledger.push({ date: "15 II", title: "Zobowiązania publicznoprawne", amount: -4100 });

  if (choices.week1 === "hire") {
    balance -= 1200;
    ledger.push({ date: "15 II", title: "Koszty pracodawcy (ZUS)", amount: -1200 });
  }

  // Week 3 decision
  if (!choices.week3) {
    return { week: 3, status: "playing", balance, stars: 0, ledger };
  }

  // Feb 17 project
  balance += 3000;
  ledger.push({ date: "17 II", title: "Mały projekt styczniowy", amount: 3000 });

  // Feb 19 tax
  balance -= 4300;
  ledger.push({ date: "19 II", title: "Podatek dochodowy", amount: -4300 });

  // Calculate stars
  let stars = 2;
  if (choices.week1 === "hire" && choices.week2 === "advance" && choices.week3 === "reserve") {
    stars = 3;
  }

  return {
    week: 3,
    status: "completed",
    balance,
    stars,
    ledger,
  };
}

export function loadStoredLevel2(): Level2State {
  if (typeof window === "undefined") {
    return {
      week: 1,
      status: "playing",
      balance: 5100,
      choices: {},
      stars: 0,
      ledger: [{ date: "1 II", title: "Czynsz i biuro rachunkowe", amount: -2900 }],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const computed = computeLevel2(parsed.choices || {});
      return {
        ...computed,
        choices: parsed.choices || {},
      };
    }
  } catch {
    // fallback
  }

  const computed = computeLevel2({});
  return {
    ...computed,
    choices: {},
  };
}

export function saveStoredLevel2(choices: Level2State["choices"]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choices }));
  } catch {
    // ignore
  }
}

export const useLevel2Store = create<Level2StoreState>((set, get) => ({
  game: loadStoredLevel2(),

  chooseAction: (action) => {
    const current = get().game;
    const newChoices = { ...current.choices };

    if (action === "hire" || action === "defer") {
      newChoices.week1 = action;
    } else if (action === "advance" || action === "wait") {
      newChoices.week2 = action;
    } else if (action === "reserve" || action === "unreserved") {
      newChoices.week3 = action;
    }

    const computed = computeLevel2(newChoices);
    saveStoredLevel2(newChoices);

    set({
      game: {
        ...computed,
        choices: newChoices,
      },
    });
  },

  rewindToWeek: (targetWeek) => {
    const current = get().game;
    const newChoices = { ...current.choices };

    if (targetWeek === 1) {
      delete newChoices.week1;
      delete newChoices.week2;
      delete newChoices.week3;
    } else if (targetWeek === 2) {
      delete newChoices.week2;
      delete newChoices.week3;
    }

    const computed = computeLevel2(newChoices);
    saveStoredLevel2(newChoices);

    set({
      game: {
        ...computed,
        choices: newChoices,
      },
    });
  },

  resetGame: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    const computed = computeLevel2({});
    set({
      game: {
        ...computed,
        choices: {},
      },
    });
  },
}));
