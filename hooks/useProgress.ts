import { useState, useEffect, useCallback } from 'react';
import {
  loadProgress,
  saveProgress,
  completeLesson,
  checkStreakStatus,
  getLevelFromXP,
  awardPracticeXP,
  buyStreakFreeze as storeBuyFreeze,
  UserProgress,
  DEFAULT_PROGRESS,
} from '@/utils/storage';
import {
  pushProgressUpdate,
  pushLessonCompletion,
  pushQuizScore,
  pushOnboarding,
} from '@/utils/sync';
import { supabase } from '@/lib/supabase';
import { COURSES } from '@/data/courses';

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress().then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const p = await loadProgress();
    setProgress(p);
    return p;
  }, []);

  const finishLesson = useCallback(
    async (lessonId: string, courseId: string, xpEarned: number, score: number, total: number) => {
      const course = COURSES.find((c) => c.id === courseId);
      const allIds = course?.lessons.map((l) => l.id) ?? [];
      const quizScore = total > 0 ? Math.round((score / total) * 100) : 0;
      const updated = await completeLesson(lessonId, courseId, xpEarned, quizScore, allIds);
      setProgress(updated);

      getCurrentUserId().then((userId) => {
        if (!userId) return;
        Promise.all([
          pushProgressUpdate(userId, updated),
          pushLessonCompletion(userId, lessonId, courseId),
          pushQuizScore(userId, lessonId, courseId, score, total, xpEarned),
        ]).catch(() => {});
      });

      return updated;
    },
    []
  );

  const awardPractice = useCallback(async (xp: number) => {
    const updated = await awardPracticeXP(xp);
    setProgress(updated);

    getCurrentUserId().then((userId) => {
      if (!userId) return;
      pushProgressUpdate(userId, updated).catch(() => {});
    });

    return updated;
  }, []);

  const buyFreeze = useCallback(async (cost: number): Promise<boolean> => {
    const updated = await storeBuyFreeze(cost);
    if (!updated) return false;
    setProgress(updated);
    return true;
  }, []);

  const updateName = useCallback(async (name: string) => {
    const p = await loadProgress();
    p.name = name;
    await saveProgress(p);
    setProgress(p);
  }, []);

  const completeOnboarding = useCallback(
    async (name: string, notificationsEnabled: boolean) => {
      const p = await loadProgress();
      p.name = name;
      p.hasOnboarded = true;
      p.notificationsEnabled = notificationsEnabled;
      await saveProgress(p);
      setProgress(p);

      const userId = await getCurrentUserId();
      if (userId) {
        await pushOnboarding(userId, name).catch(() => {});
      }
    },
    []
  );

  const isLessonComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons]
  );

  const isCourseComplete = useCallback(
    (courseId: string) => progress.completedCourses.includes(courseId),
    [progress.completedCourses]
  );

  const getCourseProgress = useCallback(
    (courseId: string): number => {
      const course = COURSES.find((c) => c.id === courseId);
      if (!course) return 0;
      const done = course.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
      return done / course.lessons.length;
    },
    [progress.completedLessons]
  );

  const streakStatus = checkStreakStatus(progress);
  const levelInfo = getLevelFromXP(progress.totalXP);

  return {
    progress,
    loading,
    refresh,
    finishLesson,
    awardPractice,
    buyFreeze,
    updateName,
    completeOnboarding,
    isLessonComplete,
    isCourseComplete,
    getCourseProgress,
    streakStatus,
    levelInfo,
  };
}
