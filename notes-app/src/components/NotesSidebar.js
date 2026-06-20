import { html } from '../html.js';
import { useEffect, useCallback } from 'react';
import { ACTIONS } from '../store.js';
import { NoteCard } from './NoteCard.js';

// Inject sidebar-specific styles once
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .notes-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--bg, #12121f);
    }
    .notes-sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .notes-sidebar__heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text, #e0e0e0);
      margin: 0;
    }
    .notes-sidebar__count {
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(255, 107, 107, 0.2);
      color: #FF6B6B;
      border-radius: 10px;
      padding: 1px 7px;
      min-width: 20px;
      text-align: center;
    }
    .notes-sidebar__new-btn {
      font-size: 0.8rem;
      padding: 5px 12px;
      border-radius: 6px;
      background: #FF6B6B;
      color: #fff;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .notes-sidebar__new-btn:hover {
      background: #ff5252;
      transform: translateY(-1px);
    }
    .notes-sidebar__new-btn:active {
      transform: translateY(0);
    }
    .notes-sidebar__list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .notes-sidebar__list::-webkit-scrollbar {
      width: 4px;
    }
    .notes-sidebar__list::-webkit-scrollbar-track {
      background: transparent;
    }
    .notes-sidebar__list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }
    .notes-sidebar__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted, rgba(255,255,255,0.4));
      gap: 8px;
    }
    .notes-sidebar__empty-icon {
      font-size: 2rem;
      opacity: 0.6;
    }
    .notes-sidebar__empty-text {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);
}

function filterAndSort(notes, searchQuery) {
  let filtered = notes;

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.contentText || '').toLowerCase().includes(q)
    );
  }

  // Pinned notes first, then sort rest by updatedAt descending
  return [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  });
}

export function NotesSidebar({ notes, activeNoteId, searchQuery, dispatch }) {
  useEffect(() => {
    injectStyles();
  }, []);

  const handleNewNote = useCallback(() => {
    // Generate a stable id for the new note so we can immediately set it active.
    const newId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({ type: ACTIONS.CREATE_NOTE, payload: { id: newId } });
    dispatch({ type: ACTIONS.SET_ACTIVE_NOTE, payload: { id: newId } });
  }, [dispatch]);

  const sortedNotes = filterAndSort(notes || [], searchQuery || '');

  const isEmpty = sortedNotes.length === 0;

  return html`
    <aside class="notes-sidebar">
      <div class="notes-sidebar__header">
        <h2 class="notes-sidebar__heading">
          Notes
          <span class="notes-sidebar__count">${(notes || []).length}</span>
        </h2>
        <button
          class="notes-sidebar__new-btn btn-primary"
          onClick=${handleNewNote}
          title="Create new note"
          aria-label="Create new note"
        >
          + New Note
        </button>
      </div>
      <div class="notes-sidebar__list" role="list">
        ${isEmpty
          ? html`
            <div class="notes-sidebar__empty">
              <span class="notes-sidebar__empty-icon">✨</span>
              <p class="notes-sidebar__empty-text">
                ${searchQuery
                  ? `No notes match "${searchQuery}"`
                  : 'No notes yet. Create your first one! ✨'
                }
              </p>
            </div>
          `
          : sortedNotes.map((note) => html`
            <div role="listitem" key=${note.id}>
              <${NoteCard}
                note=${note}
                isActive=${note.id === activeNoteId}
                searchQuery=${searchQuery || ''}
                onClick=${() => dispatch({ type: ACTIONS.SET_ACTIVE_NOTE, payload: { id: note.id } })}
                dispatch=${dispatch}
              />
            </div>
          `)
        }
      </div>
    </aside>
  `;
}
