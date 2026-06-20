import { html } from '../html.js';

const styles = `
.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.25);
  border-radius: 12px;
  margin-bottom: 8px;
  animation: pulse 2s infinite;
}
.action-item-text {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.action-item-btn {
  background: rgba(107, 203, 119, 0.15);
  color: var(--accent-green);
  border: 1px solid rgba(107, 203, 119, 0.3);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}
.action-item-btn:hover { background: rgba(107, 203, 119, 0.25); }
.action-delete-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
  flex-shrink: 0;
}
.action-delete-btn:hover { color: var(--accent-red); }
`;

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = styles;
  document.head.appendChild(el);
  stylesInjected = true;
}

export default function ActionItem({ text, noteId, noteTitle, onSendToTodo, onDelete }) {
  injectStyles();

  return html`
    <div class="action-item anim-pulse">
      <span class="action-item-text" title=${text}>${text}</span>
      <button
        class="action-item-btn"
        onClick=${() => onSendToTodo(text)}
        title="Send to To-Do list"
      >→ Todo</button>
      <button
        class="action-delete-btn"
        onClick=${() => onDelete(text)}
        title="Remove action item"
        aria-label="Delete action item"
      >×</button>
    </div>
  `;
}
