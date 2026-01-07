// Lesson（学習コンテンツ）
export interface Lesson {
  id: string;
  title: string;
  phase: number;
  order: number;
  content: string; // Markdown形式
}

// Problem（問題）
export interface Problem {
  id: string;
  title?: string;
  chartImage?: string;
  flow: {
    line: {
      question: string;
      correctAnswer: 'yes' | 'no';
    };
    nowcast: {
      question: string;
      options: string[];
      correctAnswer: string;
    };
    scenario: {
      question: string;
      correctAnswer: 'yes' | 'no';
    };
    timing: {
      question: string;
      correctAnswer: 'yes' | 'no';
    };
    conclusion: {
      question: string;
      correctAnswer: 'entry' | 'skip';
    };
  };
  explanation: {
    line?: string;
    nowcast?: string;
    scenario?: string;
    timing?: string;
    conclusion?: string;
    overall?: string;
  };
}

// Progress（進捗データ）
export interface Attempt {
  timestamp: string; // ISO 8601形式
  answers: {
    line: 'yes' | 'no';
    nowcast: string;
    scenario: 'yes' | 'no';
    timing: 'yes' | 'no';
    conclusion: 'entry' | 'skip';
  };
}

export interface ProblemProgress {
  problemId: string;
  attemptCount: number;
  lastAttemptedAt: string; // ISO 8601形式
  history: Attempt[];
  memo?: string;
}

export interface UserProgress {
  version: string;
  problems: Record<string, ProblemProgress>;
  studyDays: string[]; // YYYY-MM-DD形式
  favorites: string[];
}

