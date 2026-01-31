import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen skylands-bg p-8">
      <div className="skylands-content min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 skylands-title font-bungee">Skylandly</h1>
          <p className="text-xl skylands-subtitle">
            Guess the daily Skylander and build your streak!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            href="/game"
            className="px-8 py-6 skylands-btn-primary rounded-xl font-bold text-2xl shadow-lg"
          >
            🎮 Play Game
          </Link>

          <Link
            href="/history"
            className="px-8 py-6 skylands-btn-secondary rounded-xl font-bold text-2xl shadow-lg"
          >
            📊 View History
          </Link>
        </div>

        <div className="mt-12 text-sm skylands-subtitle">
          <p>New puzzle every day at midnight</p>
        </div>
      </div>
    </div>
  );
}