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

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is empty" });
    }

    // ✅ 只保留最后 5 条历史记录，避免消息太长
    const recentHistory = (history || []).slice(-5);

    const systemPrompt = buildPrompt(mode, snippet, bookTitle, turnCount);
    const messages = [
      { role: "system", content: systemPrompt || "" },
      ...recentHistory.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || msg.text || "",
      })),
      { role: "user", content: message.trim() },
    ];

    // ✅ 过滤掉空消息
    const filteredMessages = messages.filter((m) => m.content && m.content.trim() !== "");

    if (filteredMessages.length === 0) {
      return res.status(400).json({ error: "No valid messages" });
    }

    const requestBody = {
      model: model,
      messages: filteredMessages,
      temperature: 0.7,
      max_tokens: 300,
    };

    // 把请求体打印到日志
    console.log("Sending:", JSON.stringify(requestBody));

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    // 把响应也打印到日志
    console.log("Response status:", response.status);
    console.log("Response body:", responseText);

    if (!response.ok) {
      return res.status(500).json({ 
        error: `API error: ${response.status}`,
        detail: responseText 
      });
    }

    const data = JSON.parse(responseText);
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
