import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Flame, Sparkles, LogOut, BookHeart } from 'lucide-react';

export const Navbar = () => {
  const { user, stats, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="nav-brand">
          <div className="brand-icon-wrapper">
            <BookHeart size={24} />
          </div>
          <div>
            <h1 className="brand-title">Daily Gratitude Journal</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: '500' }}>
              Cultivate mindfulness & positivity
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* User Welcome & Stats */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {stats.streak_days > 0 && (
                <div
                  className="nav-stats-badge"
                  style={{ background: 'var(--amber-100)', color: 'var(--amber-700)' }}
                  title="Consecutive days of gratitude logging"
                >
                  <Flame size={16} color="var(--amber-600)" />
                  <span>{stats.streak_days} Day Streak</span>
                </div>
              )}

              <div className="nav-stats-badge" title="Total gratitude entries recorded">
                <Sparkles size={16} color="var(--lavender-600)" />
                <span>{stats.total_entries} {stats.total_entries === 1 ? 'Entry' : 'Entries'}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                background: '#17152a',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: '600',
                color: '#e9e4ff',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--lavender-400), var(--rose-400))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {user.username.charAt(0)}
                </div>
                <span>{user.username}</span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.88rem' }}
                title="Log out of your journal"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
