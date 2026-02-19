import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SettleModal({ group, preselectedDebt, currentUser, onClose, onSettled }) {
  const otherMembers = group.members.filter(m => m.user._id !== currentUser?._id);

  const [form, setForm] = useState({
    paidTo: preselectedDebt ? preselectedDebt.to._id : (otherMembers[0]?.user._id || ''),
    amount: preselectedDebt ? preselectedDebt.amount.toFixed(2) : '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paidTo || !form.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/settlements', {
        groupId: group._id,
        paidTo: form.paidTo,
        amount: parseFloat(form.amount),
        notes: form.notes,
        date: form.date,
        currency: group.currency
      });
      onSettled();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = group.members.find(m => m.user._id === form.paidTo);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 440 }}>
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Record Payment</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{group.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Payment direction preview */}
          {selectedMember && (
            <div style={{
              padding: '16px', background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <img src={currentUser?.avatar} alt="you" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>→</div>
              <img src={selectedMember.user.avatar} alt={selectedMember.user.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                You pay <strong style={{ color: '#22c55e' }}>{selectedMember.user.name}</strong>
              </div>
            </div>
          )}

          {/* Recipient */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pay To
            </label>
            <select
              className="input"
              value={form.paidTo}
              onChange={e => setForm(f => ({ ...f, paidTo: e.target.value }))}
            >
              {otherMembers.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
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
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              style={{ fontSize: 18, fontWeight: 700 }}
            />
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
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Notes (optional)
            </label>
            <input
              className="input"
              placeholder="e.g. Paid via Venmo"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !form.amount} style={{ flex: 2 }}>
              {loading ? 'Recording...' : `Record $${parseFloat(form.amount || 0).toFixed(2)} Payment`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
