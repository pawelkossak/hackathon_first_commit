import rawEvents from '@/data/events.json';
import { CompanyState, EventChoice, EventCondition, GameEvent } from './types';

export const GAME_EVENTS: GameEvent[] = rawEvents as GameEvent[];

const clamp = (value: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, value));

function checkCondition(state: CompanyState, cond?: EventCondition): boolean {
  if (!cond) return true;
  if (cond.minEmployees !== undefined && state.employees < cond.minEmployees) return false;
  if (cond.minMonth !== undefined && state.month < cond.minMonth) return false;
  if (cond.requiredFlag && !state.flags.includes(cond.requiredFlag)) return false;
  if (cond.forbiddenFlag && state.flags.includes(cond.forbiddenFlag)) return false;
  return true;
}

export function applyChoice(state: CompanyState, choice: EventChoice): CompanyState {
  const { effect } = choice;

  const nextFlags =
    effect.addFlag && !state.flags.includes(effect.addFlag)
      ? [...state.flags, effect.addFlag]
      : state.flags;

  const nextScheduled = effect.scheduleEvent
    ? [
        ...state.scheduledEvents,
        {
          eventId: effect.scheduleEvent.eventId,
          triggerMonth: state.month + effect.scheduleEvent.delayMonths,
          chance: effect.scheduleEvent.chance,
        },
      ]
    : state.scheduledEvents;

  const next: CompanyState = {
    ...state,
    cash: state.cash + (effect.cashDelta ?? 0),
    reputation: state.reputation + (effect.reputationDelta ?? 0),
    morale: state.morale + (effect.moraleDelta ?? 0),
    stress: state.stress + (effect.stressDelta ?? 0),
    flags: nextFlags,
    scheduledEvents: nextScheduled,
    logs: [
      {
        month: state.month,
        message: effect.logMessage,
        type: effect.logType ?? 'info',
      },
      ...state.logs,
    ],
  };

  return normalizeState(next);
}

export function nextMonth(
  state: CompanyState,
  eventsPool: GameEvent[] = GAME_EVENTS
): { state: CompanyState; event: GameEvent | null } {
  const unpaidBills = state.bills.filter((b) => !b.isPaid && b.dueMonth <= state.month);
  const reputationPenalty = unpaidBills.length * 10;

  const updatedState = normalizeState({
    ...state,
    month: state.month + 1,
    cash: state.cash + state.monthlyRevenue,
    reputation: state.reputation - reputationPenalty,
    logs: [
      {
        month: state.month + 1,
        message: `Customer revenue: +$${state.monthlyRevenue}.`,
        type: 'success',
      },
      ...state.logs,
    ],
  });

  const eligibleEvents = eventsPool.filter((e) => checkCondition(updatedState, e.condition));
  const randomEvent =
    eligibleEvents.length > 0
      ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
      : null;

  return { state: updatedState, event: randomEvent };
}

function normalizeState(state: CompanyState): CompanyState {
  return {
    ...state,
    reputation: clamp(state.reputation),
    morale: clamp(state.morale),
    stress: clamp(state.stress),
    isGameOver: state.cash < 0,
  };
}

export function createInitialState(): CompanyState {
  return {
    month: 1,
    cash: 25000,
    reputation: 50,
    morale: 70,
    stress: 20,
    employees: 2,
    monthlyRevenue: 15000,
    bills: [
      { id: 'rent_1', name: 'Office Rent', amount: 4000, dueMonth: 1, isPaid: false },
      { id: 'salaries_1', name: 'Team Payroll', amount: 10000, dueMonth: 1, isPaid: false },
    ],
    flags: [],
    scheduledEvents: [],
    logs: [{ month: 1, message: 'You founded a company! Time for your first month.', type: 'info' }],
    isGameOver: false,
  };
}

export function payBill(state: CompanyState, billId: string): CompanyState {
  const bill = state.bills.find((b) => b.id === billId && !b.isPaid);
  if (!bill || state.cash < bill.amount) return state;

  return normalizeState({
    ...state,
    cash: state.cash - bill.amount,
    bills: state.bills.map((b) => (b.id === billId ? { ...b, isPaid: true } : b)),
    logs: [
      { month: state.month, message: `Paid: ${bill.name} (-$${bill.amount}).`, type: 'info' },
      ...state.logs,
    ],
  });
}