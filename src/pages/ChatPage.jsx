import { useState, useRef, useEffect } from "react";
import { ArrowLeft, BookOpen, MessageCircle, Send, Sparkles } from "lucide-react";
import { MODES, CHAT_TURN_LIMIT } from "../data/constants.js";
import { sendChatMessage } from "../api/doubao.js";
import { generateIllustration } from "../api/seedream.js";

const MODE_ICONS = { discuss: MessageCircle, quiz: MessageCircle, character: MessageCircle };

export default function ChatPage({ mode, snippet, book, initialMessages, conversationId, onUpdate, back }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [illustrationUrl, setIllustrationUrl] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const turnCount = messages.filter((m) => m.role === "user").length;
  const nudged = turnCount >= CHAT_TURN_LIMIT;
  const ModeIcon = MODE_ICONS[mode] || MessageCircle;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    generateIllustration(snippet, book.title).then((url) => {
      setIllustrationUrl(url);
      // 立即保存插图 URL 到对话
      if (conversationId) {
        onUpdate?.(conversationId, messages, url);
      }
    });
  }, [snippet, book.title]);

  // 每次 messages 变化时保存
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      onUpdate?.(conversationId, messages, illustrationUrl);
    }
  }, [messages, conversationId, illustrationUrl]);

  async function send() {
    if (!input.trim() || sending) return;
    const userMsg = { role: "user", text: input.trim() };
    const nextCount = turnCount + 1;
    setInput("");
    setSending(true);

    try {
      const reply = await sendChatMessage({
        mode,
        snippet,
        bookTitle: book.title,
        history: messages,
        message: userMsg.text,
        turnCount: nextCount,
      });

      const newMessages = [...messages, userMsg, { role: "assistant", text: reply }];
      setMessages(newMessages);
      // 保存到 localStorage
      onUpdate?.(conversationId, newMessages, illustrationUrl);
    } catch (err) {
      console.error("Chat error:", err);
      const newMessages = [...messages, userMsg, { role: "assistant", text: "Sorry, something went wrong. Please try again." }];
      setMessages(newMessages);
      onUpdate?.(conversationId, newMessages, illustrationUrl);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-full">
      <div className="chat-header">
        <button className="btn-ghost" onClick={back}>
          <ArrowLeft size={16} />
        </button>
        <ModeIcon size={16} color="var(--lantern)" />
        <div className="reader-title">{MODES.find((m) => m.id === mode)?.label}</div>
        <div className={`chat-turn-count${nudged ? " nudged" : ""}`}>
          turn {Math.min(turnCount, CHAT_TURN_LIMIT)}/{CHAT_TURN_LIMIT}
        </div>
      </div>

      <div className="chat-illustration-wrap">
        <div className="chat-illustration">
          {illustrationUrl ? (
            <img src={illustrationUrl} alt="Scene from selected passage" />
          ) : (
            <>
              <Sparkles size={22} color="var(--lantern)" />
              <div className="chat-illustration-title">Illustration generated from your selected passage</div>
              <div className="chat-illustration-snippet">
                "{snippet.slice(0, 70)}{snippet.length > 70 ? "…" : ""}"
              </div>
            </>
          )}
        </div>
        <div className="api-note">Wire up Seedream in src/api/seedream.js — add your API key and endpoint.</div>
      </div>

      <div ref={scrollRef} className="chat-messages">
        <div className="chat-messages-inner">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
          ))}
          {nudged && (
            <div className="chat-nudge" onClick={back}>
              <BookOpen size={15} /> Back to "{book.title}"
            </div>
          )}
        </div>
      </div>

      {!nudged && (
        <div className="chat-input-bar">
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your reply..."
              disabled={sending}
            />
            <button className="btn-send" onClick={send} disabled={sending}>
              <Send size={16} color="#1B1B1B" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
