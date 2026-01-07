
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../hooks/useAppContext';
import { SESSION_COLORS } from '../constants';
import { SessionType, TopicProgress } from '../types';

const calculateOverallProgress = (progress: Record<string, TopicProgress>): number => {
    const totalCorrect = Object.values(progress).reduce((sum, topic) => sum + topic.correct, 0);
    const totalAttempted = Object.values(progress).reduce((sum, topic) => sum + topic.total, 0);
    return totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
};

const HomePage: React.FC = () => {
  const { t, progress } = useAppContext();
  const navigate = useNavigate();

  const morningProgress = calculateOverallProgress(progress.morning);
  const afternoonProgress = calculateOverallProgress(progress.afternoon);

  const navigateToStudy = (session: SessionType) => {
    navigate('/study', { state: { defaultSession: session } });
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('welcome')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('todays_task')}</p>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-4">{t('overall_progress')}</h3>
        <ProgressBar label={t('morning_session')} value={morningProgress} colorClass={SESSION_COLORS.morning} />
        <ProgressBar label={t('afternoon_session')} value={afternoonProgress} colorClass={SESSION_COLORS.afternoon} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigateToStudy(SessionType.Morning)}
          className={`w-full p-6 text-left rounded-xl shadow-md transition-transform transform hover:scale-105 ${SESSION_COLORS.morning} text-white`}
        >
          <h4 className="text-xl font-bold">{t('morning_session')}</h4>
          <p className="mt-1">{t('start_morning_session')}</p>
        </button>
        <button
          onClick={() => navigateToStudy(SessionType.Afternoon)}
          className={`w-full p-6 text-left rounded-xl shadow-md transition-transform transform hover:scale-105 ${SESSION_COLORS.afternoon} text-white`}
        >
          <h4 className="text-xl font-bold">{t('afternoon_session')}</h4>
          <p className="mt-1">{t('start_afternoon_session')}</p>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
