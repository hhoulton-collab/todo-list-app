import { html } from 'htm/react';
import { useEffect } from 'react';
import { ACTIONS } from '../store.js';

const MODAL_STYLES_ID = 'summary-modal-styles';

function injectStyles() {
  if (document.getElementById(MODAL_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = MODAL_STYLES_ID;
  style.textContent = `
    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-8px); }
    }
    .loading-dots span { display: inline-block; animation: dotBounce 1.2s infinite; }
    .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .anim-fade-in {
      animation: fadeIn 0.2s ease-out both;
    }
  `;
  document.head.appendChild(style);
}

export default function SummaryModal({ isOpen, note, summaryText, isSummarizing, dispatch }) {
  useEffect(() => {
    if (isOpen) injectStyles();
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    dispatch({ type: ACTIONS.TOGGLE_SUMMARY_MODAL });
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  return html`
    <div
      class="modal-overlay"
      style=${{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick=${handleOverlayClick}
    >
      <div
        class="modal anim-fade-in"
        style=${{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          margin: '0 16px',
          padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        <!-- Header -->
        <div style=${{ marginBottom: '20px' }}>
          <h2 style=${{ margin: '0 0 6px', fontSize: '1.25rem', color: 'var(--text)' }}>
            📝 Note Summary
          </h2>
          ${note && html`
            <p style=${{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ${note.title || 'Untitled Note'}
            </p>
          `}
        </div>

        <!-- Body -->
        <div style=${{ minHeight: '80px', marginBottom: '28px' }}>
          ${isSummarizing
            ? html`
              <div style=${{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <span>Generating summary</span>
                <span class="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            `
            : html`
              <p style=${{ margin: 0, color: 'var(--text)', lineHeight: '1.6' }}>
                ${summaryText}
              </p>
            `
          }
        </div>

        <!-- Footer -->
        <div style=${{ display: 'flex', justifyContent: 'flex-end' }}>
          <button class="btn btn-ghost" onClick=${handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  `;
}
