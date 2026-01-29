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

/**
 * Fetch today's daily Skylander name
 */
export async function fetchDailySkylander(): Promise<DailyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/game/daily`);
  if (!response.ok) {
    throw new Error(`Failed to fetch daily Skylander: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Submit a guess for the daily Skylander
 */
export async function submitGuess(skylanderName: string): Promise<GuessResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/game/guess?skylander_name=${encodeURIComponent(skylanderName)}`,
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
