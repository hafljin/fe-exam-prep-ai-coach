import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from './useLocalStorage';
import { Language, UserProgress, StudyRecord, MORNING_TOPICS, AFTERNOON_TOPICS, MorningQuestion, AfternoonQuestion } from '../types';
import { translations } from '../constants';

const initialProgress: UserProgress = {
  morning: MORNING_TOPICS.reduce((acc, topic) => ({ ...acc, [topic]: { correct: 0, total: 0 } }), {} as UserProgress['morning']),
  afternoon: AFTERNOON_TOPICS.reduce((acc, topic) => ({ ...acc, [topic]: { correct: 0, total: 0 } }), {} as UserProgress['afternoon']),
  mistakenQuestions: [],
  mistakenAfternoonQuestions: [],
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  progress: UserProgress;
  updateProgress: (record: StudyRecord) => void;
  addMistakenQuestion: (question: MorningQuestion) => void;
  removeMistakenQuestion: (questionId: string) => void;
  addMistakenAfternoonQuestion: (question: AfternoonQuestion) => void;
  removeMistakenAfternoonQuestion: (questionId: string) => void;
  studyHistory: StudyRecord[];
  addStudyHistory: (record: StudyRecord) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('fe-prep-lang', Language.JA);
  const [progress, setProgress] = useLocalStorage<UserProgress>('fe-prep-progress', initialProgress);
  const [studyHistory, setStudyHistory] = useLocalStorage<StudyRecord[]>('fe-prep-history', []);

  const t = (key: string, params: Record<string, string> = {}) => {
    let translation = translations[language][key] || key;
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translation = translation.replace(`{{${paramKey}}}`, paramValue);
    });
    return translation;
  };

  const updateProgress = (record: StudyRecord) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      const session = newProgress[record.sessionType];
      const topicProgress = session[record.topic];

      topicProgress.correct += record.correctCount;
      topicProgress.total += record.totalCount;

      return newProgress;
    });
  };
  
  const addStudyHistory = (record: StudyRecord) => {
      setStudyHistory(prev => [...prev, record]);
  }
  
  const addMistakenQuestion = (question: MorningQuestion) => {
    setProgress(prev => {
      if (prev.mistakenQuestions.some(q => q.id === question.id)) {
        return prev;
      }
      return { ...prev, mistakenQuestions: [...prev.mistakenQuestions, question] };
    });
  };
  
  const removeMistakenQuestion = (questionId: string) => {
      setProgress(prev => ({
          ...prev,
          mistakenQuestions: prev.mistakenQuestions.filter(q => q.id !== questionId)
      }));
  }
  
  const addMistakenAfternoonQuestion = (question: AfternoonQuestion) => {
    setProgress(prev => {
      if (prev.mistakenAfternoonQuestions.some(q => q.id === question.id)) {
        return prev;
      }
      return { ...prev, mistakenAfternoonQuestions: [...prev.mistakenAfternoonQuestions, question] };
    });
  };

  const removeMistakenAfternoonQuestion = (questionId: string) => {
      setProgress(prev => ({
          ...prev,
          mistakenAfternoonQuestions: prev.mistakenAfternoonQuestions.filter(q => q.id !== questionId)
      }));
  }

  const value = { language, setLanguage, t, progress, updateProgress, studyHistory, addStudyHistory, addMistakenQuestion, removeMistakenQuestion, addMistakenAfternoonQuestion, removeMistakenAfternoonQuestion };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};