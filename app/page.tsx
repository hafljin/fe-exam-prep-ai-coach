import Link from 'next/link';
import { getProblems } from '@/lib/content';
import ProgressSummary from '@/components/ProgressSummary';

export default async function HomePage() {
  const problems = await getProblems();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            よすが式学習アプリ
          </h1>
          <p className="text-gray-600">
            判断フローを反復して身につける
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Link
            href="/lessons"
            className="block w-full p-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
          >
            <h2 className="text-xl font-bold mb-1">学習を始める</h2>
            <p className="text-sm opacity-90">Phase0/1/2/3の学習コンテンツ</p>
          </Link>

          <Link
            href="/problems"
            className="block w-full p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            <h2 className="text-xl font-bold mb-1">問題を解く</h2>
            <p className="text-sm opacity-90">判断フローを実践</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">進捗サマリー</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">問題数</span>
              <span className="font-semibold">{problems.length}問</span>
            </div>
            <ProgressSummary />
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href="/progress"
            className="flex-1 text-center py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            進捗
          </Link>
          <Link
            href="/favorites"
            className="flex-1 text-center py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            お気に入り
          </Link>
          <Link
            href="/settings"
            className="flex-1 text-center py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            設定
          </Link>
        </div>
      </div>
    </div>
  );
}

