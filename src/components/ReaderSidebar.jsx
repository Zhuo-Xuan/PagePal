import { History, StickyNote } from "lucide-react";

export default function ReaderSidebar({ onOpenConversations, onToggleNotes, notesOpen }) {
  return (
    <div className="reader-sidebar">
      <button className="sidebar-btn" onClick={onOpenConversations} title="Past conversations">
        <History size={16} />
      </button>
      <button
        className={`sidebar-btn${notesOpen ? " active" : ""}`}
        onClick={onToggleNotes}
        title="Notes"
      >
        <StickyNote size={16} />
      </button>
    </div>
  );
}