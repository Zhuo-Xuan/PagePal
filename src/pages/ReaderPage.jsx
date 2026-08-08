// src/pages/ReaderPage.jsx
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  VolumeX, CloudRain, Trees, Coffee,
  MessageCircle, Brain, Users, X, Volume2,
} from "lucide-react";
import {
  ALICE_TEXT, AMBIENTS, MODES, SURFACES, FONTS, PARAGRAPHS_PER_PAGE,
} from "../data/constants.js";
import { useReadingAnalytics } from "../hooks/useReadingAnalytics.js";
import { useAmbientSound } from "../hooks/useAmbientSound.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { renderParagraph } from "../utils/textFormatting.jsx";
import ReaderSidebar from "../components/ReaderSidebar.jsx";
import NotesWidget from "../components/NotesWidget.jsx";

const AMBIENT_ICONS = { silence: VolumeX, rain: CloudRain, forest: Trees, cafe: Coffee };
const MODE_ICONS = { discuss: MessageCircle, quiz: Brain, character: Users };

export default function ReaderPage({
  book, text, loading, customization, ambient, setAmbient, onSelectMode, onProgress, back,
  onOpenConversations, notesOpen, onToggleNotes, notesValue, onNotesChange,
}) {
  // save page number
  const [pageIndex, setPageIndex] = useLocalStorage(
    `pagepal_page_${book.id}`,
    0
  );

  const [popover, setPopover] = useState(null);
  const containerRef = useRef(null);
  const surface = SURFACES[customization.surface];
  const analytics = useReadingAnalytics(customization);
  const { isPlaying, resume, volume, setVolume } = useAmbientSound(ambient);

  const allParagraphs = text && text.length > 0 ? text : ALICE_TEXT;

  const pages = [];
  for (let i = 0; i < allParagraphs.length; i += PARAGRAPHS_PER_PAGE) {
    pages.push(allParagraphs.slice(i, i + PARAGRAPHS_PER_PAGE));
  }
  const currentPage = pages[pageIndex] ?? [];
  const lastPageIndex = Math.max(pages.length - 1, 0);

  // progress bar
  useEffect(() => {
    if (pages.length > 0) {
      onProgress?.(book, pageIndex / lastPageIndex);
    }
  }, [pageIndex]);

  function goNext() {
    if (pageIndex < lastPageIndex) {
      setPageIndex(pageIndex + 1);
      setPopover(null);
    }
  }
  function goPrev() {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
      setPopover(null);
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

  function handlePageClick() {
    resume();
  }

  return (
    <div className="page-full" onClick={handlePageClick}>
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
            // customization
            currentPage.map((p, i) => (
              <p key={i}>{renderParagraph(p, customization.boldFirstSentence)}</p>
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

      {/* volume */}
      <div className="ambient-volume-control">
        <Volume2 size={14} style={{ opacity: 0.6 }} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="ambient-volume-slider"
        />
        <span style={{ fontSize: 12, opacity: 0.6, minWidth: 30 }}>
          {Math.round(volume * 100)}%
        </span>
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
