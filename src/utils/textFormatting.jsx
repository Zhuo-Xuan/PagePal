// Bolds the first sentence of a paragraph — a reading-anchor aid some ADHD
// readers find helps them re-locate their place after a break in focus.
export function renderParagraph(text, boldFirstSentence) {
  if (!boldFirstSentence) return text;

  // Match up through the first sentence-ending punctuation (., !, ?), allowing
  // a trailing closing quote/paren, then whitespace, then the rest.
  const match = text.match(/^([\s\S]*?[.!?][)"'\u201d\u2019]*)(\s+)([\s\S]*)$/);

  if (!match) {
    // No sentence break found (e.g. paragraph is one continuous clause) —
    // bold the whole thing rather than guessing.
    return <strong>{text}</strong>;
  }

  const [, firstSentence, space, rest] = match;
  return (
    <>
      <strong>{firstSentence}</strong>{space}{rest}
    </>
  );
}
