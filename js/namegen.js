// Deterministic puzzle generation from a numeric seed.
import { mulberry32, pick, randInt } from './prng.js';
import { PARTS, STRUCTURES, BANKS } from './data.js';

export const RACES = ['chinese', 'malay', 'indian', 'eurasian'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Easy mode only uses short parts (<=6 chars, i.e. <=5 letters to guess after the
// revealed first letter); hard mode uses parts of any length.
const EASY_MAX_LEN = 6;
const maxLenFor = (mode) => (mode === 'easy' ? EASY_MAX_LEN : Infinity);

// Parts matching race + role + chosen gender (unisex parts always qualify),
// optionally capped to a maximum text length.
function pool(race, role, gender, maxLen = Infinity) {
  return PARTS.filter((p) =>
    p.race === race &&
    p.roles.includes(role) &&
    (p.gender === 'u' || p.gender === gender) &&
    p.text.length <= maxLen);
}

// Generate a fake Singapore mobile number, partly masked PayNow-style.
function genMobile(rng) {
  const a = randInt(rng, 0, 9);
  const b = randInt(rng, 0, 9);
  const c = randInt(rng, 0, 9);
  // PayNow only ever exposes the last few digits.
  return `+65 9XXX ${a}${b}X${c}`;
}

// Generate a partly masked NRIC like "SXXXX123A".
function genNRIC(rng) {
  const prefix = pick(rng, ['S', 'T']);
  const digits = `${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}${randInt(rng, 0, 9)}`;
  const suffix = pick(rng, ALPHABET.split(''));
  return `${prefix}XXXX${digits}${suffix}`;
}

// A plausible everyday transfer amount in SGD.
function genAmount(rng) {
  const dollars = randInt(rng, 1, 250);
  const cents = pick(rng, ['00', '50', '20', '80', '90', '10', '88']);
  return `${dollars}.${cents}`;
}

// Build a full puzzle for a given seed + mode. The order of rng draws is the
// contract that makes puzzles stable across reloads/browsers — never reorder.
//
// Returns:
//   {
//     mode, race, gender, structureId,
//     parts: [ { text, locked, token } ],   // text uppercased internally for scoring
//     bank, channel: 'mobile'|'nric', handle, amount
//   }
// `race` is one of RACES, or 'random' to pick a (deterministic) race from the seed.
export function buildPuzzle(seed, mode, race = 'random') {
  const rng = mulberry32(seed);

  const chosenRace = race === 'random' ? pick(rng, RACES) : race;
  const gender = rng() < 0.5 ? 'm' : 'f';
  const maxLen = maxLenFor(mode);
  const candidates = STRUCTURES.filter((s) => s.race === chosenRace && s.mode === mode);
  const structure = pick(rng, candidates);

  const parts = [];
  const usedIds = new Set();

  for (const slot of structure.slots) {
    if (slot.kind === 'token') {
      let text = slot.text;
      if (text === 'bin' && gender === 'f') text = 'binti';
      if (text === 's/o' && gender === 'f') text = 'd/o';
      parts.push({ text, locked: true, token: true });
    } else if (slot.kind === 'initial') {
      parts.push({ text: pick(rng, ALPHABET.split('')), locked: true, token: false });
    } else {
      let candidatesPool = pool(chosenRace, slot.role, gender, maxLen).filter((p) => !usedIds.has(p.id));
      if (candidatesPool.length === 0) candidatesPool = pool(chosenRace, slot.role, gender, maxLen); // fallback
      const p = pick(rng, candidatesPool);
      usedIds.add(p.id);
      parts.push({ text: p.text, locked: false, token: false });
    }
  }

  const bank = pick(rng, BANKS);
  const channel = rng() < 0.5 ? 'mobile' : 'nric';
  const handle = channel === 'mobile' ? genMobile(rng) : genNRIC(rng);
  const amount = genAmount(rng);

  return { mode, race: chosenRace, gender, structureId: structure.id, parts, bank, channel, handle, amount };
}

// Dev self-check: every structure slot resolves to a non-empty pool for both
// genders. Returns an array of human-readable problem strings (empty = healthy).
export function selfCheck() {
  const problems = [];
  for (const s of STRUCTURES) {
    const maxLen = maxLenFor(s.mode);
    for (const slot of s.slots) {
      if (slot.kind !== 'part') continue;
      for (const g of ['m', 'f']) {
        if (pool(s.race, slot.role, g, maxLen).length === 0) {
          problems.push(`${s.id}: no parts for role "${slot.role}" gender "${g}" (maxLen ${maxLen})`);
        }
      }
    }
  }
  return problems;
}
