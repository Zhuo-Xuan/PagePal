import { useState } from "react";
import Nav from "./components/Nav.jsx";
import HomePage from "./pages/HomePage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { ONGOING_INIT, DEFAULT_CUSTOMIZATION } from "./data/constants.js";
import { fetchBookText } from "./api/gutenberg.js";

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

  async function openBook(book) {
    setActiveBook(book);
    setPage("reader");
    setBookText(null);
    setTextLoading(true);
    const paragraphs = await fetchBookText(book);
    setBookText(paragraphs); // null → ReaderPage falls back to ALICE_TEXT
    setTextLoading(false);
  }

  function selectMode(mode, snippet) {
    setChatState({ mode, snippet });
    setPage("chat");
  }

  function updateProgress(book, progress) {
    setOngoing((prev) => {
      const exists = prev.find((entry) => entry.book.id === book.id);
      if (exists) {
        return prev.map((entry) =>
          entry.book.id === book.id ? { ...entry, progress } : entry
        );
      }
      return [...prev, { book, progress }];
    });
  }

  return (
    <>
      <Nav page={page} setPage={setPage} streak={streak} />
      {page === "home" && (
        <HomePage streak={streak} ongoing={ongoing} openBook={openBook} />
      )}
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
        />
      )}
      {page === "chat" && chatState && activeBook && (
        <ChatPage
          mode={chatState.mode}
          snippet={chatState.snippet}
          book={activeBook}
          back={() => setPage("reader")}
        />
      )}
      {page === "settings" && (
        <SettingsPage customization={customization} setCustomization={setCustomization} />
      )}
    </>
  );
}
