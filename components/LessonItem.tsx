import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Lesson } from '@/data/courses';

interface Props {
  lesson: Lesson;
  index: number;
  isComplete: boolean;
  isLocked: boolean;
  onPress: () => void;
}

export default function LessonItem({ lesson, index, isComplete, isLocked, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handlePress = () => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={isLocked ? 1 : 0.8}
      style={[styles.container, isLocked && styles.locked]}
    >
      <View style={[
        styles.numberBadge,
        isComplete && styles.completeBadge,
        isLocked && styles.lockedBadge,
      ]}>
        {isComplete ? (
          <Text style={styles.checkIcon}>✓</Text>
        ) : (
          <Text style={[styles.number, isLocked && styles.lockedText]}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, isLocked && styles.lockedText]}>{lesson.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱ {lesson.duration}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>⚡ {lesson.xpReward} XP</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{lesson.slides.length} slides</Text>
        </View>
      </View>

      {!isLocked && (
        <Text style={[styles.arrow, isComplete && styles.doneArrow]}>
          {isComplete ? '↺' : '›'}
        </Text>
      )}
      {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
    </TouchableOpacity>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Theme.radius.lg,
      padding: Theme.spacing.md,
      gap: Theme.spacing.md,
      marginBottom: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    locked: { opacity: 0.45 },
    numberBadge: {
      width: 36,
      height: 36,
      borderRadius: Theme.radius.full,
      backgroundColor: colors.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primary + '44',
    },
    completeBadge: {
      backgroundColor: colors.success + '22',
      borderColor: colors.success + '66',
    },
    lockedBadge: {
      backgroundColor: colors.surfaceLight,
      borderColor: colors.border,
    },
    number: {
      color: colors.primary,
      fontSize: Theme.font.md,
      fontWeight: '700',
    },
    checkIcon: {
      color: colors.success,
      fontSize: Theme.font.md,
      fontWeight: '700',
    },
    lockedText: { color: colors.textMuted },
    content: { flex: 1, gap: 4 },
    title: {
      color: colors.text,
      fontSize: Theme.font.md,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    meta: { color: colors.textMuted, fontSize: Theme.font.xs },
    dot: { color: colors.textMuted, fontSize: Theme.font.xs },
    arrow: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: '700',
    },
    doneArrow: {
      color: colors.textMuted,
      fontSize: 18,
    },
    lockIcon: { fontSize: 16 },
  });
}
