import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { connectSocket, disconnectSocket } from './services/socket';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupPage from './pages/GroupPage';
import GroupsListPage from './pages/GroupsListPage';
import ExpensesPage from './pages/ExpensesPage';
import SettlementsPage from './pages/SettlementsPage';
import ProfilePage from './pages/ProfilePage';

// Layout
import Layout from './components/common/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user } = useAuth();
  const { theme } = useApp();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="groups" element={<GroupsListPage />} />
            <Route path="groups/:id" element={<GroupPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="settlements" element={<SettlementsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
