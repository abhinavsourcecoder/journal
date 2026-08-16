import React from 'react';
import { BookOpen, Calendar, ChevronRight, Heart } from 'lucide-react';

export const RecentEntriesList = ({ entries = [], onSelectDate, selectedDate }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.75rem', textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--lavender-100)',
          color: 'var(--lavender-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem',
        }}>
          <Heart size={24} />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
          Your Gratitude Journey Starts Today
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)' }}>
          Select any date on the calendar and write your very first reflection.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatRecentDate = (dateString) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} color="var(--lavender-600)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)' }}>
            Recent Reflections
          </h3>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: '500' }}>
          {entries.length} recorded
        </span>
      </div>

      <div className="recent-list">
        {entries.slice(0, 5).map((item) => {
          const isSelected = item.date === selectedDate;

          return (
            <div
              key={item.id || item.date}
              className="recent-item"
              style={{
                borderColor: isSelected ? 'var(--lavender-400)' : undefined,
                background: isSelected ? '#FAF5FF' : undefined,
              }}
              onClick={() => onSelectDate(item.date)}
              title="Click to view/edit this day's reflection"
            >
              <div className="recent-item-header">
                <span className="recent-item-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} />
                  {formatRecentDate(item.date)}
                </span>
                <ChevronRight size={16} color="var(--slate-400)" />
              </div>
              <p className="recent-item-snippet">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
