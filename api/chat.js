// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, snippet, bookTitle, history, message, turnCount } = req.body;

    const apiKey = process.env.VITE_DOUBAO_API_KEY;
    const model = process.env.VITE_DOUBAO_MODEL || "doubao-seed-character-250115";
    const baseUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    console.log("API Key exists:", !!apiKey);
    console.log("Model:", model);
    console.log("Message length:", message?.length);

    if (!apiKey) {
      console.error("API Key is missing!");
      return res.status(500).json({ error: "API Key not configured" });
    }

    const systemPrompt = buildPrompt(mode, snippet, bookTitle, turnCount);
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    console.log("Sending request to Doubao...");

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Doubao API error:", response.status, errorText);
      return res.status(500).json({ error: `API error: ${response.status} - ${errorText}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't catch that. Try again?";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

function buildPrompt(mode, snippet, bookTitle, turnCount) {
  const prompts = {
    discuss: `You are a reading companion. Discuss this passage: "${snippet}" from "${bookTitle}". Keep replies short and thought-provoking.`,
    quiz: `You are a quiz partner. Ask one question about this passage: "${snippet}". Keep it short.`,
    character: `You are a character from "${bookTitle}". Reply in character about: "${snippet}". Keep it short and vivid.`,
  };
  let prompt = prompts[mode] || prompts.discuss;
  if (turnCount >= 9) {
    prompt += " Gently suggest they continue reading.";
  }
  return prompt;
}
