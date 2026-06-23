import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useProgress } from '@/hooks/useProgress';
import { COURSES } from '@/data/courses';
import ProgressBar from '@/components/ProgressBar';

type Period = 'weekly' | 'monthly';

interface ReflectionData {
  summary: string;
  insights: string[];
  highlight: string;
}

function buildStats(progress: ReturnType<typeof useProgress>['progress'], period: Period) {
  const now = new Date();
  const daysBack = period === 'weekly' ? 7 : 30;
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const completedCourses = COURSES.filter((c) => progress.completedCourses.includes(c.id)).map((c) => c.title);
  const avgScore = Object.values(progress.quizScores).length > 0
    ? Math.round(Object.values(progress.quizScores).reduce((a, b) => a + b, 0) / Object.values(progress.quizScores).length)
    : 0;

  return {
    period,
    total_xp: progress.totalXP,
    current_streak: progress.streak,
    longest_streak: progress.longestStreak,
    total_lessons: progress.completedLessons.length,
    completed_courses: completedCourses,
    courses_count: completedCourses.length,
    average_quiz_score: avgScore,
    last_activity: progress.lastActivityDate ?? 'Never',
  };
}

export default function ReflectionScreen() {
  const router = useRouter();
  const { progress, levelInfo } = useProgress();
  const [period, setPeriod] = useState<Period>('weekly');
  const [reflection, setReflection] = useState<ReflectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const stats = buildStats(progress, period);

  const generate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setReflection(null);
    fadeAnim.setValue(0);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('claude-ai', {
        body: {
          type: 'reflection',
          payload: { period, stats },
          user_id: authData.user?.id,
        },
      });

      if (error) throw new Error(error.message);

      const parsed: ReflectionData = JSON.parse(data.content);
      setReflection(parsed);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (err: any) {
      Alert.alert(
        'Reflection unavailable',
        'Make sure the claude-ai edge function is deployed:\n\nsupabase functions deploy claude-ai',
      );
    } finally {
      setLoading(false);
    }
  };

  const levelPct = levelInfo.nextXP > 0 ? levelInfo.currentXP / levelInfo.nextXP : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.back}>
          <Text style={styles.backText}>‹ AI Tools</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>📊 AI Reflection</Text>
        <Text style={styles.pageSubtitle}>AI-generated insights based on your real learning data.</Text>

        {/* Period toggle */}
        <View style={styles.toggleRow}>
          {(['weekly', 'monthly'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
              onPress={() => {
                setPeriod(p);
                setReflection(null);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
                {p === 'weekly' ? '7-Day Report' : '30-Day Report'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>
            {period === 'weekly' ? 'YOUR WEEK AT A GLANCE' : 'YOUR MONTH AT A GLANCE'}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.streak }]}>{stats.current_streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.xp }]}>{stats.total_xp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.total_lessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success }]}>{stats.courses_count}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
          </View>

          {/* Level progress */}
          <View style={styles.levelRow}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>Level {levelInfo.level} · {levelInfo.label}</Text>
              <Text style={styles.levelXP}>{levelInfo.currentXP} / {levelInfo.nextXP} XP</Text>
            </View>
            <ProgressBar progress={levelPct} height={6} color={Colors.primary} />
          </View>

          {/* Quiz avg */}
          {stats.average_quiz_score > 0 && (
            <View style={styles.quizRow}>
              <Text style={styles.quizLabel}>Avg Quiz Score</Text>
              <View style={styles.quizBadge}>
                <Text style={styles.quizValue}>{stats.average_quiz_score}%</Text>
              </View>
            </View>
          )}

          {/* Completed courses */}
          {stats.completed_courses.length > 0 && (
            <View style={styles.completedSection}>
              <Text style={styles.completedLabel}>COMPLETED COURSES</Text>
              {stats.completed_courses.map((name) => (
                <View key={name} style={styles.completedCourse}>
                  <Text style={styles.completedDot}>✓</Text>
                  <Text style={styles.completedName}>{name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
          onPress={generate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#F857A6', '#FF5858']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.generateBtnText}>Analyzing your progress...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText}>
                {reflection ? '↺ Regenerate Report' : `✦ Generate ${period === 'weekly' ? 'Weekly' : 'Monthly'} Report`}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Reflection output */}
        {reflection && !loading && (
          <Animated.View style={[styles.reflectionSection, { opacity: fadeAnim }]}>
            {/* Highlight */}
            <LinearGradient
              colors={['#8360C3', '#2EBF91']}
              style={styles.highlightCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.highlightLabel}>🏆 TOP ACHIEVEMENT</Text>
              <Text style={styles.highlightText}>{reflection.highlight}</Text>
            </LinearGradient>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>📝 AI SUMMARY</Text>
              <Text style={styles.summaryText}>{reflection.summary}</Text>
            </View>

            {/* Insights */}
            <View style={styles.insightsCard}>
              <Text style={styles.insightsLabel}>💡 INSIGHTS & RECOMMENDATIONS</Text>
              {reflection.insights.map((insight, i) => (
                <View key={i} style={styles.insightItem}>
                  <View style={[styles.insightNum, { backgroundColor: Colors.primary + '22' }]}>
                    <Text style={styles.insightNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty state */}
        {!loading && !reflection && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Ready for your report?</Text>
            <Text style={styles.emptySubtitle}>
              Claude will analyze your {period === 'weekly' ? '7-day' : '30-day'} learning data and generate personalized insights and recommendations.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Theme.spacing.lg, paddingBottom: 60, gap: Theme.spacing.md },
  back: { marginBottom: 4 },
  backText: { color: Colors.primary, fontSize: Theme.font.md, fontWeight: Theme.weight.semibold },
  pageTitle: { color: Colors.text, fontSize: Theme.font.xxl, fontWeight: Theme.weight.black, letterSpacing: -0.5 },
  pageSubtitle: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.radius.md,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { color: Colors.textMuted, fontSize: Theme.font.sm, fontWeight: Theme.weight.semibold },
  toggleTextActive: { color: Colors.white },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
  },
  statsCardTitle: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  statsGrid: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: Theme.font.xxl, fontWeight: Theme.weight.black },
  statLabel: { color: Colors.textMuted, fontSize: Theme.font.xs, textAlign: 'center' },
  levelRow: { gap: 6 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  levelLabel: { color: Colors.primary, fontSize: Theme.font.sm, fontWeight: Theme.weight.semibold },
  levelXP: { color: Colors.textMuted, fontSize: Theme.font.xs },
  quizRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quizLabel: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  quizBadge: {
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  quizValue: { color: Colors.success, fontSize: Theme.font.sm, fontWeight: Theme.weight.bold },
  completedSection: { gap: 6 },
  completedLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  completedCourse: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedDot: { color: Colors.success, fontWeight: Theme.weight.bold, fontSize: Theme.font.md },
  completedName: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  generateBtn: { borderRadius: Theme.radius.xl, overflow: 'hidden' },
  generateBtnDisabled: { opacity: 0.6 },
  generateGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  generateBtnText: { color: Colors.white, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  reflectionSection: { gap: Theme.spacing.md },
  highlightCard: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  highlightLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  highlightText: {
    color: Colors.white,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
    lineHeight: 26,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.sm,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  summaryText: { color: Colors.text, fontSize: Theme.font.md, lineHeight: 24 },
  insightsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
  },
  insightsLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  insightItem: { flexDirection: 'row', gap: Theme.spacing.sm, alignItems: 'flex-start' },
  insightNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  insightNumText: { color: Colors.primary, fontSize: 11, fontWeight: Theme.weight.bold },
  insightText: { color: Colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 22, flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xl, gap: Theme.spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: Theme.font.xl, fontWeight: Theme.weight.bold },
  emptySubtitle: { color: Colors.textSecondary, fontSize: Theme.font.sm, textAlign: 'center', lineHeight: 22, paddingHorizontal: Theme.spacing.lg },
});
