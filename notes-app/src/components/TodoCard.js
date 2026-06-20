import { html } from '../html.js';
import { useState, useEffect } from 'react';

const CARD_STYLES = `
.todo-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  margin-bottom: 10px;
  transition: box-shadow 0.2s, transform 0.1s;
  position: relative;
}
.todo-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
.todo-card.dragging { opacity: 0.5; transform: scale(0.98); }
.todo-card.done-card { opacity: 0.7; }
.drag-handle { cursor: grab; color: var(--text-muted); font-size: 1.1rem; user-select: none; }
.task-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); }
.task-text { flex: 1; font-size: 0.9rem; line-height: 1.4; }
.task-text.done { text-decoration: line-through; color: var(--text-muted); }
.source-chip { font-size: 0.72rem; padding: 2px 8px; background: rgba(155,93,229,0.15); color: var(--accent-purple); border-radius: 10px; white-space: nowrap; }
.task-date { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }
.status-select { background: var(--card); color: var(--text); border: 1px solid var(--card-border); border-radius: 8px; padding: 3px 6px; font-size: 0.75rem; cursor: pointer; }
.task-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 4px; }
.task-delete:hover { color: var(--accent-red); }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const el = document.createElement('style');
  el.textContent = CARD_STYLES;
  document.head.appendChild(el);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TodoCard({ todo, onUpdate, onDelete, dragHandlers }) {
  useEffect(() => { injectStyles(); }, []);

  const [isDragging, setIsDragging] = useState(false);

  const isDone = todo.status === 'done';

  function handleCheckboxChange(e) {
    onUpdate({ id: todo.id, status: e.target.checked ? 'done' : 'todo' });
  }

  function handleStatusChange(e) {
    onUpdate({ id: todo.id, status: e.target.value });
  }

  function handleDragStart(e) {
    setIsDragging(true);
    dragHandlers.onDragStart(e);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }

  const priorityClass = todo.priority === 'high'
    ? 'priority-high'
    : todo.priority === 'low'
    ? 'priority-low'
    : 'priority-medium';

  const priorityLabel = todo.priority === 'high' ? 'High' : todo.priority === 'low' ? 'Low' : 'Medium';

  return html`
    <div
      class=${['todo-card', isDragging ? 'dragging' : '', isDone ? 'done-card' : ''].filter(Boolean).join(' ')}
      draggable=${true}
      onDragStart=${handleDragStart}
      onDragEnd=${handleDragEnd}
      onDragOver=${dragHandlers.onDragOver}
      onDrop=${dragHandlers.onDrop}
    >
      <span class="drag-handle" title="Drag to reorder">⠿</span>

      <input
        type="checkbox"
        class="task-checkbox"
        checked=${isDone}
        onChange=${handleCheckboxChange}
      />

      <span class=${['task-text', isDone ? 'done' : ''].filter(Boolean).join(' ')}>
        ${todo.text}
      </span>

      ${todo.sourceNoteTitle && html`
        <span class="source-chip">📝 ${todo.sourceNoteTitle}</span>
      `}

      <span class="task-date">${formatDate(todo.createdAt)}</span>

      <span class=${['badge', 'pill', priorityClass].join(' ')}>${priorityLabel}</span>

      <select
        class="status-select"
        value=${todo.status}
        onChange=${handleStatusChange}
      >
        <option value="todo">To Do</option>
        <option value="inprogress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <button
        class="task-delete"
        onClick=${() => onDelete({ id: todo.id })}
        title="Delete task"
      >×</button>
    </div>
  `;
}
