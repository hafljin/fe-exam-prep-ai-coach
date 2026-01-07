'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProblems, getRandomProblem } from '@/lib/content';
import { Problem } from '@/lib/types';

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    load();
  }, []);

  const handleRandomProblem = async () => {
    try {
      const res = await fetch('/api/problems/random');
      const data = await res.json();
      router.push(`/problems/${data.id}`);
    } catch (error) {
      console.error('Failed to get random problem:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            問題を解く
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={handleRandomProblem}
            className="w-full p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            <h2 className="text-xl font-bold mb-1">ランダム問題</h2>
            <p className="text-sm opacity-90">ランダムに問題を出題</p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">問題一覧</h3>
          <div className="space-y-2">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {problem.title || problem.id}
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

