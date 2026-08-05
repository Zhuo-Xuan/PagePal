/**
 * Seedream API — image generation from selected text
 * ─────────────────────────────────────────────────────────────
 * FILL IN BEFORE USE:
 *
 *   export const SEEDREAM_API_KEY = "your-api-key-here";
 *   export const SEEDREAM_ENDPOINT = "https://your-seedream-endpoint/v1/images/generations";
 *
 * Called when the user opens ChatPage after selecting text.
 * The illustration should visually represent the selected passage
 * in a child-friendly, non-scary style.
 *
 * Recommended: call from a serverless proxy (/api/illustrate) so the
 * API key never ships to the browser.
 */

export const SEEDREAM_API_KEY = "";
export const SEEDREAM_ENDPOINT = "";

/**
 * Generate an illustration URL from a text snippet.
 * Returns null until you wire up the real API (ChatPage shows a placeholder).
 */
export async function generateIllustration(snippet, bookTitle) {
  // ── REPLACE THIS BLOCK with a real fetch to Seedream ──
  //
  // const prompt = `Children's book illustration, warm and friendly style, scene from "${bookTitle}": ${snippet.slice(0, 200)}`;
  //
  // const res = await fetch(SEEDREAM_ENDPOINT, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${SEEDREAM_API_KEY}`,
  //   },
  //   body: JSON.stringify({ prompt, size: "1024x512" }),
  // });
  // const data = await res.json();
  // return data.data[0].url;

  void snippet;
  void bookTitle;
  return null;
}
