const express = require("express");
const Parser = require("rss-parser");
const path = require("path");

const app = express();

// Parser met browser-achtige headers om 406 te voorkomen
const parser = new Parser({
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept":
        "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7"
    }
  }
});

// ======= INSTELLINGEN =======
const REGION_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2729641";    // Regio-feed
const LIFELINER_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2f39a77"; // Lifeliners-feed

const PORT = process.env.PORT || 3000;

// ======= STATIC FILES =======
app.use(express.static(__dirname));

// Rootpagina (monitor)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "p2000-monitor.html"));
});

// ======= HULPFUNCTIES =======
function mapItem(item) {
  return {
    title: item.title || "",
    description:
      item.contentSnippet ||
      item.content ||
      item.summary ||
      item.description ||
      "",
    pubDate: item.pubDate || "",
    link: item.link || "",
    raw: item,
  };
}

const UTRECHT_PLACES = [
  "utrecht",
  "amersfoort",
  "zeist",
  "nieuwegein",
  "houten",
  "ijsselstein",
  "de bilt",
  "bunnik",
  "veenendaal",
  "soest",
  "woerden",
  "baarn",
  "leusden",
  "wijk bij duurstede",
  "montfoort",
  "lopik",
  "eemnes",
  "driebergen",
  "driebergen-rijsenburg",
  "doorn",
  "leersum",
  "maarn",
  "maarsbergen",
  "amerongen",
  "rijsenburg"
];

function isInProvinceUtrecht(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  return UTRECHT_PLACES.some(place => text.includes(place));
}

// ======= ENDPOINTS =======

// Regiofeed
app.get("/p2000.json", async (req, res) => {
  try {
    const feed = await parser.parseURL(REGION_RSS_URL);
    const items = (feed.items || []).map(mapItem);

    res.json({
      source: REGION_RSS_URL,
      latestUpdate: new Date().toISOString(),
      count: items.length,
      items
    });
  } catch (err) {
    console.error("Fout bij ophalen regio-RSS:", err);
    res.status(500).json({
      error: "Kon regio RSS niet ophalen",
      details: String(err.message || err)
    });
  }
});

// Lifeliners (alleen provincie Utrecht)
app.get("/lifeliners.json", async (req, res) => {
  try {
    const feed = await parser.parseURL(LIFELINER_RSS_URL);
    let items = (feed.items || []).map(mapItem);

    items = items.filter(isInProvinceUtrecht);

    res.json({
      source: LIFELINER_RSS_URL,
      latestUpdate: new Date().toISOString(),
      count: items.length,
      items
    });
  } catch (err) {
    console.error("Fout bij ophalen lifeliner-RSS:", err);
    res.status(500).json({
      error: "Kon lifeliner RSS niet ophalen",
      details: String(err.message || err)
    });
  }
});

// ======= SERVER STARTEN =======
app.listen(PORT, () => {
  console.log(`P2000 Backend actief op poort ${PORT}`);
});
