// src/api/doubao.js
export async function sendChatMessage({ mode, snippet, bookTitle, history, message, turnCount }) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, snippet, bookTitle, history, message, turnCount }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("API error:", data.error);
      return fallbackReply(mode, turnCount, bookTitle);
    }
    return data.reply;
  } catch (err) {
    console.error("Request failed:", err);
    return "Network error — refresh and try again?";
  }
}

function fallbackReply(mode, turnCount, bookTitle) {
  if (turnCount >= 10) {
    return `That's a great pause point. Ready to dive back into "${bookTitle}"? I'll be here.`;
  }
  if (mode === "quiz") return "Nice! Here's a follow-up: what detail stood out to you most?";
  if (mode === "character") return "*leans in* You want to know my story? Alright — but don't blink!";
  return "That's a beautiful passage. What do you think the author is trying to say here?";
}
