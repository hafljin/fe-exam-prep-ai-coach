'use client';

import { useEffect, useState } from 'react';
import { getProgress, initProgress } from '@/lib/storage';

export default function ProgressSummary() {
  const [studyDays, setStudyDays] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const progress = getProgress() || initProgress();
    setStudyDays(progress.studyDays.length);
    setFavoritesCount(progress.favorites.length);
  }, []);

  return (
    <>
      <div className="flex justify-between">
        <span className="text-gray-600">学習日数</span>
        <span className="font-semibold">{studyDays}日</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">お気に入り</span>
        <span className="font-semibold">{favoritesCount}</span>
      </div>
    </>
  );
}

