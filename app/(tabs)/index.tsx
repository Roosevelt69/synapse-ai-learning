import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useProgress } from '@/hooks/useProgress';
import { COURSES } from '@/data/courses';
import CourseCard from '@/components/CourseCard';
import StreakBadge from '@/components/StreakBadge';
import ProgressBar from '@/components/ProgressBar';

export default function HomeScreen() {
  const router = useRouter();
  const { progress, loading, refresh, streakStatus, levelInfo, getCourseProgress, isCourseComplete } = useProgress();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const inProgressCourse = COURSES.find((c) => {
    const prog = getCourseProgress(c.id);
    return prog > 0 && prog < 1;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{progress.name} 👋</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⚡ {progress.totalXP.toLocaleString()} XP</Text>
          </View>
        </View>

        {/* Streak + Level Card */}
        <LinearGradient
          colors={[Colors.surface, Colors.surfaceLight]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StreakBadge streak={progress.streak} size="lg" pulse={streakStatus === 'at_risk'} />
              {streakStatus === 'at_risk' && (
                <Text style={styles.atRiskText}>Complete a lesson to keep it!</Text>
              )}
              {streakStatus === 'broken' && progress.streak === 0 && (
                <Text style={styles.brokenText}>Start your streak today</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Level {levelInfo.level}</Text>
              <Text style={styles.levelName}>{levelInfo.label}</Text>
              <ProgressBar
                progress={levelInfo.currentXP / levelInfo.nextXP}
                height={5}
                color={Colors.primary}
              />
              <Text style={styles.xpToNext}>
                {levelInfo.currentXP}/{levelInfo.nextXP} XP
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Continue Learning */}
        {inProgressCourse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/course/${inProgressCourse.id}`);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[...inProgressCourse.gradient]}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.continueContent}>
                  <Text style={styles.continueEmoji}>{inProgressCourse.emoji}</Text>
                  <View style={styles.continueText}>
                    <Text style={styles.continueTitle}>{inProgressCourse.title}</Text>
                    <Text style={styles.continueSub}>
                      {Math.round(getCourseProgress(inProgressCourse.id) * 100)}% complete
                    </Text>
                    <ProgressBar
                      progress={getCourseProgress(inProgressCourse.id)}
                      height={4}
                      color="rgba(255,255,255,0.9)"
                      backgroundColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                  <Text style={styles.continueArrow}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>🎯 Daily Goal</Text>
            <Text style={styles.goalSub}>Complete 1 lesson today</Text>
          </View>
          <ProgressBar
            progress={streakStatus === 'active' ? 1 : 0}
            height={8}
            color={Colors.success}
          />
          <Text style={styles.goalStatus}>
            {streakStatus === 'active' ? '✅ Goal complete — great work!' : '⏳ No lesson yet today'}
          </Text>
        </View>

        {/* All Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Courses</Text>
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={getCourseProgress(course.id)}
              isComplete={isCourseComplete(course.id)}
              onPress={() => router.push(`/course/${course.id}`)}
            />
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: Theme.font.md,
  },
  name: {
    color: Colors.text,
    fontSize: Theme.font.xxl,
    fontWeight: Theme.weight.bold,
    letterSpacing: -0.5,
  },
  xpBadge: {
    backgroundColor: Colors.xp + '18',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.xp + '33',
  },
  xpText: {
    color: Colors.xp,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.bold,
  },
  statsCard: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  atRiskText: {
    color: Colors.streak,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.medium,
  },
  brokenText: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
  },
  levelInfo: {
    flex: 1,
    gap: 4,
  },
  levelLabel: {
    color: Colors.primary,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelName: {
    color: Colors.text,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
  },
  xpToNext: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
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
  continueCard: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
  },
  continueGradient: {
    padding: Theme.spacing.lg,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  continueEmoji: {
    fontSize: 32,
  },
  continueText: {
    flex: 1,
    gap: 4,
  },
  continueTitle: {
    color: Colors.white,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
  },
  continueSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.sm,
    marginBottom: 4,
  },
  continueArrow: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: Theme.weight.bold,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalHeader: {
    gap: 2,
  },
  goalTitle: {
    color: Colors.text,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
  },
  goalSub: {
    color: Colors.textSecondary,
    fontSize: Theme.font.sm,
  },
  goalStatus: {
    color: Colors.textSecondary,
    fontSize: Theme.font.sm,
    marginTop: 2,
  },
});
