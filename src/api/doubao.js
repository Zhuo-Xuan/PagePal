// src/api/doubao.js
// ─────────────────────────────────────────────
// Doubao Seed Character API — Role-Play Chat
// ─────────────────────────────────────────────

const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY;
const DOUBAO_BASE_URL = import.meta.env.VITE_DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

// ✅ Replace with your actual Seed Character model ID from the console
const DOUBAO_MODEL = import.meta.env.VITE_DOUBAO_MODEL || "doubao-seed-character-250115";

/**
 * Send a chat message to Doubao Seed Character API
 * 
 * @param {Object} params
 * @param {string} params.mode - 'discuss' | 'quiz' | 'character'
 * @param {string} params.snippet - Currently selected text passage
 * @param {string} params.bookTitle - Name of the book
 * @param {Array}  params.history - Chat history [{role, content}]
 * @param {string} params.message - User's current message
 * @param {number} params.turnCount - Number of exchanges so far
 * @returns {Promise<string>} AI reply
 */
export async function sendChatMessage({ mode, snippet, bookTitle, history, message, turnCount }) {
  if (!DOUBAO_API_KEY) {
    console.warn("⚠️ Doubao API Key not configured — using mock replies");
    return getMockReply(mode, turnCount, bookTitle);
  }

  const messages = buildMessages(mode, snippet, bookTitle, history, message, turnCount);

  try {
    const response = await fetch(DOUBAO_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        messages: messages,
        temperature: mode === "character" ? 0.85 : 0.5,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Doubao API error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error("API returned empty content");

    // After 10 turns, gently wrap up
    if (turnCount >= 10) {
      return `${reply}\n\n——That's a good place to pause. Want to head back into "${bookTitle}" and see what happens next? I'll be here.`;
    }

    return reply;
  } catch (err) {
    console.error("Doubao API call failed:", err);
    return "Hmm, I spaced out for a second — could you say that again? I want to hear you.";
  }
}

/**
 * Build the full message array for the API
 */
function buildMessages(mode, snippet, bookTitle, history, message, turnCount) {
  const systemPrompt = buildSystemPrompt(mode, snippet, bookTitle, turnCount);
  
  let finalSystemPrompt = systemPrompt;
  if (mode === "character") {
    finalSystemPrompt = `You are a character from "${bookTitle}". Speak in that character's voice — keep it short and vivid, and help the reader "act out" the scene.\n\n${systemPrompt}`;
  }

  return [
    { role: "system", content: finalSystemPrompt },
    ...(history || []),
    { role: "user", content: message },
  ];
}

/**
 * Build the system prompt for each mode
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

/**
 * Mock replies when API key is not configured
 */
function getMockReply(mode, turnCount, bookTitle) {
  if (turnCount >= 10) {
    return `That's a great note to pause on. Ready to dive back into "${bookTitle}"? I'll be right here when you need me.`;
  }
  if (mode === "quiz") {
    return "Nice one! Here's a follow-up: what detail from this passage stood out to you the most?";
  }
  if (mode === "character") {
    return "*leans in closer* You really want to know my story? Alright — but don't blink, or you'll miss it!";
  }
  return "That's a beautiful passage. What do you think the author is trying to make you feel here?";
}
