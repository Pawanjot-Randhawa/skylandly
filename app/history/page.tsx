'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchAverageGuesses, fetchHistoryGames, fetchHistorySummary, HistoryGameResponse } from '@/lib/api';
import { getBrowserId } from '@/lib/browserId';
import { SKYLANDER_IMAGES } from '@/lib/data/skylandersImages';

const skylanderKeyMap = Object.keys(SKYLANDER_IMAGES).reduce<Record<string, string>>(
  (acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  },
  {}
);

function getSkylanderImage(name?: string | null) {
  if (!name) return undefined;
  const direct = SKYLANDER_IMAGES[name];
  if (direct) return direct;
  const normalized = skylanderKeyMap[name.toLowerCase()];
  return normalized ? SKYLANDER_IMAGES[normalized] : undefined;
}

export default function HistoryPage() {
  const [stats, setStats] = useState({
    averageGuesses: 0,
    currentStreak: 0,
    highestStreak: 0,
    totalGamesPlayed: 0,
  });
  const [games, setGames] = useState<HistoryGameResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const browserId = useMemo(() => getBrowserId(), []);

  useEffect(() => {
    async function loadHistory() {
      if (!browserId) {
        setError('Unable to identify browser.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [avg, summary, history] = await Promise.all([
          fetchAverageGuesses(browserId),
          fetchHistorySummary(browserId),
          fetchHistoryGames(browserId),
        ]);

        setStats({
          averageGuesses: avg.average_guesses,
          currentStreak: summary.current_streak,
          highestStreak: summary.highest_streak,
          totalGamesPlayed: summary.total_games_played,
        });
        setGames(history.games);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load history. Please try again.');
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [browserId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading history...</p>
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

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Statistics</h1>
          <p className="text-gray-600">Track your Skylandly performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.averageGuesses}
            </div>
            <div className="text-sm text-gray-600">Average Guesses</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.highestStreak}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalGamesPlayed}
            </div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">🔥</span>
              <span>
                Your streak increases by 1 for each day you successfully guess the Skylander
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>
                Your streak resets to 0 if you skip a day or fail to guess correctly
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>
                You have unlimited guesses each day until you find the correct Skylander
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🕐</span>
              <span>A new Skylander is available every day at midnight</span>
            </li>
          </ul>
        </div>

        {/* Game History */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Game History</h2>
          {games.length === 0 ? (
            <p className="text-gray-600">No games played yet.</p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div
                  key={`${game.date}-${game.skylander_name ?? 'unknown'}`}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="text-xl font-semibold text-gray-800">
                      {game.date}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-base font-semibold ${
                        game.won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {game.won ? 'Won' : 'Lost'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 text-center">
                      <div>
                        <div className="text-base font-semibold text-gray-600">Target</div>
                        <div className="mt-4 flex flex-col items-center gap-3">
                          {getSkylanderImage(game.skylander_name) ? (
                            <img
                              src={getSkylanderImage(game.skylander_name)?.img}
                              alt={game.skylander_name || 'Skylander'}
                              className="w-28 h-28 object-contain"
                            />
                          ) : (
                            <div className="w-28 h-28 rounded bg-gray-100" />
                          )}
                          <div className="font-fredoka text-3xl text-center">
                            {game.skylander_name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-semibold text-gray-600">Guesses</div>
                        <div className="text-3xl font-bold text-gray-800">
                          {game.guess_count}
                        </div>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-600">Guess List</div>
                        {game.guesses.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {game.guesses.map((guess, index) => (
                              <div
                                key={`${game.date}-${guess}-${index}`}
                                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5"
                              >
                                {getSkylanderImage(guess) ? (
                                  <img
                                    src={getSkylanderImage(guess)?.img}
                                    alt={guess}
                                    className="w-7 h-7 object-contain"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded bg-gray-200" />
                                )}
                                <span className="text-lg font-manrope">{guess}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-base text-gray-500">No guesses saved</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/game"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold text-center hover:bg-blue-600 transition-colors"
          >
            🎮 Play Today&apos;s Game
          </Link>
          
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}