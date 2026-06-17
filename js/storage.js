// localStorage persistence with schema versioning + in-memory fallback.
import { sgtDateString } from './date.js';

const VERSION = 1;
const mem = {}; // fallback when localStorage is unavailable (e.g. Safari private)

function key(mode, race) {
  return `ehwt:${mode}:${race}:state`;
}

function safeGet(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return k in mem ? mem[k] : null;
  }
}

function safeSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {
    mem[k] = v;
  }
}

// Load today's saved state for a mode, or null if none / stale / wrong version.
// State shape: { v, date, guesses: string[][], status: 'playing'|'won'|'lost' }
// guesses[i] is the array of typed remainders... we store full guessed part
// strings (uppercase) so colours can be recomputed from guesses + answer.
export function loadState(mode, race) {
  const raw = safeGet(key(mode, race));
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return null;
  }
  if (!parsed || parsed.v !== VERSION) return null;
  if (parsed.date !== sgtDateString()) return null;
  return parsed;
}

export function saveState(mode, race, guesses, status) {
  const state = { v: VERSION, date: sgtDateString(), guesses, status };
  safeSet(key(mode, race), JSON.stringify(state));
  return state;
}
