import { useState } from 'react';
import { applyChoice, createInitialState, nextMonth, payBill } from '@/engine/engine';
import { CompanyState, EventChoice, GameEvent } from '@/engine/types';

export default function App() {
  const [state, setState] = useState<CompanyState>(() => createInitialState());
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  const handleNextMonth = () => {
    const result = nextMonth(state);
    setState(result.state);
    setActiveEvent(result.event);
  };

  const handleChoice = (choice: EventChoice) => {
    setState((prev) => applyChoice(prev, choice));
    setActiveEvent(null);
  };

  const handlePayBill = (billId: string) => {
    setState((prev) => payBill(prev, billId));
  };

  const handleRestart = () => {
    setState(createInitialState());
    setActiveEvent(null);
  };

  const unpaidBills = state.bills.filter((b) => !b.isPaid);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Company Simulator</h1>
        <strong>Month {state.month}</strong>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          padding: 12,
          background: '#f4f4f5',
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div>
          <small>Cash</small>
          <div style={{ fontWeight: 'bold', color: state.cash < 5000 ? '#dc2626' : '#16a34a' }}>
            ${state.cash.toLocaleString()}
          </div>
        </div>
        <div>
          <small>Reputation</small>
          <div style={{ fontWeight: 'bold' }}>{state.reputation}/100</div>
        </div>
        <div>
          <small>Morale</small>
          <div style={{ fontWeight: 'bold' }}>{state.morale}/100</div>
        </div>
        <div>
          <small>Stress</small>
          <div style={{ fontWeight: 'bold' }}>{state.stress}/100</div>
        </div>
      </section>

      {state.isGameOver ? (
        <div style={{ padding: 20, background: '#fee2e2', borderRadius: 8, textAlign: 'center' }}>
          <h2>Bankruptcy!</h2>
          <p>Your company ran out of cash in month {state.month}.</p>
          <button onClick={handleRestart} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Play Again
          </button>
        </div>
      ) : (
        <>
          {activeEvent && (
            <div
              style={{
                padding: 16,
                border: '2px solid #2563eb',
                borderRadius: 8,
                marginBottom: 20,
                background: '#eff6ff',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{activeEvent.title}</h3>
              <p>{activeEvent.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeEvent.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {unpaidBills.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h3>Unpaid Bills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unpaidBills.map((bill) => (
                  <div
                    key={bill.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      border: '1px solid #e4e4e7',
                      borderRadius: 6,
                    }}
                  >
                    <span>
                      {bill.name} — <strong>${bill.amount.toLocaleString()}</strong>
                    </span>
                    <button
                      disabled={state.cash < bill.amount}
                      onClick={() => handlePayBill(bill.id)}
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                    >
                      Pay
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <button
            onClick={handleNextMonth}
            disabled={activeEvent !== null}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              fontWeight: 'bold',
              background: activeEvent ? '#9ca3af' : '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: activeEvent ? 'not-allowed' : 'pointer',
              marginBottom: 24,
            }}
          >
            {activeEvent ? 'Resolve event to continue' : 'Next Month'}
          </button>
        </>
      )}

      <section>
        <h3>Activity Feed</h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {state.logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: 10,
                borderRadius: 6,
                background: '#fafafa',
                borderLeft: `4px solid ${
                  log.type === 'danger'
                    ? '#dc2626'
                    : log.type === 'warning'
                    ? '#d97706'
                    : log.type === 'success'
                    ? '#16a34a'
                    : '#3b82f6'
                }`,
              }}
            >
              <small style={{ color: '#71717a' }}>Month {log.month}</small>
              <div>{log.message}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}