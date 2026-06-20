const KEY = 'pm-notes-v1';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {}
}

export function loadState() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
