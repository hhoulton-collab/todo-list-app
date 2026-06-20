import { html } from 'htm/react';
import { useRef } from 'react';

const PRESET_COLORS = [
  '#ff4444', '#ff8800', '#ffcc00', '#44cc44', '#00aaff',
  '#8844ee', '#ff44aa', '#44ddcc', '#ffffff', '#aaaaaa',
  '#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7',
  '#cc5de8', '#f783ac', '#38d9a9', '#dee2e6', '#495057',
];

export default function ColorPicker({ mode, onClose }) {
  const customRef = useRef(null);

  function applyColor(color) {
    if (mode === 'text') {
      document.execCommand('foreColor', false, color);
    } else {
      if (!document.execCommand('hiliteColor', false, color)) {
        document.execCommand('backColor', false, color);
      }
    }
    onClose();
  }

  function handleCustomChange(e) {
    applyColor(e.target.value);
  }

  return html`
    <div
      style=${{
        position: 'absolute',
        zIndex: 200,
        background: '#252540',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '180px',
      }}
    >
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style=${{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ${mode === 'text' ? 'Text Color' : 'Highlight'}
        </span>
        <button
          onClick=${onClose}
          style=${{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 2px' }}
        >×</button>
      </div>
      <div
        style=${{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        ${PRESET_COLORS.map(
          (color) => html`
            <button
              key=${color}
              onClick=${() => applyColor(color)}
              title=${color}
              style=${{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: color,
                border: '2px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.1s',
              }}
              onMouseOver=${(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseOut=${(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          `
        )}
      </div>
      <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style=${{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Custom:</label>
        <input
          type="color"
          ref=${customRef}
          onChange=${handleCustomChange}
          style=${{ width: '36px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
        />
      </div>
    </div>
  `;
}
