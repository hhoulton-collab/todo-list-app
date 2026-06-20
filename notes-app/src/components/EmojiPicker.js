import { html } from '../html.js';

const EMOJI_CATEGORIES = [
  {
    label: 'Smileys',
    emojis: ['😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😴', '😢', '😡', '🤩', '🥳'],
  },
  {
    label: 'Objects',
    emojis: ['📝', '📋', '📌', '📍', '🔑', '🔒', '💡', '📚', '🎯', '🏆', '🎉', '🎊'],
  },
  {
    label: 'Nature',
    emojis: ['🌟', '⭐', '🌈', '☀️', '🌙', '❄️', '🌊', '🌸', '🌺', '🌻'],
  },
  {
    label: 'Actions',
    emojis: ['✅', '❌', '⚡', '🔥', '💎', '➡️', '⬆️', '⬇️', '↩️', '🔄'],
  },
  {
    label: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔'],
  },
];

export default function EmojiPicker({ onClose }) {
  function insertEmoji(emoji) {
    document.execCommand('insertText', false, emoji);
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
        width: '260px',
        maxHeight: '320px',
        overflowY: 'auto',
      }}
    >
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style=${{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Emojis
        </span>
        <button
          onClick=${onClose}
          style=${{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 2px' }}
        >×</button>
      </div>
      ${EMOJI_CATEGORIES.map(
        (cat) => html`
          <div key=${cat.label} style=${{ marginBottom: '10px' }}>
            <div style=${{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ${cat.label}
            </div>
            <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              ${cat.emojis.map(
                (emoji) => html`
                  <button
                    key=${emoji}
                    onClick=${() => insertEmoji(emoji)}
                    title=${emoji}
                    style=${{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '4px',
                      borderRadius: '6px',
                      lineHeight: 1,
                      transition: 'background 0.1s',
                    }}
                    onMouseOver=${(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseOut=${(e) => (e.currentTarget.style.background = 'transparent')}
                  >${emoji}</button>
                `
              )}
            </div>
          </div>
        `
      )}
    </div>
  `;
}
