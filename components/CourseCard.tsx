import React, { useMemo } from 'react';
import {
  TouchableOpacity, View, Text, StyleSheet,
  ImageBackground, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import ProgressBar from './ProgressBar';
import { Course } from '@/data/courses';

interface Props {
  course: Course;
  progress: number;
  isComplete: boolean;
  onPress: () => void;
}

const levelColors: Record<string, string> = {
  Beginner: '#4ADE80',
  Intermediate: '#FBBF24',
  Advanced: '#F87171',
};

export default function CourseCard({ course, progress, isComplete, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.wrapper}>
      {/* Image hero */}
      <ImageBackground
        source={{ uri: course.coverImage }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        {/* Gradient overlay so text is always readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Course colour accent along top edge */}
        <View style={[styles.accentBar, { backgroundColor: course.gradient[0] }]} />

        {/* Emoji badge */}
        <View style={styles.heroBadge}>
          <Text style={styles.heroEmoji}>{course.emoji}</Text>
        </View>

        {/* Hero text */}
        <View style={styles.heroBottom}>
          {isComplete && (
            <View style={styles.completePill}>
              <Text style={styles.completePillText}>✓ Complete</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{course.title}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>{course.subtitle}</Text>
        </View>
      </ImageBackground>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.description} numberOfLines={2}>{course.description}</Text>

        {/* Tags row */}
        <View style={styles.tagRow}>
          <View style={[styles.levelTag, { backgroundColor: levelColors[course.level] + '20' }]}>
            <View style={[styles.levelDot, { backgroundColor: levelColors[course.level] }]} />
            <Text style={[styles.levelText, { color: levelColors[course.level] }]}>{course.level}</Text>
          </View>
          <Text style={styles.meta}>📚 {course.lessons.length} lessons</Text>
          <Text style={styles.meta}>⏱ {course.totalDuration}</Text>
        </View>

        {/* Progress bar if started */}
        {progress > 0 && !isComplete && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>In progress</Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} height={5} color={course.gradient[0]} backgroundColor={colors.border} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.xpTag}>
            <Text style={styles.xpText}>⚡ {course.xpReward} XP</Text>
          </View>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.ctaWrap}>
            <LinearGradient
              colors={[...course.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {isComplete ? 'Review' : progress > 0 ? 'Continue →' : 'Start →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginBottom: Theme.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    hero: {
      height: 160,
      justifyContent: 'space-between',
    },
    heroImage: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    accentBar: {
      height: 3,
      width: '100%',
    },
    heroBadge: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      margin: Theme.spacing.md,
      marginTop: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(8px)',
    },
    heroEmoji: {
      fontSize: 26,
    },
    heroBottom: {
      padding: Theme.spacing.md,
      gap: 3,
    },
    completePill: {
      backgroundColor: '#4ADE8022',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Theme.radius.full,
      alignSelf: 'flex-start',
      marginBottom: 2,
      borderWidth: 1,
      borderColor: '#4ADE8066',
    },
    completePillText: {
      color: '#4ADE80',
      fontSize: 10,
      fontWeight: '700',
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: Theme.font.xl,
      fontWeight: '800',
      letterSpacing: -0.4,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: Theme.font.sm,
    },
    body: {
      padding: Theme.spacing.md,
      gap: Theme.spacing.sm,
    },
    description: {
      color: colors.textSecondary,
      fontSize: Theme.font.sm,
      lineHeight: 20,
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
      fontWeight: '600',
    },
    meta: {
      color: colors.textMuted,
      fontSize: Theme.font.xs,
    },
    progressSection: {
      gap: 5,
    },
    progressLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressLabel: {
      color: colors.textMuted,
      fontSize: Theme.font.xs,
    },
    progressPct: {
      color: colors.textSecondary,
      fontSize: Theme.font.xs,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    xpTag: {
      backgroundColor: colors.xp + '18',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Theme.radius.full,
      borderWidth: 1,
      borderColor: colors.xp + '30',
    },
    xpText: {
      color: colors.xp,
      fontSize: Theme.font.sm,
      fontWeight: '700',
    },
    ctaWrap: {
      borderRadius: Theme.radius.md,
      overflow: 'hidden',
    },
    ctaGradient: {
      paddingHorizontal: 18,
      paddingVertical: 8,
    },
    ctaText: {
      color: '#FFFFFF',
      fontSize: Theme.font.sm,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });
}
