import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useApp();
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Manage your account settings</p>
      </div>

      {/* Avatar section */}
      <div className="card" style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <img
          src={user?.avatar}
          alt={user?.name}
          style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--accent)', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Personal Info</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Display name
            </label>
            <input
              className="input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Default Currency
            </label>
            <select
              className="input"
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              style={{ cursor: 'pointer' }}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Theme</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Currently using {theme} mode
            </div>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 10, cursor: 'pointer', color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans'
            }}
          >
            {theme === 'dark' ? '☀ Light Mode' : '☾ Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
