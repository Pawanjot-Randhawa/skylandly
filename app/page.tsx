import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">Skylandly</h1>
        <p className="text-xl text-white/90">
          Guess the daily Skylander and build your streak!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          href="/game"
          className="px-8 py-6 bg-white text-blue-600 rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          🎮 Play Game
        </Link>

        <Link
          href="/history"
          className="px-8 py-6 bg-white/10 backdrop-blur text-white border-2 border-white rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          📊 View History
        </Link>
      </div>

      <div className="mt-12 text-white/80 text-sm">
        <p>New puzzle every day at midnight UTC</p>
      </div>
    </div>
  );
}