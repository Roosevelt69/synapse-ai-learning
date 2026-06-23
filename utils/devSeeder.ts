import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DEFAULT_PROGRESS } from './storage';
import { COURSES } from '@/data/courses';

const STORAGE_KEY = '@synapse:progress';

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

async function writeProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Fresh onboarded user — no lessons completed
export async function seedFreshUser(): Promise<void> {
  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
  });
}

// Active streak: last activity = today, streak = N days
export async function seedStreakActive(streakDays: number): Promise<void> {
  const course = COURSES[0];
  const lessons = course.lessons.slice(0, Math.min(2, course.lessons.length));
  const lessonIds = lessons.map((l) => l.id);
  const xp = lessons.reduce((sum, l) => sum + l.xpReward, 0);

  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: streakDays,
    longestStreak: streakDays,
    lastActivityDate: dateOffset(0),
    completedLessons: lessonIds,
    totalXP: xp,
    quizScores: Object.fromEntries(lessonIds.map((id) => [id, 75])),
  });
}

// At-risk streak: last activity = yesterday, streak = N days
// checkStreakStatus returns 'at_risk' — user must complete a lesson today
export async function seedStreakAtRisk(streakDays: number): Promise<void> {
  const course = COURSES[0];
  const lessons = course.lessons.slice(0, Math.min(2, course.lessons.length));
  const lessonIds = lessons.map((l) => l.id);
  const xp = lessons.reduce((sum, l) => sum + l.xpReward, 0);

  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: streakDays,
    longestStreak: Math.max(streakDays, streakDays + 2),
    lastActivityDate: dateOffset(1),
    completedLessons: lessonIds,
    totalXP: xp,
    quizScores: Object.fromEntries(lessonIds.map((id) => [id, 75])),
  });
}

// Broken streak: last activity = 3+ days ago, streak resets to 0
// checkStreakStatus returns 'broken'
export async function seedStreakBroken(): Promise<void> {
  const firstLesson = COURSES[0].lessons[0];
  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: 0,
    longestStreak: 7,
    lastActivityDate: dateOffset(3),
    completedLessons: [firstLesson.id],
    totalXP: firstLesson.xpReward,
    quizScores: { [firstLesson.id]: 75 },
  });
}

// All lessons in a single course completed
export async function seedCompletedCourse(courseId: string): Promise<void> {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return;
  const lessonIds = course.lessons.map((l) => l.id);
  const xp = course.lessons.reduce((sum, l) => sum + l.xpReward, 0);

  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: 4,
    longestStreak: 4,
    lastActivityDate: dateOffset(0),
    completedLessons: lessonIds,
    completedCourses: [courseId],
    totalXP: xp,
    quizScores: Object.fromEntries(lessonIds.map((id) => [id, 100])),
  });
}

// Two full courses + partial third — high XP, long active streak
export async function seedFullProgress(): Promise<void> {
  const finished = COURSES.slice(0, 2);
  const finishedLessons = finished.flatMap((c) => c.lessons.map((l) => l.id));
  const finishedXP = finished.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.xpReward, 0),
    0
  );

  const partial = COURSES[2];
  const partialLessons = partial
    ? partial.lessons.slice(0, 2).map((l) => l.id)
    : [];
  const partialXP = partial
    ? partial.lessons.slice(0, 2).reduce((s, l) => s + l.xpReward, 0)
    : 0;

  const allLessons = [...finishedLessons, ...partialLessons];

  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: 12,
    longestStreak: 14,
    lastActivityDate: dateOffset(0),
    completedLessons: allLessons,
    completedCourses: finished.map((c) => c.id),
    totalXP: finishedXP + partialXP,
    quizScores: Object.fromEntries(allLessons.map((id) => [id, 88])),
  });
}

// Seed consecutive-day completions to verify streak counting logic
// Writes lastActivityDate = today but streak = 1 so next lesson triggers increment
export async function seedReadyForStreak(): Promise<void> {
  const lesson = COURSES[0].lessons[0];
  await writeProgress({
    ...DEFAULT_PROGRESS,
    name: 'Test User',
    hasOnboarded: true,
    streak: 1,
    longestStreak: 1,
    lastActivityDate: dateOffset(1), // yesterday — so next completion increments to 2
    completedLessons: [lesson.id],
    totalXP: lesson.xpReward,
    quizScores: { [lesson.id]: 100 },
  });
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
