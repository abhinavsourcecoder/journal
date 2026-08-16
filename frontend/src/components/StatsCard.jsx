import React from 'react';
import { Sparkles, Flame, CheckCircle, Clock } from 'lucide-react';

export const StatsCard = ({ stats, onSelectToday, todayStr }) => {
  return (
    <div className="stats-container">
      {/* Total Entries */}
      <div className="stat-card stat-card-lavender">
        <div className="stat-icon-wrapper">
          <Sparkles size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.total_entries || 0}</div>
          <div className="stat-label">Total Reflections</div>
        </div>
      </div>

      {/* Streak */}
      <div className="stat-card stat-card-amber">
        <div className="stat-icon-wrapper">
          <Flame size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.streak_days || 0} {stats.streak_days === 1 ? 'Day' : 'Days'}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {/* Today's Reflection status */}
      <div
        className="stat-card stat-card-sage"
        style={{ cursor: 'pointer' }}
        onClick={onSelectToday}
        title="Click to write or review today's gratitude"
      >
        <div className="stat-icon-wrapper">
          {stats.has_today_entry ? (
            <CheckCircle size={24} color="var(--sage-600)" />
          ) : (
            <Clock size={24} color="var(--amber-600)" />
          )}
        </div>
        <div className="stat-info">
          <div className="stat-value" style={{ fontSize: '1.15rem' }}>
            {stats.has_today_entry ? 'Completed 🌿' : 'Pending ✍️'}
          </div>
          <div className="stat-label">Today's Reflection</div>
        </div>
      </div>
    </div>
  );
};
