import { COURSES, QuizQuestion } from '@/data/courses';
import { loadProgress } from './storage';

export interface PracticeQuestion extends QuizQuestion {
  lessonId: string;
  courseId: string;
  courseEmoji: string;
  courseTitle: string;
}

export async function generatePracticeSession(count = 5): Promise<PracticeQuestion[]> {
  const progress = await loadProgress();
  const completed = new Set(progress.completedLessons);

  const pool: PracticeQuestion[] = [];
  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      if (completed.has(lesson.id)) {
        for (const q of lesson.quiz) {
          pool.push({
            ...q,
            lessonId: lesson.id,
            courseId: course.id,
            courseEmoji: course.emoji,
            courseTitle: course.title,
          });
        }
      }
    }
  }

  // Fisher-Yates shuffle for fair randomness
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

export function countAvailableQuestions(completedLessons: string[]): number {
  const completed = new Set(completedLessons);
  let count = 0;
  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      if (completed.has(lesson.id)) {
        count += lesson.quiz.length;
      }
    }
  }
  return count;
}
