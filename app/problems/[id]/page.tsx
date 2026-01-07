'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Problem } from '@/lib/types';
import { addAttempt, toggleFavorite, isFavorite, getProblemProgress } from '@/lib/storage';
import { Attempt } from '@/lib/types';
import SimpleChart from '@/components/SimpleChart';

type Step = 'line' | 'nowcast' | 'scenario' | 'timing' | 'conclusion' | 'explanation';

export default function ProblemPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('line');
  const [answers, setAnswers] = useState<Partial<Attempt['answers']>>({});
  const [favorite, setFavorite] = useState(false);
  const [problemId, setProblemId] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        // paramsがPromiseの場合は解決
        const resolvedParams = params instanceof Promise ? await params : params;
        const id = resolvedParams.id;
        setProblemId(id);
        
        const res = await fetch(`/api/problems/${id}`);
        const data = await res.json();
        setProblem(data);
        setFavorite(isFavorite(id));
      } catch (error) {
        console.error('Failed to load problem:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params]);

  const handleAnswer = (step: Step, value: string) => {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);
    
    const steps: Step[] = ['line', 'nowcast', 'scenario', 'timing', 'conclusion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      setCurrentStep('explanation');
      // 回答を保存（すべての回答が揃った時点で）
      const attempt: Attempt = {
        timestamp: new Date().toISOString(),
        answers: {
          line: (newAnswers.line || value) as 'yes' | 'no',
          nowcast: (newAnswers.nowcast || value) as string,
          scenario: (newAnswers.scenario || value) as 'yes' | 'no',
          timing: (newAnswers.timing || value) as 'yes' | 'no',
          conclusion: (newAnswers.conclusion || value) as 'entry' | 'skip',
        },
      };
      if (problemId) {
        addAttempt(problemId, attempt);
      }
    }
  };

  const handleFavorite = () => {
    if (problemId) {
      toggleFavorite(problemId);
      setFavorite(!favorite);
    }
  };

  const handleNext = () => {
    router.push('/problems');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">問題が見つかりません</div>
      </div>
    );
  }

  const progress = problemId ? getProblemProgress(problemId) : null;
  const attemptCount = progress?.attemptCount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/problems"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← 問題一覧に戻る
          </Link>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {problem.title || problem.id}
            </h1>
            <button
              onClick={handleFavorite}
              className={`text-2xl ${favorite ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </button>
          </div>
          {progress && (
            <p className="text-sm text-gray-500 mt-2">
              解いた回数: {attemptCount}回
            </p>
          )}
        </div>

        {/* チャート表示 */}
        <div className="mb-6">
          {problem.chartImage ? (
            <img
              src={problem.chartImage}
              alt="チャート"
              className="w-full rounded-lg shadow-md"
            />
          ) : (
            <SimpleChart data={problem.chartData} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {currentStep === 'line' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {problem.flow.line.question}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer('line', 'yes')}
                  className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('line', 'no')}
                  className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {currentStep === 'nowcast' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {problem.flow.nowcast.question}
              </h2>
              <div className="space-y-3">
                {problem.flow.nowcast.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer('nowcast', option)}
                    className="w-full p-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'scenario' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {problem.flow.scenario.question}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer('scenario', 'yes')}
                  className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('scenario', 'no')}
                  className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {currentStep === 'timing' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {problem.flow.timing.question}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer('timing', 'yes')}
                  className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('timing', 'no')}
                  className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {currentStep === 'conclusion' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {problem.flow.conclusion.question}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer('conclusion', 'entry')}
                  className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Entry
                </button>
                <button
                  onClick={() => handleAnswer('conclusion', 'skip')}
                  className="w-full p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {currentStep === 'explanation' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">解説</h2>
              <div className="space-y-4 text-sm">
                {problem.explanation.line && (
                  <div>
                    <h3 className="font-semibold mb-1">ライン判断</h3>
                    <p className="text-gray-700">{problem.explanation.line}</p>
                  </div>
                )}
                {problem.explanation.nowcast && (
                  <div>
                    <h3 className="font-semibold mb-1">ナウキャスト判断</h3>
                    <p className="text-gray-700">{problem.explanation.nowcast}</p>
                  </div>
                )}
                {problem.explanation.scenario && (
                  <div>
                    <h3 className="font-semibold mb-1">シナリオ判断</h3>
                    <p className="text-gray-700">{problem.explanation.scenario}</p>
                  </div>
                )}
                {problem.explanation.timing && (
                  <div>
                    <h3 className="font-semibold mb-1">タイミング判断</h3>
                    <p className="text-gray-700">{problem.explanation.timing}</p>
                  </div>
                )}
                {problem.explanation.conclusion && (
                  <div>
                    <h3 className="font-semibold mb-1">結論</h3>
                    <p className="text-gray-700">{problem.explanation.conclusion}</p>
                  </div>
                )}
                {problem.explanation.overall && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-1">全体の解説</h3>
                    <p className="text-gray-700">{problem.explanation.overall}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleNext}
                className="w-full mt-6 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                次の問題へ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

