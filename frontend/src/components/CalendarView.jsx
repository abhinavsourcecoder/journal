import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

export const CalendarView = ({
  selectedDate,
  onSelectDate,
  entryDates = new Set(), // Set of 'YYYY-MM-DD' strings with entries
  currentMonthDate,
  setCurrentMonthDate,
}) => {
  const [hoveredDate, setHoveredDate] = useState(null);

  // Helper to format date to 'YYYY-MM-DD' in local time
  const formatYMD = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const today = new Date();
  const todayStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(todayStr);
  };

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar grid items
  const calendarCells = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = totalDaysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, prevDay);
    const dateStr = formatYMD(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), prevDay);
    calendarCells.push({
      dayNumber: prevDay,
      dateStr,
      isCurrentMonth: false,
      hasEntry: entryDates.has(dateStr),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = formatYMD(year, month, d);
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      hasEntry: entryDates.has(dateStr),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    });
  }

  // Next month padding days to fill 5 or 6 rows (multiple of 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    const nextMonthDate = new Date(year, month + 1, nextDay);
    const dateStr = formatYMD(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextDay);
    calendarCells.push({
      dayNumber: nextDay,
      dateStr,
      isCurrentMonth: false,
      hasEntry: entryDates.has(dateStr),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    });
  }

  // Calculate entries in current month
  let currentMonthEntryCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    if (entryDates.has(formatYMD(year, month, d))) {
      currentMonthEntryCount++;
    }
  }

  return (
    <div className="glass-card calendar-card">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div>
          <h2 className="calendar-month-title">
            {monthNames[month]} <span style={{ color: 'var(--lavender-600)', fontWeight: '600' }}>{year}</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            {currentMonthEntryCount} {currentMonthEntryCount === 1 ? 'reflection' : 'reflections'} this month
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={prevMonth}
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={goToToday}
            title="Jump to Today"
            style={{ width: 'auto', padding: '0 0.6rem', fontSize: '0.78rem', fontWeight: '600' }}
          >
            <RotateCcw size={14} style={{ marginRight: '4px' }} /> Today
          </button>

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={nextMonth}
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="calendar-weekdays-grid">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="calendar-days-grid">
        {calendarCells.map((cell, index) => {
          let cellClasses = 'calendar-day-cell';
          if (!cell.isCurrentMonth) cellClasses += ' other-month';
          if (cell.isToday) cellClasses += ' today';
          if (cell.isSelected) cellClasses += ' selected';
          if (cell.hasEntry) cellClasses += ' has-entry';

          return (
            <button
              key={`${cell.dateStr}-${index}`}
              type="button"
              className={cellClasses}
              onClick={() => onSelectDate(cell.dateStr)}
              onMouseEnter={() => setHoveredDate(cell.dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              title={`${cell.dateStr}${cell.hasEntry ? ' (Entry recorded)' : ''}${cell.isToday ? ' (Today)' : ''}`}
            >
              <span>{cell.dayNumber}</span>
              {cell.hasEntry && <span className="entry-dot" />}
            </button>
          );
        })}
      </div>

      {/* Calendar Footer / Legend */}
      <div className="calendar-footer">
        <div className="legend-item">
          <span className="legend-indicator" />
          <span>Has Entry</span>
        </div>
        <div className="legend-item">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--lavender-500)',
              outline: '2px solid var(--lavender-300)',
            }}
          />
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              border: '1px solid var(--lavender-500)',
            }}
          />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
