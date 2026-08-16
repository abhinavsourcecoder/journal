import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg-gradient)'
      }}>
        <span
          className="spinner"
          style={{
            width: '36px',
            height: '36px',
            borderColor: 'var(--lavender-200)',
            borderTopColor: 'var(--lavender-600)'
          }}
        />
        <p style={{ color: 'var(--slate-600)', fontWeight: '500', fontSize: '0.95rem' }}>
          Opening your gratitude space...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <>
          <Navbar />
          <Dashboard showToast={showToast} />
        </>
      ) : (
        <>
          {authView === 'login' ? (
            <Login
              onSwitchToRegister={() => setAuthView('register')}
              showToast={showToast}
            />
          ) : (
            <Register
              onSwitchToLogin={() => setAuthView('login')}
              showToast={showToast}
            />
          )}
        </>
      )}

      {/* Global Toast Alerts */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
