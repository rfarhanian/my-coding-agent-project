# Void Drifter

A compact browser game where you pilot a ship through an endless asteroid field, dodging rocks and collecting energy crystals. One hit ends the run.

## How to play

- **Arrow keys** or **WASD** to move your ship
- **Dodge asteroids** — they drift down and accelerate over time
- **Collect yellow crystals** for bonus points
- **One collision** ends the round

## How scoring works

Score is earned two ways during a run:

- **Survival time**: 10 points per second survived
- **Crystals collected**: 100 points per crystal

Final score = `floor(seconds_survived × 10) + (crystals × 100)`

Difficulty ramps over time: asteroids spawn faster and move quicker, so longer survival requires sharper reflexes. Crystals are worth more than passive survival time, rewarding active risk-taking.

## Setup and run

Requires **Node.js 22**.

```bash
npm install --production
PORT=3000 node server.js
```

The server starts in the foreground on the specified port (default 3000). Open `http://localhost:3000` in a browser to play.

The `PORT` environment variable controls which port the server binds to.

## API

### `GET /scores`

Returns the top 20 scores as a JSON array, ordered by score descending.

### `POST /scores`

Submit a score. Body (JSON):

```json
{
  "name": "string (1-20 chars, required)",
  "score": "integer 0-999999 (required)",
  "crystals": "non-negative integer (required)",
  "survived_ms": "non-negative integer (required)"
}
```

Returns 201 on success, 400 with `{"error": "..."}` on validation failure.

## Persistence

Scores are stored in a SQLite database (`scores.db` in the project directory, or set `DB_PATH`). Data survives server restarts.

## Hosting notes

- All page URLs are relative — works behind a reverse proxy with a path prefix
- No external CDN, web fonts, or third-party scripts
- CORS enabled for cross-origin requests including JSON preflight
- No cookies, localStorage, or session storage required
- Form submission handled via JavaScript fetch (no native form navigation)
- Controls respect focused inputs (keyboard shortcuts disabled when typing in the name field)
