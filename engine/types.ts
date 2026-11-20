export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueMonth: number;
  isPaid: boolean;
  penaltyFlag?: string;
}

export interface LogEntry {
  month: number;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export interface ScheduledEvent {
  eventId: string;
  triggerMonth: number;
  chance: number;
}

export interface CompanyState {
  month: number;
  cash: number;
  reputation: number;
  morale: number;
  stress: number;
  employees: number;
  monthlyRevenue: number;
  bills: Bill[];
  flags: string[];
  scheduledEvents: ScheduledEvent[];
  logs: LogEntry[];
  isGameOver: boolean;
}

export interface EventCondition {
  minEmployees?: number;
  minMonth?: number;
  requiredFlag?: string;
  forbiddenFlag?: string;
}

export interface EventEffect {
  cashDelta?: number;
  reputationDelta?: number;
  moraleDelta?: number;
  stressDelta?: number;
  addFlag?: string;
  logMessage: string;
  logType?: LogEntry['type'];
  scheduleEvent?: {
    eventId: string;
    delayMonths: number;
    chance: number;
  };
}

export interface EventChoice {
  id: string;
  label: string;
  effect: EventEffect;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  condition?: EventCondition;
  choices: EventChoice[];
}