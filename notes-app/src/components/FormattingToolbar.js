import { html } from '../html.js';
import { useState, useRef } from 'react';
import ColorPicker from './ColorPicker.js';
import EmojiPicker from './EmojiPicker.js';
import BulletStylePicker from './BulletStylePicker.js';

const TOOLBAR_STYLES = `
.toolbar-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #252540;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 40px;
  padding: 6px 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.toolbar-btn {
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s;
}
.toolbar-btn:hover { background: rgba(255,255,255,0.1); }
.toolbar-separator { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }
`;

function ensureStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('toolbar-styles')) {
    const el = document.createElement('style');
    el.id = 'toolbar-styles';
    el.textContent = TOOLBAR_STYLES;
    document.head.appendChild(el);
  }
}

export default function FormattingToolbar({ editorRef }) {
  ensureStyles();

  const [openPicker, setOpenPicker] = useState(null); // 'color-text' | 'color-highlight' | 'emoji' | 'bullet'
  const pickerAnchorRef = useRef(null);

  function exec(cmd, value) {
    document.execCommand(cmd, false, value ?? null);
    if (editorRef && editorRef.current) {
      editorRef.current.focus();
    }
  }

  function makeAction() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const selectedText = sel.toString();
    if (!selectedText) return;
    const text = selectedText.startsWith('ACTION:') ? selectedText : `ACTION: ${selectedText}`;
    exec('insertHTML', `<span class="action-badge">${text}</span>`);
  }

  function togglePicker(name) {
    setOpenPicker((prev) => (prev === name ? null : name));
  }

  function closePicker() {
    setOpenPicker(null);
    if (editorRef && editorRef.current) {
      editorRef.current.focus();
    }
  }

  return html`
    <div style=${{ position: 'relative' }} ref=${pickerAnchorRef}>
      <div class="toolbar-pill">
        <button class="toolbar-btn" onClick=${() => exec('bold')} title="Bold"><b>B</b></button>
        <button class="toolbar-btn" onClick=${() => exec('italic')} title="Italic"><i>I</i></button>
        <button class="toolbar-btn" onClick=${() => exec('underline')} title="Underline" style=${{ textDecoration: 'underline' }}>U</button>
        <button class="toolbar-btn" onClick=${() => exec('strikeThrough')} title="Strikethrough" style=${{ textDecoration: 'line-through' }}>S</button>

        <div class="toolbar-separator"></div>

        <button class="toolbar-btn" onClick=${() => exec('fontSize', '2')} title="Small" style=${{ fontSize: '0.7rem' }}>S</button>
        <button class="toolbar-btn" onClick=${() => exec('fontSize', '3')} title="Normal">N</button>
        <button class="toolbar-btn" onClick=${() => exec('fontSize', '4')} title="Large" style=${{ fontSize: '1rem' }}>L</button>
        <button class="toolbar-btn" onClick=${() => exec('fontSize', '5')} title="XL" style=${{ fontSize: '1.1rem' }}>XL</button>

        <div class="toolbar-separator"></div>

        <button class="toolbar-btn" onClick=${() => exec('formatBlock', 'h1')} title="Heading 1">H1</button>
        <button class="toolbar-btn" onClick=${() => exec('formatBlock', 'h2')} title="Heading 2">H2</button>
        <button class="toolbar-btn" onClick=${() => exec('formatBlock', 'h3')} title="Heading 3">H3</button>

        <div class="toolbar-separator"></div>

        <button class="toolbar-btn" onClick=${() => exec('insertHTML', '<hr/>')} title="Horizontal rule">—</button>

        <button class="toolbar-btn" onClick=${() => togglePicker('bullet')} title="Custom bullet">• ▾</button>
        <button class="toolbar-btn" onClick=${() => exec('insertOrderedList')} title="Numbered list">1.</button>

        <div class="toolbar-separator"></div>

        <button class="toolbar-btn" onClick=${() => togglePicker('color-text')} title="Text color" style=${{ color: '#ff8800' }}>A</button>
        <button class="toolbar-btn" onClick=${() => togglePicker('color-highlight')} title="Highlight">🖊</button>
        <button class="toolbar-btn" onClick=${() => togglePicker('emoji')} title="Emoji">😀</button>

        <div class="toolbar-separator"></div>

        <button
          class="toolbar-btn"
          onClick=${makeAction}
          title="Wrap selection as ACTION item"
          style=${{ color: 'var(--accent-red)', fontWeight: 700 }}
        >ACTION</button>
      </div>

      ${openPicker === 'color-text' && html`
        <${ColorPicker} mode="text" onClose=${closePicker} />
      `}
      ${openPicker === 'color-highlight' && html`
        <${ColorPicker} mode="highlight" onClose=${closePicker} />
      `}
      ${openPicker === 'emoji' && html`
        <${EmojiPicker} onClose=${closePicker} />
      `}
      ${openPicker === 'bullet' && html`
        <${BulletStylePicker} onClose=${closePicker} />
      `}
    </div>
  `;
}
