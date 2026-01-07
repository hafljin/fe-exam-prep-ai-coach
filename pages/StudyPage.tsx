import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { generateMorningQuestions, generateAfternoonQuestion } from '../services/geminiService';
import { SessionType, MorningTopic, AfternoonTopic, MorningQuestion, AfternoonQuestion, StudyRecord, MORNING_TOPICS, AFTERNOON_TOPICS, Language } from '../types';
import { SESSION_COLORS } from '../constants';
import { CheckCircleIcon, XCircleIcon } from '../components/icons';

type StudyMode = 'quick' | 'topic' | 'review';
type AfternoonStudyMode = 'topic_drill';

const StudyPage: React.FC = () => {
    const { t, progress, language, updateProgress, addStudyHistory, addMistakenQuestion, removeMistakenQuestion, addMistakenAfternoonQuestion } = useAppContext();
    const location = useLocation();
    
    // Common state
    const [sessionType, setSessionType] = useState<SessionType>(location.state?.defaultSession || SessionType.Morning);
    const [isLoading, setIsLoading] = useState(false);
    
    // Morning session state
    const [morningStudyMode, setMorningStudyMode] = useState<StudyMode | null>(null);
    const [selectedMorningTopic, setSelectedMorningTopic] = useState<MorningTopic | null>(null);
    const [questions, setQuestions] = useState<MorningQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    
    // Afternoon session state
    const [afternoonStudyMode, setAfternoonStudyMode] = useState<AfternoonStudyMode | null>(null);
    const [selectedAfternoonTopic, setSelectedAfternoonTopic] = useState<AfternoonTopic | null>(null);
    const [afternoonQuestion, setAfternoonQuestion] = useState<AfternoonQuestion | null>(null);
    const [showAfternoonAnswer, setShowAfternoonAnswer] = useState(false);
    const [isAfternoonFinished, setIsAfternoonFinished] = useState(false);

    const startQuiz = async () => {
        setIsLoading(true);
        if (sessionType === SessionType.Morning) {
            let fetchedQuestions: MorningQuestion[] = [];
            if (morningStudyMode === 'review') {
                fetchedQuestions = progress.mistakenQuestions;
            } else {
                const topic = morningStudyMode === 'quick' ? MORNING_TOPICS[Math.floor(Math.random() * MORNING_TOPICS.length)] : selectedMorningTopic;
                if (topic) {
                    fetchedQuestions = await generateMorningQuestions(topic, 5, language as Language);
                }
            }
            setQuestions(fetchedQuestions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else { // Afternoon session
            if (selectedAfternoonTopic) {
                const fetchedQuestion = await generateAfternoonQuestion(selectedAfternoonTopic, language as Language);
                setAfternoonQuestion(fetchedQuestion);
                setShowAfternoonAnswer(false);
                setIsAfternoonFinished(false);
            }
        }
        setIsLoading(false);
    };
    
    const handleAnswerSubmit = () => {
        if (selectedAnswer === null) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
            if(morningStudyMode === 'review') {
                removeMistakenQuestion(currentQuestion.id);
            }
        } else {
            if(morningStudyMode !== 'review'){
                addMistakenQuestion(currentQuestion);
            }
        }
        setIsAnswered(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            const record: StudyRecord = {
                date: new Date().toISOString().split('T')[0],
                sessionType,
                topic: selectedMorningTopic || 'quick_quiz' as MorningTopic,
                correctCount: score,
                totalCount: questions.length,
            };
            if(morningStudyMode !== 'review') {
                updateProgress(record);
                addStudyHistory(record);
            }
        }
    };
    
    const handleSelfAssessment = (isCorrect: boolean) => {
        if (!afternoonQuestion || !selectedAfternoonTopic) return;
        const record: StudyRecord = {
            date: new Date().toISOString().split('T')[0],
            sessionType: SessionType.Afternoon,
            topic: selectedAfternoonTopic,
            correctCount: isCorrect ? 1 : 0,
            totalCount: 1,
        };
        updateProgress(record);
        addStudyHistory(record);
        if(!isCorrect){
            addMistakenAfternoonQuestion(afternoonQuestion);
        }
        setIsAfternoonFinished(true);
    };

    const resetQuiz = () => {
        // Reset all states
        setQuestions([]);
        setMorningStudyMode(null);
        setSelectedMorningTopic(null);
        setAfternoonStudyMode(null);
        setSelectedAfternoonTopic(null);
        setAfternoonQuestion(null);
        setShowAfternoonAnswer(false);
        setIsAfternoonFinished(false);
    };
    
    if (isLoading) {
        return <div className="text-center p-8">{t('predicting')}</div>;
    }

    // --- Afternoon Quiz View ---
    if (sessionType === SessionType.Afternoon && afternoonQuestion) {
        if (isAfternoonFinished) {
            return (
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4">{t('quiz_results')}</h2>
                    <p className="text-lg mb-6">お疲れ様でした！結果はカレンダーとステータスに記録されました。</p>
                    <button onClick={resetQuiz} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        {t('back_to_study_menu')}
                    </button>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{afternoonQuestion.title}</h3>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    <p dangerouslySetInnerHTML={{ __html: afternoonQuestion.problemStatement.replace(/\n/g, '<br/>') }}></p>
                </div>

                {showAfternoonAnswer ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">{t('model_answer')}</h4>
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 bg-blue-50 dark:bg-blue-900/50 rounded-md border border-blue-200 dark:border-blue-800">
                                <p dangerouslySetInnerHTML={{ __html: afternoonQuestion.modelAnswer.replace(/\n/g, '<br/>') }}></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">{t('explanation')}</h4>
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                               <p dangerouslySetInnerHTML={{ __html: afternoonQuestion.explanation.replace(/\n/g, '<br/>') }}></p>
                            </div>
                        </div>
                        <div className="text-center space-y-2 pt-4">
                            <p className="font-semibold">自己採点の結果はどうでしたか？</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => handleSelfAssessment(true)} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" /> {t('correct')}
                                </button>
                                <button onClick={() => handleSelfAssessment(false)} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                                    <XCircleIcon className="w-5 h-5" /> {t('incorrect')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowAfternoonAnswer(true)} className="w-full mt-4 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        模範解答と解説を見る
                    </button>
                )}
            </div>
        );
    }

    // --- Morning Quiz View ---
    if (sessionType === SessionType.Morning && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const isQuizFinished = isAnswered && currentQuestionIndex === questions.length - 1;

        if (isQuizFinished && isAnswered) {
             return (
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4">{t('quiz_results')}</h2>
                    <p className="text-4xl font-bold mb-2">
                        {score} / {questions.length}
                    </p>
                    <p className={`text-lg font-semibold ${score/questions.length > 0.7 ? 'text-green-500' : 'text-red-500'}`}>{t('score')}: {((score/questions.length)*100).toFixed(0)}%</p>
                    <button onClick={resetQuiz} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        {t('back_to_study_menu')}
                    </button>
                </div>
            );
        }

        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{`${t('question')} ${currentQuestionIndex + 1}/${questions.length}`}</h3>
                    <div className={`${SESSION_COLORS.morningText} font-bold`}>{t('morning_session')}</div>
                </div>
                <p className="mb-6 text-gray-800 dark:text-gray-200">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-colors ';
                        if (isAnswered) {
                            if (isCorrect) buttonClass += 'bg-green-100 dark:bg-green-900 border-green-500';
                            else if (isSelected) buttonClass += 'bg-red-100 dark:bg-red-900 border-red-500';
                            else buttonClass += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
                        } else {
                            if (isSelected) buttonClass += 'bg-blue-100 dark:bg-blue-900 border-blue-500';
                            else buttonClass += 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900';
                        }
                        return <button key={index} onClick={() => !isAnswered && setSelectedAnswer(option)} disabled={isAnswered} className={buttonClass}>{option}</button>;
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center mb-2">
                             {selectedAnswer === currentQuestion.correctAnswer ? <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" /> : <XCircleIcon className="w-6 h-6 text-red-500 mr-2" />}
                            <h4 className="font-bold text-lg">{selectedAnswer === currentQuestion.correctAnswer ? t('correct') : t('incorrect')}</h4>
                        </div>
                        {selectedAnswer !== currentQuestion.correctAnswer && <p className="mb-2 text-sm">{t('correct_answer_is', {answer: currentQuestion.correctAnswer})}</p>}
                        <p className="text-sm text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                    </div>
                )}

                <button onClick={isAnswered ? handleNextQuestion : handleAnswerSubmit} disabled={!isAnswered && selectedAnswer === null} className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    {isAnswered ? (isQuizFinished ? t('quiz_results') : t('next')) : t('submit')}
                </button>
            </div>
        );
    }

    // --- Menu View ---
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">{t('select_study_mode')}</h2>
            
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button onClick={() => { resetQuiz(); setSessionType(SessionType.Morning); }} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${sessionType === SessionType.Morning ? 'bg-blue-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('morning_session')}</button>
                <button onClick={() => { resetQuiz(); setSessionType(SessionType.Afternoon); }} className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${sessionType === SessionType.Afternoon ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('afternoon_session')}</button>
            </div>
            
            {sessionType === SessionType.Morning && (
                morningStudyMode === null ? (
                     <div className="space-y-4">
                         <button onClick={() => setMorningStudyMode('quick')} className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-semibold">{t('quick_quiz')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">5 questions from a random topic.</p>
                         </button>
                         <button onClick={() => setMorningStudyMode('topic')} className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-semibold">{t('topic_quiz')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Focus on a specific area.</p>
                         </button>
                         {progress.mistakenQuestions.length > 0 && (
                            <button onClick={() => setMorningStudyMode('review')} className="w-full text-left p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('review_mistakes')}</h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">{progress.mistakenQuestions.length} questions to review.</p>
                            </button>
                         )}
                     </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {morningStudyMode === 'topic' && (
                             <>
                                <h3 className="font-semibold mb-3">{t('select_topic')}</h3>
                                <select value={selectedMorningTopic || ''} onChange={(e) => setSelectedMorningTopic(e.target.value as MorningTopic)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md">
                                    <option value="" disabled>{t('select_topic')}</option>
                                    {MORNING_TOPICS.map(topic => <option key={topic} value={topic}>{t(topic)}</option>)}
                                </select>
                             </>
                        )}
                        <button onClick={startQuiz} disabled={morningStudyMode === 'topic' && !selectedMorningTopic} className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {t('start_quiz')}
                        </button>
                        <button onClick={() => setMorningStudyMode(null)} className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400">Back</button>
                    </div>
                )
            )}

            {sessionType === SessionType.Afternoon && (
                afternoonStudyMode === null ? (
                    <div className="space-y-4">
                        <button onClick={() => setAfternoonStudyMode('topic_drill')} className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                           <h3 className="font-semibold">分野別演習</h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400">特定の分野の長文問題を解きます。</p>
                        </button>
                        {/* Mock exam coming soon */}
                    </div>
                ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-3">{t('select_topic')}</h3>
                        <select value={selectedAfternoonTopic || ''} onChange={(e) => setSelectedAfternoonTopic(e.target.value as AfternoonTopic)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md">
                            <option value="" disabled>{t('select_topic')}</option>
                            {AFTERNOON_TOPICS.map(topic => <option key={topic} value={topic}>{t(topic)}</option>)}
                        </select>
                        <button onClick={startQuiz} disabled={!selectedAfternoonTopic} className="w-full mt-4 py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-400">
                            演習開始
                        </button>
                        <button onClick={() => setAfternoonStudyMode(null)} className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400">Back</button>
                    </div>
                )
            )}
        </div>
    );
};

export default StudyPage;