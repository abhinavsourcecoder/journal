import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookHeart, User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

export const Register = ({ onSwitchToLogin, showToast }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrorMessage('Username is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await register(username.trim(), email.trim(), password);
      showToast('Account created successfully! Welcome to your gratitude space 🌿', 'success');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.username) {
          setErrorMessage(Array.isArray(errorData.username) ? errorData.username[0] : errorData.username);
        } else if (errorData.password) {
          setErrorMessage(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
        } else if (errorData.email) {
          setErrorMessage(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
        } else {
          setErrorMessage('Registration failed. Please check your information.');
        }
      } else {
        setErrorMessage('Unable to connect to server. Please check your network.');
      }
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
          <h2 className="auth-title">Begin Your Journey</h2>
          <p className="auth-subtitle">
            Create your private Daily Gratitude Journal
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
            <label className="form-label" htmlFor="reg-username">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-username"
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email <span style={{ color: 'var(--slate-400)', fontWeight: '400' }}>(optional)</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
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
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
