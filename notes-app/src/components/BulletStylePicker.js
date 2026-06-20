import { html } from 'htm/react';

const BULLET_STYLES = [
  { emoji: '⭐', label: 'Star' },
  { emoji: '➡️', label: 'Arrow' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '✅', label: 'Check' },
  { emoji: '🔥', label: 'Fire' },
];

export default function BulletStylePicker({ onClose }) {
  function insertBullet(emoji) {
    document.execCommand('insertHTML', false, `<div>${emoji} </div>`);
    onClose();
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
        minWidth: '160px',
      }}
    >
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style=${{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Bullet Style
        </span>
        <button
          onClick=${onClose}
          style=${{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 2px' }}
        >×</button>
      </div>
      <div style=${{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        ${BULLET_STYLES.map(
          ({ emoji, label }) => html`
            <button
              key=${label}
              onClick=${() => insertBullet(emoji)}
              style=${{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.1s',
              }}
              onMouseOver=${(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseOut=${(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style=${{ fontSize: '1.1rem' }}>${emoji}</span>
              <span>${label} list</span>
            </button>
          `
        )}
      </div>
    </div>
  `;
}
