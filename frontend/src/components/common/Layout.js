import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { to: '/', icon: '⬡', label: 'Dashboard', exact: true },
  { to: '/groups', icon: '◈', label: 'Groups' },
  { to: '/expenses', icon: '◎', label: 'Expenses' },
  { to: '/settlements', icon: '⇌', label: 'Settlements' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      {/* Logo */}
      <div style={{ padding: '8px 14px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6c63ff, #f472b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Syne'
        }}>S+</div>
        {sidebarOpen && (
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            SplitWise<span style={{ color: 'var(--accent-light)' }}>+</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span style={{ fontSize: 18, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
            {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-link"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 18 }}>{theme === 'dark' ? '☀' : '☾'}</span>
          {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
          />
          {sidebarOpen && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
        >
          <span style={{ fontSize: 18 }}>⏻</span>
          {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        minWidth: sidebarOpen ? 220 : 64,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
      }} className="hidden md:flex">
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: mobileOpen ? 0 : -220,
        width: 220, height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        transition: 'left 0.3s ease',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
      }} className="md:hidden">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }} className="md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-primary)' }}
          >
            ☰
          </button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>
            SplitWise<span style={{ color: 'var(--accent-light)' }}>+</span>
          </span>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: 1400, width: '100%' }}
          className="px-5 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
