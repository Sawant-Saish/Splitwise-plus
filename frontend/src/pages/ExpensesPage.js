import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  food: '🍽', transport: '🚗', accommodation: '🏠',
  entertainment: '🎭', shopping: '🛍', utilities: '⚡',
  healthcare: '💊', education: '📚', travel: '✈️',
  groceries: '🛒', sports: '⚽', other: '📦'
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/expenses/my');
        setExpenses(data.expenses);
      } catch {
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? expenses :
    filter === 'paid' ? expenses.filter(e => e.paidBy._id === user?._id) :
    expenses.filter(e => e.paidBy._id !== user?._id);

  const totalAmount = filtered.reduce((sum, e) => {
    const myShare = e.participants.find(p => p.user._id === user?._id)?.share || 0;
    return sum + myShare;
  }, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Expenses</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>All expenses you're part of</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['all', 'All Expenses'], ['paid', 'I Paid'], ['involved', 'Others Paid']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`chip ${filter === val ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--text-muted)', alignSelf: 'center' }}>
          Total share: <strong style={{ color: 'var(--text-primary)' }}>${totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◎</div>
          <p>No expenses found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(expense => {
            const myShare = expense.participants.find(p => p.user._id === user?._id)?.share || 0;
            const iPaid = expense.paidBy._id === user?._id;

            return (
              <div key={expense._id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0
                  }}>
                    {CATEGORY_ICONS[expense.category] || '📦'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>{expense.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                      <span>{expense.groupId?.name || 'Group'}</span>
                      <span>·</span>
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      <span>·</span>
                      <span>{iPaid ? 'You paid' : `${expense.paidBy.name} paid`}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Syne', color: 'var(--text-primary)' }}>
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: iPaid ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                      {iPaid ? `+$${(expense.amount - myShare).toFixed(2)}` : `-$${myShare.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
