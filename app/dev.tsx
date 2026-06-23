import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { loadProgress, checkStreakStatus, getLevelFromXP, UserProgress } from '@/utils/storage';
import {
  seedFreshUser,
  seedStreakActive,
  seedStreakAtRisk,
  seedStreakBroken,
  seedCompletedCourse,
  seedFullProgress,
  seedReadyForStreak,
  resetProgress,
} from '@/utils/devSeeder';
import { COURSES } from '@/data/courses';

type ButtonVariant = 'primary' | 'warning' | 'danger' | 'success' | 'neutral';

function DevButton({
  label,
  sublabel,
  variant = 'primary',
  onPress,
  loading,
}: {
  label: string;
  sublabel?: string;
  variant?: ButtonVariant;
  onPress: () => void;
  loading?: boolean;
}) {
  const bgMap: Record<ButtonVariant, string> = {
    primary: Colors.primary,
    warning: '#F5A623',
    danger: Colors.error,
    success: Colors.success,
    neutral: Colors.surface,
  };
  const bg = bgMap[variant];
  const textColor = variant === 'neutral' ? Colors.textSecondary : '#fff';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, borderColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <Text style={[styles.btnLabel, { color: textColor }]}>{label}</Text>
          {sublabel ? (
            <Text style={[styles.btnSublabel, { color: textColor + 'CC' }]}>{sublabel}</Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stateRow}>
      <Text style={styles.stateLabel}>{label}</Text>
      <Text style={styles.stateValue}>{value}</Text>
    </View>
  );
}

export default function DevPanelScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadState = useCallback(() => {
    loadProgress().then(setProgress);
  }, []);

  useFocusEffect(loadState);

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      loadState();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setBusy(null);
    }
  }

  const streakStatus = progress ? checkStreakStatus(progress) : '—';
  const levelInfo = progress ? getLevelFromXP(progress.totalXP) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚙️ Dev Panel</Text>
          <Text style={styles.subtitle}>Synapse test harness — only visible in dev builds</Text>
        </View>

        {/* Live State */}
        {progress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live State</Text>
            <View style={styles.stateCard}>
              <StateRow label="Name" value={progress.name} />
              <StateRow label="Onboarded" value={progress.hasOnboarded ? 'Yes' : 'No'} />
              <StateRow label="Total XP" value={String(progress.totalXP)} />
              <StateRow label="Level" value={levelInfo ? `${levelInfo.level} — ${levelInfo.label}` : '—'} />
              <StateRow label="Streak" value={`${progress.streak} day${progress.streak !== 1 ? 's' : ''}`} />
              <StateRow label="Longest Streak" value={`${progress.longestStreak} days`} />
              <StateRow label="Last Activity" value={progress.lastActivityDate ?? 'none'} />
              <StateRow
                label="Streak Status"
                value={streakStatus.toUpperCase()}
              />
              <StateRow
                label="Lessons Done"
                value={`${progress.completedLessons.length} (${progress.completedLessons.join(', ') || 'none'})`}
              />
              <StateRow
                label="Courses Done"
                value={`${progress.completedCourses.length} (${progress.completedCourses.join(', ') || 'none'})`}
              />
            </View>
          </View>
        )}

        {/* Streak Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak Scenarios</Text>
          <Text style={styles.sectionNote}>
            Seeds progress state — tap "Go Home" after each to observe UI
          </Text>

          <DevButton
            label="✅ Active Streak — 5 days"
            sublabel="lastActivityDate = today → status: active"
            variant="success"
            loading={busy === 'active5'}
            onPress={() => run('active5', () => seedStreakActive(5))}
          />
          <DevButton
            label="✅ Active Streak — 1 day"
            sublabel="First day done today → status: active"
            variant="success"
            loading={busy === 'active1'}
            onPress={() => run('active1', () => seedStreakActive(1))}
          />
          <DevButton
            label="⚠️ At-Risk Streak — 5 days"
            sublabel="lastActivityDate = yesterday → status: at_risk"
            variant="warning"
            loading={busy === 'risk5'}
            onPress={() => run('risk5', () => seedStreakAtRisk(5))}
          />
          <DevButton
            label="⚠️ At-Risk Streak — 1 day"
            sublabel="Did 1 lesson yesterday → status: at_risk"
            variant="warning"
            loading={busy === 'risk1'}
            onPress={() => run('risk1', () => seedStreakAtRisk(1))}
          />
          <DevButton
            label="💔 Broken Streak"
            sublabel="lastActivityDate = 3 days ago → status: broken, streak=0"
            variant="danger"
            loading={busy === 'broken'}
            onPress={() => run('broken', () => seedStreakBroken())}
          />
          <DevButton
            label="🔢 Ready for Streak Increment"
            sublabel="lastActivityDate = yesterday, streak=1 — complete a lesson to verify it goes to 2"
            variant="primary"
            loading={busy === 'readyStreak'}
            onPress={() => run('readyStreak', () => seedReadyForStreak())}
          />
        </View>

        {/* Progress Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Scenarios</Text>

          <DevButton
            label="🆕 Fresh Onboarded User"
            sublabel="No lessons, no streak"
            variant="neutral"
            loading={busy === 'fresh'}
            onPress={() => run('fresh', () => seedFreshUser())}
          />
          {COURSES.map((course) => (
            <DevButton
              key={course.id}
              label={`${course.emoji} Complete: ${course.title}`}
              sublabel={`${course.lessons.length} lessons marked done`}
              variant="primary"
              loading={busy === `course-${course.id}`}
              onPress={() => run(`course-${course.id}`, () => seedCompletedCourse(course.id))}
            />
          ))}
          <DevButton
            label="🏆 Full Progress"
            sublabel="2 courses done, 1 partial, 12-day streak, high XP"
            variant="success"
            loading={busy === 'full'}
            onPress={() => run('full', () => seedFullProgress())}
          />
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reset</Text>
          <DevButton
            label="🗑️ Clear All Progress"
            sublabel="Wipes AsyncStorage — app behaves as brand-new install"
            variant="danger"
            loading={busy === 'reset'}
            onPress={() =>
              Alert.alert(
                'Clear All Progress?',
                'This wipes all local data. The app will restart as a fresh install.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => run('reset', async () => { await resetProgress(); }),
                  },
                ]
              )
            }
          />
        </View>

        {/* Navigation Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <DevButton
            label="🏠 Go to Home Tab"
            variant="neutral"
            onPress={() => router.replace('/(tabs)')}
          />
          <DevButton
            label="👤 Go to Profile Tab"
            variant="neutral"
            onPress={() => router.replace('/(tabs)/profile')}
          />
          <DevButton
            label="🔐 Go to Auth Screen"
            variant="neutral"
            onPress={() => router.replace('/auth')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All changes write directly to AsyncStorage. Pull-to-refresh on any tab screen updates the UI.
          </Text>
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
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 48,
    gap: Theme.spacing.lg,
  },
  header: {
    gap: 4,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: Colors.primary,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.semibold,
  },
  title: {
    color: Colors.text,
    fontSize: Theme.font.xxl,
    fontWeight: Theme.weight.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Theme.font.sm,
  },
  section: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sectionNote: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    marginBottom: 4,
  },
  stateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stateLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  stateValue: {
    color: Colors.text,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.medium,
    textAlign: 'right',
    flex: 1,
  },
  btn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.bold,
  },
  btnSublabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingTop: 8,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
