// Game orchestrator: builds the daily puzzles, handles input, scoring, screens.
import { cyrb53 } from './prng.js';
import { sgtDateString, sgtTimestamp } from './date.js';
import { buildPuzzle, selfCheck } from './namegen.js';
import { scoreGuess, updateKeyStates, isWin } from './wordle.js';
import { loadState, saveState } from './storage.js';
import {
  showScreen, renderReceipt, renderGrid, renderKeyboard, setMessage,
  editableTiles, inputToGuessParts, fullName,
} from './ui.js';

const MODE_LABEL = { easy: 'PayNow', hard: 'PayLater' };
const RACE_LABEL = {
  chinese: 'Chinese', malay: 'Malay', indian: 'Indian', eurasian: 'Eurasian', random: 'Rojak',
};

// The race the player picked on the landing ("random" = Rojak / surprise).
let selectedRace = 'random';

const session = {
  mode: null,
  race: 'random', // the chosen race token for this game
  puzzle: null,
  guesses: [],   // array of guessParts arrays
  cells: [],     // fixed-length: typed letter ('' = empty) per editable tile
  cursor: 0,     // index of the selected editable tile
  keyState: {},
  status: 'playing',
};

function seedFor(mode, race) {
  return cyrb53(`${mode}|${race}|${sgtDateString()}`);
}

function rebuildKeyState() {
  session.keyState = {};
  for (const g of session.guesses) {
    const scored = scoreGuess(g, session.puzzle.parts);
    updateKeyStates(session.keyState, g, scored);
  }
}

function render(flipRow = -1) {
  const activeRow = session.status === 'playing' ? session.guesses.length : -1;
  renderGrid(session.puzzle, session.guesses, session.cells, session.cursor, activeRow, flipRow, setCursor);
  renderKeyboard(session.keyState, onKey);
}

function setCursor(i) {
  session.cursor = i;
  render();
}

// Next empty cell after `from` (wrapping); returns cells.length when all filled.
function nextEmptyCell(from) {
  const n = session.cells.length;
  for (let i = from + 1; i < n; i++) if (session.cells[i] === '') return i;
  for (let i = 0; i <= from && i < n; i++) if (session.cells[i] === '') return i;
  return n;
}

function startMode(mode) {
  session.mode = mode;
  session.race = selectedRace;
  session.puzzle = buildPuzzle(seedFor(mode, selectedRace), mode, selectedRace);
  session.cells = new Array(editableTiles(session.puzzle).length).fill('');
  session.cursor = 0;

  const saved = loadState(mode, selectedRace);
  if (saved) {
    session.guesses = saved.guesses;
    session.status = saved.status;
  } else {
    session.guesses = [];
    session.status = 'playing';
  }
  rebuildKeyState();

  renderReceipt(session.puzzle);
  setMessage('');
  render();
  showScreen('game');

  if (session.status === 'won') showWin();
  else if (session.status === 'lost') showLose();
}

function onKey(key) {
  if (session.status !== 'playing') return;
  const n = session.cells.length;

  if (key === 'ENTER') {
    if (session.cells.some((c) => c === '')) {
      setMessage('Key in the whole name lah');
      return;
    }
    submitGuess();
  } else if (key === 'BACK') {
    if (session.cursor < n && session.cells[session.cursor] !== '') {
      session.cells[session.cursor] = '';
    } else {
      const i = Math.max(0, session.cursor - 1);
      session.cells[i] = '';
      session.cursor = i;
    }
    setMessage('');
    render();
  } else if (/^[A-Z]$/.test(key)) {
    if (session.cursor < n) {
      session.cells[session.cursor] = key;
      session.cursor = nextEmptyCell(session.cursor);
      setMessage('');
      render();
    }
  }
}

function submitGuess() {
  const n = session.cells.length;
  const guessParts = inputToGuessParts(session.puzzle, session.cells);
  const scored = scoreGuess(guessParts, session.puzzle.parts);
  updateKeyStates(session.keyState, guessParts, scored);
  session.guesses.push(guessParts);
  session.cells = new Array(n).fill('');
  session.cursor = 0;
  const flipRow = session.guesses.length - 1;

  if (isWin(scored)) {
    session.status = 'won';
    saveState(session.mode, session.race, session.guesses, session.status);
    render(flipRow);
    setTimeout(showWin, 1400);
  } else if (session.guesses.length >= 6) {
    session.status = 'lost';
    saveState(session.mode, session.race, session.guesses, session.status);
    render(flipRow);
    setTimeout(showLose, 1400);
  } else {
    saveState(session.mode, session.race, session.guesses, session.status);
    render(flipRow);
  }
}

// Encode the result grid as a shareable emoji block.
function shareText() {
  const EMO = { green: '🟩', yellow: '🟨', gray: '⬛' };
  const lines = session.guesses.map((g) => {
    const scored = scoreGuess(g, session.puzzle.parts);
    return scored.map((s) => (s.token ? '·' : s.states.map((x) => EMO[x]).join(''))).join(' ');
  });
  const score = session.status === 'won' ? `${session.guesses.length}/6` : 'X/6';
  const tag = `${MODE_LABEL[session.mode]} · ${RACE_LABEL[session.puzzle.race]}`;
  return `Eh Who This? (${tag}) ${sgtDateString()} ${score}\n` +
    `${lines.join('\n')}\n` +
    'cwlroda.github.io/eh-who-this';
}

// Animate a money figure from 0 to target (ease-out), respecting reduced motion.
function countUp(el, target, ms) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'S$ ' + target.toFixed(2);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = 'S$ ' + (target * eased).toFixed(2);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showWin() {
  document.getElementById('win-name').textContent = fullName(session.puzzle);
  countUp(document.getElementById('win-amount'), parseFloat(session.puzzle.amount), 800);
  document.getElementById('win-time').textContent = sgtTimestamp();
  document.getElementById('win-ref').textContent =
    'EWT' + String(seedFor(session.mode, session.race) % 1e9).padStart(9, '0');
  document.getElementById('win-tries').textContent = `${session.guesses.length}/6`;
  showScreen('win');
}

function showLose() {
  document.getElementById('lose-name').textContent = fullName(session.puzzle);
  showScreen('lose');
}

function bindGlobalKeys() {
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('screen-game').classList.contains('active')) return;
    if (e.key === 'Enter') onKey('ENTER');
    else if (e.key === 'Backspace') onKey('BACK');
    else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
  });
}

function init() {
  const problems = selfCheck();
  if (problems.length) console.warn('Puzzle data self-check failed:', problems);

  document.getElementById('btn-easy').addEventListener('click', () => startMode('easy'));
  document.getElementById('btn-hard').addEventListener('click', () => startMode('hard'));
  document.querySelectorAll('.btn-home').forEach((b) =>
    b.addEventListener('click', () => showScreen('landing')));

  // "Choose your bro" race selector (segmented control).
  const segs = document.querySelectorAll('.seg');
  segs.forEach((s) => s.addEventListener('click', () => {
    selectedRace = s.dataset.race;
    segs.forEach((x) => {
      const on = x === s;
      x.classList.toggle('selected', on);
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }));
  document.querySelectorAll('.js-help').forEach((b) =>
    b.addEventListener('click', () => showScreen('help')));

  document.getElementById('win-share').addEventListener('click', async () => {
    const text = shareText();
    try {
      await navigator.clipboard.writeText(text);
      setMessage('');
      document.getElementById('win-share').textContent = 'Copied!';
      setTimeout(() => { document.getElementById('win-share').textContent = 'Share result'; }, 1500);
    } catch (e) {
      window.prompt('Copy your result:', text);
    }
  });

  bindGlobalKeys();

  // Detect SGT midnight rollover when the tab regains focus mid-session.
  let loadedDate = sgtDateString();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sgtDateString() !== loadedDate) {
      loadedDate = sgtDateString();
      if (session.mode) startMode(session.mode);
    }
  });

  showScreen('landing');
}

init();
