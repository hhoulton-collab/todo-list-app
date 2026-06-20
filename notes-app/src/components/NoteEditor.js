import { html } from '../html.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ACTIONS } from '../store.js';
import FormattingToolbar from './FormattingToolbar.js';

const EDITOR_STYLES = `
.note-editor-title {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0;
  margin-bottom: 16px;
  font-family: inherit;
}
.note-editor-title::placeholder {
  color: var(--text-muted);
}
.note-editor-body {
  min-height: 400px;
  outline: none;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text);
  caret-color: var(--text);
  word-break: break-word;
}
.note-editor-body:empty:before {
  content: "Start typing your note...";
  color: var(--text-muted);
  pointer-events: none;
}
.action-badge {
  display: inline-block;
  background: rgba(255, 68, 68, 0.15);
  border: 1px solid var(--accent-red, #ff4444);
  color: var(--accent-red, #ff4444);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.85em;
  font-weight: 700;
  margin: 0 2px;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, var(--card-border) 25%, rgba(255,255,255,0.15) 50%, var(--card-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
  color: transparent !important;
  user-select: none;
  pointer-events: none;
}
`;

function ensureEditorStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('note-editor-styles')) {
    const el = document.createElement('style');
    el.id = 'note-editor-styles';
    el.textContent = EDITOR_STYLES;
    document.head.appendChild(el);
  }
}

function extractActionItems(text) {
  return text
    .split('\n')
    .filter((line) => line.trimStart().startsWith('ACTION:'))
    .map((line) => line.replace(/^.*?ACTION:\s*/, '').trim())
    .filter(Boolean);
}

export default function NoteEditor({ note, isGeneratingTitle, dispatch, onSummarise, onContentChange }) {
  ensureEditorStyles();

  const editorRef = useRef(null);
  const debounceTimer = useRef(null);
  const lastNoteId = useRef(null);

  // Sync content when note changes (different note selected)
  useEffect(() => {
    if (!editorRef.current) return;
    if (note && note.id !== lastNoteId.current) {
      editorRef.current.innerHTML = note.content || '';
      lastNoteId.current = note.id;
    }
  }, [note]);

  const handleInput = useCallback(() => {
    if (!editorRef.current || !note) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const content = editorRef.current.innerHTML;
      const contentText = editorRef.current.innerText;
      const actionItems = extractActionItems(contentText);

      dispatch({
        type: ACTIONS.UPDATE_NOTE,
        payload: {
          id: note.id,
          content,
          contentText,
          actionItems,
        },
      });
      if (onContentChange) onContentChange(note.id, contentText);
    }, 300);
  }, [note, dispatch, onContentChange]);

  function handleTitleChange(e) {
    if (!note) return;
    dispatch({
      type: ACTIONS.UPDATE_NOTE,
      payload: { id: note.id, title: e.target.value },
    });
  }

  if (!note) {
    return html`
      <div style=${{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Select or create a note to get started.
      </div>
    `;
  }

  return html`
    <div style=${{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 32px' }}>
      <div style=${{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <input
          class=${isGeneratingTitle ? 'note-editor-title shimmer' : 'note-editor-title'}
          type="text"
          value=${isGeneratingTitle ? 'Generating title…' : (note.title || '')}
          onInput=${handleTitleChange}
          onChange=${handleTitleChange}
          placeholder="Untitled Note"
          readOnly=${isGeneratingTitle}
          aria-label="Note title"
        />
        <button
          onClick=${onSummarise}
          title="Auto-summarise this note"
          style=${{
            flexShrink: 0,
            background: 'transparent',
            border: '1px solid var(--card-border)',
            color: 'var(--text-muted)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver=${(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-purple)';
            e.currentTarget.style.color = 'var(--accent-purple)';
          }}
          onMouseOut=${(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >✨ Summarise</button>
      </div>

      <${FormattingToolbar} editorRef=${editorRef} />

      <div
        ref=${editorRef}
        class="note-editor-body"
        contentEditable=${true}
        suppressContentEditableWarning=${true}
        onInput=${handleInput}
        spellCheck=${true}
        aria-label="Note content"
        style=${{ flex: 1 }}
      />
    </div>
  `;
}
