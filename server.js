const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "scores.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    crystals INTEGER NOT NULL DEFAULT 0,
    survived_ms INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertScore = db.prepare(
  "INSERT INTO scores (name, score, crystals, survived_ms) VALUES (?, ?, ?, ?)"
);
const topScores = db.prepare(
  "SELECT name, score, crystals, survived_ms, created_at FROM scores ORDER BY score DESC, survived_ms DESC LIMIT 20"
);

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/scores", (_req, res) => {
  const rows = topScores.all();
  res.json(rows);
});

app.post("/scores", (req, res) => {
  const { name, score, crystals, survived_ms } = req.body || {};

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }
  if (name.trim().length > 20) {
    return res.status(400).json({ error: "name must be 20 characters or fewer" });
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 999999) {
    return res.status(400).json({ error: "score must be an integer between 0 and 999999" });
  }
  if (typeof crystals !== "number" || !Number.isInteger(crystals) || crystals < 0) {
    return res.status(400).json({ error: "crystals must be a non-negative integer" });
  }
  if (typeof survived_ms !== "number" || !Number.isInteger(survived_ms) || survived_ms < 0) {
    return res.status(400).json({ error: "survived_ms must be a non-negative integer" });
  }

  const trimmed = name.trim();
  try {
    const info = insertScore.run(trimmed, score, crystals, survived_ms);
    res.status(201).json({ id: info.lastInsertRowid, name: trimmed, score, crystals, survived_ms });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Void Drifter listening on http://localhost:${PORT}`);
});
