import { html } from '../html.js';
import { useState, useEffect, useRef } from 'react';
import { ACTIONS } from '../store.js';

const STATIC_COMMANDS = [
  { id: 'new-note', icon: '📝', title: 'New Note', description: 'Create a new note', action: (dispatch, onClose) => { dispatch({ type: ACTIONS.CREATE_NOTE }); onClose(); } },
  { id: 'view-notes', icon: '📋', title: 'Switch to Notes view', description: 'Go to the notes panel', action: (dispatch, onClose) => { dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'notes' } }); onClose(); } },
  { id: 'view-todos', icon: '✅', title: 'Switch to To-Do view', description: 'Go to the to-do list', action: (dispatch, onClose) => { dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'todos' } }); onClose(); } },
];

export function CommandPalette({ onClose, dispatch, notes }) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  // Build note commands
  const noteCommands = notes.map(note => ({
    id: `note-${note.id}`,
    icon: '🗒️',
    title: `Open: ${note.title || 'Untitled'}`,
    description: note.contentText ? note.contentText.slice(0, 60) + '...' : '',
    action: (dispatch, onClose) => { dispatch({ type: ACTIONS.SET_ACTIVE_NOTE, payload: { id: note.id } }); dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'notes' } }); onClose(); },
  }));

  const allCommands = [...STATIC_COMMANDS, ...noteCommands];

  const filtered = query.trim()
    ? allCommands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.description || '').toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Reset highlight when filter changes
  useEffect(() => { setHighlighted(0); }, [query]);

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) {
        filtered[highlighted].action(dispatch, onClose);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  return html`
    <div
      onClick=${onClose}
      style=${{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '120px', zIndex: 1000,
      }}
    >
      <div
        onClick=${e => e.stopPropagation()}
        style=${{
          width: '100%', maxWidth: '560px', background: 'var(--card)',
          borderRadius: '24px', border: '1px solid var(--card-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div style=${{ padding: '16px', borderBottom: '1px solid var(--card-border)' }}>
          <input
            ref=${inputRef}
            type="text"
            placeholder="Type a command or search notes..."
            value=${query}
            onInput=${e => setQuery(e.target.value)}
            onKeyDown=${handleKeyDown}
            style=${{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '1rem', fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        <div style=${{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          ${filtered.length === 0 && html`
            <div style=${{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No commands found
            </div>
          `}
          ${filtered.map((cmd, i) => html`
            <div
              key=${cmd.id}
              onClick=${() => cmd.action(dispatch, onClose)}
              onMouseEnter=${() => setHighlighted(i)}
              style=${{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                background: i === highlighted ? 'rgba(155,93,229,0.2)' : 'transparent',
                border: i === highlighted ? '1px solid rgba(155,93,229,0.4)' : '1px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style=${{ fontSize: '1.25rem', flexShrink: 0 }}>${cmd.icon}</span>
              <div style=${{ flex: 1, minWidth: 0 }}>
                <div style=${{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>${cmd.title}</div>
                ${cmd.description && html`
                  <div style=${{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ${cmd.description}
                  </div>
                `}
              </div>
              ${i === highlighted && html`<span style=${{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>↵</span>`}
            </div>
          `)}
        </div>

        <div style=${{
          padding: '10px 16px', borderTop: '1px solid var(--card-border)',
          display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-muted)'
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  `;
}
