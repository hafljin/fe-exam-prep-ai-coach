import { Lesson, Problem } from './types';
import fs from 'fs';
import path from 'path';

// 学習コンテンツの読み込み
export async function getLessons(): Promise<Lesson[]> {
  const lessonsDir = path.join(process.cwd(), 'content', 'lessons');
  const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md'));
  
  const lessons: Lesson[] = [];
  
  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // フロントマターからメタデータを抽出
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      const body = frontMatterMatch[2];
      
      const id = file.replace('.md', '');
      const titleMatch = frontMatter.match(/title:\s*(.+)/);
      const phaseMatch = frontMatter.match(/phase:\s*(\d+)/);
      const orderMatch = frontMatter.match(/order:\s*(\d+)/);
      
      lessons.push({
        id,
        title: titleMatch ? titleMatch[1].trim() : id,
        phase: phaseMatch ? parseInt(phaseMatch[1]) : 0,
        order: orderMatch ? parseInt(orderMatch[1]) : 0,
        content: body,
      });
    } else {
      // フロントマターがない場合はファイル名から推測
      const id = file.replace('.md', '');
      lessons.push({
        id,
        title: id,
        phase: 0,
        order: 0,
        content,
      });
    }
  }
  
  return lessons.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.order - b.order;
  });
}

// 学習コンテンツの取得（ID指定）
export async function getLesson(id: string): Promise<Lesson | null> {
  const lessons = await getLessons();
  return lessons.find(l => l.id === id) || null;
}

// 問題データの読み込み
export async function getProblems(): Promise<Problem[]> {
  const problemsPath = path.join(process.cwd(), 'content', 'problems', 'problems.json');
  
  try {
    const data = fs.readFileSync(problemsPath, 'utf-8');
    return JSON.parse(data) as Problem[];
  } catch (error) {
    console.error('Failed to load problems:', error);
    return [];
  }
}

// 問題の取得（ID指定）
export async function getProblem(id: string): Promise<Problem | null> {
  const problems = await getProblems();
  return problems.find(p => p.id === id) || null;
}

// ランダムな問題の取得
export async function getRandomProblem(): Promise<Problem | null> {
  const problems = await getProblems();
  if (problems.length === 0) return null;
  return problems[Math.floor(Math.random() * problems.length)];
}

