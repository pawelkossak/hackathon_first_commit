import { GameEvent } from './types';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'server_crash',
    title: 'Friday Night Server Crash',
    description: 'Customers cannot log in. Your team is already off the clock.',
    condition: (state) => state.employees > 0,
    choices: [
      {
        id: 'pay_overtime',
        label: 'Call the team in for paid overtime (-$3,000)',
        effect: (s) => ({
          statePatch: {
            cash: s.cash - 3000,
            morale: s.morale - 5,
            reputation: s.reputation + 5,
          },
          logMessage: 'Outage fixed in 2 hours. Customers are happy, but the team is exhausted.',
          logType: 'info',
        }),
      },
      {
        id: 'wait_until_monday',
        label: 'Fix it on Monday ($0)',
        effect: (s) => ({
          statePatch: {
            reputation: s.reputation - 20,
            morale: s.morale + 5,
          },
          logMessage: 'Customers are furious on social media. Reputation dropped sharply.',
          logType: 'danger',
        }),
      },
    ],
  },
  {
    id: 'creative_accounting',
    title: 'Tax "Optimization" Offer',
    description: 'A friend suggests writing off your personal car as a business expense.',
    choices: [
      {
        id: 'accept_risk',
        label: 'Go for it (+$8,000 now)',
        effect: (s) => ({
          statePatch: {
            cash: s.cash + 8000,
            flags: [...s.flags, 'creative_accounting'],
          },
          logMessage: 'You saved $8,000 on taxes. Let’s hope nobody checks the invoices.',
          logType: 'warning',
          scheduleEvent: {
            eventId: 'tax_audit',
            triggerMonth: s.month + 4,
            chance: 0.45,
          },
        }),
      },
      {
        id: 'reject_risk',
        label: 'Decline, I prefer sleeping peacefully',
        effect: (s) => ({
          statePatch: { stress: s.stress - 5 },
          logMessage: 'You stuck to legal accounting. Less stress.',
          logType: 'success',
        }),
      },
    ],
  },
];