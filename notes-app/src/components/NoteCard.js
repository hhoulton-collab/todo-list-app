import { html } from '../html.js';
import { useEffect, useRef } from 'react';
import { ACTIONS } from '../store.js';

// Inject component styles once at module level
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .note-card {
      position: relative;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #1A1A2E;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
      user-select: none;
      overflow: hidden;
    }
    .note-card:hover {
      background: #1f1f3a;
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }
    .note-card.note-card--active {
      border-left: 3px solid #FF6B6B;
      background: #1f1f38;
      padding-left: 11px;
    }
    .note-card__header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .note-card__title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text, #e0e0e0);
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .note-card__title mark {
      background: rgba(255, 107, 107, 0.35);
      color: #FF6B6B;
      border-radius: 2px;
      padding: 0 1px;
    }
    .note-card__pin {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 2px;
      font-size: 0.75rem;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.15s, transform 0.15s;
    }
    .note-card__pin:hover {
      opacity: 1;
      transform: scale(1.2);
    }
    .note-card__delete {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.3);
      font-size: 1.1rem;
      line-height: 1;
      padding: 0 2px;
      transition: color 0.15s;
      flex-shrink: 0;
    }
    .note-card__delete:hover {
      color: #FF6B6B;
    }
    .note-card__preview {
      font-size: 0.75rem;
      color: var(--text-muted, rgba(255,255,255,0.45));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 6px;
    }
    .note-card__footer {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .note-card__date {
      font-size: 0.7rem;
      color: var(--text-muted, rgba(255,255,255,0.35));
    }
    .note-card__category-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .note-card__category-pill {
      font-size: 0.65rem;
      padding: 1px 6px;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.45);
      border-radius: 10px;
    }
  `;
  document.head.appendChild(style);
}

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function stripHtml(rawHtml) {
  return rawHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function highlightQuery(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return html`<mark key=${i}>${part}</mark>`;
    }
    return part;
  });
}

const CATEGORY_COLORS = {
  work: '#FF6B6B',
  personal: '#4ECDC4',
  ideas: '#FFE66D',
  learning: '#A8E6CF',
  health: '#FF8B94',
  finance: '#C3B1E1',
};

function getCategoryColor(category) {
  if (!category) return '#888';
  return CATEGORY_COLORS[category.toLowerCase()] || '#888';
}

export function NoteCard({ note, isActive, searchQuery, onClick, dispatch }) {
  // Track whether the note was very recently created for pop-in animation
  const isNewRef = useRef(null);
  if (isNewRef.current === null) {
    isNewRef.current = Date.now() - new Date(note.createdAt).getTime() < 2000;
  }

  useEffect(() => {
    injectStyles();
  }, []);

  const preview = (() => {
    const text = note.contentText || stripHtml(note.content || '');
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
  })();

  function handlePinClick(e) {
    e.stopPropagation();
    dispatch({ type: ACTIONS.TOGGLE_PIN, payload: { id: note.id } });
  }

  function handleDeleteClick(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${note.title || 'Untitled'}"? This cannot be undone.`)) {
      dispatch({ type: ACTIONS.DELETE_NOTE, payload: { id: note.id } });
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  }

  const cardClass = [
    'note-card',
    isActive ? 'note-card--active' : '',
    isNewRef.current ? 'anim-pop-in' : '',
  ].filter(Boolean).join(' ');

  return html`
    <div
      class=${cardClass}
      onClick=${onClick}
      role="button"
      aria-pressed=${isActive}
      tabIndex="0"
      onKeyDown=${handleKeyDown}
    >
      <div class="note-card__header">
        ${note.isPinned && html`
          <button
            class="note-card__pin"
            onClick=${handlePinClick}
            title="Unpin note"
            aria-label="Unpin note"
          >📌</button>
        `}
        <span class="note-card__title">
          ${highlightQuery(note.title || 'Untitled', searchQuery)}
        </span>
        <button
          class="note-card__delete"
          onClick=${handleDeleteClick}
          title="Delete note"
          aria-label="Delete note"
        >×</button>
      </div>
      ${preview && html`
        <div class="note-card__preview">${preview}</div>
      `}
      <div class="note-card__footer">
        ${note.category && html`
          <span
            class="note-card__category-dot"
            style=${{ background: getCategoryColor(note.category) }}
            title=${note.category}
          ></span>
        `}
        <span class="note-card__date">${relativeDate(note.updatedAt || note.createdAt)}</span>
        ${note.category && html`
          <span class="note-card__category-pill">${note.category}</span>
        `}
      </div>
    </div>
  `;
}
