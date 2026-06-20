export const ACTIONS = {
  CREATE_NOTE: 'CREATE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  SET_ACTIVE_NOTE: 'SET_ACTIVE_NOTE',
  TOGGLE_PIN: 'TOGGLE_PIN',
  ADD_TODO: 'ADD_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  REORDER_TODOS: 'REORDER_TODOS',
  SET_VIEW: 'SET_VIEW',
  SET_SEARCH: 'SET_SEARCH',
  TOGGLE_RIGHT_PANEL: 'TOGGLE_RIGHT_PANEL',
  SET_AI_LOADING: 'SET_AI_LOADING',
  SET_SUMMARY: 'SET_SUMMARY',
  TOGGLE_SUMMARY_MODAL: 'TOGGLE_SUMMARY_MODAL',
};

export const initialState = {
  notes: [],
  activeNoteId: null,
  todos: [],
  view: 'notes',
  searchQuery: '',
  rightPanelOpen: true,
  isGeneratingTitle: false,
  isSummarizing: false,
  summaryModalOpen: false,
  summaryText: '',
};

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.CREATE_NOTE: {
      const now = new Date().toISOString();
      const note = {
        id: (action.payload && action.payload.id) ? action.payload.id : Date.now(),
        title: 'Untitled Note',
        content: '',
        contentText: '',
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        category: null,
        actionItems: [],
      };
      return { ...state, notes: [note, ...state.notes], activeNoteId: note.id };
    }

    case ACTIONS.UPDATE_NOTE: {
      const { id, ...fields } = action.payload;
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === id ? { ...n, ...fields, updatedAt: new Date().toISOString() } : n
        ),
      };
    }

    case ACTIONS.DELETE_NOTE: {
      const { id } = action.payload;
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
      };
    }

    case ACTIONS.SET_ACTIVE_NOTE:
      return { ...state, activeNoteId: action.payload.id };

    case ACTIONS.TOGGLE_PIN: {
      const { id } = action.payload;
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === id ? { ...n, isPinned: !n.isPinned } : n
        ),
      };
    }

    case ACTIONS.ADD_TODO: {
      const todo = {
        id: Date.now(),
        text: action.payload.text,
        sourceNoteId: action.payload.sourceNoteId || null,
        sourceNoteTitle: action.payload.sourceNoteTitle || null,
        createdAt: new Date().toISOString(),
        priority: action.payload.priority || 'medium',
        status: 'todo',
        order: state.todos.length,
      };
      return { ...state, todos: [...state.todos, todo] };
    }

    case ACTIONS.UPDATE_TODO: {
      const { id, ...fields } = action.payload;
      let todos = state.todos.map(t =>
        t.id === id ? { ...t, ...fields } : t
      );
      if (fields.status === 'done') {
        const idx = todos.findIndex(t => t.id === id);
        if (idx !== -1) {
          const [done] = todos.splice(idx, 1);
          todos = [...todos, done];
        }
      }
      return { ...state, todos };
    }

    case ACTIONS.DELETE_TODO: {
      const { id } = action.payload;
      return { ...state, todos: state.todos.filter(t => t.id !== id) };
    }

    case ACTIONS.REORDER_TODOS:
      return { ...state, todos: action.payload.todos };

    case ACTIONS.SET_VIEW:
      return { ...state, view: action.payload.view };

    case ACTIONS.SET_SEARCH:
      return { ...state, searchQuery: action.payload.query };

    case ACTIONS.TOGGLE_RIGHT_PANEL:
      return { ...state, rightPanelOpen: !state.rightPanelOpen };

    case ACTIONS.SET_AI_LOADING:
      return { ...state, isGeneratingTitle: action.payload.loading };

    case ACTIONS.SET_SUMMARY:
      return { ...state, summaryText: action.payload.text, isSummarizing: false };

    case ACTIONS.TOGGLE_SUMMARY_MODAL: {
      const opening = !state.summaryModalOpen;
      return {
        ...state,
        summaryModalOpen: opening,
        isSummarizing: opening,
        summaryText: opening ? '' : state.summaryText,
      };
    }

    default:
      return state;
  }
}
