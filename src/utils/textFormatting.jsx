// Bolds the first word of a paragraph — a reading-anchor aid some ADHD
// readers find helps them re-locate their place after a break in focus.
export function renderParagraph(text, boldFirstWord) {
  if (!boldFirstWord) return text;
  const match = text.match(/^(\S+)(\s*)([\s\S]*)$/);
  if (!match) return text;
  const [, firstWord, space, rest] = match;
  return (
    <>
      <strong>{firstWord}</strong>{space}{rest}
    </>
  );
}
