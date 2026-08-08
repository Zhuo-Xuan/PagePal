let abortController = null;

const SEEDREAM_API_KEY = import.meta.env.VITE_SEEDREAM_API_KEY;
const SEEDREAM_ENDPOINT = import.meta.env.VITE_SEEDREAM_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const SEEDREAM_MODEL = import.meta.env.VITE_SEEDREAM_MODEL || "doubao-seedream-5.0-lite-250715";

export async function generateIllustration(snippet, bookTitle) {

  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  if (!SEEDREAM_API_KEY) {
    console.warn("⚠️ Seedream API Key not configured — using placeholder");
    return null;
  }

  abortController = new AbortController();

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
        size: "2048x2048",
        n: 1,
      }),
      signal: abortController.signal, 
    });

    abortController = null;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Seedream API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (err) {
    abortController = null;
    if (err.name === "AbortError") {
      console.log("🛑 picture cancelled");
      return null;
    }
    console.error("Seedream API call failed:", err);
    return null;
  }
}
