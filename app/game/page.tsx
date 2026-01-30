'use client';

import { useEffect, useState } from 'react';
import { fetchDailySkylander, fetchSkylanderNames, submitGuess, GuessResponse } from '@/lib/api';
import { loadGameState, saveGameState, addGuess, setDailyTarget, GameState, getCurrentLocalDate } from '@/lib/gameState';
import { SKYLANDER_IMAGES } from '@/lib/data/skylandersImages';
import { GAME_IMAGES } from '@/lib/data/gameImages';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [skylanderNames, setSkylanderNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize game on mount
  useEffect(() => {
    async function initGame() {
      try {
        setIsLoading(true);
        
        // Load state from localStorage
        const state = loadGameState();
        
        // Fetch Skylander names for autocomplete
        const names = await fetchSkylanderNames();
        setSkylanderNames(names);
        
        // If no daily target set or new day, fetch it
        if (!state.dailyTarget) {
          const dailyData = await fetchDailySkylander(state.currentDate || getCurrentLocalDate());
          const updatedState = setDailyTarget(state, dailyData.skylander_name);
          saveGameState(updatedState);
          setGameState(updatedState);
        } else {
          setGameState(state);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize game. Please check your connection.');
        setIsLoading(false);
        console.error(err);
      }
    }

    initGame();
  }, []);

  // Filter suggestions based on input, excluding already-guessed names
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const guessedNames = new Set(
        gameState?.guesses.map((guess) => guess.comparison.name.value) ?? []
      );
      const query = inputValue.trim().toLowerCase();
      const filtered = skylanderNames.filter((name) => {
        const normalizedName = name.toLowerCase();
        return normalizedName.startsWith(query) && !guessedNames.has(name);
      });
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [inputValue, skylanderNames, gameState]);

  const handleGuess = async (selectedName: string) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;

    try {
      setIsLoading(true);
      const response = await submitGuess(selectedName, gameState.currentDate || getCurrentLocalDate());
      const newState = addGuess(gameState, response);
      saveGameState(newState);
      setGameState(newState);
      setInputValue('');
      setShowSuggestions(false);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to submit guess. Please try again.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleSuggestionClick = (name: string) => {
    handleGuess(name);
  };

  // Handle keyboard navigation in suggestions
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedSuggestionIndex((current) =>
        Math.min(current + 1, filteredSuggestions.length - 1)
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedSuggestionIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const indexToUse = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
      const selectedName = filteredSuggestions[indexToUse];
      if (selectedName) {
        handleGuess(selectedName);
      }
    }
  };

  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Skylandly</h1>
          <p className="text-gray-600">Guess today&apos;s Skylander!</p>
          <div className="mt-4">
            <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded">
              🔥 Streak: {gameState.currentStreak}
            </span>
          </div>
        </div>

        {/* Game Status */}
        {gameState.gameStatus === 'won' && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded text-center">
            <p className="text-green-800 font-semibold text-lg">
              🎉 Congratulations! You guessed it in {gameState.guesses.length} {gameState.guesses.length === 1 ? 'try' : 'tries'}!
            </p>
          </div>
        )}

        {/* Search Input */}
        {gameState.gameStatus === 'playing' && (
          <div className="mb-6 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a Skylander name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.map((name, index) => {
                  const imageData = SKYLANDER_IMAGES[name];
                  const isSelected = index === selectedSuggestionIndex;
                  return (
                    <button
                      key={name}
                      onClick={() => handleSuggestionClick(name)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left ${
                        isSelected ? 'bg-blue-100' : 'hover:bg-blue-50'
                      }`}
                      aria-selected={isSelected}
                    >
                      {imageData && (
                        <img
                          src={imageData.img}
                          alt={name}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <span className="font-medium">{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Guesses Grid */}
        {gameState.guesses.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">Your Guesses</h2>
            
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-2 font-semibold text-sm mb-2">
              <div className="text-center">Name</div>
              <div className="text-center">Element</div>
              <div className="text-center">Gender</div>
              <div className="text-center">Game</div>
              <div className="text-center">Species</div>
            </div>

            {/* Guess Rows */}
            {[...gameState.guesses].reverse().map((guess, index) => {
              const imageData = SKYLANDER_IMAGES[guess.comparison.name.value];
              return (
                <div key={index} className="grid grid-cols-5 gap-2">
                  {/* Name with image */}
                  <div
                    className={`p-3 rounded flex flex-col items-center justify-center ${
                      guess.comparison.name.is_correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {imageData && (
                      <img
                        src={imageData.img}
                        alt={guess.comparison.name.value}
                        className="w-12 h-12 object-contain mb-1"
                      />
                    )}
                    <span className="text-sm font-medium text-center">
                      {guess.comparison.name.value}
                    </span>
                  </div>

                  {/* Element */}
                  <div
                    className={`p-3 rounded flex items-center justify-center ${
                      guess.comparison.element.is_correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {guess.comparison.element.value}
                    </span>
                  </div>

                  {/* Gender */}
                  <div
                    className={`p-3 rounded flex items-center justify-center ${
                      guess.comparison.gender.is_correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {guess.comparison.gender.value}
                    </span>
                  </div>

                  {/* Game */}
                  <div
                    className={`p-3 rounded flex flex-col items-center justify-center ${
                      guess.comparison.game.is_correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {GAME_IMAGES[guess.comparison.game.value] && (
                      <img
                        src={GAME_IMAGES[guess.comparison.game.value].img}
                        alt={guess.comparison.game.value}
                        className="w-16 h-10 object-contain mb-1"
                      />
                    )}
                  </div>

                  {/* Species */}
                  <div
                    className={`p-3 rounded flex items-center justify-center ${
                      guess.comparison.species?.is_correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {guess.comparison.species?.value ?? '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {gameState.guesses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Make your first guess to start playing!</p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-500 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
