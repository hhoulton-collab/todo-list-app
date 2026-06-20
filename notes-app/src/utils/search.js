export function searchNotes(notes, query) {
  if (!query || !query.trim()) return { results: notes, totalMatches: 0 };
  const q = query.toLowerCase().trim();
  let totalMatches = 0;
  const results = notes.filter(note => {
    const titleMatches = (note.title || '').toLowerCase().includes(q);
    const contentMatches = (note.contentText || '').toLowerCase().includes(q);
    if (titleMatches || contentMatches) {
      const titleCount = (note.title || '').toLowerCase().split(q).length - 1;
      const contentCount = (note.contentText || '').toLowerCase().split(q).length - 1;
      totalMatches += titleCount + contentCount;
      return true;
    }
    return false;
  });
  return { results, totalMatches };
}

export function highlightText(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts; // caller maps these with mark tags
}
