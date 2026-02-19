import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to SplitWise+');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6c63ff, #f472b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'Syne',
            margin: '0 auto 16px',
            boxShadow: '0 20px 60px rgba(108,99,255,0.4)',
          }}>S+</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Join SplitWise+ for free</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { name: 'name', label: 'Full name', type: 'text', placeholder: 'Alex Johnson' },
              { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
              { name: 'confirm', label: 'Confirm password', type: 'password', placeholder: 'Repeat password' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  className="input"
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Creating account...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
