import React from 'react';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  food: '🍽', transport: '🚗', accommodation: '🏠',
  entertainment: '🎭', shopping: '🛍', utilities: '⚡',
  healthcare: '💊', education: '📚', travel: '✈️',
  groceries: '🛒', sports: '⚽', other: '📦'
};

const CATEGORY_COLORS = {
  food: '#f59e0b', transport: '#38bdf8', accommodation: '#a78bfa',
  entertainment: '#f472b6', shopping: '#fb923c', utilities: '#34d399',
  other: '#6c63ff'
};

export default function ExpenseList({ expenses, currentUser, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: 'var(--text-muted)', border: '2px dashed var(--border)',
        borderRadius: 16
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>◎</div>
        <p style={{ fontSize: 16, fontWeight: 500 }}>No expenses yet</p>
        <p style={{ fontSize: 14, marginTop: 6 }}>Add the first expense to this group</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
      {expenses.map(expense => {
        const iPaid = expense.paidBy._id === currentUser?._id;
        const myShare = expense.participants.find(p => p.user._id === currentUser?._id)?.share || 0;
        const netForMe = iPaid ? expense.amount - myShare : -myShare;
        const catColor = CATEGORY_COLORS[expense.category] || '#6c63ff';

        return (
          <div
            key={expense._id}
            className="card"
            style={{
              padding: '16px 20px',
              borderLeft: `3px solid ${catColor}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Category icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${catColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>
                {CATEGORY_ICONS[expense.category] || '📦'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                    {expense.title}
                  </span>
                  <span style={{
                    padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: `${catColor}15`, color: catColor, textTransform: 'capitalize'
                  }}>
                    {expense.category}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img
                      src={expense.paidBy.avatar}
                      alt={expense.paidBy.name}
                      style={{ width: 16, height: 16, borderRadius: '50%' }}
                    />
                    <span>{iPaid ? 'You paid' : `${expense.paidBy.name} paid`}</span>
                  </div>
                  <span>·</span>
                  <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                  {expense.notes && <><span>·</span><span style={{ fontStyle: 'italic' }}>"{expense.notes}"</span></>}
                </div>

                {/* Participants */}
                <div style={{ display: 'flex', marginTop: 6, gap: 4 }}>
                  {expense.participants.slice(0, 6).map(p => (
                    <img
                      key={p.user._id}
                      src={p.user.avatar}
                      alt={p.user.name}
                      title={`${p.user.name}: $${p.share.toFixed(2)}`}
                      style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--bg-card)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 2 }}>
                  ${expense.amount.toFixed(2)}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: netForMe > 0 ? '#22c55e' : netForMe < 0 ? '#ef4444' : 'var(--text-muted)'
                }}>
                  {netForMe > 0 ? `+$${netForMe.toFixed(2)}` :
                   netForMe < 0 ? `-$${Math.abs(netForMe).toFixed(2)}` : 'settled'}
                </div>
              </div>

              {/* Delete btn */}
              {expense.createdBy?._id === currentUser?._id && onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(expense._id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 16, padding: '4px 6px',
                    borderRadius: 6, transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="Delete expense"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
