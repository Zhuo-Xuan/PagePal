import { useState } from "react";
import Nav from "./components/Nav.jsx";
import HomePage from "./pages/HomePage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import PastConversationsPage from "./pages/PastConversationsPage.jsx";
import { ONGOING_INIT, DEFAULT_CUSTOMIZATION, MODE_OPENERS } from "./data/constants.js";
import { fetchBookText } from "./api/gutenberg.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";

export default function App() {
  const [page, setPage] = useState("home");
  const [streak] = useState(12);
  const [ongoing, setOngoing] = useState(ONGOING_INIT);
  const [activeBook, setActiveBook] = useState(null);
  const [bookText, setBookText] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [ambient, setAmbient] = useState("silence");
  const [chatState, setChatState] = useState(null);
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [conversations, setConversations] = useLocalStorage("pagepal_conversations", []);
  const [notesByBook, setNotesByBook] = useLocalStorage("pagepal_notes", {});
  const [notesOpen, setNotesOpen] = useState(false);

  async function openBook(book) {
    setActiveBook(book);
    setPage("reader");
    setBookText(null);
    setTextLoading(true);
    const paragraphs = await fetchBookText(book);
    setBookText(paragraphs);
    setTextLoading(false);
  }

  function selectMode(mode, snippet) {
    const id = `conv-${Date.now()}`;
    const initialMessages = [{ role: "assistant", text: MODE_OPENERS[mode](snippet) }];
    setConversations((prev) => [
      ...prev,
      {
        id,
        bookId: activeBook.id,
        bookTitle: activeBook.title,
        mode,
        snippet,
        messages: initialMessages,
        illustrationUrl: null,
        updatedAt: Date.now(),
      },
    ]);
    setChatState({ mode, snippet, conversationId: id, initialMessages });
    setPage("chat");
  }

  function updateConversation(id, messages, illustrationUrl) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, messages, illustrationUrl: illustrationUrl || c.illustrationUrl, updatedAt: Date.now() }
          : c
      )
    );
  }

  function updateProgress(book, progress) {
    setOngoing((prev) => {
      const exists = prev.find((entry) => entry.book.id === book.id);
      if (exists) {
        return prev.map((entry) => (entry.book.id === book.id ? { ...entry, progress } : entry));
      }
      return [...prev, { book, progress }];
    });
  }

  function updateNotes(bookId, value) {
    setNotesByBook((prev) => ({ ...prev, [bookId]: value }));
  }

  return (
    <>
      <Nav page={page} setPage={setPage} streak={streak} />
      {page === "home" && <HomePage streak={streak} ongoing={ongoing} openBook={openBook} />}
      {page === "reader" && activeBook && (
        <ReaderPage
          book={activeBook}
          text={bookText}
          loading={textLoading}
          customization={customization}
          ambient={ambient}
          setAmbient={setAmbient}
          onSelectMode={selectMode}
          onProgress={updateProgress}
          back={() => setPage("home")}
          onOpenConversations={() => setPage("conversations")}
          notesOpen={notesOpen}
          onToggleNotes={() => setNotesOpen((v) => !v)}
          notesValue={notesByBook[activeBook.id]}
          onNotesChange={(value) => updateNotes(activeBook.id, value)}
        />
      )}
      {page === "chat" && chatState && activeBook && (
        <ChatPage
          key={chatState.conversationId}
          mode={chatState.mode}
          snippet={chatState.snippet}
          book={activeBook}
          initialMessages={chatState.initialMessages}
          conversationId={chatState.conversationId}
          onUpdate={updateConversation}
          back={() => setPage("reader")}
        />
      )}
      {page === "conversations" && (
        <PastConversationsPage
          conversations={conversations}
          back={() => setPage(activeBook ? "reader" : "home")}
        />
      )}
      {page === "settings" && (
        <SettingsPage customization={customization} setCustomization={setCustomization} />
      )}
    </>
  );
}
