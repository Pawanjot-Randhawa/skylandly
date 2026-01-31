// API client for Skylandly backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface AttributeComparison {
  value: string;
  is_correct: boolean;
}

export interface CompareResult {
  name: AttributeComparison;
  element: AttributeComparison;
  gender: AttributeComparison;
  game: AttributeComparison;
  species: AttributeComparison;
}

export interface GuessResponse {
  correct: boolean;
  comparison: CompareResult;
}

export interface DailyResponse {
  skylander_name: string;
}

export interface SkylandersResponse {
  skylanders: string[];
}

export interface HistoryResultPayload {
  browser_id: string;
  date?: string;
  won: boolean;
  guess_count: number;
  skylander_name?: string;
  guesses?: string[];
  current_streak?: number;
  highest_streak?: number;
  total_games_played?: number;
  total_wins?: number;
  last_played_date?: string;
}


export interface AverageGuessesResponse {
  average_guesses: number;
  total_games: number;
}

export interface HistorySummaryResponse {
  current_streak: number;
  highest_streak: number;
  total_games_played: number;
  total_wins: number;
}

export interface HistoryGameResponse {
  date: string;
  won: boolean;
  guess_count: number;
  skylander_name?: string | null;
  guesses: string[];
}

export interface HistoryGamesResponse {
  games: HistoryGameResponse[];
}

/**
 * Fetch today's daily Skylander name
 */
export async function fetchDailySkylander(date?: string): Promise<DailyResponse> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/game/daily${query}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch daily Skylander: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Submit a guess for the daily Skylander
 */
export async function submitGuess(
  skylanderName: string,
  date?: string
): Promise<GuessResponse> {
  const dateQuery = date ? `&date=${encodeURIComponent(date)}` : '';
  const response = await fetch(
    `${API_BASE_URL}/api/game/guess?skylander_name=${encodeURIComponent(skylanderName)}${dateQuery}`,
    {
      method: 'POST',
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to submit guess: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch list of all Skylander names for autocomplete
 */
export async function fetchSkylanderNames(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/game/skylanders`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Skylander names: ${response.statusText}`);
  }
  const data: SkylandersResponse = await response.json();
  return data.skylanders;
}


/**
 * Save or update today's result
 */
export async function saveHistoryResult(payload: HistoryResultPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/history/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to save history result: ${response.status} ${response.statusText} ${errorText}`
    );
  }
}

/**
 * Get average guesses per game for a browser
 */
export async function fetchAverageGuesses(browserId: string): Promise<AverageGuessesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/history/average-guesses?browser_id=${encodeURIComponent(browserId)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch average guesses: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get summary stats for a browser
 */
export async function fetchHistorySummary(browserId: string): Promise<HistorySummaryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/history/summary?browser_id=${encodeURIComponent(browserId)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch history summary: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get game history list for a browser
 */
export async function fetchHistoryGames(
  browserId: string,
  limit = 365
): Promise<HistoryGamesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/history/games?browser_id=${encodeURIComponent(browserId)}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch history games: ${response.statusText}`);
  }

  return response.json();
}
