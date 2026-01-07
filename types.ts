export enum Language {
  JA = 'ja',
  EN = 'en',
}

export enum SessionType {
  Morning = 'morning',
  Afternoon = 'afternoon',
}

export const MORNING_TOPICS = ['foundations', 'architecture', 'network', 'security', 'database', 'management', 'strategy'] as const;
export type MorningTopic = typeof MORNING_TOPICS[number];

export const AFTERNOON_TOPICS = ['programming', 'database', 'network', 'security', 'design', 'management'] as const;
export type AfternoonTopic = typeof AFTERNOON_TOPICS[number];

export interface MorningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AfternoonQuestion {
  id: string;
  title: string;
  problemStatement: string; // Can be markdown
  modelAnswer: string;
  explanation: string;
}

export interface StudyRecord {
  date: string; // YYYY-MM-DD
  sessionType: SessionType;
  topic: MorningTopic | AfternoonTopic;
  correctCount: number;
  totalCount: number;
}

export type TopicProgress = { correct: number; total: number };

export interface UserProgress {
  morning: Record<MorningTopic, TopicProgress>;
  afternoon: Record<AfternoonTopic, TopicProgress>;
  mistakenQuestions: MorningQuestion[];
  mistakenAfternoonQuestions: AfternoonQuestion[];
}

export interface AIPassProbability {
  probability: number;
  reasoning: string;
  advice: string;
}