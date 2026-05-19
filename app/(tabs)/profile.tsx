import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useProgress } from '@/hooks/useProgress';
import { COURSES } from '@/data/courses';
import ProgressBar from '@/components/ProgressBar';
import StreakBadge from '@/components/StreakBadge';

interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
  color: string;
}

function StatCard({ label, value, emoji, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface BadgeProps {
  emoji: string;
  label: string;
  earned: boolean;
}

function Badge({ emoji, label, earned }: BadgeProps) {
  return (
    <View style={[styles.badge, !earned && styles.badgeLocked]}>
      <Text style={{ fontSize: 28, opacity: earned ? 1 : 0.3 }}>{emoji}</Text>
      <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { progress, refresh, levelInfo, getCourseProgress, isCourseComplete, streakStatus } = useProgress();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const completedLessonsCount = progress.completedLessons.length;
  const completedCoursesCount = progress.completedCourses.length;

  const badges = [
    { emoji: '🚀', label: 'First Lesson', earned: completedLessonsCount >= 1 },
    { emoji: '🔥', label: '3-Day Streak', earned: progress.longestStreak >= 3 },
    { emoji: '🏆', label: 'Week Warrior', earned: progress.longestStreak >= 7 },
    { emoji: '⚡', label: '500 XP', earned: progress.totalXP >= 500 },
    { emoji: '🎓', label: 'Grad', earned: completedCoursesCount >= 1 },
    { emoji: '🧠', label: 'AI Thinker', earned: isCourseComplete('ai-intro') },
    { emoji: '✨', label: 'Prompter', earned: isCourseComplete('prompt-eng') },
    { emoji: '🤖', label: 'Agent Builder', earned: isCourseComplete('ai-agents') },
  ];

  const levelPct = levelInfo.nextXP > 0 ? levelInfo.currentXP / levelInfo.nextXP : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name */}
        <LinearGradient
          colors={[...Gradients.primary]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {progress.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{progress.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {levelInfo.level} · {levelInfo.label}</Text>
          </View>
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>XP Progress</Text>
              <Text style={styles.xpNumbers}>{levelInfo.currentXP} / {levelInfo.nextXP}</Text>
            </View>
            <ProgressBar
              progress={levelPct}
              height={8}
              color="rgba(255,255,255,0.95)"
              backgroundColor="rgba(255,255,255,0.25)"
            />
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            emoji="⚡"
            label="Total XP"
            value={progress.totalXP.toLocaleString()}
            color={Colors.xp}
          />
          <StatCard
            emoji="🔥"
            label="Current Streak"
            value={`${progress.streak}d`}
            color={Colors.streak}
          />
          <StatCard
            emoji="🏅"
            label="Best Streak"
            value={`${progress.longestStreak}d`}
            color={Colors.primaryLight}
          />
          <StatCard
            emoji="📚"
            label="Lessons Done"
            value={completedLessonsCount}
            color={Colors.success}
          />
        </View>

        {/* Streak Status */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <StreakBadge streak={progress.streak} size="md" pulse={streakStatus === 'at_risk'} />
            <View style={styles.streakMeta}>
              <Text style={styles.streakMetaTitle}>
                {streakStatus === 'active'
                  ? "Today's lesson done ✅"
                  : streakStatus === 'at_risk'
                  ? "Complete a lesson tonight 🕐"
                  : streakStatus === 'new'
                  ? "Start your streak today!"
                  : "Streak reset — start again 💪"}
              </Text>
              <Text style={styles.streakMetaSub}>
                Longest streak: {progress.longestStreak} days
              </Text>
            </View>
          </View>
        </View>

        {/* Course Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Progress</Text>
          {COURSES.map((course) => {
            const prog = getCourseProgress(course.id);
            const done = isCourseComplete(course.id);
            const started = prog > 0;
            return (
              <View key={course.id} style={styles.courseProgressCard}>
                <View style={styles.courseProgressRow}>
                  <View style={[styles.courseEmoji, { backgroundColor: course.gradient[0] + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{course.emoji}</Text>
                  </View>
                  <View style={styles.courseProgressText}>
                    <View style={styles.courseProgressHeader}>
                      <Text style={styles.courseProgressTitle}>{course.title}</Text>
                      {done && (
                        <View style={styles.doneTag}>
                          <Text style={styles.doneTagText}>✓ Complete</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.courseProgressSub}>
                      {Math.round(prog * 100)}% complete · {course.lessons.length} lessons
                    </Text>
                    <ProgressBar
                      progress={prog}
                      height={5}
                      color={course.gradient[0]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgeGrid}>
            {badges.map((b) => (
              <Badge key={b.label} emoji={b.emoji} label={b.label} earned={b.earned} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    gap: Theme.spacing.lg,
  },
  profileCard: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Theme.font.xxxl,
    fontWeight: Theme.weight.black,
  },
  profileName: {
    color: Colors.white,
    fontSize: Theme.font.xxl,
    fontWeight: Theme.weight.black,
    letterSpacing: -0.5,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  levelBadgeText: {
    color: Colors.white,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
  xpSection: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.sm,
  },
  xpNumbers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontSize: Theme.font.xl,
    fontWeight: Theme.weight.black,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.streak + '33',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  streakMeta: {
    flex: 1,
    gap: 3,
  },
  streakMetaTitle: {
    color: Colors.text,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.semibold,
  },
  streakMetaSub: {
    color: Colors.textSecondary,
    fontSize: Theme.font.sm,
  },
  section: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
    marginBottom: 4,
  },
  courseProgressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseProgressRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  courseEmoji: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseProgressText: {
    flex: 1,
    gap: 4,
  },
  courseProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseProgressTitle: {
    color: Colors.text,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.semibold,
    flex: 1,
  },
  courseProgressSub: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  doneTag: {
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.radius.full,
  },
  doneTagText: {
    color: Colors.success,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  badge: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
  },
  badgeLocked: {
    borderColor: Colors.border,
  },
  badgeLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: Theme.weight.semibold,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: Colors.textMuted,
  },
});
