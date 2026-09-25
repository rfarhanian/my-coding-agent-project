const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const db = new Database(path.join(__dirname, 'scores.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    near_misses INTEGER NOT NULL DEFAULT 0,
    survival_secs REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertScore = db.prepare(
  'INSERT INTO scores (name, score, near_misses, survival_secs) VALUES (?, ?, ?, ?)'
);
const topScores = db.prepare(
  'SELECT name, score, near_misses, survival_secs, created_at FROM scores ORDER BY score DESC LIMIT 10'
);

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/scores', (_req, res) => {
  const rows = topScores.all();
  res.json(rows);
});

app.post('/scores', (req, res) => {
  const { name, score, near_misses, survival_secs } = req.body || {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }
  if (name.trim().length > 20) {
    return res.status(400).json({ error: 'name must be 20 characters or fewer' });
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 999999) {
    return res.status(400).json({ error: 'score must be a finite number between 0 and 999999' });
  }
  if (typeof near_misses !== 'number' || !Number.isFinite(near_misses) || near_misses < 0) {
    return res.status(400).json({ error: 'near_misses must be a non-negative finite number' });
  }
  if (typeof survival_secs !== 'number' || !Number.isFinite(survival_secs) || survival_secs < 0) {
    return res.status(400).json({ error: 'survival_secs must be a non-negative finite number' });
  }

  const trimmed = name.trim();
  const roundedScore = Math.round(score);
  const roundedMisses = Math.round(near_misses);
  const roundedSecs = Math.round(survival_secs * 10) / 10;

  const info = insertScore.run(trimmed, roundedScore, roundedMisses, roundedSecs);
  res.status(201).json({
    id: info.lastInsertRowid,
    name: trimmed,
    score: roundedScore,
    near_misses: roundedMisses,
    survival_secs: roundedSecs,
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Stellar Drift running on http://127.0.0.1:${PORT}`);
});
