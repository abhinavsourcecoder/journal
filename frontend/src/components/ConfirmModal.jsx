import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--rose-100)',
            color: 'var(--rose-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)' }}>
              {title || 'Are you sure?'}
            </h3>
          </div>
        </div>

        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{ minWidth: '100px' }}
          >
            {isDeleting ? <span className="spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
