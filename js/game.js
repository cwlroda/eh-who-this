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

const session = {
  mode: null,
  puzzle: null,
  guesses: [],   // array of guessParts arrays
  input: [],     // letters for current row's editable tiles
  keyState: {},
  status: 'playing',
};

function seedFor(mode) {
  return cyrb53(`${mode}|${sgtDateString()}`);
}

function rebuildKeyState() {
  session.keyState = {};
  for (const g of session.guesses) {
    const scored = scoreGuess(g, session.puzzle.parts);
    updateKeyStates(session.keyState, g, scored);
  }
}

function render() {
  const activeRow = session.status === 'playing' ? session.guesses.length : -1;
  renderGrid(session.puzzle, session.guesses, session.input, activeRow);
  renderKeyboard(session.keyState, onKey);
}

function startMode(mode) {
  session.mode = mode;
  session.puzzle = buildPuzzle(seedFor(mode), mode);
  session.input = [];

  const saved = loadState(mode);
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
  const total = editableTiles(session.puzzle).length;

  if (key === 'ENTER') {
    if (session.input.length < total) {
      setMessage('Key in the whole name lah');
      return;
    }
    submitGuess();
  } else if (key === 'BACK') {
    session.input.pop();
    setMessage('');
    render();
  } else if (/^[A-Z]$/.test(key)) {
    if (session.input.length < total) {
      session.input.push(key);
      setMessage('');
      render();
    }
  }
}

function submitGuess() {
  const guessParts = inputToGuessParts(session.puzzle, session.input);
  const scored = scoreGuess(guessParts, session.puzzle.parts);
  updateKeyStates(session.keyState, guessParts, scored);
  session.guesses.push(guessParts);
  session.input = [];

  if (isWin(scored)) {
    session.status = 'won';
    saveState(session.mode, session.guesses, session.status);
    render();
    setTimeout(showWin, 900);
  } else if (session.guesses.length >= 6) {
    session.status = 'lost';
    saveState(session.mode, session.guesses, session.status);
    render();
    setTimeout(showLose, 700);
  } else {
    saveState(session.mode, session.guesses, session.status);
    render();
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
  return `Eh Who This? (${MODE_LABEL[session.mode]}) ${sgtDateString()} ${score}\n` +
    `${lines.join('\n')}\n` +
    'cwlroda.github.io/eh-who-this';
}

function showWin() {
  document.getElementById('win-name').textContent = fullName(session.puzzle);
  document.getElementById('win-amount').textContent = 'S$ ' + session.puzzle.amount;
  document.getElementById('win-time').textContent = sgtTimestamp();
  document.getElementById('win-ref').textContent =
    'EWT' + String(seedFor(session.mode) % 1e9).padStart(9, '0');
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
