import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORY_COLORS = {
  food: '#f59e0b', transport: '#38bdf8', accommodation: '#a78bfa',
  entertainment: '#f472b6', shopping: '#fb923c', utilities: '#34d399',
  healthcare: '#f87171', education: '#818cf8', travel: '#06b6d4',
  groceries: '#84cc16', sports: '#22d3ee', other: '#94a3b8'
};

const CATEGORY_ICONS = {
  food: '🍽', transport: '🚗', accommodation: '🏠',
  entertainment: '🎭', shopping: '🛍', utilities: '⚡',
  healthcare: '💊', education: '📚', travel: '✈️',
  groceries: '🛒', sports: '⚽', other: '📦'
};

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="card card-hover" style={{ padding: 24, flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div style={{
        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
        background: `${color}20`, color
      }}>{sub}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne', color: color || 'var(--text-primary)', marginBottom: 4 }}>
      {value}
    </div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--accent-light)', fontWeight: 600 }}>${payload[0].value?.toFixed(2)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fmt = (n) => {
    const currency = user?.currency || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const { stats, categoryData, monthlyData } = analytics || {};

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Here's your financial summary</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard
          icon="💸" label="Total Spent" value={fmt(stats?.totalSpent)}
          sub={`${stats?.expenseCount || 0} expenses`} color="var(--accent-light)"
        />
        <StatCard
          icon="📥" label="You Are Owed" value={fmt(stats?.totalOwed)}
          sub="Others owe you" color="#22c55e"
        />
        <StatCard
          icon="📤" label="You Owe" value={fmt(stats?.totalOwing)}
          sub="You owe others" color="#ef4444"
        />
        <StatCard
          icon="◈" label="Active Groups" value={stats?.groupCount || 0}
          sub="Across all groups" color="#f59e0b"
        />
      </div>

      {/* Net balance banner */}
      {stats && Math.abs(stats.netBalance) > 0.01 && (
        <div style={{
          marginBottom: 28, padding: '16px 24px', borderRadius: 14,
          background: stats.netBalance > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${stats.netBalance > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2, color: stats.netBalance > 0 ? '#22c55e' : '#ef4444' }}>
              {stats.netBalance > 0 ? '✓ Net Positive' : '⚠ Net Negative'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {stats.netBalance > 0
                ? `Overall, you're owed ${fmt(stats.netBalance)}`
                : `Overall, you owe ${fmt(Math.abs(stats.netBalance))}`}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/settlements')}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            View Settlements
          </button>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Monthly spending */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            Monthly Spending
          </h3>
          {monthlyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="spent" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No spending data yet
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            By Category
          </h3>
          {categoryData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || '#6c63ff'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [fmt(val), `${CATEGORY_ICONS[name] || '📦'} ${name}`]}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No category data yet
            </div>
          )}
          {/* Category legend */}
          {categoryData?.slice(0, 5).map(cat => (
            <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat.category] || '#6c63ff' }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {CATEGORY_ICONS[cat.category]} {cat.category}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(cat.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'New Group', icon: '◈', action: () => navigate('/groups'), color: '#6c63ff' },
            { label: 'Add Expense', icon: '＋', action: () => navigate('/expenses'), color: '#f59e0b' },
            { label: 'Settle Up', icon: '⇌', action: () => navigate('/settlements'), color: '#22c55e' },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                background: 'var(--bg-card)', border: `1px solid ${item.color}30`,
                borderRadius: 12, cursor: 'pointer', color: item.color,
                fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${item.color}12`; e.currentTarget.style.borderColor = item.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = `${item.color}30`; }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
