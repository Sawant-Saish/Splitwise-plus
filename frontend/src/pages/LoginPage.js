import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6c63ff, #f472b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'Syne',
            margin: '0 auto 16px',
            boxShadow: '0 20px 60px rgba(108,99,255,0.4)',
          }}>S+</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Sign in to SplitWise+</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email address
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)'
        }}>
          Demo: <span style={{ color: 'var(--text-secondary)' }}>demo@example.com</span> / <span style={{ color: 'var(--text-secondary)' }}>password123</span>
        </div>
      </div>
    </div>
  );
}
