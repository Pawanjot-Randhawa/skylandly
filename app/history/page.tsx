'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchAverageGuesses, fetchHistoryGames, fetchHistorySummary, HistoryGameResponse } from '@/lib/api';
import { getBrowserId } from '@/lib/browserId';
import { getCurrentLocalDate } from '@/lib/gameState';
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
  const today = useMemo(() => getCurrentLocalDate(), []);

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
      <div className="min-h-screen skylands-bg flex items-center justify-center p-8">
        <div className="skylands-content">
          <p className="text-xl skylands-subtitle">Loading history... (May take a few seconds)</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen skylands-bg flex items-center justify-center p-8">
        <div className="skylands-content text-center">
          <p className="text-xl text-red-200 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 skylands-btn-primary rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 skylands-bg">
      <div className="max-w-4xl mx-auto skylands-content">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 skylands-title">Your Statistics</h1>
          <p className="skylands-subtitle">Track your Skylandly performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-lg text-center skylands-card">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {stats.averageGuesses}
            </div>
            <div className="text-sm skylands-muted">Average Guesses</div>
          </div>

          <div className="p-6 rounded-lg text-center skylands-card">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-sm skylands-muted">Current Streak</div>
          </div>

          <div className="p-6 rounded-lg text-center skylands-card">
            <div className="text-3xl font-bold text-amber-500 mb-2">
              {stats.highestStreak}
            </div>
            <div className="text-sm skylands-muted">Best Streak</div>
          </div>

          <div className="p-6 rounded-lg text-center skylands-card">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {stats.totalGamesPlayed}
            </div>
            <div className="text-sm skylands-muted">Games Played</div>
          </div>
        </div>

        {/* Information Card */}
        <div className="p-6 rounded-lg mb-8 skylands-card">
          <h2 className="text-xl font-semibold mb-4 skylands-ink">How It Works</h2>
          <ul className="space-y-2 skylands-muted">
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
        <div className="p-6 rounded-lg mb-8 skylands-card">
          <h2 className="text-xl font-semibold mb-4 skylands-ink">Game History</h2>
          {games.length === 0 ? (
            <p className="skylands-muted">No games played yet.</p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => {
                const isPastDay = game.date < today;
                const canRevealTarget = game.won || isPastDay;
                const targetName = canRevealTarget ? (game.skylander_name || 'Unknown') : '?????';
                return (
                <div
                  key={`${game.date}-${game.skylander_name ?? 'unknown'}`}
                  className="rounded-lg p-5 skylands-card"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="text-xl font-semibold skylands-ink">
                      {game.date}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-base font-semibold skylands-chip ${
                        game.won ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {game.won ? 'Won' : 'Lost'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 text-center">
                      <div>
                        <div className="text-base font-semibold skylands-muted">Target</div>
                        <div className="mt-4 flex flex-col items-center gap-3">
                          {canRevealTarget && getSkylanderImage(game.skylander_name) ? (
                            <img
                              src={getSkylanderImage(game.skylander_name)?.img}
                              alt={game.skylander_name || 'Skylander'}
                              className="w-28 h-28 object-contain"
                            />
                          ) : (
                            <div className="w-28 h-28 rounded bg-amber-50" />
                          )}
                          <div className="font-fredoka text-3xl text-center skylands-ink">
                            {targetName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-semibold skylands-muted">Guesses</div>
                        <div className="text-3xl font-bold skylands-ink">
                          {game.guess_count}
                        </div>
                      </div>
                      <div>
                        <div className="text-base font-semibold skylands-muted">Guess List</div>
                        {game.guesses.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[...game.guesses].reverse().map((guess, index) => (
                              <div
                                key={`${game.date}-${guess}-${index}`}
                                className="flex items-center gap-2 rounded-full px-3 py-1.5 skylands-chip"
                              >
                                {getSkylanderImage(guess) ? (
                                  <img
                                    src={getSkylanderImage(guess)?.img}
                                    alt={guess}
                                    className="w-7 h-7 object-contain"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded bg-amber-100" />
                                )}
                                <span className="text-lg font-manrope skylands-ink">{guess}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-base skylands-muted">No guesses saved</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/game"
            className="px-6 py-3 skylands-btn-primary rounded-lg font-semibold text-center"
          >
            🎮 Play Today&apos;s Game
          </Link>
          
          <Link
            href="/"
            className="px-6 py-3 skylands-btn-ghost rounded-lg font-semibold text-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}