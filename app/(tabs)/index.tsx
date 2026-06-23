import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { Gradients } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { COURSES } from '@/data/courses';
import { countAvailableQuestions } from '@/utils/practice';
import CourseCard from '@/components/CourseCard';
import StreakBadge from '@/components/StreakBadge';
import ProgressBar from '@/components/ProgressBar';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { progress, loading, refresh, streakStatus, levelInfo, getCourseProgress, isCourseComplete } = useProgress();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const inProgressCourse = COURSES.find((c) => {
    const p = getCourseProgress(c.id);
    return p > 0 && p < 1;
  });

  const practiceAvailable = countAvailableQuestions(progress.completedLessons);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{progress.name} 👋</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⚡ {progress.totalXP.toLocaleString()} XP</Text>
          </View>
        </View>

        {/* Streak + Level Card */}
        <LinearGradient
          colors={[colors.surface, colors.surfaceLight]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StreakBadge streak={progress.streak} size="lg" pulse={streakStatus === 'at_risk'} />
              {streakStatus === 'at_risk' && <Text style={styles.atRiskText}>Complete tonight!</Text>}
              {streakStatus === 'broken' && progress.streak === 0 && <Text style={styles.brokenText}>Start today</Text>}
              {streakStatus === 'active' && <Text style={styles.activeText}>Goal done ✅</Text>}
            </View>
            <View style={styles.divider} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Level {levelInfo.level}</Text>
              <Text style={styles.levelName}>{levelInfo.label}</Text>
              <ProgressBar
                progress={levelInfo.currentXP / levelInfo.nextXP}
                height={5}
                color={colors.primary}
                backgroundColor={colors.border}
              />
              <Text style={styles.xpToNext}>{levelInfo.currentXP}/{levelInfo.nextXP} XP</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Continue Learning */}
        {inProgressCourse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/course/${inProgressCourse.id}`); }}
              activeOpacity={0.88}
            >
              <LinearGradient colors={[...inProgressCourse.gradient]} style={styles.continueGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.continueEmoji}>{inProgressCourse.emoji}</Text>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>{inProgressCourse.title}</Text>
                  <Text style={styles.continueSub}>{Math.round(getCourseProgress(inProgressCourse.id) * 100)}% complete</Text>
                  <ProgressBar
                    progress={getCourseProgress(inProgressCourse.id)}
                    height={4}
                    color="rgba(255,255,255,0.9)"
                    backgroundColor="rgba(255,255,255,0.25)"
                  />
                </View>
                <Text style={styles.continueArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Practice CTA */}
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/practice'); }}
          activeOpacity={0.88}
          style={styles.practiceCard}
        >
          <LinearGradient colors={['#4776E622', '#8E54E911']} style={StyleSheet.absoluteFill} />
          <View style={styles.practiceContent}>
            <View style={styles.practiceLeft}>
              <View style={styles.practiceBadge}>
                <Text style={styles.practiceBadgeText}>DAILY PRACTICE</Text>
              </View>
              <Text style={styles.practiceTitle}>
                {streakStatus === 'active' ? 'Practice More Today' : 'Keep Your Streak Alive'}
              </Text>
              <Text style={styles.practiceSub}>
                {practiceAvailable > 0 ? `${practiceAvailable} questions available` : 'Complete lessons to unlock'}
              </Text>
            </View>
            <View style={styles.practiceRight}>
              <Text style={styles.practiceEmoji}>⚡</Text>
              <Text style={styles.practiceXP}>+10 XP</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Courses</Text>
            <Text style={styles.sectionCount}>{COURSES.length} courses</Text>
          </View>
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

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { padding: Theme.spacing.lg, paddingBottom: 40, gap: Theme.spacing.lg },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 4 },
    greeting: { color: colors.textSecondary, fontSize: Theme.font.md, fontWeight: '500' },
    name: { color: colors.text, fontSize: Theme.font.xxl, fontWeight: '800', letterSpacing: -0.6 },
    xpBadge: { backgroundColor: colors.xp + '18', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Theme.radius.full, borderWidth: 1, borderColor: colors.xp + '33' },
    xpText: { color: colors.xp, fontSize: Theme.font.sm, fontWeight: '700' },

    statsCard: { borderRadius: 20, padding: Theme.spacing.lg, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.lg },
    statItem: { flex: 1, alignItems: 'flex-start', gap: 6 },
    atRiskText: { color: colors.streak, fontSize: Theme.font.xs, fontWeight: '600' },
    brokenText: { color: colors.textMuted, fontSize: Theme.font.xs },
    activeText: { color: colors.success, fontSize: Theme.font.xs, fontWeight: '600' },
    divider: { width: 1, height: 60, backgroundColor: colors.border },
    levelInfo: { flex: 1, gap: 4 },
    levelLabel: { color: colors.primary, fontSize: Theme.font.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    levelName: { color: colors.text, fontSize: Theme.font.lg, fontWeight: '700', letterSpacing: -0.2 },
    xpToNext: { color: colors.textMuted, fontSize: Theme.font.xs, marginTop: 2 },

    section: { gap: Theme.spacing.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
    sectionTitle: { color: colors.text, fontSize: Theme.font.lg, fontWeight: '700', letterSpacing: -0.2 },
    sectionCount: { color: colors.textMuted, fontSize: Theme.font.sm },

    continueCard: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
    continueGradient: { padding: Theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
    continueEmoji: { fontSize: 32 },
    continueText: { flex: 1, gap: 4 },
    continueTitle: { color: '#FFF', fontSize: Theme.font.lg, fontWeight: '700' },
    continueSub: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sm, marginBottom: 4 },
    continueArrow: { color: '#FFF', fontSize: 28, fontWeight: '700' },

    practiceCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.primary + '33', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
    practiceContent: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.lg, gap: Theme.spacing.md },
    practiceLeft: { flex: 1, gap: 6 },
    practiceBadge: { backgroundColor: colors.primary + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.radius.full, alignSelf: 'flex-start' },
    practiceBadgeText: { color: colors.primaryLight, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
    practiceTitle: { color: colors.text, fontSize: Theme.font.lg, fontWeight: '700', letterSpacing: -0.2 },
    practiceSub: { color: colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 20 },
    practiceRight: { alignItems: 'center', gap: 4 },
    practiceEmoji: { fontSize: 32 },
    practiceXP: { color: colors.xp, fontSize: Theme.font.sm, fontWeight: '700' },
  });
}
