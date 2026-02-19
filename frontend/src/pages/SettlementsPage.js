import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SettlementsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: groupData } = await api.get('/groups');
        setGroups(groupData.groups);

        const allSettlements = await Promise.all(
          groupData.groups.slice(0, 10).map(g =>
            api.get(`/settlements/group/${g._id}`).then(r => r.data.settlements)
          )
        );
        setSettlements(allSettlements.flat().sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch {
        toast.error('Failed to load settlements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/settlements/${id}`);
      setSettlements(prev => prev.filter(s => s._id !== id));
      toast.success('Settlement removed');
    } catch {
      toast.error('Failed to remove settlement');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Settlements</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Track all payment settlements</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : settlements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⇌</div>
          <p>No settlements yet</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Go to a group to settle up</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {settlements.map(s => {
            const iPaid = s.paidBy._id === user?._id;
            const iReceived = s.paidTo._id === user?._id;

            return (
              <div key={s._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: iPaid ? 'rgba(239,68,68,0.1)' : iReceived ? 'rgba(34,197,94,0.1)' : 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
                }}>
                  {iPaid ? '📤' : iReceived ? '📥' : '⇌'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    <span style={{ color: 'var(--accent-light)' }}>{s.paidBy.name}</span>
                    {' → '}
                    <span style={{ color: '#22c55e' }}>{s.paidTo.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                    <span>{format(new Date(s.date), 'MMM d, yyyy')}</span>
                    {s.notes && <><span>·</span><span>{s.notes}</span></>}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 17, fontFamily: 'Syne',
                    color: iPaid ? '#ef4444' : iReceived ? '#22c55e' : 'var(--text-primary)'
                  }}>
                    {iPaid ? '-' : iReceived ? '+' : ''}{s.currency} {s.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {iPaid ? 'You paid' : iReceived ? 'You received' : 'Settlement'}
                  </div>
                </div>

                {(iPaid || s.createdBy === user?._id) && (
                  <button
                    onClick={() => handleDelete(s._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 18, padding: 4,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    title="Delete settlement"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
