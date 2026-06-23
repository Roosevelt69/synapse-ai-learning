import React, { useState, useEffect, useRef } from 'react';
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
import StreakBadge from '@/components/StreakBadge';

interface CoachData {
  message: string;
  tip: string;
  challenge: string;
  emoji: string;
}

const STREAK_GRADIENTS: Record<string, readonly [string, string]> = {
  active: ['#11998E', '#38EF7D'],
  at_risk: ['#F7971E', '#FFD200'],
  broken: ['#F857A6', '#FF5858'],
  new: ['#4776E6', '#8E54E9'],
};

export default function CoachingScreen() {
  const router = useRouter();
  const { progress, levelInfo, streakStatus } = useProgress();
  const [coaching, setCoaching] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const completedCourseNames = COURSES
    .filter((c) => progress.completedCourses.includes(c.id))
    .map((c) => c.title);

  const fetchCoaching = async () => {
    setLoading(true);
    setCoaching(null);
    fadeAnim.setValue(0);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('claude-ai', {
        body: {
          type: 'coaching',
          payload: {
            streak: progress.streak,
            xp: progress.totalXP,
            level: levelInfo.level,
            level_label: levelInfo.label,
            streak_status: streakStatus,
            completed_lessons: progress.completedLessons.length,
            completed_courses: completedCourseNames,
          },
          user_id: authData.user?.id,
        },
      });

      if (error) throw new Error(error.message);

      const parsed: CoachData = JSON.parse(data.content);
      setCoaching(parsed);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (err: any) {
      Alert.alert(
        'Coach unavailable',
        'Make sure the claude-ai edge function is deployed:\n\nsupabase functions deploy claude-ai',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoaching(); }, []);

  const gradient = STREAK_GRADIENTS[streakStatus] ?? STREAK_GRADIENTS.new;

  const statusMessages: Record<string, string> = {
    active: "You're on fire today 🔥",
    at_risk: "Don't lose your streak tonight ⚠️",
    broken: "Let's start fresh 💪",
    new: "Welcome to the journey 🌟",
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.back}>
          <Text style={styles.backText}>‹ AI Tools</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>🎯 Smart Coach</Text>
        <Text style={styles.pageSubtitle}>Personalized guidance based on your learning data.</Text>

        {/* Status banner */}
        <LinearGradient colors={[...gradient]} style={styles.statusBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.statusBannerContent}>
            <StreakBadge streak={progress.streak} size="lg" pulse={streakStatus === 'at_risk'} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>{statusMessages[streakStatus]}</Text>
              <Text style={styles.statusSub}>
                {progress.streak} day streak · {progress.totalXP.toLocaleString()} XP · Level {levelInfo.level} {levelInfo.label}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Coach message */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Claude is reading your progress...</Text>
          </View>
        )}

        {coaching && !loading && (
          <Animated.View style={{ opacity: fadeAnim, gap: Theme.spacing.md }}>
            {/* Main message */}
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.coachAvatarEmoji}>🤖</Text>
                <View>
                  <Text style={styles.coachName}>Your AI Coach</Text>
                  <Text style={styles.coachSub}>Powered by Claude Sonnet</Text>
                </View>
              </View>
              <Text style={styles.messageText}>{coaching.message}</Text>
            </View>

            {/* Today's tip */}
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipLabel}>TODAY'S TIP</Text>
              </View>
              <Text style={styles.tipText}>{coaching.tip}</Text>
            </View>

            {/* Challenge */}
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeIcon}>{coaching.emoji}</Text>
                <Text style={styles.challengeLabel}>15-MINUTE CHALLENGE</Text>
              </View>
              <Text style={styles.challengeText}>{coaching.challenge}</Text>
              <TouchableOpacity
                style={styles.challengeBtn}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert("Challenge accepted! 🎯", "Come back after completing it — your streak will be waiting.");
                }}
              >
                <Text style={styles.challengeBtnText}>Accept Challenge</Text>
              </TouchableOpacity>
            </View>

            {/* Stats recap */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>YOUR STATS</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.streak }]}>{progress.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.xp }]}>{progress.totalXP.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.primary }]}>{progress.completedLessons.length}</Text>
                  <Text style={styles.statLabel}>Lessons</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>{progress.longestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>
            </View>

            {/* Refresh */}
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fetchCoaching(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshText}>↺ Get New Message</Text>
            </TouchableOpacity>
          </Animated.View>
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
  statusBanner: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
  },
  statusBannerContent: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  statusTitle: { color: Colors.white, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold },
  statusSub: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.sm, marginTop: 2 },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  messageCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    gap: Theme.spacing.md,
  },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  coachAvatarEmoji: { fontSize: 32 },
  coachName: { color: Colors.text, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  coachSub: { color: Colors.textMuted, fontSize: Theme.font.xs },
  messageText: { color: Colors.text, fontSize: Theme.font.md, lineHeight: 24 },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.xp + '33',
    gap: Theme.spacing.sm,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipIcon: { fontSize: 18 },
  tipLabel: {
    color: Colors.xp,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  tipText: { color: Colors.textSecondary, fontSize: Theme.font.md, lineHeight: 22 },
  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '33',
    gap: Theme.spacing.sm,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeIcon: { fontSize: 18 },
  challengeLabel: {
    color: Colors.success,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  challengeText: { color: Colors.text, fontSize: Theme.font.md, lineHeight: 22 },
  challengeBtn: {
    backgroundColor: Colors.success,
    borderRadius: Theme.radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  challengeBtnText: { color: Colors.white, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
  },
  statsTitle: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  statsGrid: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: Theme.font.xxl, fontWeight: Theme.weight.black },
  statLabel: { color: Colors.textMuted, fontSize: Theme.font.xs, textAlign: 'center' },
  refreshBtn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshText: { color: Colors.textSecondary, fontSize: Theme.font.md, fontWeight: Theme.weight.semibold },
});
