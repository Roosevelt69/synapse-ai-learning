import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import ProgressBar from './ProgressBar';
import { Course } from '@/data/courses';

const { width } = Dimensions.get('window');

interface Props {
  course: Course;
  progress: number;
  isComplete: boolean;
  onPress: () => void;
}

export default function CourseCard({ course, progress, isComplete, onPress }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const levelColors: Record<string, string> = {
    Beginner: '#4ADE80',
    Intermediate: '#FBBF24',
    Advanced: '#F87171',
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.88} style={styles.wrapper}>
      <LinearGradient
        colors={[...course.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{course.emoji}</Text>
            </View>
            {isComplete && (
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>✓ Done</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{course.description}</Text>

          <View style={styles.tagRow}>
            <View style={[styles.levelTag, { backgroundColor: levelColors[course.level] + '22' }]}>
              <View style={[styles.levelDot, { backgroundColor: levelColors[course.level] }]} />
              <Text style={[styles.levelText, { color: levelColors[course.level] }]}>{course.level}</Text>
            </View>
            <Text style={styles.meta}>📚 {course.lessons.length} lessons</Text>
            <Text style={styles.meta}>⏱ {course.totalDuration}</Text>
          </View>

          {progress > 0 && !isComplete && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
              </View>
              <ProgressBar progress={progress} height={5} color={course.gradient[0]} />
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.xpTag}>
              <Text style={styles.xpText}>⚡ {course.xpReward} XP</Text>
            </View>
            <View style={styles.startButton}>
              <LinearGradient
                colors={[...course.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>
                  {isComplete ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Theme.spacing.md,
  },
  gradientBorder: {
    borderRadius: Theme.radius.xl,
    padding: 1.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl - 1,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  completeBadge: {
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  completeText: {
    color: Colors.success,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
  title: {
    color: Colors.text,
    fontSize: Theme.font.xl,
    fontWeight: Theme.weight.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Theme.font.sm,
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
    gap: 5,
  },
  levelDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  levelText: {
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  progressSection: {
    gap: 6,
    marginTop: 2,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
  },
  progressPct: {
    color: Colors.textSecondary,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  xpTag: {
    backgroundColor: Colors.xp + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  xpText: {
    color: Colors.xp,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
  startButton: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
  },
  startGradient: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  startText: {
    color: Colors.white,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.bold,
    letterSpacing: 0.2,
  },
});
