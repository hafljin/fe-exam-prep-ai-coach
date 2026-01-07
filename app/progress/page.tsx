'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, initProgress } from '@/lib/storage';
import { UserProgress } from '@/lib/types';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const data = getProgress() || initProgress();
    setProgress(data);
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const totalAttempts = Object.values(progress.problems).reduce(
    (sum, p) => sum + p.attemptCount,
    0
  );
  const uniqueProblems = Object.keys(progress.problems).length;
  const studyDays = progress.studyDays.length;

  // 最近の履歴（最新5件）
  const recentHistory = Object.values(progress.problems)
    .flatMap((p) =>
      p.history.map((h) => ({
        problemId: p.problemId,
        timestamp: h.timestamp,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">進捗</h1>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">統計</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">解いた問題数</span>
                <span className="font-semibold">{uniqueProblems}問</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">総回答回数</span>
                <span className="font-semibold">{totalAttempts}回</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">学習日数</span>
                <span className="font-semibold">{studyDays}日</span>
              </div>
            </div>
          </div>

          {recentHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">最近の履歴</h2>
              <div className="space-y-2">
                {recentHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {item.problemId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(progress.problems).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">問題別進捗</h2>
              <div className="space-y-2">
                {Object.values(progress.problems)
                  .sort(
                    (a, b) =>
                      new Date(b.lastAttemptedAt).getTime() -
                      new Date(a.lastAttemptedAt).getTime()
                  )
                  .slice(0, 10)
                  .map((p) => (
                    <div
                      key={p.problemId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {p.problemId}
                        </span>
                        <p className="text-xs text-gray-500">
                          解いた回数: {p.attemptCount}回
                        </p>
                      </div>
                      <Link
                        href={`/problems/${p.problemId}`}
                        className="text-blue-500 text-sm"
                      >
                        開く →
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

