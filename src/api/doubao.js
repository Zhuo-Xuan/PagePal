/**
 * Doubao API — text chat
 * ─────────────────────────────────────────────────────────────
 * FILL IN BEFORE USE:
 *
 *   export const DOUBAO_API_KEY = "your-api-key-here";
 *   export const DOUBAO_ENDPOINT = "https://your-doubao-endpoint/v1/chat/completions";
 *   export const DOUBAO_MODEL   = "your-model-id";
 *
 * Used for three chat modes (see constants.js MODES):
 *   - discuss   → explain / explore the selected passage
 *   - quiz      → test comprehension with follow-up questions
 *   - character → role-play as a story character
 *
 * After CHAT_TURN_LIMIT (10) user turns, the system prompt should
 * nudge the student back to reading the next passage.
 *
 * Recommended: call this from a serverless proxy (/api/chat) so the
 * API key never ships to the browser.
 */

export const DOUBAO_API_KEY = "";
export const DOUBAO_ENDPOINT = "";
export const DOUBAO_MODEL = "";

/**
 * Send a chat message and get a reply.
 * Returns mock text until you wire up the real API.
 */
export async function sendChatMessage({ mode, snippet, bookTitle, history, message, turnCount }) {
  // ── REPLACE THIS BLOCK with a real fetch to Doubao ──
  //
  // const res = await fetch(DOUBAO_ENDPOINT, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${DOUBAO_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: DOUBAO_MODEL,
  //     messages: buildMessages(mode, snippet, bookTitle, history, message, turnCount),
  //   }),
  // });
  // const data = await res.json();
  // return data.choices[0].message.content;

  if (turnCount >= 10) {
    return `That's a great note to end on for now. Let's head back into "${bookTitle}" and see what happens next — I'll be here if you want to talk again later.`;
  }

  if (mode === "quiz") {
    return "Good thinking — that's part of it. Here's a follow-up: what does the pocket watch tell us about the Rabbit's world?";
  }
  if (mode === "character") {
    return "*fidgets* Yes, yes, go on — but be quick about it!";
  }
  return "That's an interesting read on it. What do you think the daisy-chain detail tells us about how Alice is feeling before the Rabbit shows up?";
}

/** Build the system + history messages array for Doubao. */
export function buildMessages(mode, snippet, bookTitle, history, message, turnCount) {
  const modeInstructions = {
    discuss: "You are a friendly reading tutor helping an ADHD student understand a book passage. Keep answers short and engaging.",
    quiz: "You are a quiz partner. Ask one clear comprehension question at a time based on the passage. Give brief encouraging feedback.",
    character: "You are a character from the story. Stay in character. Keep replies short and vivid.",
  };

  const system = {
    role: "system",
    content: `${modeInstructions[mode]}\nBook: "${bookTitle}"\nSelected passage: "${snippet}"${
      turnCount >= 9 ? "\nThis is the final exchange — warmly wrap up and encourage the student to keep reading." : ""
    }`,
  };

  return [system, ...history, { role: "user", content: message }];
}
