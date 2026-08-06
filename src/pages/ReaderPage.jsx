import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  VolumeX, CloudRain, Trees, Coffee,
  MessageCircle, Brain, Users, X,
} from "lucide-react";
import {
  ALICE_TEXT, AMBIENTS, MODES, SURFACES, FONTS, PARAGRAPHS_PER_PAGE,
} from "../data/constants.js";
import { useReadingAnalytics } from "../hooks/useReadingAnalytics.js";
import ReaderSidebar from "../components/ReaderSidebar.jsx";
import NotesWidget from "../components/NotesWidget.jsx";
import { renderParagraph } from "../utils/textFormatting.jsx";

const AMBIENT_ICONS = { silence: VolumeX, rain: CloudRain, forest: Trees, cafe: Coffee };
const MODE_ICONS = { discuss: MessageCircle, quiz: Brain, character: Users };

export default function ReaderPage({
  book, text, loading, customization, ambient, setAmbient, onSelectMode, onProgress,
  initialPageIndex = 0, back, onOpenConversations, notesOpen, onToggleNotes, notesValue, onNotesChange,
}) {
  const [popover, setPopover] = useState(null);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const containerRef = useRef(null);
  const surface = SURFACES[customization.surface];
  const analytics = useReadingAnalytics(customization);

  const allParagraphs = text && text.length > 0 ? text : ALICE_TEXT;

  const pages = [];
  for (let i = 0; i < allParagraphs.length; i += PARAGRAPHS_PER_PAGE) {
    pages.push(allParagraphs.slice(i, i + PARAGRAPHS_PER_PAGE));
  }
  const lastPageIndex = Math.max(pages.length - 1, 0);

  // Real book text loads asynchronously after mount, which changes the page
  // count — clamp so a saved pageIndex never points past the loaded book's end.
  useEffect(() => {
    setPageIndex((p) => Math.min(p, lastPageIndex));
  }, [lastPageIndex]);

  const currentPage = pages[pageIndex] ?? [];

  function goNext() {
    if (pageIndex < lastPageIndex) {
      const next = pageIndex + 1;
      setPageIndex(next);
      setPopover(null);
      onProgress?.(book, next, lastPageIndex);
    }
  }
  function goPrev() {
    if (pageIndex > 0) {
      const next = pageIndex - 1;
      setPageIndex(next);
      setPopover(null);
      onProgress?.(book, next, lastPageIndex);
    }
  }

  function handleMouseUp() {
    const sel = window.getSelection();
    const selText = sel ? sel.toString().trim() : "";
    if (!selText || !containerRef.current) {
      setPopover(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setPopover({
      text: selText,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
    });
  }

  function handleSelectMode(mode, selText) {
    analytics.recordChatInterruption();
    onSelectMode(mode, selText);
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div className="page-full">
      <div className="reader-header">
        <button className="btn-ghost" onClick={back}><ArrowLeft size={16} /></button>
        <div className="reader-title">{book.title}</div>
        <div className="reader-author">by {book.author}</div>
        {!loading && <div className="reader-page-count">page {pageIndex + 1} / {pages.length}</div>}
      </div>

      <div className="reader-scroll">
        <div
          ref={containerRef}
          className="reader-surface"
          onMouseUp={handleMouseUp}
          style={{
            background: surface.bg, color: surface.text,
            fontFamily: FONTS[customization.font].stack, fontSize: customization.fontSize,
          }}
        >
          {loading ? (
            <p>Loading the book...</p>
          ) : (
            currentPage.map((p, i) => (
              <p key={i}>{renderParagraph(p, customization.boldFirstWord)}</p>
            ))
          )}

          {popover && (
            <div className="selection-popover" style={{ left: popover.x, top: popover.y - 12 }}>
              {MODES.map((m) => {
                const Icon = MODE_ICONS[m.id];
                return (
                  <button
                    key={m.id} className="selection-btn" title={m.blurb}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectMode(m.id, popover.text)}
                  >
                    <Icon size={16} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
              <button className="selection-close" onMouseDown={(e) => e.preventDefault()} onClick={() => setPopover(null)}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {!loading && (
          <div className="reader-pagination">
            <button className="btn-ghost" onClick={goPrev} disabled={pageIndex === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            <div className="reader-progress-track">
              <div className="reader-progress-fill" style={{ width: `${(pageIndex / lastPageIndex) * 100}%` }} />
            </div>
            <button className="btn-ghost" onClick={goNext} disabled={pageIndex === lastPageIndex}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="reader-hint">Select any text to discuss it, get quizzed, or talk to a character.</div>
      </div>

      <div className="ambient-bar">
        {AMBIENTS.map((a) => {
          const Icon = AMBIENT_ICONS[a.id];
          return (
            <button
              key={a.id}
              className={`ambient-btn${ambient === a.id ? " active" : ""}`}
              onClick={() => setAmbient(a.id)}
              title={a.label}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>

      <ReaderSidebar
        onOpenConversations={onOpenConversations}
        onToggleNotes={onToggleNotes}
        notesOpen={notesOpen}
      />

      {notesOpen && (
        <NotesWidget book={book} value={notesValue} onChange={onNotesChange} onClose={onToggleNotes} />
      )}
    </div>
  );
}
