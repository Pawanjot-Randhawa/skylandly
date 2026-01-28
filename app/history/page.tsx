'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGameStats } from '@/lib/gameState';

export default function HistoryPage() {
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalGamesPlayed: 0,
    totalWins: 0,
    winRate: 0,
  });

  useEffect(() => {
    const gameStats = getGameStats();
    setStats(gameStats);
  }, []);

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
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalGamesPlayed}
            </div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalWins}
            </div>
            <div className="text-sm text-gray-600">Total Wins</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.winRate}%
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
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
              <span>A new Skylander is available every day at midnight UTC</span>
            </li>
          </ul>
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