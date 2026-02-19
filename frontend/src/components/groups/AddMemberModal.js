import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AddMemberModal({ groupId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/groups/${groupId}/members`, { email });
      onAdded(data.group);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>Add Member</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Enter the email address of the person you want to add. They must already have a SplitWise+ account.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              className="input"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
