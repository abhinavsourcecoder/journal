import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookHeart, User, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

export const Login = ({ onSwitchToRegister, showToast }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(username.trim(), password);
      showToast('Welcome back! ✨', 'success');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.non_field_errors) {
          setErrorMessage(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail);
        } else {
          setErrorMessage('Invalid username or password. Please try again.');
        }
      } else {
        setErrorMessage('Unable to connect to server. Please check your network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('demo_user');
    setPassword('demo123');
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login('demo_user', 'demo123');
      showToast('Logged in with Demo Account! 🌿', 'success');
    } catch (err) {
      console.error('Demo login error:', err);
      setErrorMessage('Demo account is not available yet. Please register a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrapper" style={{ margin: '0 auto', width: '54px', height: '54px' }}>
            <BookHeart size={30} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to continue your daily gratitude reflections
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--rose-50)',
            border: '1px solid var(--rose-200)',
            color: 'var(--rose-600)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Quick Access */}
        <div className="demo-account-banner">
          <div>
            <strong>Quick Demo:</strong>
            <span style={{ marginLeft: '6px' }}>demo_user / demo123</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-ghost"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.8rem',
              background: 'white',
              border: '1px solid var(--lavender-300)',
              color: 'var(--lavender-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            disabled={isLoading}
          >
            <Sparkles size={13} />
            <span>Try Demo</span>
          </button>
        </div>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--lavender-600)',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
