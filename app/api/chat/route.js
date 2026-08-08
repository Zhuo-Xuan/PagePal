export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, snippet, bookTitle, history, message, turnCount } = body;

    const apiKey = process.env.VITE_DOUBAO_API_KEY;
    const model = process.env.VITE_DOUBAO_MODEL || "doubao-seed-character-250115";
    const baseUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    const messages = [
      { role: "system", content: buildPrompt(mode, snippet, bookTitle, turnCount) },
      ...(history || []),
      { role: "user", content: message },
    ];

    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 300 }),
    });

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't catch that. Try again?";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

function buildPrompt(mode, snippet, bookTitle, turnCount) {
  const prompts = {
    discuss: `You are a reading companion. Discuss this passage: "${snippet}" from "${bookTitle}". Keep replies short.`,
    quiz: `You are a quiz partner. Ask one question about: "${snippet}". Keep it short.`,
    character: `You are a character from "${bookTitle}". Reply in character about: "${snippet}". Keep it short.`,
  };
  let prompt = prompts[mode] || prompts.discuss;
  if (turnCount >= 9) prompt += " Gently suggest they continue reading.";
  return prompt;
}
