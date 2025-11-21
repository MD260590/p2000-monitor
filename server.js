// server.js
const express = require("express");
const Parser = require("rss-parser");
const path = require("path");

const app = express();
const parser = new Parser();

// ======= INSTELLINGEN =======
const REGION_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2729641";
const LIFELINER_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2f39a77";

// Render geeft een poort via env
const PORT = process.env.PORT || 3000;

// Static files (html + mp3's)
app.use(express.static(__dirname));

// ======= HULPFUNCTIES =======
function mapItem(item) {
  return {
    title: item.title || "",
    description: item.contentSnippet || item.content || item.summary || item.description || "",
    pubDate: item.pubDate || "",
    link: item.link || "",
    raw: item
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
  const text = ((item.title || "") + " " + (item.description || "")).toLowerCase();
  return UTRECHT_PLACES.some(place => text.includes(place));
}

// ======= ENDPOINTS =======

// Regio-feed
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
    res.status(500).json({ error: "Kon regio RSS niet ophalen" });
  }
});

// Lifeliners (Utrecht)
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
    res.status(500).json({ error: "Kon lifeliner RSS niet ophalen" });
  }
});

// ======= SERVER STARTEN =======
app.listen(PORT, () => {
  console.log(`P2000 Backend actief op poort ${PORT}`);
});
// server.js
const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

// ======= INSTELLINGEN =======
const REGION_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2729641";
const LIFELINER_RSS_URL = "https://www.alarmeringdroid.nl/rss/f2f39a77";
const PORT = 3000;

const path = require("path");
app.use(express.static(__dirname));

// ======= HULPFUNCTIES =======
function mapItem(item) {
  return {
    title: item.title || "",
    description: item.contentSnippet || item.content || item.summary || item.description || "",
    pubDate: item.pubDate || "",
    link: item.link || "",
    raw: item
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
  "rhenen",
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
  const text = ((item.title || "") + " " + (item.description || "")).toLowerCase();
  return UTRECHT_PLACES.some(place => text.includes(place));
}

// ======= ENDPOINTS =======
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
    res.status(500).json({ error: "Kon regio RSS niet ophalen" });
  }
});

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
    res.status(500).json({ error: "Kon lifeliner RSS niet ophalen" });
  }
});

// ======= SERVER STARTEN =======
app.listen(PORT, () => {
  console.log(`P2000 Backend actief op http://localhost:${PORT}/p2000.json`);
  console.log(`Lifeliners (Utrecht) op http://localhost:${PORT}/lifeliners.json`);
});
