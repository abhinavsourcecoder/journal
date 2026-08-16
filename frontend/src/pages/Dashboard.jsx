import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { journalAPI } from '../api/client';
import { CalendarView } from '../components/CalendarView';
import { JournalEditor } from '../components/JournalEditor';
import { StatsCard } from '../components/StatsCard';
import { RecentEntriesList } from '../components/RecentEntriesList';

export const Dashboard = ({ showToast }) => {
  const { user, stats, refreshUserStats } = useAuth();

  // Helper to format date as 'YYYY-MM-DD' in local time
  const getTodayDateStr = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Set of dates ('YYYY-MM-DD') that have entries for quick calendar dot rendering
  const [entryDatesSet, setEntryDatesSet] = useState(new Set());
  const [recentEntries, setRecentEntries] = useState([]);

  // Selected date entry state
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all calendar entry dates & recent entries for the user
  const fetchEntriesOverview = useCallback(async () => {
    try {
      const summaryRes = await journalAPI.getCalendarSummary();
      const dateSet = new Set(summaryRes.data.map((item) => item.date));
      setEntryDatesSet(dateSet);

      // Also get the full list for recent entries feed
      const listRes = await journalAPI.getEntries();
      setRecentEntries(listRes.data || []);
    } catch (err) {
      console.error('Failed to fetch entries overview:', err);
    }
  }, []);

  // Fetch entry for the currently selected date
  const fetchDateEntry = useCallback(async (date) => {
    setIsLoadingEntry(true);
    try {
      const res = await journalAPI.getEntryByDate(date);
      setCurrentEntry(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No entry for this date yet
        setCurrentEntry(null);
      } else {
        console.error('Failed to fetch entry for date:', date, err);
        setCurrentEntry(null);
      }
    } finally {
      setIsLoadingEntry(false);
    }
  }, []);

  // On mount and when user changes
  useEffect(() => {
    fetchEntriesOverview();
  }, [fetchEntriesOverview]);

  // When selectedDate changes, load its entry
  useEffect(() => {
    if (selectedDate) {
      fetchDateEntry(selectedDate);
    }
  }, [selectedDate, fetchDateEntry]);

  // Create new entry
  const handleSaveEntry = async ({ date, content }) => {
    setIsSaving(true);
    try {
      const res = await journalAPI.createEntry({ date, content });
      setCurrentEntry(res.data);

      // Add date to entryDatesSet
      setEntryDatesSet((prev) => new Set([...prev, date]));

      await fetchEntriesOverview();
      await refreshUserStats();

      showToast('Gratitude entry saved! 🌸', 'success');
    } catch (err) {
      console.error('Save entry failed:', err);
      let errorMsg = 'Failed to save entry. Please try again.';
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (d.content) errorMsg = Array.isArray(d.content) ? d.content[0] : d.content;
        else if (d.date) errorMsg = Array.isArray(d.date) ? d.date[0] : d.date;
        else if (d.detail) errorMsg = d.detail;
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing entry
  const handleUpdateEntry = async (id, { content }) => {
    setIsSaving(true);
    try {
      const res = await journalAPI.updateEntry(id, { content });
      setCurrentEntry(res.data);

      await fetchEntriesOverview();
      await refreshUserStats();

      showToast('Reflection updated successfully! ✨', 'success');
    } catch (err) {
      console.error('Update entry failed:', err);
      let errorMsg = 'Failed to update entry.';
      if (err.response && err.response.data && err.response.data.content) {
        errorMsg = Array.isArray(err.response.data.content)
          ? err.response.data.content[0]
          : err.response.data.content;
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id) => {
    setIsDeleting(true);
    try {
      await journalAPI.deleteEntry(id);
      setCurrentEntry(null);

      // Remove date from entryDatesSet
      setEntryDatesSet((prev) => {
        const next = new Set(prev);
        next.delete(selectedDate);
        return next;
      });

      await fetchEntriesOverview();
      await refreshUserStats();

      showToast('Entry removed from your journal.', 'info');
    } catch (err) {
      console.error('Delete entry failed:', err);
      showToast('Failed to delete entry. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const handleSelectToday = () => {
    const todayStr = getTodayDateStr();
    setSelectedDate(todayStr);
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <main className="main-content">
      {/* Top Quick Stats */}
      <StatsCard
        stats={stats}
        onSelectToday={handleSelectToday}
        todayStr={getTodayDateStr()}
      />

      {/* Dashboard Grid: Calendar on Left, Editor on Right */}
      <div className="dashboard-grid">
        {/* Left Column: Calendar & Recent Reflections */}
        <section aria-label="Calendar and History Navigation">
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            entryDates={entryDatesSet}
            currentMonthDate={currentMonthDate}
            setCurrentMonthDate={setCurrentMonthDate}
          />

          <RecentEntriesList
            entries={recentEntries}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
        </section>

        {/* Right Column: Journal Entry Editor */}
        <section aria-label="Daily Journal Editor">
          <JournalEditor
            selectedDate={selectedDate}
            entry={currentEntry}
            isLoadingEntry={isLoadingEntry}
            onSave={handleSaveEntry}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
            isSaving={isSaving}
            isDeleting={isDeleting}
          />
        </section>
      </div>
    </main>
  );
};
