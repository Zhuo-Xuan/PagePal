import { useEffect, useRef } from "react";

/**
 * Reading efficiency analytics
 * ─────────────────────────────────────────────────────────────
 * Tracks how fast the user reads under different customization settings.
 * Data is stored in localStorage until you add a backend.
 *
 * Metrics per session:
 *   - wordsRead, durationMs → words per minute
 *   - font, fontSize, surface
 *   - chatInterruptions (times user left reader for chat)
 *
 * SettingsPage reads getEfficiencyInsight() to suggest the best combo.
 */

const STORAGE_KEY = "reading-nook-sessions";

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-50)));
}

/** Start tracking a reading session. Returns a session id. */
export function startSession(customization) {
  const session = {
    id: Date.now(),
    startedAt: Date.now(),
    font: customization.font,
    fontSize: customization.fontSize,
    surface: customization.surface,
    wordsRead: 0,
    chatInterruptions: 0,
  };
  const sessions = loadSessions();
  sessions.push(session);
  saveSessions(sessions);
  return session.id;
}

/** Update word count based on scroll position through paragraphs. */
export function updateWordsRead(sessionId, paragraphsRead) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const wordsPerParagraph = 80; // rough estimate until real text is loaded
  session.wordsRead = paragraphsRead * wordsPerParagraph;
  saveSessions(sessions);
}

/** Mark that the user opened chat mid-reading. */
export function recordChatInterruption(sessionId) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.chatInterruptions += 1;
  saveSessions(sessions);
}

/** Close session and compute WPM. */
export function endSession(sessionId) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.endedAt = Date.now();
  session.durationMs = session.endedAt - session.startedAt;
  session.wpm = session.durationMs > 0
    ? Math.round((session.wordsRead / session.durationMs) * 60000)
    : 0;
  saveSessions(sessions);
}

/**
 * Analyze past sessions and return a human-readable insight string.
 * Returns null if not enough data yet (needs ≥ 3 completed sessions).
 */
export function getEfficiencyInsight() {
  const sessions = loadSessions().filter((s) => s.wpm > 0);
  if (sessions.length < 3) return null;

  const byCombo = {};
  for (const s of sessions) {
    const key = `${s.font}|${s.fontSize}|${s.surface}`;
    if (!byCombo[key]) byCombo[key] = { total: 0, count: 0, font: s.font, fontSize: s.fontSize, surface: s.surface };
    byCombo[key].total += s.wpm;
    byCombo[key].count += 1;
  }

  const ranked = Object.values(byCombo)
    .map((c) => ({ ...c, avgWpm: c.total / c.count }))
    .sort((a, b) => b.avgWpm - a.avgWpm);

  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const improvement = worst.avgWpm > 0
    ? Math.round(((best.avgWpm - worst.avgWpm) / worst.avgWpm) * 100)
    : 0;

  return `Over your last ${sessions.length} sessions, you read fastest with ${best.font} at ${best.fontSize}px on the ${best.surface} surface — about ${improvement}% quicker than your slowest combo.`;
}

/** React hook wrapper — use in ReaderPage and SettingsPage. */
export function useReadingAnalytics(customization) {
  const sessionIdRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = startSession(customization);
    return () => endSession(sessionIdRef.current);
  }, []);

  return {
    sessionId: sessionIdRef,
    recordChatInterruption: () => recordChatInterruption(sessionIdRef.current),
    updateWordsRead: (paragraphs) => updateWordsRead(sessionIdRef.current, paragraphs),
  };
}
