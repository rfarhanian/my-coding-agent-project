# Stellar Drift

A compact browser game where you pilot a ship through an asteroid field. Dodge debris, earn points for survival and near-misses, and compete on the persistent high-score table.

## How to Run

```bash
npm install       # one-time setup
npm start         # starts on port 3000 by default
```

Set the `PORT` environment variable to use a different port:

```bash
PORT=8080 npm start
```

Then open `http://127.0.0.1:<port>/` in your browser to play.

The start command stays in the foreground and serves until killed.

## How to Play

- **Move**: Arrow keys (Left/Right) or A/D
- **Goal**: Dodge falling asteroids as long as possible
- **Scoring**:
  - **+10 points per second** of survival
  - **+50 points** for each near-miss (an asteroid that passes within 1.5× ship widths of you)
- **End state**: A single collision ends the run
- **Restart**: Click "PLAY AGAIN" after a run ends

After a run, enter your name and save your score to the persistent leaderboard. Scores are stored in a SQLite database (`scores.db`) and survive server restarts.

## API

| Method | Path     | Description          |
|--------|----------|----------------------|
| GET    | /scores  | Top 10 high scores   |
| POST   | /scores  | Submit a new score   |

### POST /scores body

```json
{
  "name": "string (1-20 chars, required)",
  "score": "number (0-999999, required)",
  "near_misses": "number (>= 0, required)",
  "survival_secs": "number (>= 0, required)"
}
```

Invalid submissions receive a 400 response with an `error` field explaining the problem.

## Hosting Notes

- All page URLs are relative — works behind a reverse proxy with a path prefix.
- No external CDN, fonts, or third-party scripts — fully self-contained.
- No cookies, localStorage, or session storage — works in a CSP sandbox with an opaque origin.
- CORS is enabled with preflight support for cross-origin embedding.
- Form submission is handled via JavaScript `fetch` with `preventDefault()` — no native form navigation.
- Score persistence uses SQLite on disk, not in-memory storage.

## Tech Stack

- Node.js + Express (HTTP server, static files, API)
- better-sqlite3 (durable score storage)
- HTML5 Canvas (game rendering, no external dependencies)
