# Eh Who This? 💸

A satirical, browser-based **Wordle for Singaporean names** — guess the full name from its
PayNow-style censored variant.

In 2026 Singapore's PayNow began masking recipient names with the letter **X** (e.g. `Sean → SEXX`)
as an anti-scam measure, which famously produced some unfortunate accidental display names and went
viral. This game leans into that saga: someone PayNow-ed you, all you see is `DXXXX TXX`, and you
have 6 tries to work out who before you get "scammed".

**Play:** https://cwlroda.github.io/eh-who-this

## How to play

- Two daily puzzles, refreshed at midnight Singapore time:
  - **PayNow** (Easy) — first + last name, e.g. `David Tan`, `Michael Pereira`, `Nur Aisyah Salleh`, `Arun Kumar`.
  - **PayLater** (Hard) — full traditional names, e.g. `David Tan Wei Meng`, `John Michael Anthony Pereira`, `S Rajagopalan Narayanan`, `Muhammad Danish Irfan bin Ahmad`.
- Each name part reveals its **first letter**; the rest are `X`s (so part lengths are visible).
- Type the whole name. Each letter is coloured like Wordle — 🟩 right spot, 🟨 wrong spot, ⬛ not in
  that part — scored **per name part**. Connectors like `bin`/`binti` and leading initials are given
  for free.
- 6 tries. Solve it for a "Transfer Successful" receipt; run out and you've "been scammed".

## ⚠️ Satire disclaimer

This is a parody. Every name is assembled mechanically from common, generic and deliberately
stereotypical name parts drawn from Singapore's **Chinese, Malay, Indian and Eurasian** communities,
purely for comic effect. **Any resemblance to a real person is entirely coincidental.** Not
affiliated with, or endorsed by, PayNow, the Association of Banks in Singapore, MAS, or any bank.

## Tech

Pure static HTML/CSS/JS — no frameworks, no build step, no dependencies. Daily puzzles are generated
deterministically in the browser from a seed derived from the Singapore-time date, so everyone gets
the same two names each day with no backend.

```
index.html      screens (landing / game / win / lose)
css/            theme + game styling
js/
  prng.js       seeded PRNG (cyrb53 + mulberry32)
  date.js       Singapore-time date helpers
  data.js       name-parts database + name structures + banks
  namegen.js    deterministic daily puzzle generation
  wordle.js     masking + per-part scoring
  storage.js    localStorage progress (per mode, per day)
  ui.js         rendering (receipt, grid, keyboard)
  game.js       orchestrator
```

### Local development

The site uses ES modules, so it must be served over HTTP (opening `index.html` via `file://` will
not work):

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the repo root to GitHub
Pages. One-time setup: **Settings → Pages → Source = "GitHub Actions"**.
