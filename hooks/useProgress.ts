import { useState, useEffect, useCallback } from 'react';
import {
  loadProgress,
  saveProgress,
  completeLesson,
  checkStreakStatus,
  getLevelFromXP,
  UserProgress,
  DEFAULT_PROGRESS,
} from '@/utils/storage';
import { COURSES } from '@/data/courses';

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
    async (lessonId: string, courseId: string, xpEarned: number, quizScore: number) => {
      const course = COURSES.find((c) => c.id === courseId);
      const allIds = course?.lessons.map((l) => l.id) ?? [];
      const updated = await completeLesson(lessonId, courseId, xpEarned, quizScore, allIds);
      setProgress(updated);
      return updated;
    },
    []
  );

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
    updateName,
    completeOnboarding,
    isLessonComplete,
    isCourseComplete,
    getCourseProgress,
    streakStatus,
    levelInfo,
  };
}
