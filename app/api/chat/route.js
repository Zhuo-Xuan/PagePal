// app/api/chat/route.js
// ─────────────────────────────────────────────
// Vercel Serverless Function — Doubao API Proxy
// ─────────────────────────────────────────────

export async function POST(request) {
  try {
    // 1. Parse request body from frontend
    const body = await request.json();
    const { mode, snippet, bookTitle, history, message, turnCount } = body;

    // 2. Read environment variables from Vercel
    const apiKey = process.env.VITE_DOUBAO_API_KEY;
    const model = process.env.VITE_DOUBAO_MODEL || "doubao-seed-character-250115";
    const baseUrl = process.env.VITE_DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    // 3. Build system prompt
    const systemPrompt = buildSystemPrompt(mode, snippet, bookTitle, turnCount);
    
    let finalSystemPrompt = systemPrompt;
    if (mode === "character") {
      finalSystemPrompt = `You are a character from "${bookTitle}". Speak in that character's voice — keep it short and vivid, and help the reader "act out" the scene.\n\n${systemPrompt}`;
    }

    // 4. Assemble messages
    const messages = [
      { role: "system", content: finalSystemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    // 5. Call Volcengine API
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: mode === "character" ? 0.85 : 0.5,
        max_tokens: 300,
      }),
    });

    // 6. Parse response
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "API returned empty content" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. After 10 turns, add a gentle wrap-up
    let finalReply = reply;
    if (turnCount >= 10) {
      finalReply = `${reply}\n\n——That's a good place to pause. Want to head back into "${bookTitle}" and see what happens next? I'll be here.`;
    }

    // 8. Return reply to frontend
    return new Response(
      JSON.stringify({ reply: finalReply }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("API Proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Build system prompt for each mode
 */
function buildSystemPrompt(mode, snippet, bookTitle, turnCount) {
  const modeMap = {
    discuss: "You are a friendly reading companion helping a reader understand this passage. Keep replies short and thought-provoking. Use questions to guide their thinking.",
    quiz: "You are a reading quiz partner. Ask one clear comprehension question at a time based on the passage. Give brief encouraging feedback.",
    character: `You are a character from "${bookTitle}". Speak in that character's voice — keep it short and vivid.`,
  };

  let content = modeMap[mode] || modeMap.discuss;
  content += `\nCurrent passage: "${snippet}"`;
  
  if (turnCount >= 9) {
    content += "\nThis is the 10th exchange — gently encourage the reader to return to the book.";
  }
  
  return content;
}
