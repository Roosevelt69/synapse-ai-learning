import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { Gradients } from '@/constants/colors';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { COURSES } from '@/data/courses';
import ProgressBar from '@/components/ProgressBar';
import StreakBadge from '@/components/StreakBadge';
import { supabase } from '@/lib/supabase';
import { saveProgress, DEFAULT_PROGRESS } from '@/utils/storage';

const FREEZE_COST = 200;

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { progress, refresh, levelInfo, getCourseProgress, isCourseComplete, streakStatus, buyFreeze } = useProgress();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const completedLessonsCount = progress.completedLessons.length;
  const completedCoursesCount = progress.completedCourses.length;
  const xpBalance = progress.xpBalance ?? 0;
  const streakFreezes = progress.streakFreezes ?? 0;
  const levelPct = levelInfo.nextXP > 0 ? levelInfo.currentXP / levelInfo.nextXP : 1;

  const badges = [
    { emoji: '🚀', label: 'First Lesson', earned: completedLessonsCount >= 1 },
    { emoji: '🔥', label: '3-Day Streak', earned: progress.longestStreak >= 3 },
    { emoji: '🏆', label: 'Week Warrior', earned: progress.longestStreak >= 7 },
    { emoji: '⚡', label: '500 XP', earned: progress.totalXP >= 500 },
    { emoji: '🎓', label: 'Graduate', earned: completedCoursesCount >= 1 },
    { emoji: '🧠', label: 'AI Thinker', earned: isCourseComplete('ai-intro') },
    { emoji: '✨', label: 'Prompter', earned: isCourseComplete('prompt-eng') },
    { emoji: '🤖', label: 'Agent Builder', earned: isCourseComplete('ai-agents') },
    { emoji: '⚡', label: 'JS Master', earned: isCourseComplete('javascript') },
    { emoji: '🔧', label: 'Dev Mindset', earned: isCourseComplete('programming-fundamentals') },
    { emoji: '🌟', label: '5 Courses', earned: completedCoursesCount >= 5 },
    { emoji: '💎', label: '2000 XP', earned: progress.totalXP >= 2000 },
  ];

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          await saveProgress(DEFAULT_PROGRESS);
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleBuyFreeze = () => {
    if (xpBalance < FREEZE_COST) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Not enough XP', `You need ${FREEZE_COST} XP. You have ${xpBalance}.`);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Buy Streak Freeze?', `Spend ${FREEZE_COST} XP for 1 Streak Freeze?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: `Buy — ${FREEZE_COST} XP`,
        onPress: async () => {
          const ok = await buyFreeze(FREEZE_COST);
          if (ok) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Streak Freeze purchased! 🧊', 'It activates automatically if you ever miss a day.');
          }
        },
      },
    ]);
  };

  const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'dark', label: 'Dark', icon: '🌙' },
    { mode: 'light', label: 'Light', icon: '☀️' },
    { mode: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={[...Gradients.primary]} style={styles.profileCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{progress.name.charAt(0).toUpperCase()}</Text>
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
            <ProgressBar progress={levelPct} height={6} color="rgba(255,255,255,0.95)" backgroundColor="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { emoji: '⚡', label: 'Total XP', value: progress.totalXP.toLocaleString(), color: colors.xp },
            { emoji: '🔥', label: 'Streak', value: `${progress.streak}d`, color: colors.streak },
            { emoji: '🏅', label: 'Best Streak', value: `${progress.longestStreak}d`, color: colors.primaryLight },
            { emoji: '📚', label: 'Lessons', value: completedLessonsCount, color: colors.success },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '30' }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Streak status */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <StreakBadge streak={progress.streak} size="md" pulse={streakStatus === 'at_risk'} />
            <View style={styles.streakMeta}>
              <Text style={styles.streakMetaTitle}>
                {streakStatus === 'active' ? "Today's lesson done ✅"
                  : streakStatus === 'at_risk' ? "Complete a lesson tonight 🕐"
                  : streakStatus === 'new' ? "Start your streak today!"
                  : "Streak reset — start again 💪"}
              </Text>
              <Text style={styles.streakMetaSub}>Longest: {progress.longestStreak} days</Text>
            </View>
          </View>
        </View>

        {/* ── Appearance ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => { Haptics.selectionAsync(); setMode(opt.mode); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.themeIcon}>{opt.icon}</Text>
                  <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>{opt.label}</Text>
                  {active && <View style={[styles.themeActiveDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Shop ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop</Text>
            <View style={styles.balancePill}>
              <Text style={styles.balanceText}>⚡ {xpBalance.toLocaleString()} XP</Text>
            </View>
          </View>

          <View style={styles.shopCard}>
            <View style={styles.shopLeft}>
              <Text style={styles.shopEmoji}>🧊</Text>
              <View style={styles.shopText}>
                <Text style={styles.shopTitle}>Streak Freeze</Text>
                <Text style={styles.shopSub}>Auto-protects your streak if you miss a day</Text>
                {streakFreezes > 0 && (
                  <View style={styles.ownedPill}>
                    <Text style={styles.ownedPillText}>You own {streakFreezes}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleBuyFreeze}
              activeOpacity={0.8}
              style={[styles.buyBtn, xpBalance < FREEZE_COST && styles.buyBtnOff]}
            >
              <Text style={[styles.buyBtnText, xpBalance < FREEZE_COST && styles.buyBtnTextOff]}>
                {FREEZE_COST} XP
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.shopHint}>Earn XP by completing lessons and practice sessions</Text>
        </View>

        {/* ── Course Progress ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Progress</Text>
          {COURSES.map((course) => {
            const p = getCourseProgress(course.id);
            const done = isCourseComplete(course.id);
            return (
              <View key={course.id} style={styles.courseCard}>
                <View style={[styles.courseEmoji, { backgroundColor: course.gradient[0] + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{course.emoji}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <View style={styles.courseRow}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    {done && <View style={styles.donePill}><Text style={styles.donePillText}>✓</Text></View>}
                  </View>
                  <Text style={styles.courseSub}>{Math.round(p * 100)}% · {course.lessons.length} lessons</Text>
                  <ProgressBar progress={p} height={4} color={course.gradient[0]} backgroundColor={colors.border} />
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Achievements ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgeGrid}>
            {badges.map((b) => (
              <View key={b.label} style={[styles.badge, !b.earned && styles.badgeLocked]}>
                <Text style={{ fontSize: 26, opacity: b.earned ? 1 : 0.2 }}>{b.emoji}</Text>
                <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelOff]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {__DEV__ && (
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push('/dev' as any); }} activeOpacity={0.7} style={styles.devBtn}>
            <Text style={styles.devBtnText}>⚙️ Dev Panel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { padding: Theme.spacing.lg, paddingBottom: 40, gap: Theme.spacing.lg },

    profileCard: { borderRadius: 24, padding: Theme.spacing.xl, alignItems: 'center', gap: Theme.spacing.sm, shadowColor: '#7B61FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    avatarText: { color: '#FFF', fontSize: Theme.font.xxxl, fontWeight: '900' },
    profileName: { color: '#FFF', fontSize: Theme.font.xxl, fontWeight: '900', letterSpacing: -0.5 },
    levelBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: Theme.radius.full },
    levelBadgeText: { color: '#FFF', fontSize: Theme.font.sm, fontWeight: '600' },
    xpSection: { width: '100%', gap: 6, marginTop: 4 },
    xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
    xpLabel: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sm },
    xpNumbers: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sm, fontWeight: '600' },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
    statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, alignItems: 'center', gap: 4, borderWidth: 1 },
    statEmoji: { fontSize: 22 },
    statValue: { fontSize: Theme.font.xl, fontWeight: '900', letterSpacing: -0.3 },
    statLabel: { color: colors.textMuted, fontSize: Theme.font.xs, textAlign: 'center', fontWeight: '500' },

    streakCard: { backgroundColor: colors.surface, borderRadius: 20, padding: Theme.spacing.lg, borderWidth: 1, borderColor: colors.streak + '30' },
    streakHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
    streakMeta: { flex: 1, gap: 3 },
    streakMetaTitle: { color: colors.text, fontSize: Theme.font.md, fontWeight: '600' },
    streakMetaSub: { color: colors.textSecondary, fontSize: Theme.font.sm },

    section: { gap: Theme.spacing.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    sectionTitle: { color: colors.text, fontSize: Theme.font.lg, fontWeight: '700', letterSpacing: -0.2, marginBottom: 4 },

    // Appearance / theme switcher
    themeRow: { flexDirection: 'row', gap: Theme.spacing.sm },
    themeOption: { flex: 1, backgroundColor: colors.surface, borderRadius: Theme.radius.lg, paddingVertical: 14, alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: colors.border },
    themeOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
    themeIcon: { fontSize: 22 },
    themeLabel: { color: colors.textSecondary, fontSize: Theme.font.sm, fontWeight: '600' },
    themeLabelActive: { color: colors.primary },
    themeActiveDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },

    // Shop
    balancePill: { backgroundColor: colors.xp + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Theme.radius.full, borderWidth: 1, borderColor: colors.xp + '30' },
    balanceText: { color: colors.xp, fontSize: Theme.font.sm, fontWeight: '700' },
    shopCard: { backgroundColor: colors.surface, borderRadius: 20, padding: Theme.spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: Theme.spacing.md },
    shopLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
    shopEmoji: { fontSize: 36 },
    shopText: { flex: 1, gap: 4 },
    shopTitle: { color: colors.text, fontSize: Theme.font.md, fontWeight: '700' },
    shopSub: { color: colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 18 },
    ownedPill: { backgroundColor: colors.success + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.radius.full, alignSelf: 'flex-start', marginTop: 2 },
    ownedPillText: { color: colors.success, fontSize: Theme.font.xs, fontWeight: '600' },
    buyBtn: { backgroundColor: colors.primary, paddingHorizontal: Theme.spacing.md, paddingVertical: 10, borderRadius: Theme.radius.lg },
    buyBtnOff: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
    buyBtnText: { color: '#FFF', fontSize: Theme.font.sm, fontWeight: '700' },
    buyBtnTextOff: { color: colors.textMuted },
    shopHint: { color: colors.textMuted, fontSize: Theme.font.xs, textAlign: 'center', marginTop: 2 },

    // Course progress
    courseCard: { backgroundColor: colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: Theme.spacing.md, alignItems: 'center' },
    courseEmoji: { width: 44, height: 44, borderRadius: Theme.radius.md, alignItems: 'center', justifyContent: 'center' },
    courseInfo: { flex: 1, gap: 4 },
    courseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    courseTitle: { color: colors.text, fontSize: Theme.font.md, fontWeight: '600', flex: 1 },
    courseSub: { color: colors.textMuted, fontSize: Theme.font.xs },
    donePill: { backgroundColor: colors.success + '22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: Theme.radius.full },
    donePillText: { color: colors.success, fontSize: Theme.font.xs, fontWeight: '700' },

    // Badges
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
    badge: { width: '22%', aspectRatio: 1, backgroundColor: colors.surface, borderRadius: Theme.radius.lg, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, padding: 8 },
    badgeLocked: { borderColor: colors.border },
    badgeLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600', textAlign: 'center' },
    badgeLabelOff: { color: colors.textMuted },

    devBtn: { borderRadius: Theme.radius.lg, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '50', backgroundColor: colors.primary + '10' },
    devBtnText: { color: colors.primary, fontSize: Theme.font.md, fontWeight: '600' },
    signOutBtn: { borderRadius: Theme.radius.lg, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.error + '50', backgroundColor: colors.error + '10' },
    signOutText: { color: colors.error, fontSize: Theme.font.md, fontWeight: '600' },
  });
}
