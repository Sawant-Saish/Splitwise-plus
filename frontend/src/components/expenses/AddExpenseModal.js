import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { value: 'food', label: 'Food', icon: '🍽' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'accommodation', label: 'Stay', icon: '🏠' },
  { value: 'entertainment', label: 'Fun', icon: '🎭' },
  { value: 'shopping', label: 'Shopping', icon: '🛍' },
  { value: 'utilities', label: 'Bills', icon: '⚡' },
  { value: 'groceries', label: 'Groceries', icon: '🛒' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equally', icon: '⟺' },
  { value: 'exact', label: 'Exact amounts', icon: '⌗' },
  { value: 'percentage', label: 'By %', icon: '%' },
];

export default function AddExpenseModal({ group, onClose, onAdded }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    paidBy: user?._id || '',
    category: 'other',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
    participants: group.members.map(m => ({
      user: m.user._id,
      name: m.user.name,
      avatar: m.user.avatar,
      included: true,
      share: 0,
      percentage: 0
    }))
  });

  const updateField = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const includedParticipants = form.participants.filter(p => p.included);

  // Recalculate shares based on split type
  const calculateShares = (participants, amount, splitType) => {
    const amt = parseFloat(amount) || 0;
    const included = participants.filter(p => p.included);
    if (included.length === 0) return participants;

    if (splitType === 'equal') {
      const share = parseFloat((amt / included.length).toFixed(2));
      const remainder = parseFloat((amt - share * included.length).toFixed(2));
      let firstDone = false;
      return participants.map(p => {
        if (!p.included) return { ...p, share: 0 };
        if (!firstDone) { firstDone = true; return { ...p, share: share + remainder }; }
        return { ...p, share };
      });
    }
    return participants;
  };

  const handleAmountChange = (val) => {
    const newParticipants = calculateShares(form.participants, val, form.splitType);
    setForm(f => ({ ...f, amount: val, participants: newParticipants }));
  };

  const handleSplitTypeChange = (st) => {
    const newParticipants = calculateShares(form.participants, form.amount, st);
    setForm(f => ({ ...f, splitType: st, participants: newParticipants }));
  };

  const handleToggleParticipant = (userId) => {
    const updated = form.participants.map(p =>
      p.user === userId ? { ...p, included: !p.included } : p
    );
    const recalced = calculateShares(updated, form.amount, form.splitType);
    setForm(f => ({ ...f, participants: recalced }));
  };

  const handleShareChange = (userId, val) => {
    setForm(f => ({
      ...f,
      participants: f.participants.map(p =>
        p.user === userId ? { ...p, share: parseFloat(val) || 0 } : p
      )
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.amount) {
      toast.error('Please fill in title and amount');
      return;
    }
    if (includedParticipants.length === 0) {
      toast.error('At least one participant required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        amount: parseFloat(form.amount),
        paidBy: form.paidBy,
        category: form.category,
        notes: form.notes,
        date: form.date,
        splitType: form.splitType,
        groupId: group._id,
        participants: form.participants
          .filter(p => p.included)
          .map(p => ({ user: p.user, share: p.share }))
      };

      const { data } = await api.post('/expenses', payload);
      onAdded(data.expense);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const totalShares = form.participants.filter(p => p.included).reduce((s, p) => s + (p.share || 0), 0);
  const amountNum = parseFloat(form.amount) || 0;
  const sharesDiff = Math.abs(totalShares - amountNum);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Add Expense</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{group.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What was it for?
            </label>
            <input
              className="input"
              placeholder="e.g. Dinner at Mario's"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              autoFocus
            />
          </div>

          {/* Amount + Paid by */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Amount ({group.currency})
              </label>
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => handleAmountChange(e.target.value)}
                style={{ fontSize: 18, fontWeight: 700 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Paid by
              </label>
              <select className="input" value={form.paidBy} onChange={e => updateField('paidBy', e.target.value)}>
                {group.members.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Date
            </label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={e => updateField('date', e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => updateField('category', cat.value)}
                  className={`chip ${form.category === cat.value ? 'active' : ''}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split type */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Split
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {SPLIT_TYPES.map(st => (
                <button
                  key={st.value}
                  onClick={() => handleSplitTypeChange(st.value)}
                  className={`chip ${form.splitType === st.value ? 'active' : ''}`}
                >
                  {st.icon} {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Split between ({includedParticipants.length} people)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.participants.map(p => (
                <div key={p.user} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'var(--bg-secondary)', borderRadius: 10,
                  opacity: p.included ? 1 : 0.5
                }}>
                  <button
                    onClick={() => handleToggleParticipant(p.user)}
                    style={{
                      width: 20, height: 20, borderRadius: 5,
                      border: `2px solid ${p.included ? 'var(--accent)' : 'var(--border)'}`,
                      background: p.included ? 'var(--accent)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {p.included && <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>✓</span>}
                  </button>
                  <img src={p.avatar} alt={p.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                  {form.splitType !== 'equal' && p.included && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.share || ''}
                      onChange={e => handleShareChange(p.user, e.target.value)}
                      style={{
                        width: 90, padding: '4px 8px', background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        color: 'var(--text-primary)', fontSize: 13, fontFamily: 'DM Sans'
                      }}
                      placeholder={form.splitType === 'percentage' ? '%' : '$'}
                    />
                  )}
                  {form.splitType === 'equal' && p.included && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>
                      ${(p.share || 0).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {form.splitType !== 'equal' && amountNum > 0 && sharesDiff > 0.01 && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>
                Shares don't add up: ${totalShares.toFixed(2)} / ${amountNum.toFixed(2)}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Notes (optional)
            </label>
            <textarea
              className="input"
              rows={2}
              placeholder="Add a note..."
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || !form.title || !form.amount}
              style={{ flex: 2 }}
            >
              {loading ? 'Adding...' : `Add $${parseFloat(form.amount || 0).toFixed(2)} Expense`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
