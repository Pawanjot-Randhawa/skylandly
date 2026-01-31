// Game state management with localStorage for Skylandly

import { GuessResponse } from './api';

const STORAGE_KEY = 'skylandly_game_state';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  currentDate: string; // YYYY-MM-DD format (local time)
  dailyTarget: string; // The correct Skylander name for today
  guesses: GuessResponse[]; // Array of all guesses made today
  gameStatus: GameStatus;
  currentStreak: number;
  highestStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD format (local time)
  totalGamesPlayed: number;
  totalWins: number;
}

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getCurrentLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Initialize empty game state
 */
function createInitialState(): GameState {
  return {
    currentDate: getCurrentLocalDate(),
    dailyTarget: '',
    guesses: [],
    gameStatus: 'playing',
    currentStreak: 0,
    highestStreak: 0,
    lastPlayedDate: '',
    totalGamesPlayed: 0,
    totalWins: 0,
  };
}

/**
 * Load game state from localStorage
 */
export function loadGameState(): GameState {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createInitialState();
    }

    const state: GameState = JSON.parse(stored);
    const today = getCurrentLocalDate();

    // Backfill missing comparison fields from older stored guesses
    const normalizedGuesses = state.guesses.map((guess) => {
      if (!guess?.comparison?.species) {
        return {
          ...guess,
          comparison: {
            ...guess.comparison,
            species: {
              value: '—',
              is_correct: false,
            },
          },
        };
      }
      return guess;
    });

    // Check if it's a new day
    if (state.currentDate !== today) {
      // New day detected - check if streak should be maintained
      const lastPlayed = new Date(state.lastPlayedDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Reset streak if more than 1 day gap or if last game was lost
      const shouldResetStreak = daysDiff > 1 || state.gameStatus === 'lost';

      return {
        ...createInitialState(),
        currentStreak: shouldResetStreak ? 0 : state.currentStreak,
        highestStreak: state.highestStreak ?? state.currentStreak,
        totalGamesPlayed: state.totalGamesPlayed,
        totalWins: state.totalWins,
        lastPlayedDate: state.lastPlayedDate,
        guesses: [],
      };
    }

    return {
      ...state,
      highestStreak: state.highestStreak ?? state.currentStreak ?? 0,
      guesses: normalizedGuesses,
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return createInitialState();
  }
}

/**
 * Save game state to localStorage
 */
export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

/**
 * Add a guess to the game state
 */
export function addGuess(
  state: GameState,
  guessResponse: GuessResponse
): GameState {
  const newGuesses = [...state.guesses, guessResponse];
  const newStatus: GameStatus = guessResponse.correct ? 'won' : state.gameStatus;

  const newState: GameState = {
    ...state,
    guesses: newGuesses,
    gameStatus: newStatus,
  };

  // If game just ended, update stats
  if (newStatus === 'won' && state.gameStatus === 'playing') {
    const updatedStreak = state.currentStreak + 1;
    newState.currentStreak = updatedStreak;
    newState.highestStreak = Math.max(state.highestStreak || 0, updatedStreak);
    newState.totalWins = state.totalWins + 1;
    newState.totalGamesPlayed = state.totalGamesPlayed + 1;
    newState.lastPlayedDate = getCurrentLocalDate();
  }

  return newState;
}

/**
 * Set the daily target Skylander
 */
export function setDailyTarget(
  state: GameState,
  targetName: string
): GameState {
  return {
    ...state,
    dailyTarget: targetName,
  };
}

/**
 * Reset game state (for testing or manual reset)
 */
export function resetGameState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get stats for history page
 */
export function getGameStats(): {
  currentStreak: number;
  totalGamesPlayed: number;
  totalWins: number;
  winRate: number;
} {
  const state = loadGameState();
  const winRate =
    state.totalGamesPlayed > 0
      ? Math.round((state.totalWins / state.totalGamesPlayed) * 100)
      : 0;

  return {
    currentStreak: state.currentStreak,
    totalGamesPlayed: state.totalGamesPlayed,
    totalWins: state.totalWins,
    winRate,
  };
}
