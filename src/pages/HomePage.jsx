import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Lantern from "../components/Lantern.jsx";
import { searchBooks } from "../api/gutenberg.js";

export default function HomePage({ streak, ongoing, openBook }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const books = await searchBooks(query);
      setResults(books);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-wrap">
      <div className="search-wrap">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search Project Gutenberg for a book..."
          />
        </div>

        {focused && query.trim() && (
          <div className="search-dropdown">
            {loading && <div className="search-loading">Searching...</div>}
            {!loading && results.length === 0 && (
              <div className="search-empty">No books found — try another title or author.</div>
            )}
            {!loading && results.map((b) => (
              <div key={b.id} className="search-result" onClick={() => openBook(b)}>
                <div className="search-accent" style={{ background: b.accent }} />
                <div>
                  <div className="search-result-title">{b.title}</div>
                  <div className="search-result-author">{b.author}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="streak-banner">
        <Lantern streak={streak} size={48} />
        <div>
          <div className="streak-num">{streak} days</div>
          <div className="streak-label">Keep your reading streak going — even a few pages count.</div>
        </div>
      </div>

      <div className="section-eyebrow">Your shelf</div>
      <div className="section-title">Books in progress</div>
      <div className="section-sub">
        {ongoing.length} book{ongoing.length !== 1 ? "s" : ""} in progress
      </div>

      <div className="shelf">
        {ongoing.map(({ book, progress }) => (
          <div
            key={book.id}
            className="book-spine"
            style={{ background: `linear-gradient(180deg, ${book.accent} 0%, ${book.accent}CC 100%)` }}
            onClick={() => openBook(book)}
          >
            <div className="book-spine-title">{book.title}</div>
            <div className="book-spine-progress" style={{ width: `${progress * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}