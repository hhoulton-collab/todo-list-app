import { html } from '../html.js';
import { useRef } from 'react';
import { ACTIONS } from '../store.js';

export function TopBar({ view, searchQuery, searchResults, dispatch, onOpenCommandPalette }) {
  const searchRef = useRef(null);

  return html`
    <header class="topbar">
      <div style=${{ display: 'flex', gap: '8px', marginRight: '12px' }}>
        <button
          class=${'btn' + (view === 'notes' ? ' btn-primary' : ' btn-ghost')}
          onClick=${() => dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'notes' } })}
        >📝 Notes</button>
        <button
          class=${'btn' + (view === 'todos' ? ' btn-primary' : ' btn-ghost')}
          onClick=${() => dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'todos' } })}
        >✅ To-Do</button>
      </div>

      <div style=${{ flex: 1, position: 'relative' }}>
        <input
          ref=${searchRef}
          type="text"
          placeholder="🔍 Search notes... (⌘F)"
          value=${searchQuery}
          onInput=${e => dispatch({ type: ACTIONS.SET_SEARCH, payload: { query: e.target.value } })}
          style=${{
            width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--card-border)',
            borderRadius: '24px', padding: '8px 16px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none'
          }}
        />
        ${searchResults && html`
          <span style=${{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--accent-yellow)' }}>
            ${searchResults.totalMatches} match${searchResults.totalMatches !== 1 ? 'es' : ''}
          </span>
        `}
      </div>

      <button class="btn btn-ghost" onClick=${onOpenCommandPalette} style=${{ whiteSpace: 'nowrap' }}>⌘K</button>
      <button
        class="btn btn-primary"
        onClick=${() => dispatch({ type: ACTIONS.CREATE_NOTE })}
        style=${{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
      >+ New Note</button>
    </header>
  `;
}
