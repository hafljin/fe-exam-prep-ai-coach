import { UserProgress, ProblemProgress, Attempt } from './types';

const STORAGE_KEY = 'yosuga-progress';
const CURRENT_VERSION = '1.0.0';

// 進捗データの取得
export function getProgress(): UserProgress | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const progress = JSON.parse(data) as UserProgress;
    // バージョンチェック（必要に応じてマイグレーション）
    if (progress.version !== CURRENT_VERSION) {
      // マイグレーション処理（必要に応じて実装）
    }
    
    return progress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}

// 進捗データの保存
export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    progress.version = CURRENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

// 進捗データの初期化
export function initProgress(): UserProgress {
  return {
    version: CURRENT_VERSION,
    problems: {},
    studyDays: [],
    favorites: [],
  };
}

// 進捗データのクリア
export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// 学習日の追加
export function addStudyDay(date: string): void {
  const progress = getProgress() || initProgress();
  if (!progress.studyDays.includes(date)) {
    progress.studyDays.push(date);
    saveProgress(progress);
  }
}

// 回答履歴の追加
export function addAttempt(problemId: string, attempt: Attempt): void {
  const progress = getProgress() || initProgress();
  
  if (!progress.problems[problemId]) {
    progress.problems[problemId] = {
      problemId,
      attemptCount: 0,
      lastAttemptedAt: new Date().toISOString(),
      history: [],
    };
  }
  
  const problemProgress = progress.problems[problemId];
  problemProgress.attemptCount += 1;
  problemProgress.lastAttemptedAt = new Date().toISOString();
  problemProgress.history.push(attempt);
  
  // 履歴は最新100件まで保持
  if (problemProgress.history.length > 100) {
    problemProgress.history = problemProgress.history.slice(-100);
  }
  
  saveProgress(progress);
  
  // 今日の学習日を追加
  const today = new Date().toISOString().split('T')[0];
  addStudyDay(today);
}

// メモの更新
export function updateMemo(problemId: string, memo: string): void {
  const progress = getProgress() || initProgress();
  
  if (!progress.problems[problemId]) {
    progress.problems[problemId] = {
      problemId,
      attemptCount: 0,
      lastAttemptedAt: new Date().toISOString(),
      history: [],
    };
  }
  
  progress.problems[problemId].memo = memo;
  saveProgress(progress);
}

// お気に入りのトグル
export function toggleFavorite(problemId: string): void {
  const progress = getProgress() || initProgress();
  
  const index = progress.favorites.indexOf(problemId);
  if (index === -1) {
    progress.favorites.push(problemId);
  } else {
    progress.favorites.splice(index, 1);
  }
  
  saveProgress(progress);
}

// お気に入りかどうか
export function isFavorite(problemId: string): boolean {
  const progress = getProgress();
  if (!progress) return false;
  return progress.favorites.includes(problemId);
}

// 問題の進捗取得
export function getProblemProgress(problemId: string): ProblemProgress | null {
  const progress = getProgress();
  if (!progress) return null;
  return progress.problems[problemId] || null;
}

