import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Save,
  Trash2,
  Clock,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Lightbulb,
  FileText
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

// Inspiring gratitude prompts
const GRATITUDE_PROMPTS = [
  "What small moment made you smile or laugh today?",
  "Who is someone you are deeply grateful to have in your life, and why?",
  "What is a simple comfort or convenience you enjoyed today (warm bed, hot tea, cozy clothes)?",
  "What obstacle or challenge did you handle better than you expected?",
  "What beauty in nature or your surroundings did you notice today?",
  "What is a skill, talent, or strength within yourself that you appreciate?",
  "What music, book, art, or conversation inspired you recently?",
  "What is one positive thing about today that you never want to forget?"
];

export const JournalEditor = ({
  selectedDate,
  entry,
  isLoadingEntry,
  onSave,
  onUpdate,
  onDelete,
  isSaving,
  isDeleting,
}) => {
  const [content, setContent] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync content when entry or selectedDate changes
  useEffect(() => {
    if (entry) {
      setContent(entry.content || '');
    } else {
      setContent('');
    }
    setHasUnsavedChanges(false);
  }, [entry, selectedDate]);

  // Pick a random prompt on date switch
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * GRATITUDE_PROMPTS.length);
    setPromptIndex(randomIdx);
  }, [selectedDate]);

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % GRATITUDE_PROMPTS.length);
  };

  const handleTextChange = (e) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSaveOrUpdate = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (entry && entry.id) {
      onUpdate(entry.id, { content: content.trim() });
    } else {
      onSave({ date: selectedDate, content: content.trim() });
    }
  };

  const handleDeleteConfirm = async () => {
    if (entry && entry.id) {
      await onDelete(entry.id);
      setIsDeleteModalOpen(false);
    }
  };

  // Human friendly date formatting
  const formatFriendlyDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Relative day badge
  const getRelativeDayLabel = (dateString) => {
    if (!dateString) return '';
    const today = new Date();
    const [y, m, d] = dateString.split('-').map(Number);
    const target = new Date(y, m - 1, d);

    // Normalize time
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today 🌟';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const isExisting = !!(entry && entry.id);

  return (
    <div className="glass-card editor-card">
      {/* Header */}
      <div className="editor-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="editor-date-badge">
              <CalendarIcon size={15} />
              <span>{getRelativeDayLabel(selectedDate)}</span>
            </span>

            {isExisting ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '0.3rem 0.7rem',
                background: 'var(--sage-50)',
                color: 'var(--sage-600)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--sage-200)',
              }}>
                <CheckCircle2 size={14} /> Saved Reflection
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '0.3rem 0.7rem',
                background: 'var(--lavender-50)',
                color: 'var(--lavender-600)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--lavender-200)',
              }}>
                <Edit3 size={14} /> New Reflection
              </span>
            )}
          </div>

          <h2 className="editor-title">{formatFriendlyDate(selectedDate)}</h2>
          <p className="editor-subtitle">
            Take a gentle breath and reflect on what brought joy or peace to your day.
          </p>
        </div>
      </div>

      {/* Daily Gratitude Prompt Box */}
      <div className="prompt-box">
        <div className="prompt-content">
          <Lightbulb size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <span>"{GRATITUDE_PROMPTS[promptIndex]}"</span>
        </div>
        <button
          type="button"
          onClick={handleNextPrompt}
          className="prompt-refresh-btn"
          title="Get another inspiration prompt"
        >
          <RefreshCw size={12} />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Editor Body */}
      {isLoadingEntry ? (
        <div style={{
          minHeight: '230px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--slate-500)',
        }}>
          <span className="spinner" style={{ borderColor: 'var(--lavender-300)', borderTopColor: 'var(--lavender-600)', width: '28px', height: '28px' }} />
          <span style={{ fontSize: '0.92rem' }}>Loading reflection for {selectedDate}...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveOrUpdate}>
          <div className="journal-textarea-container">
            <textarea
              id="gratitude-entry-input"
              className="journal-textarea"
              placeholder="Write what you are grateful for today... Even the smallest moment of kindness, a warm cup of tea, or a quiet breath of peace."
              value={content}
              onChange={handleTextChange}
              required
            />

            <div className="textarea-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>

              {isExisting && entry.updated_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                  <Clock size={13} />
                  <span>Last saved {new Date(entry.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="editor-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isExisting && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting || isSaving}
                  title="Delete this journal entry"
                >
                  <Trash2 size={16} />
                  <span>Delete Entry</span>
                </button>
              )}

              {content.trim() && !isSaving && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setContent('')}
                  title="Clear text"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!content.trim() || isSaving || isDeleting}
            >
              {isSaving ? (
                <>
                  <span className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isExisting ? 'Update Entry' : 'Save Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Gratitude Entry?"
        message={`Are you sure you want to permanently delete your gratitude reflection for ${formatFriendlyDate(selectedDate)}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
