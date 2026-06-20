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

// Render the guess grid: a scrollable history of past guesses (its own div) plus
// a fixed current row + attempts indicator that never overflow.
//   cells        array (per editable tile) of typed letters ('' = empty)
//   cursor       index of the selected editable tile on the active row
//   activeRow    index of the row currently being typed (or -1 if game over)
//   flipRow      index of a just-submitted row to flip-animate (-1 = none)
//   onCellClick  callback(editableIndex) when an active-row tile/word is tapped
//   activePart   index of the part the keyboard is coloured for (highlighted)
export function renderGrid(puzzle, guesses, cells, cursor, activeRow, flipRow, onCellClick, activePart = -1) {
  const host = document.getElementById('grid');
  host.innerHTML = '';
  const tiles = editableTiles(puzzle);
  const tileIndex = new Map();
  tiles.forEach((t, i) => tileIndex.set(`${t.partIndex}:${t.charIndex}`, i));
  const playing = activeRow >= 0;
  // First editable tile of each part, for tap-to-focus a whole word.
  const firstTileOfPart = new Map();
  tiles.forEach((t, i) => { if (!firstTileOfPart.has(t.partIndex)) firstTileOfPart.set(t.partIndex, i); });

  const buildRow = (row, { past, active }) => {
    const rowEl = el('div', `guess-row${past ? ' past' : ''}${active ? ' active' : ''}`);
    const scored = past ? scoreGuess(guesses[row], puzzle.parts) : null;
    const animate = row === flipRow;
    let cellIdx = 0;

    puzzle.parts.forEach((p, pi) => {
      if (p.token) { rowEl.append(el('div', 'token-pill', p.text)); return; }
      const group = el('div', 'part-group');
      // Tapping anywhere in the active word focuses it (recolours the keyboard).
      const focusTi = firstTileOfPart.get(pi);
      if (active && focusTi != null) {
        if (pi === activePart) group.classList.add('active-word');
        group.classList.add('tappable');
        group.addEventListener('click', () => onCellClick(focusTi));
      }
      const len = p.text.length;
      for (let ci = 0; ci < len; ci++) {
        if (ci > 0 && !isLetter(p.text[ci])) {
          group.append(el('div', 'tile-sep', p.text[ci] === ' ' ? '' : p.text[ci]));
          continue;
        }
        const tile = el('div', 'tile');
        if (ci === 0 || p.locked) {
          // Anchor: revealed first letter (or whole initial). Never scored green.
          tile.textContent = p.text[ci].toUpperCase();
          tile.classList.add('anchor');
        } else if (past) {
          tile.textContent = guesses[row][pi][ci];
          tile.classList.add(scored[pi].states[ci]);
        } else if (active) {
          const ti = tileIndex.get(`${pi}:${ci}`);
          if (ti != null) {
            if (cells[ti]) tile.textContent = cells[ti];
            if (ti === cursor) tile.classList.add('cursor');
            // Tap a specific tile to put the cursor there (overrides the group).
            tile.addEventListener('click', (e) => { e.stopPropagation(); onCellClick(ti); });
          }
        }
        if (animate) { tile.classList.add('flip'); tile.style.animationDelay = `${cellIdx * 0.11}s`; }
        cellIdx++;
        group.append(tile);
      }
      rowEl.append(group);
    });
    return rowEl;
  };

  // Past guesses live in their own scrollable container.
  const historyEl = el('div', 'history');
  for (let row = 0; row < guesses.length; row++) {
    historyEl.append(buildRow(row, { past: true, active: false }));
  }
  host.append(historyEl);

  // Current row + attempts are fixed (don't scroll, don't overflow).
  const currentEl = el('div', 'current');
  if (playing) {
    currentEl.append(buildRow(activeRow, { past: false, active: true }));
    const used = guesses.length;
    const left = 6 - used;
    const dots = el('div', 'attempts');
    for (let i = 0; i < 6; i++) dots.append(el('span', `dot${i < used ? ' filled' : ''}`));
    dots.append(el('span', 'attempts-label', `${left} ${left === 1 ? 'try' : 'tries'} left`));
    currentEl.append(dots);
  }
  host.append(currentEl);

  if (!playing && guesses.length) {
    fitBoard(historyEl, guesses.length);
  } else {
    historyEl.classList.remove('fit');
    historyEl.style.removeProperty('--fit-sz');
  }

  historyEl.scrollTop = historyEl.scrollHeight; // keep the latest guess in view
}

// On the finished/admire board, size the cells to fill the available area based
// on the number of rows (guesses) and columns (tiles per row), so it doesn't
// look empty. Falls back silently if the container isn't laid out yet.
function fitBoard(historyEl, rows) {
  const row = historyEl.querySelector('.guess-row');
  if (!row) return;
  const availW = historyEl.clientWidth - 8;
  const availH = historyEl.clientHeight - 8;
  if (availW < 40 || availH < 40) return; // not laid out yet

  const tiles = row.querySelectorAll('.tile').length;
  const seps = row.querySelectorAll('.tile-sep').length;
  const tokens = row.querySelectorAll('.token-pill').length;
  const parts = row.querySelectorAll('.part-group').length;

  const units = tiles + seps * 0.4 + tokens * 1.8;       // tile-equivalent widths
  const gapW = (tiles + seps + tokens) * 4 + parts * 4;  // approx inter-tile gaps
  const rowGap = 8;
  const sizeW = (availW - gapW) / Math.max(1, units);
  const sizeH = (availH - rows * rowGap) / rows;
  let s = Math.max(22, Math.min(56, Math.min(sizeW, sizeH)));

  historyEl.classList.add('fit');
  historyEl.style.setProperty('--fit-sz', `${s}px`);

  // One correction pass if a row still overflows the width.
  if (row.scrollWidth > availW) {
    s = Math.max(18, s * (availW / row.scrollWidth));
    historyEl.style.setProperty('--fit-sz', `${s}px`);
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
