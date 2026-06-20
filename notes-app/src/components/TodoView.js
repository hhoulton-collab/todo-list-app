import { html } from 'htm/react';
import { useState, useRef } from 'react';
import { TodoCard } from './TodoCard.js';

// ACTIONS mirror — consumers pass dispatch from their reducer
const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  REORDER_TODOS: 'REORDER_TODOS',
};

export function TodoView({ todos, dispatch }) {
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Drag-and-drop refs
  const dragIndexRef = useRef(null);
  // Track which card is currently showing confetti
  const [confettiId, setConfettiId] = useState(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const countByStatus = (status) => todos.filter((t) => t.status === status).length;

  // ── Add task ──────────────────────────────────────────────────────────────
  function handleAddTask(e) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    dispatch({
      type: ACTIONS.ADD_TODO,
      payload: { text, sourceNoteId: null, sourceNoteTitle: null, priority: newPriority },
    });
    setNewText('');
    setNewPriority('medium');
  }

  // ── Update / delete helpers ───────────────────────────────────────────────
  function handleUpdate(payload) {
    // Confetti when marking done
    if (payload.status === 'done') {
      setConfettiId(payload.id);
      setTimeout(() => setConfettiId(null), 700);
    }
    dispatch({ type: ACTIONS.UPDATE_TODO, payload });
  }

  function handleDelete(payload) {
    dispatch({ type: ACTIONS.DELETE_TODO, payload });
  }

  // ── Filtering & sorting ───────────────────────────────────────────────────
  const filtered = todos
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .sort((a, b) => {
      // Done tasks always at bottom
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (b.status === 'done' && a.status !== 'done') return -1;
      // Respect order property within same status group
      return (a.order ?? 0) - (b.order ?? 0);
    });

  // ── Drag-and-drop handlers (operate on the filtered list indices) ─────────
  function makeDragHandlers(filteredIndex) {
    return {
      onDragStart(e) {
        dragIndexRef.current = filteredIndex;
        e.dataTransfer.effectAllowed = 'move';
      },
      onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      },
      onDrop(e) {
        e.preventDefault();
        const fromIndex = dragIndexRef.current;
        const toIndex = filteredIndex;
        if (fromIndex === null || fromIndex === toIndex) return;

        // Reorder within the filtered list, then rebuild full todos array
        const reordered = [...filtered];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        // Re-assign order values
        const reorderedWithOrder = reordered.map((t, i) => ({ ...t, order: i }));

        // Merge back: non-filtered items keep their place, filtered items get new order
        const filteredIds = new Set(filtered.map((t) => t.id));
        const nonFiltered = todos.filter((t) => !filteredIds.has(t.id));
        const merged = [...reorderedWithOrder, ...nonFiltered];

        dispatch({ type: ACTIONS.REORDER_TODOS, payload: { todos: merged } });
        dragIndexRef.current = null;
      },
    };
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return html`
    <div style=${{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <!-- Stats bar -->
      <div style=${{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span class="badge status-todo">To Do: ${countByStatus('todo')}</span>
        <span class="badge status-inprogress">In Progress: ${countByStatus('inprogress')}</span>
        <span class="badge status-done">Done: ${countByStatus('done')}</span>
      </div>

      <!-- Add task form -->
      <form
        onSubmit=${handleAddTask}
        style=${{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          placeholder="Add a new task…"
          value=${newText}
          onInput=${(e) => setNewText(e.target.value)}
          style=${{
            flex: '1',
            minWidth: '200px',
            padding: '10px 14px',
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            color: 'var(--text)',
            fontSize: '0.9rem',
          }}
        />
        <select
          value=${newPriority}
          onChange=${(e) => setNewPriority(e.target.value)}
          style=${{
            padding: '10px 10px',
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            color: 'var(--text)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" class="btn btn-primary">Add Task</button>
      </form>

      <!-- Filter bar -->
      <div style=${{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style=${{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '4px' }}>Status:</span>
        ${['all', 'todo', 'inprogress', 'done'].map((s) => html`
          <button
            key=${s}
            class=${statusFilter === s ? 'btn btn-primary' : 'btn btn-ghost'}
            style=${{ padding: '5px 12px', fontSize: '0.8rem' }}
            onClick=${() => setStatusFilter(s)}
          >
            ${{ all: 'All', todo: 'To Do', inprogress: 'In Progress', done: 'Done' }[s]}
          </button>
        `)}
        <span style=${{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 4px 0 12px' }}>Priority:</span>
        ${['all', 'low', 'medium', 'high'].map((p) => html`
          <button
            key=${p}
            class=${priorityFilter === p ? 'btn btn-primary' : 'btn btn-ghost'}
            style=${{ padding: '5px 12px', fontSize: '0.8rem' }}
            onClick=${() => setPriorityFilter(p)}
          >
            ${{ all: 'All', low: 'Low', medium: 'Medium', high: 'High' }[p]}
          </button>
        `)}
      </div>

      <!-- Task list -->
      ${filtered.length === 0
        ? html`
          <div style=${{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
            fontSize: '1rem',
          }}>
            <div style=${{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
            <div>${todos.length === 0
              ? 'No tasks yet. Add one above!'
              : 'No tasks match your filters.'
            }</div>
          </div>
        `
        : html`
          <div>
            ${filtered.map((todo, i) => html`
              <div
                key=${todo.id}
                class=${confettiId === todo.id ? 'confetti-burst' : ''}
              >
                <${TodoCard}
                  todo=${todo}
                  onUpdate=${handleUpdate}
                  onDelete=${handleDelete}
                  dragHandlers=${makeDragHandlers(i)}
                />
              </div>
            `)}
          </div>
        `
      }
    </div>
  `;
}
