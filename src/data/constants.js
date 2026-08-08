export const CATALOG = [
  { id: "alice", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", accent: "#E8A33D" },
  { id: "oz", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", accent: "#6B9080" },
  { id: "peterpan", title: "Peter Pan", author: "J. M. Barrie", accent: "#8C6FAE" },
  { id: "jungle", title: "The Jungle Book", author: "Rudyard Kipling", accent: "#B5654A" },
  { id: "princess", title: "A Little Princess", author: "Frances Hodgson Burnett", accent: "#C97BAE" },
  { id: "anne", title: "Anne of Green Gables", author: "L. M. Montgomery", accent: "#5B8A9A" },
];

export const ONGOING_INIT = [];

export const DEFAULT_CUSTOMIZATION = {
  font: "lexend",
  fontSize: 18,
  surface: "parchment",
  boldFirstSentence: true,
};

export const ALICE_TEXT = [
  "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \"and what is the use of a book,\" thought Alice, \"without pictures or conversations?\"",
  "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
  "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, \"Oh dear! Oh dear! I shall be late!\" But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it.",
  "Burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge. In another moment down went Alice after it, never once considering how in the world she was to get out again.",
  "The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down what seemed to be a very deep well.",
];

export const AMBIENTS = [
  { id: "silence", label: "Quiet" },
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "cafe", label: "Café" },
];

export const MODES = [
  { id: "discuss", label: "Talk it through", blurb: "Chat about what this part means" },
  { id: "quiz", label: "Check my memory", blurb: "Quick questions on what you've read" },
  { id: "character", label: "Talk to a character", blurb: "Chat as someone from the story" },
];

export const SURFACES = {
  parchment: { label: "Parchment", bg: "#EDE6D6", text: "#2A2118" },
  sage: { label: "Sage", bg: "#DCE6DC", text: "#1F2E23" },
  dusk: { label: "Dusk", bg: "#2B2A3D", text: "#EDE6D6" },
  midnight: { label: "Midnight (high contrast)", bg: "#0B0B0B", text: "#FFFFFF" },
};

export const FONTS = {
  lexend: { label: "Lexend", stack: "'Lexend', sans-serif", note: "Built for reading fluency" },
  fraunces: { label: "Fraunces", stack: "'Fraunces', serif", note: "Warm, classic serif" },
  dyslexic: { label: "Open Dyslexic-style", stack: "'Comic Sans MS', 'Comic Sans', sans-serif", note: "Wide, distinct letterforms" },
};

export const PARAGRAPHS_PER_PAGE = 4;
export const CHAT_TURN_LIMIT = 10;

export const MODE_OPENERS = {
  discuss: (snippet) =>
    `You picked out: "${snippet.slice(0, 90)}${snippet.length > 90 ? "…" : ""}" — what made you stop there? What do you think is going on in this part?`,
  quiz: (snippet) =>
    `Let's check your memory. Based on what you just read: "${snippet.slice(0, 90)}${snippet.length > 90 ? "…" : ""}" — what do you think happens because of this?`,
  character: (snippet) =>
    `*looks up from the page* You wanted to talk to me about this part? "${snippet.slice(0, 70)}${snippet.length > 70 ? "…" : ""}" — go on, ask me anything.`,
};
