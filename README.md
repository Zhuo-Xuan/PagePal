# PagePal

A reading companion for ADHD minors — search Project Gutenberg books, read with customizable settings, ambient sound, and AI-powered text discussions.

## Folder structure

```
reading companion/
├── index.html              # Entry point
├── css/
│   └── styles.css          # All styles 
├── src/
│   ├── main.jsx            # React bootstrap
│   ├── App.jsx             # Page routing & global state
│   ├── data/
│   │   └── constants.js    # fonts, surfaces, modes
│   ├── api/
│   │   ├── gutenberg.js    # Project Gutenberg search (Gutendex)
│   │   ├── doubao.js       # Text chat — fill in your API key
│   │   └── seedream.js     # Image generation — fill in your API key
│   ├── hooks/
│   │   └── useReadingAnalytics.js  # Reading pace & efficiency tracking
│   ├── components/         # Shared UI pieces
│   └── pages/              # One file per screen
└── package.json
```

## Pages

| Page       | File                    | Purpose                                      |
|------------|-------------------------|----------------------------------------------|
| Home       | `pages/HomePage.jsx`    | Streak, search bar, ongoing books            |
| Reader     | `pages/ReaderPage.jsx`  | Full text, text selection, ambient music     |
| Past Conversation| `pages/PastConversation.jsx`| View past chats, store images and text|
| Chat       | `pages/ChatPage.jsx`    | AI chat + illustration from selected text    |
| Settings   | `pages/SettingsPage.jsx`| Font, size, background, efficiency insights  |

## API setup (for you to fill in)

### Doubao — text chat
File: `src/api/doubao.js`

Add your API key and endpoint. Used for:
- Discuss selected passage
- Quiz on comprehension
- Character role-play chat
- After 10 turns, nudge user back to the book

### Seedream — image generation
File: `src/api/seedream.js`

Add your API key and endpoint. Generates an illustration from the selected text snippet when chat opens.

### Project Gutenberg — book search
File: `src/api/gutenberg.js`

Uses [Gutendex](https://gutendex.com/) (free, no key). Falls back to local mock catalog when offline.

## Reading efficiency monitoring

File: `src/hooks/useReadingAnalytics.js`

Tracks per session:
- Words read per minute (scroll + time)
- Font, size, and surface settings used
- Chat interruptions vs. continuous reading

Once enough sessions are logged (localStorage for now), Settings shows which combo helped the user read fastest.

## Run locally

```bash
npm install
npm run dev
```
