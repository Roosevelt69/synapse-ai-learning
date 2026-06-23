import { supabase } from '@/lib/supabase';
import { COURSES } from '@/data/courses';
import { UserProgress, loadProgress, saveProgress } from './storage';

export async function pushProgressUpdate(userId: string, progress: UserProgress): Promise<void> {
  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      total_xp: progress.totalXP,
      current_streak: progress.streak,
      longest_streak: progress.longestStreak,
      last_activity_date: progress.lastActivityDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export async function pushLessonCompletion(
  userId: string,
  lessonId: string,
  courseId: string
): Promise<void> {
  await supabase.from('lesson_completions').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );
}

export async function pushQuizScore(
  userId: string,
  lessonId: string,
  courseId: string,
  score: number,
  total: number,
  xpEarned: number
): Promise<void> {
  await supabase.from('quiz_scores').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      score,
      total,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );
}

export async function pushOnboarding(userId: string, name: string): Promise<void> {
  await Promise.all([
    // UPSERT so it works even if the trigger-created row doesn't exist yet
    supabase.from('profiles').upsert(
      { id: userId, display_name: name, has_onboarded: true },
      { onConflict: 'id' }
    ),
    supabase.from('user_progress').upsert(
      {
        user_id: userId,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    ),
  ]);
}

export async function pullAndMergeProgress(userId: string): Promise<void> {
  try {
    const [profileRes, progressRes, completionsRes, scoresRes] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', userId).single(),
      supabase.from('user_progress').select('*').eq('user_id', userId).single(),
      supabase.from('lesson_completions').select('lesson_id').eq('user_id', userId),
      supabase.from('quiz_scores').select('lesson_id, score, total').eq('user_id', userId),
    ]);

    const local = await loadProgress();

    if (profileRes.data?.display_name) {
      local.name = profileRes.data.display_name;
    }

    if (progressRes.data) {
      const r = progressRes.data;
      local.totalXP = Math.max(local.totalXP, r.total_xp ?? 0);
      local.streak = r.current_streak ?? local.streak;
      local.longestStreak = Math.max(local.longestStreak, r.longest_streak ?? 0);
      if (r.last_activity_date) local.lastActivityDate = r.last_activity_date;
    }

    if (completionsRes.data?.length) {
      const remoteIds = completionsRes.data.map((c: { lesson_id: string }) => c.lesson_id);
      local.completedLessons = [...new Set([...local.completedLessons, ...remoteIds])];

      // Recalculate course completions from merged lesson set
      for (const course of COURSES) {
        const allDone = course.lessons.every((l) => local.completedLessons.includes(l.id));
        if (allDone && !local.completedCourses.includes(course.id)) {
          local.completedCourses.push(course.id);
        }
      }
    }

    if (scoresRes.data?.length) {
      for (const s of scoresRes.data as { lesson_id: string; score: number; total: number }[]) {
        const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
        local.quizScores[s.lesson_id] = Math.max(local.quizScores[s.lesson_id] ?? 0, pct);
      }
    }

    await saveProgress(local);
  } catch {
    // Sync failure is non-fatal; local data is untouched
  }
}
