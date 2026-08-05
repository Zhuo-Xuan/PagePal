/**
 * Project Gutenberg search via Gutendex (free, no key, CORS-friendly).
 * Full text is routed through our own /api/book-text serverless function,
 * since gutenberg.org itself doesn't send CORS headers for direct browser fetches.
 */

import { CATALOG } from "../data/constants.js";

const GUTENDEX_URL = "https://gutendex.com/books";

function accentFromTitle(title) {
  const palette = ["#E8A33D", "#6B9080", "#8C6FAE", "#B5654A", "#C97BAE", "#5B8A9A"];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function normalizeGutendexBook(book) {
  return {
    id: `gutenberg-${book.id}`,
    gutenbergId: book.id,
    title: book.title,
    author: book.authors?.[0]?.name ?? "Unknown",
    accent: accentFromTitle(book.title),
    formats: book.formats,
  };
}

function searchLocalCatalog(query) {
  const q = query.toLowerCase();
  return CATALOG.filter(
    (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
}

/** Search Project Gutenberg books. Falls back to local CATALOG if the request fails. */
export async function searchBooks(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const res = await fetch(`${GUTENDEX_URL}?search=${encodeURIComponent(trimmed)}`);
    if (!res.ok) throw new Error(`Gutendex ${res.status}`);
    const data = await res.json();
    return (data.results ?? []).map(normalizeGutendexBook);
  } catch {
    return searchLocalCatalog(trimmed);
  }
}

/**
 * Fetch full plain-text content for a book, split into paragraphs.
 * Returns null for local mock-catalog books (no `formats`), or if the fetch
 * fails — ReaderPage falls back to ALICE_TEXT in that case.
 *
 * Routed through /api/book-text (our own serverless function) so this works
 * with `vercel dev` locally and in production, with no CORS issues.
 */
export async function fetchBookText(book) {
  const plainUrl =
    book.formats?.["text/plain; charset=utf-8"] ||
    book.formats?.["text/plain; charset=us-ascii"] ||
    book.formats?.["text/plain"] ||
    Object.entries(book.formats ?? {}).find(([key]) => key.startsWith("text/plain"))?.[1];

  if (!plainUrl) {
    console.warn("No plain-text format found for", book.title, book.formats);
    return null;
  }

  const proxiedUrl = `/api/book-text?url=${encodeURIComponent(plainUrl)}`;

  try {
    const res = await fetch(proxiedUrl);
    if (!res.ok) {
      console.warn("Gutenberg fetch failed", res.status, plainUrl);
      return null;
    }
    const raw = await res.text();
    return raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 80);
  } catch (err) {
    console.warn("Gutenberg fetch threw", err, plainUrl);
    return null;
  }
}
