
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getAIPassProbability } from '../services/geminiService';
import { AIPassProbability, TopicProgress, Language } from '../types';
import { BrainCircuitIcon } from '../components/icons';

const getTopicStats = (progress: Record<string, TopicProgress>) => {
    return Object.entries(progress)
        .filter(([, data]) => data.total > 0)
        .map(([topic, data]) => ({
            topic,
            accuracy: (data.correct / data.total) * 100,
            total: data.total
        }))
        .sort((a, b) => a.accuracy - b.accuracy);
};

const TopicList: React.FC<{ title: string, topics: {topic: string, accuracy: number}[] }> = ({ title, topics }) => {
    const { t } = useAppContext();
    if (topics.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <ul className="space-y-2">
                {topics.map(({topic, accuracy}) => (
                    <li key={topic} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                        <span>{t(topic)}</span>
                        <span className="font-bold">{accuracy.toFixed(0)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const StatusPage: React.FC = () => {
    const { t, progress, language } = useAppContext();
    const [aiResult, setAiResult] = useState<AIPassProbability | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const topicStats = useMemo(() => getTopicStats({ ...progress.morning, ...progress.afternoon }), [progress]);
    const weakAreas = topicStats.filter(t => t.accuracy < 70).slice(0, 5);
    const strongAreas = [...topicStats].reverse().filter(t => t.accuracy >= 70).slice(0, 5);

    const handleGetPrediction = async () => {
        setIsLoading(true);
        const result = await getAIPassProbability(progress, language as Language);
        setAiResult(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">{t('my_status')}</h2>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4">
                <TopicList title={t('weak_areas')} topics={weakAreas} />
                <TopicList title={t('strong_areas')} topics={strongAreas} />
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center">
                <div className="flex justify-center items-center mb-4">
                    <BrainCircuitIcon className="w-8 h-8 mr-3 text-blue-500"/>
                    <h3 className="text-lg font-semibold">{t('pass_probability')}</h3>
                </div>
                {isLoading ? (
                    <p>{t('predicting')}</p>
                ) : aiResult ? (
                    <div className="space-y-4 text-left">
                        <div className="text-center">
                             <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">{aiResult.probability}<span className="text-2xl">%</span></div>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Reasoning:</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{aiResult.reasoning}</p>
                        </div>
                         <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Advice:</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{aiResult.advice}</p>
                        </div>
                        <button 
                            onClick={handleGetPrediction} 
                            className="w-full mt-4 py-2 px-4 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                        >
                            {t('get_prediction')}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleGetPrediction} 
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('get_prediction')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatusPage;
