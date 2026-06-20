import { ACTIONS } from '../store.js';

export { ACTIONS };

export async function generateTitle(noteId, content, dispatch) {
  if (content.trim().length < 20) return;

  dispatch({ type: ACTIONS.SET_AI_LOADING, payload: { loading: true } });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{
          role: "user",
          content: `Generate a short 3-6 word title for this note. If it starts with a meeting name like "meeting with X", use that. Return ONLY the title text, no quotes or punctuation.\nNote content: ${content.substring(0, 500)}`
        }]
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const title = data.content[0].text.trim();

    dispatch({ type: ACTIONS.UPDATE_NOTE, payload: { id: noteId, title } });
    dispatch({ type: ACTIONS.SET_AI_LOADING, payload: { loading: false } });
  } catch (err) {
    dispatch({ type: ACTIONS.SET_AI_LOADING, payload: { loading: false } });
  }
}

export async function summariseNote(content, dispatch) {
  dispatch({ type: ACTIONS.TOGGLE_SUMMARY_MODAL });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Summarise this note in 2-3 sentences. Be concise and capture the key points.\nNote content: ${content.substring(0, 2000)}`
        }]
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    dispatch({ type: ACTIONS.SET_SUMMARY, payload: { text: data.content[0].text.trim() } });
  } catch (err) {
    dispatch({ type: ACTIONS.SET_SUMMARY, payload: { text: 'Failed to generate summary. Please try again.' } });
  }
}
