// Pure Wordle mechanics: masking + per-part scoring + keyboard aggregation.

// Mask a name part PayNow-style: reveal the first letter, turn other letters
// into X, and preserve non-letter characters (spaces in "de Souza", etc).
// "David" -> "DXXXX", "Tan" -> "TXX", "S" -> "S", "de Souza" -> "DX XXXXX".
export function maskPart(text) {
  const up = text.toUpperCase();
  let out = '';
  for (let i = 0; i < up.length; i++) {
    if (i === 0) out += up[i];
    else if (/[A-Z]/.test(up[i])) out += 'X';
    else out += up[i];
  }
  return out;
}

// Standard two-pass Wordle scoring for one part. guess and answer are equal-length
// uppercase strings. Returns array of "green" | "yellow" | "gray".
// The locked first letter is a real green and participates in the count pass, so
// duplicate letters elsewhere in the part are scored correctly.
export function scorePart(guess, answer) {
  const n = answer.length;
  const result = new Array(n).fill('gray');
  const counts = Object.create(null);

  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'green';
    } else {
      counts[answer[i]] = (counts[answer[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < n; i++) {
    if (result[i] === 'green') continue;
    const c = guess[i];
    if (counts[c] > 0) {
      result[i] = 'yellow';
      counts[c]--;
    }
  }
  return result;
}

// Score a full guessed name (array of guessed part strings) against the answer
// parts. Only guessable (non-token) parts are scored; tokens map to null.
// Returns array (per part) of { token: true } or { states: [...] }.
export function scoreGuess(guessParts, answerParts) {
  return answerParts.map((p, i) => {
    if (p.token) return { token: true };
    return { states: scorePart(guessParts[i], p.text.toUpperCase()) };
  });
}

// True when every guessable part is fully green.
export function isWin(scored) {
  return scored.every((s) => s.token || s.states.every((st) => st === 'green'));
}

// Each name part is its own mini-Wordle, so the keyboard is coloured for one
// part at a time. Build the letter-state map (upgrade-only: green > yellow >
// gray) for a single part from every past guess of that part. Index 0 is the
// revealed anchor, not a guess result, so it's skipped.
const RANK = { gray: 0, yellow: 1, green: 2 };
export function keyStateForPart(guesses, answerParts, partIndex) {
  const map = Object.create(null);
  const p = answerParts[partIndex];
  if (!p || p.token || p.locked) return map;
  const answer = p.text.toUpperCase();
  for (const g of guesses) {
    const states = scorePart(g[partIndex], answer);
    states.forEach((state, j) => {
      if (j === 0) return;
      const letter = g[partIndex][j];
      if (!(letter in map) || RANK[state] > RANK[map[letter]]) {
        map[letter] = state;
      }
    });
  }
  return map;
}

// Ordinal label for the n-th guessable word, e.g. 0 -> "1st", 1 -> "2nd".
function ordinal(n) {
  const k = n + 1;
  const suffix = (k % 100 >= 11 && k % 100 <= 13) ? 'th'
    : ['th', 'st', 'nd', 'rd'][k % 10] || 'th';
  return `${k}${suffix}`;
}

// Enforce Wordle hard mode per word: revealed hints must be reused in later
// guesses. For each guessable part, greens lock their position and yellow
// letters must reappear somewhere in that same word. Returns a player-facing
// message for the first violation, or null when the guess is allowed. The
// revealed anchor (index 0) is always satisfied, so it's skipped.
export function hardModeViolation(guessParts, prevGuesses, answerParts) {
  let wordNo = -1;
  for (let pi = 0; pi < answerParts.length; pi++) {
    const p = answerParts[pi];
    if (p.token || p.locked) continue;
    wordNo++;
    const answer = p.text.toUpperCase();
    const greenAt = Object.create(null); // index -> required letter
    const required = new Set();           // letters that must appear somewhere
    for (const g of prevGuesses) {
      const states = scorePart(g[pi], answer);
      states.forEach((state, j) => {
        if (j === 0) return;
        if (state === 'green') greenAt[j] = g[pi][j];
        else if (state === 'yellow') required.add(g[pi][j]);
      });
    }
    const guess = guessParts[pi];
    for (const j in greenAt) {
      if (guess[j] !== greenAt[j]) {
        return `${ordinal(wordNo)} word: letter ${Number(j) + 1} must be ${greenAt[j]}`;
      }
    }
    for (const ch of required) {
      if (!guess.includes(ch)) {
        return `${ordinal(wordNo)} word: must use ${ch}`;
      }
    }
  }
  return null;
}
