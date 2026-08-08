// src/api/seedream.js
// ─────────────────────────────────────────────
// Doubao Seedream 5.0 Lite — Image Generation
// ─────────────────────────────────────────────

const SEEDREAM_API_KEY = import.meta.env.VITE_SEEDREAM_API_KEY;
const SEEDREAM_ENDPOINT = import.meta.env.VITE_SEEDREAM_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/images/generations";

// ✅ Replace with your actual Seedream model ID from the console
const SEEDREAM_MODEL = import.meta.env.VITE_SEEDREAM_MODEL || "doubao-seedream-5.0-lite-250715";

/**
 * Generate an illustration from a text snippet
 * 
 * @param {string} snippet - Selected text passage
 * @param {string} bookTitle - Name of the book
 * @returns {Promise<string|null>} Image URL, or null if generation fails
 */
export async function generateIllustration(snippet, bookTitle) {
  if (!SEEDREAM_API_KEY) {
    console.warn("⚠️ Seedream API Key not configured — using placeholder");
    return null;
  }

  const prompt = `Children's book illustration, warm and friendly style, scene from "${bookTitle}": ${snippet.slice(0, 200)}`;

  try {
    const response = await fetch(SEEDREAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SEEDREAM_API_KEY}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_MODEL,
        prompt: prompt,
        size: "1024x512",
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Seedream API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (err) {
    console.error("Seedream API call failed:", err);
    return null;
  }
}
