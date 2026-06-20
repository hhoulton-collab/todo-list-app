import { html } from 'htm/react';
import ActionItem from './ActionItem.js';

const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  UPDATE_NOTE: 'UPDATE_NOTE',
  SET_VIEW: 'SET_VIEW',
  TOGGLE_RIGHT_PANEL: 'TOGGLE_RIGHT_PANEL',
};

export default function ActionPanel({ note, dispatch, rightPanelOpen, todos }) {
  const actionItems = (note && note.actionItems) ? note.actionItems : [];
  const todoCount = todos ? todos.length : 0;

  function handleToggle() {
    dispatch({ type: ACTIONS.TOGGLE_RIGHT_PANEL });
  }

  function handleSendToTodo(text) {
    if (!note) return;
    dispatch({
      type: ACTIONS.ADD_TODO,
      payload: {
        text,
        sourceNoteId: note.id,
        sourceNoteTitle: note.title,
        priority: 'medium',
      },
    });
  }

  function handleDelete(text) {
    if (!note) return;
    const idx = actionItems.indexOf(text);
    if (idx === -1) return;
    const updated = [...actionItems.slice(0, idx), ...actionItems.slice(idx + 1)];
    dispatch({
      type: ACTIONS.UPDATE_NOTE,
      payload: {
        id: note.id,
        actionItems: updated,
      },
    });
  }

  function handleViewTodos() {
    dispatch({ type: ACTIONS.SET_VIEW, payload: { view: 'todos' } });
  }

  if (!rightPanelOpen) {
    return html`
      <div style=${{
        width: '40px',
        minWidth: '40px',
        background: 'var(--card)',
        borderLeft: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        gap: '8px',
        flexShrink: 0,
      }}>
        <button
          class="btn btn-ghost"
          onClick=${handleToggle}
          title="Expand actions panel"
          style=${{ padding: '4px 8px', fontSize: '1rem' }}
        >→</button>
        ${actionItems.length > 0 && html`
          <span class="badge" style=${{ fontSize: '0.7rem' }}>${actionItems.length}</span>
        `}
      </div>
    `;
  }

  return html`
    <div style=${{
      width: '280px',
      minWidth: '280px',
      background: 'var(--card)',
      borderLeft: '1px solid var(--card-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <div style=${{
        position: 'sticky',
        top: 0,
        background: 'var(--card)',
        borderBottom: '1px solid var(--card-border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
      }}>
        <span style=${{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
          ⚡ Actions
          ${actionItems.length > 0 && html`
            <span class="badge" style=${{ marginLeft: '6px' }}>${actionItems.length}</span>
          `}
        </span>
        <button
          class="btn btn-ghost"
          onClick=${handleToggle}
          title="Collapse actions panel"
          style=${{ padding: '4px 8px', fontSize: '1rem' }}
        >←</button>
      </div>

      <div style=${{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        ${actionItems.length === 0
          ? html`
            <p style=${{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              margin: 0,
            }}>
              No action items yet. Type <strong>ACTION:</strong> at the start of a line or highlight text and click 'Make Action'.
            </p>
          `
          : actionItems.map((text, i) => html`
            <${ActionItem}
              key=${text + i}
              text=${text}
              noteId=${note ? note.id : null}
              noteTitle=${note ? note.title : ''}
              onSendToTodo=${handleSendToTodo}
              onDelete=${handleDelete}
            />
          `)
        }
      </div>

      <div style=${{
        borderTop: '1px solid var(--card-border)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style=${{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ${todoCount} todo${todoCount !== 1 ? 's' : ''} total
        </div>
        <button
          class="btn btn-primary"
          onClick=${handleViewTodos}
          style=${{ width: '100%' }}
        >View To-Do List</button>
      </div>
    </div>
  `;
}
