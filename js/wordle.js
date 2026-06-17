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

// Merge per-guess scoring into a keyboard letter-state map (upgrade-only:
// green > yellow > gray). Mutates and returns `map`.
const RANK = { gray: 0, yellow: 1, green: 2 };
export function updateKeyStates(map, guessParts, scored) {
  scored.forEach((s, i) => {
    if (s.token) return;
    const g = guessParts[i];
    s.states.forEach((state, j) => {
      if (j === 0) return; // index 0 is the revealed anchor, not a guess result
      const letter = g[j];
      if (!(letter in map) || RANK[state] > RANK[map[letter]]) {
        map[letter] = state;
      }
    });
  });
  return map;
}
