export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith("https://www.gutenberg.org/")) {
    return res.status(400).json({ error: "Missing or invalid url" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Gutenberg fetch failed" });
    }
    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: "Fetch error", detail: String(err) });
  }
}