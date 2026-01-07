import Link from 'next/link';
import { getLesson, getLessons } from '@/lib/content';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const lessons = await getLessons();
  return lessons.map((lesson) => ({
    id: lesson.id,
  }));
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const lesson = await getLesson(resolvedParams.id);
  const lessons = await getLessons();

  if (!lesson) {
    notFound();
  }

  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/lessons"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← 学習一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {lesson.title}
          </h1>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>

        <div className="flex space-x-2">
          {prevLesson ? (
            <Link
              href={`/lessons/${prevLesson.id}`}
              className="flex-1 text-center py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← 前へ
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextLesson ? (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="flex-1 text-center py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              次へ →
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}

