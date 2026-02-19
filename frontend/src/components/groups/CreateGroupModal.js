import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'trip', icon: '✈️', label: 'Trip' },
  { value: 'home', icon: '🏠', label: 'Home' },
  { value: 'couple', icon: '💑', label: 'Couple' },
  { value: 'friends', icon: '👥', label: 'Friends' },
  { value: 'work', icon: '💼', label: 'Work' },
  { value: 'other', icon: '💸', label: 'Other' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', category: 'other', icon: '💸', currency: 'USD'
  });
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = (cat) => {
    setForm(f => ({ ...f, category: cat.value, icon: cat.icon }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Group name required'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/groups', form);
      onCreated(data.group);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>Create Group</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Group Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    padding: '12px 8px', border: `2px solid ${form.category === cat.value ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 12, cursor: 'pointer',
                    background: form.category === cat.value ? 'rgba(108,99,255,0.1)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)', textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Group Name *
            </label>
            <input
              className="input"
              placeholder="e.g. Europe Trip 2025"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description
            </label>
            <textarea
              className="input"
              rows={2}
              placeholder="Optional description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Currency */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Default Currency
            </label>
            <select
              className="input"
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
