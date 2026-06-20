import { html } from './html.js';
import { useState, useReducer, useEffect, useRef, useCallback } from 'react';
import { reducer, initialState, ACTIONS } from './store.js';
import { saveState, loadState } from './utils/storage.js';
import { generateTitle, summariseNote } from './utils/api.js';
import { searchNotes } from './utils/search.js';
import { NotesSidebar } from './components/NotesSidebar.js';
import NoteEditor from './components/NoteEditor.js';
import ActionPanel from './components/ActionPanel.js';
import { TodoView } from './components/TodoView.js';
import SummaryModal from './components/SummaryModal.js';
import { TopBar } from './components/TopBar.js';
import { CommandPalette } from './components/CommandPalette.js';

export function App() {
  const [state, dispatch] = useReducer(reducer, loadState() || initialState);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const activeNote = state.notes.find(n => n.id === state.activeNoteId) || null;

  const titleTimerRef = useRef(null);
  const triggerTitleGen = useCallback((noteId, content) => {
    clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      generateTitle(noteId, content, dispatch);
    }, 1500);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'n') {
          e.preventDefault();
          dispatch({ type: ACTIONS.CREATE_NOTE });
        } else if (e.key === 'f') {
          e.preventDefault();
          document.querySelector('input[placeholder*="Search"]')?.focus();
        } else if (e.key === 'k') {
          e.preventDefault();
          setCommandPaletteOpen(p => !p);
        }
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = state.searchQuery
    ? searchNotes(state.notes, state.searchQuery)
    : null;

  const handleSummarise = useCallback(() => {
    if (activeNote) summariseNote(activeNote.contentText || activeNote.content || '', dispatch);
  }, [activeNote]);

  const layoutClass = 'app-layout';

  return html`
    <div class=${layoutClass}>
      <${TopBar}
        view=${state.view}
        searchQuery=${state.searchQuery}
        searchResults=${searchResults}
        dispatch=${dispatch}
        onOpenCommandPalette=${() => setCommandPaletteOpen(true)}
      />

      ${state.view === 'notes' ? html`
        <${NotesSidebar}
          notes=${searchResults ? searchResults.results : state.notes}
          activeNoteId=${state.activeNoteId}
          searchQuery=${state.searchQuery}
          dispatch=${dispatch}
        />
        <div class="editor-area">
          ${activeNote ? html`
            <${NoteEditor}
              note=${activeNote}
              isGeneratingTitle=${state.isGeneratingTitle}
              dispatch=${dispatch}
              onContentChange=${triggerTitleGen}
              onSummarise=${handleSummarise}
            />
          ` : html`
            <div style=${{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: '16px',
              color: 'var(--text-muted)'
            }}>
              <div style=${{ fontSize: '4rem' }}>📝</div>
              <div style=${{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text)' }}>
                Your notes live here
              </div>
              <div style=${{ fontSize: '0.875rem', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
                Select a note from the sidebar or create a new one to get started.
              </div>
              <button
                class="btn btn-primary"
                onClick=${() => dispatch({ type: ACTIONS.CREATE_NOTE })}
                style=${{ marginTop: '8px', background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
              >+ New Note</button>
            </div>
          `}
        </div>
        <${ActionPanel}
          note=${activeNote}
          todos=${state.todos}
          dispatch=${dispatch}
          rightPanelOpen=${state.rightPanelOpen}
        />
      ` : html`
        <div style=${{ gridColumn: '1 / -1', overflow: 'auto' }}>
          <${TodoView} todos=${state.todos} dispatch=${dispatch} />
        </div>
      `}

      <${SummaryModal}
        isOpen=${state.summaryModalOpen}
        note=${activeNote}
        summaryText=${state.summaryText}
        isSummarizing=${state.isSummarizing}
        dispatch=${dispatch}
      />

      ${commandPaletteOpen && html`
        <${CommandPalette}
          onClose=${() => setCommandPaletteOpen(false)}
          dispatch=${dispatch}
          notes=${state.notes}
        />
      `}
    </div>
  `;
}
