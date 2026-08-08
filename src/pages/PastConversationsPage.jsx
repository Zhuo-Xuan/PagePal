import { useState } from "react";
import { ArrowLeft, MessageCircle, Brain, Users } from "lucide-react";

const MODE_ICONS = { discuss: MessageCircle, quiz: Brain, character: Users };

export default function PastConversationsPage({ conversations, back }) {
  const [expandedId, setExpandedId] = useState(null);
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="page-wrap">
      <div className="conversations-header">
        <button className="btn-ghost" onClick={back}><ArrowLeft size={16} /></button>
        <div className="section-title" style={{ marginBottom: 0 }}>Past conversations</div>
      </div>

      {sorted.length === 0 && (
        <div className="section-sub" style={{ marginTop: 20 }}>
          No conversations yet — select some text on a book page to start one.
        </div>
      )}

      <div className="conversation-list">
        {sorted.map((c) => {
          const Icon = MODE_ICONS[c.mode] || MessageCircle;
          const isOpen = expandedId === c.id;
          return (
            <div key={c.id} className="conversation-item">
              <div className="conversation-summary" onClick={() => setExpandedId(isOpen ? null : c.id)}>
                <Icon size={16} color="var(--lantern)" />
                <div className="conversation-meta">
                  <div className="conversation-book">{c.bookTitle}</div>
                  <div className="conversation-snippet">
                    "{c.snippet.slice(0, 60)}{c.snippet.length > 60 ? "…" : ""}"
                  </div>
                </div>
                <div className="conversation-date">{new Date(c.updatedAt).toLocaleDateString()}</div>
              </div>
              {isOpen && (
                <div className="conversation-transcript">
                  {c.illustrationUrl && (
                    <div className="conversation-illustration">
                      <img 
                        src={c.illustrationUrl} 
                        alt="Illustration" 
                        style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }} 
                      />
                    </div>
                  )}
                  {c.messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
