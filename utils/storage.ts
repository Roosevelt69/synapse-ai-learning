import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProgress {
  name: string;
  totalXP: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  completedLessons: string[];
  completedCourses: string[];
  quizScores: Record<string, number>;
  hasOnboarded: boolean;
  notificationsEnabled: boolean;
}

const KEYS = {
  PROGRESS: '@synapse:progress',
} as const;

export const DEFAULT_PROGRESS: UserProgress = {
  name: 'Learner',
  totalXP: 0,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  completedLessons: [],
  completedCourses: [],
  quizScores: {},
  hasOnboarded: false,
  notificationsEnabled: false,
};

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export async function completeLesson(
  lessonId: string,
  courseId: string,
  xpEarned: number,
  quizScore: number,
  allCourseLessonIds: string[]
): Promise<UserProgress> {
  const progress = await loadProgress();
  const today = new Date().toISOString().split('T')[0];

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons = [...progress.completedLessons, lessonId];
    progress.totalXP += xpEarned;
  }

  progress.quizScores[lessonId] = Math.max(progress.quizScores[lessonId] ?? 0, quizScore);

  const allDone = allCourseLessonIds.every((id) => progress.completedLessons.includes(id));
  if (allDone && !progress.completedCourses.includes(courseId)) {
    progress.completedCourses = [...progress.completedCourses, courseId];
  }

  const last = progress.lastActivityDate;
  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    if (last === yStr) {
      progress.streak += 1;
    } else if (last === null) {
      progress.streak = 1;
    } else {
      progress.streak = 1;
    }
    progress.longestStreak = Math.max(progress.longestStreak, progress.streak);
    progress.lastActivityDate = today;
  }

  await saveProgress(progress);
  return progress;
}

export function checkStreakStatus(progress: UserProgress): 'active' | 'at_risk' | 'broken' | 'new' {
  if (!progress.lastActivityDate) return 'new';
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  if (progress.lastActivityDate === today) return 'active';
  if (progress.lastActivityDate === yStr) return 'at_risk';
  return 'broken';
}

export function getLevelFromXP(xp: number): { level: number; label: string; nextXP: number; currentXP: number } {
  const thresholds = [0, 200, 500, 1000, 1800, 2800, 4200, 6000, 8500, 12000];
  const labels = ['Novice', 'Explorer', 'Learner', 'Thinker', 'Analyst', 'Engineer', 'Architect', 'Expert', 'Master', 'Visionary'];

  let level = 0;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i]) level = i;
    else break;
  }
  level = Math.min(level, thresholds.length - 2);

  return {
    level: level + 1,
    label: labels[level],
    currentXP: xp - thresholds[level],
    nextXP: thresholds[level + 1] - thresholds[level],
  };
}
