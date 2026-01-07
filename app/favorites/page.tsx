'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, initProgress } from '@/lib/storage';
import { UserProgress, Problem } from '@/lib/types';

export default function FavoritesPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getProgress() || initProgress();
    setProgress(data);

    async function loadProblems() {
      try {
        const res = await fetch('/api/problems');
        const data = await res.json();
        setProblems(data);
      } catch (error) {
        console.error('Failed to load problems:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  if (loading || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const favoriteProblems = problems.filter((p) =>
    progress.favorites.includes(p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">お気に入り</h1>
        </div>

        {favoriteProblems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">お気に入りがありません</p>
            <Link
              href="/problems"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600"
            >
              問題を解く →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}`}
                className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {problem.title || problem.id}
                    </h3>
                    {progress.problems[problem.id] && (
                      <p className="text-sm text-gray-500 mt-1">
                        解いた回数:{' '}
                        {progress.problems[problem.id].attemptCount}回
                      </p>
                    )}
                  </div>
                  <span className="text-yellow-500 text-xl">★</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

