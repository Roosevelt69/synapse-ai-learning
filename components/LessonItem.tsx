import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { Lesson } from '@/data/courses';

interface Props {
  lesson: Lesson;
  index: number;
  isComplete: boolean;
  isLocked: boolean;
  onPress: () => void;
}

export default function LessonItem({ lesson, index, isComplete, isLocked, onPress }: Props) {
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
      <View style={[styles.numberBadge, isComplete && styles.completeBadge, isLocked && styles.lockedBadge]}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locked: {
    opacity: 0.5,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '44',
  },
  completeBadge: {
    backgroundColor: Colors.success + '22',
    borderColor: Colors.success + '66',
  },
  lockedBadge: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.border,
  },
  number: {
    color: Colors.primary,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.bold,
  },
  checkIcon: {
    color: Colors.success,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.bold,
  },
  lockedText: {
    color: Colors.textMuted,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Colors.text,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  arrow: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: Theme.weight.bold,
  },
  doneArrow: {
    color: Colors.textMuted,
    fontSize: 18,
  },
  lockIcon: {
    fontSize: 16,
  },
});
