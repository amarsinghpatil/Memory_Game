/**
 * Memory Matrix Game Engine
 * GUVI Task #11: Memory Game Sub-Brain
 * 
 * Complies with official GUVI Rubric:
 * - 4x4 Grid (16 cards, 8 unique pairs)
 * - CSS 3D Card Flip Integration
 * - Fisher-Yates Shuffle Algorithm
 * - Strict State Guarding (isBoardLocked, firstCard, secondCard)
 * - Timer, Move Counter & Victory Modal
 */

// ============================================================================
// 1. Configuration & Constants
// ============================================================================
const CARD_SYMBOLS = [
  { id: 'rocket', emoji: '🚀' },
  { id: 'brain', emoji: '🧠' },
  { id: 'fire', emoji: '🔥' },
  { id: 'atom', emoji: '⚛️' },
  { id: 'gem', emoji: '💎' },
  { id: 'star', emoji: '⭐' },
  { id: 'robot', emoji: '🤖' },
  { id: 'target', emoji: '🎯' }
];

const TOTAL_PAIRS = CARD_SYMBOLS.length; // 8 pairs = 16 cards
const MISMATCH_TIMEOUT_MS = 1000;
const STORAGE_KEY_BEST_SCORE = 'memory_matrix_best_score';

// ============================================================================
// 2. Global Game State
// ============================================================================
const gameState = {
  firstCard: null,
  secondCard: null,
  isBoardLocked: false,
  moves: 0,
  matchedPairs: 0,
  timerSeconds: 0,
  timerIntervalId: null,
  isTimerRunning: false
};

// ============================================================================
// 3. DOM Elements Cache
// ============================================================================
const gameGrid = document.getElementById('game-grid');
const movesCountDisplay = document.getElementById('moves-count');
const timerDisplay = document.getElementById('timer-display');
const bestScoreDisplay = document.getElementById('best-score-display');
const restartBtn = document.getElementById('restart-btn');

const winModal = document.getElementById('win-modal');
const finalMovesDisplay = document.getElementById('final-moves');
const finalTimeDisplay = document.getElementById('final-time');
const finalBestDisplay = document.getElementById('final-best');
const newRecordBadge = document.getElementById('new-record-badge');
const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');

// ============================================================================
// 4. Fisher-Yates (Knuth) Shuffle Algorithm
// ============================================================================
/**
 * Shuffles an array in place with O(n) unbiased randomness.
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
function shuffle(array) {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }
  return deck;
}

// ============================================================================
// 5. Timer & Metrics Controller
// ============================================================================
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

function startTimer() {
  if (gameState.isTimerRunning) return;
  
  gameState.isTimerRunning = true;
  gameState.timerIntervalId = setInterval(() => {
    gameState.timerSeconds += 1;
    timerDisplay.textContent = formatTime(gameState.timerSeconds);
  }, 1000);
}

function stopTimer() {
  if (gameState.timerIntervalId) {
    clearInterval(gameState.timerIntervalId);
    gameState.timerIntervalId = null;
  }
  gameState.isTimerRunning = false;
}

function resetTimer() {
  stopTimer();
  gameState.timerSeconds = 0;
  timerDisplay.textContent = '00:00';
}

function incrementMoves() {
  gameState.moves += 1;
  movesCountDisplay.textContent = String(gameState.moves);
}

function resetMoves() {
  gameState.moves = 0;
  movesCountDisplay.textContent = '0';
}

// ============================================================================
// 5.1 Best Score (Personal Record) Controller
// ============================================================================
function getBestScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BEST_SCORE);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function updateBestScoreDisplay() {
  const best = getBestScore();
  if (best) {
    bestScoreDisplay.textContent = `${best.moves}`;
    bestScoreDisplay.title = `Best: ${best.moves} moves in ${formatTime(best.seconds)}`;
  } else {
    bestScoreDisplay.textContent = '-';
    bestScoreDisplay.title = 'No best score recorded yet';
  }
}

function processBestScoreAtVictory(currentMoves, currentSeconds) {
  const currentBest = getBestScore();
  let isNewRecord = false;

  if (!currentBest) {
    isNewRecord = true;
  } else if (currentMoves < currentBest.moves) {
    isNewRecord = true;
  } else if (currentMoves === currentBest.moves && currentSeconds < currentBest.seconds) {
    isNewRecord = true;
  }

  if (isNewRecord) {
    const newBest = { moves: currentMoves, seconds: currentSeconds };
    try {
      localStorage.setItem(STORAGE_KEY_BEST_SCORE, JSON.stringify(newBest));
    } catch (err) {
      console.warn('Could not save best score to localStorage', err);
    }
    updateBestScoreDisplay();
  }

  return {
    isNewRecord,
    bestRecord: getBestScore()
  };
}

// ============================================================================
// 6. Card Generation & Board Initialization
// ============================================================================
/**
 * Creates the DOM element for an individual 3D card.
 * @param {Object} item - Symbol object containing id and emoji
 * @returns {HTMLElement} Card DOM element
 */
function createCardElement(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.card = item.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', 'Memory card');

  card.innerHTML = `
    <div class="card-face card-front">${item.emoji}</div>
    <div class="card-face card-back">❓</div>
  `;

  card.addEventListener('click', () => handleCardClick(card));
  
  // Keyboard accessibility (Enter or Space to flip)
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(card);
    }
  });

  return card;
}

/**
 * Generates a freshly shuffled 4x4 card grid.
 */
function buildGrid() {
  gameGrid.innerHTML = '';
  
  // Create 16-card deck (8 pairs)
  const fullDeck = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
  const shuffledDeck = shuffle(fullDeck);

  shuffledDeck.forEach((item) => {
    const cardElement = createCardElement(item);
    gameGrid.appendChild(cardElement);
  });
}

// ============================================================================
// 7. Core Match Evaluation Engine
// ============================================================================
function handleCardClick(clickedCard) {
  // Guard 1: Prevent clicks when board is locked during evaluation
  if (gameState.isBoardLocked) {
    return;
  }

  // Guard 2: Prevent clicking the same card twice
  if (clickedCard === gameState.firstCard) {
    return;
  }

  // Guard 3: Prevent clicking already matched cards
  if (clickedCard.classList.contains('matched')) {
    return;
  }

  // Start the timer on the very first flip
  if (!gameState.isTimerRunning) {
    startTimer();
  }

  // Flip the selected card
  clickedCard.classList.add('flip');

  // If this is the first card picked in this turn
  if (!gameState.firstCard) {
    gameState.firstCard = clickedCard;
    return;
  }

  // Otherwise, this is the second card
  gameState.secondCard = clickedCard;
  incrementMoves();
  checkForMatch();
}

function checkForMatch() {
  const isMatch = gameState.firstCard.dataset.card === gameState.secondCard.dataset.card;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  // Mark cards as matched
  gameState.firstCard.classList.add('matched');
  gameState.secondCard.classList.add('matched');

  gameState.matchedPairs += 1;

  resetTurn();

  // Check if player completed all 8 pairs
  if (gameState.matchedPairs === TOTAL_PAIRS) {
    handleVictory();
  }
}

function handleMismatch() {
  // Lock board to block interaction while mismatch timeout is active
  gameState.isBoardLocked = true;

  setTimeout(() => {
    if (gameState.firstCard && gameState.secondCard) {
      gameState.firstCard.classList.remove('flip');
      gameState.secondCard.classList.remove('flip');
    }
    resetTurn();
  }, MISMATCH_TIMEOUT_MS);
}

function resetTurn() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.isBoardLocked = false;
}

// ============================================================================
// 8. Win Modal & Game Lifecycle Controller
// ============================================================================
function handleVictory() {
  stopTimer();

  const { isNewRecord, bestRecord } = processBestScoreAtVictory(
    gameState.moves,
    gameState.timerSeconds
  );

  // Populate victory modal statistics
  finalMovesDisplay.textContent = String(gameState.moves);
  finalTimeDisplay.textContent = formatTime(gameState.timerSeconds);

  if (bestRecord) {
    finalBestDisplay.textContent = `${bestRecord.moves} moves (${formatTime(bestRecord.seconds)})`;
  } else {
    finalBestDisplay.textContent = `${gameState.moves} moves`;
  }

  if (isNewRecord) {
    newRecordBadge.classList.remove('hidden');
  } else {
    newRecordBadge.classList.add('hidden');
  }

  // Small delay for natural UX so the last match animation completes
  setTimeout(() => {
    winModal.classList.remove('hidden');
  }, 400);
}

function hideWinModal() {
  winModal.classList.add('hidden');
}

function startNewGame() {
  hideWinModal();
  stopTimer();
  resetTimer();
  resetMoves();
  updateBestScoreDisplay();
  
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.isBoardLocked = false;
  gameState.matchedPairs = 0;

  buildGrid();
}

// ============================================================================
// 9. Event Listeners & Bootstrapping
// ============================================================================
restartBtn.addEventListener('click', startNewGame);
modalPlayAgainBtn.addEventListener('click', startNewGame);

// Initialize game on document load
document.addEventListener('DOMContentLoaded', () => {
  startNewGame();
});

