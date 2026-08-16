import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast ${isSuccess ? 'toast-success' : isError ? 'toast-error' : ''}`}
          >
            {isSuccess && <CheckCircle2 size={20} color="var(--sage-600)" />}
            {isError && <AlertCircle size={20} color="var(--rose-600)" />}
            {!isSuccess && !isError && <Info size={20} color="var(--lavender-600)" />}

            <div className="toast-message">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              title="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
