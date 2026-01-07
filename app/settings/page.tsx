'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clearProgress, initProgress } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleClearData = () => {
    if (confirming) {
      clearProgress();
      setConfirming(false);
      router.push('/');
    } else {
      setConfirming(true);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">設定</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">データ管理</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  ローカルに保存されている進捗データを削除します。
                  この操作は取り消せません。
                </p>
                {confirming ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 font-semibold">
                      本当に削除しますか？
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleClearData}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        削除する
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleClearData}
                    className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    データを削除
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">アプリ情報</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">バージョン</span>
                <span className="font-semibold">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PWA対応</span>
                <span className="font-semibold">対応済み</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

