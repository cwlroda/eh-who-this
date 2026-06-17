// DOM rendering: screens, PayNow receipt, guess grid, on-screen keyboard.
import { maskPart, scoreGuess } from './wordle.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// Show one screen, hide the others.
export function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.toggle('active', s.id === `screen-${name}`);
  });
}

// The masked recipient name as displayed on the receipt, e.g. "DXXXX TXX".
export function maskedName(puzzle) {
  return puzzle.parts.map((p) => (p.token ? p.text : maskPart(p.text))).join(' ');
}

// The full revealed name, e.g. "David Tan".
export function fullName(puzzle) {
  return puzzle.parts.map((p) => p.text).join(' ');
}

// Render the PayNow transfer receipt header for the active game.
export function renderReceipt(puzzle) {
  const host = document.getElementById('receipt');
  host.innerHTML = '';

  const head = el('div', 'receipt-head');
  head.append(el('span', 'receipt-brand', 'PayNow'));
  host.append(head);

  const nameRow = el('div', 'receipt-name');
  nameRow.append(el('div', 'receipt-label', 'Transfer to'));
  nameRow.append(el('div', 'masked-name', maskedName(puzzle)));
  host.append(nameRow);

  const grid = el('div', 'receipt-meta');
  const channel = puzzle.channel === 'mobile' ? 'Mobile number' : 'NRIC';
  const rows = [
    ['Bank', puzzle.bank],
    ['PayNow ' + channel, puzzle.handle],
    ['Amount', 'S$ ' + puzzle.amount],
  ];
  for (const [k, v] of rows) {
    const r = el('div', 'meta-row');
    r.append(el('span', 'meta-key', k));
    r.append(el('span', 'meta-val', v));
    grid.append(r);
  }
  host.append(grid);
}

const isLetter = (ch) => /[A-Za-z]/.test(ch);

// Enumerate editable tile positions: array of { partIndex, charIndex }.
// Position 0 of each guessable part is the locked revealed letter; tokens,
// length-1 locked parts (initials) and non-letter chars (spaces) are not editable.
export function editableTiles(puzzle) {
  const tiles = [];
  puzzle.parts.forEach((p, pi) => {
    if (p.token || p.locked) return;
    for (let ci = 1; ci < p.text.length; ci++) {
      if (isLetter(p.text[ci])) tiles.push({ partIndex: pi, charIndex: ci });
    }
  });
  return tiles;
}

// Build the full guessed string array (aligned with puzzle.parts) from the
// editable-tile input letters. Token/locked parts use their own text.
export function inputToGuessParts(puzzle, input) {
  const tiles = editableTiles(puzzle);
  const chars = puzzle.parts.map((p) => p.text.toUpperCase().split(''));
  tiles.forEach((t, i) => {
    chars[t.partIndex][t.charIndex] = (input[i] || ' ').toUpperCase();
  });
  return chars.map((c) => c.join(''));
}

// Render the 6-row guess grid.
//   puzzle       the active puzzle
//   guesses      array of past guessParts arrays (full uppercase strings per part)
//   input        array of letters for the active row's editable tiles
//   activeRow    index of the row currently being typed (or -1 if game over)
//   flipRow      index of a just-submitted row to animate with a tile flip (-1 = none)
export function renderGrid(puzzle, guesses, input, activeRow, flipRow = -1) {
  const host = document.getElementById('grid');
  host.innerHTML = '';
  const tiles = editableTiles(puzzle);
  const cursor = input.length; // next empty editable tile on the active row

  // Render only past guesses + the active row (no empty future rows). Remaining
  // attempts are shown as a compact dot indicator below.
  const playing = activeRow >= 0;
  const lastRow = playing ? activeRow : guesses.length - 1;

  for (let row = 0; row <= lastRow; row++) {
    const past = row < guesses.length;
    const active = playing && row === activeRow;
    const rowEl = el('div', `guess-row${past ? ' past' : ''}${active ? ' active' : ''}`);

    // Per-row scoring for past guesses.
    let scored = null;
    if (past) scored = scoreGuess(guesses[row], puzzle.parts);

    const animate = row === flipRow;
    let cellIdx = 0; // running tile index across the row, for flip stagger

    puzzle.parts.forEach((p, pi) => {
      if (p.token) {
        rowEl.append(el('div', 'token-pill', p.text));
        return;
      }
      const group = el('div', 'part-group');
      const len = p.text.length;
      for (let ci = 0; ci < len; ci++) {
        // Non-letter chars (e.g. the space in "de Souza") render as a separator.
        if (ci > 0 && !isLetter(p.text[ci])) {
          const sep = el('div', 'tile-sep', p.text[ci] === ' ' ? '' : p.text[ci]);
          group.append(sep);
          continue;
        }
        const tile = el('div', 'tile');
        if (ci === 0 || p.locked) {
          // Revealed first letter (or whole initial) — always shown, locked.
          tile.textContent = p.text[ci].toUpperCase();
          tile.classList.add('locked');
          if (past && scored) tile.classList.add(scored[pi].states[ci]);
          else tile.classList.add('given');
        } else if (past && scored) {
          tile.textContent = guesses[row][pi][ci];
          tile.classList.add(scored[pi].states[ci]);
        } else if (active) {
          // Map this (pi,ci) to its editable-tile index.
          const ti = tiles.findIndex((t) => t.partIndex === pi && t.charIndex === ci);
          if (ti > -1 && ti < input.length) tile.textContent = input[ti];
          if (ti === cursor) tile.classList.add('cursor');
        }
        if (animate) {
          tile.classList.add('flip');
          tile.style.animationDelay = `${cellIdx * 0.11}s`;
        }
        cellIdx++;
        group.append(tile);
      }
      rowEl.append(group);
    });
    host.append(rowEl);
  }

  if (playing) {
    const used = guesses.length;
    const left = 6 - used;
    const dots = el('div', 'attempts');
    for (let i = 0; i < 6; i++) dots.append(el('span', `dot${i < used ? ' filled' : ''}`));
    dots.append(el('span', 'attempts-label', `${left} ${left === 1 ? 'try' : 'tries'} left`));
    host.append(dots);
  }
}

const KB_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

// Render the on-screen keyboard. keyState maps letter -> 'green'|'yellow'|'gray'.
// onKey(key) is called with 'A'..'Z', 'ENTER', or 'BACK'.
export function renderKeyboard(keyState, onKey) {
  const host = document.getElementById('keyboard');
  host.innerHTML = '';
  KB_ROWS.forEach((letters, ri) => {
    const rowEl = el('div', 'kb-row');
    if (ri === 2) {
      const enter = el('button', 'kb-key kb-wide', 'Enter');
      enter.addEventListener('click', () => onKey('ENTER'));
      rowEl.append(enter);
    }
    for (const ch of letters) {
      const k = el('button', 'kb-key', ch);
      if (keyState[ch]) k.classList.add(keyState[ch]);
      k.addEventListener('click', () => onKey(ch));
      rowEl.append(k);
    }
    if (ri === 2) {
      const back = el('button', 'kb-key kb-wide', '⌫');
      back.addEventListener('click', () => onKey('BACK'));
      rowEl.append(back);
    }
    host.append(rowEl);
  });
}

export function setMessage(text) {
  document.getElementById('message').textContent = text || '';
}
