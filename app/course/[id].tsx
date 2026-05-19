import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { getCourseById } from '@/data/courses';
import { useProgress } from '@/hooks/useProgress';
import LessonItem from '@/components/LessonItem';
import ProgressBar from '@/components/ProgressBar';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = getCourseById(id);
  const { refresh, isLessonComplete, isCourseComplete, getCourseProgress } = useProgress();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!course) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Course not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prog = getCourseProgress(course.id);
  const done = isCourseComplete(course.id);

  const nextUnlockedIndex = course.lessons.findIndex((l) => !isLessonComplete(l.id));
  const allComplete = nextUnlockedIndex === -1;

  const handleStartLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...course.gradient]}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.heroEmoji}>
              <Text style={{ fontSize: 48 }}>{course.emoji}</Text>
            </View>

            <Text style={styles.heroTitle}>{course.title}</Text>
            <Text style={styles.heroSub}>{course.subtitle}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>📚 {course.lessons.length} lessons</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>⏱ {course.totalDuration}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>⚡ {course.xpReward} XP</Text>
              </View>
            </View>

            {prog > 0 && (
              <View style={styles.heroProgress}>
                <ProgressBar
                  progress={prog}
                  height={6}
                  color="rgba(255,255,255,0.95)"
                  backgroundColor="rgba(255,255,255,0.3)"
                />
                <Text style={styles.heroProgressText}>{Math.round(prog * 100)}% complete</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.descText}>{course.description}</Text>

        <View style={styles.tagsRow}>
          {course.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {done && (
          <View style={styles.completeBanner}>
            <Text style={styles.completeBannerText}>🎉 Course Complete! Well done.</Text>
          </View>
        )}

        <Text style={styles.lessonsTitle}>Lessons</Text>

        {course.lessons.map((lesson, i) => {
          const complete = isLessonComplete(lesson.id);
          const locked = !complete && i > (nextUnlockedIndex === -1 ? course.lessons.length : nextUnlockedIndex);
          return (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={i}
              isComplete={complete}
              isLocked={locked}
              onPress={() => handleStartLesson(lesson.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroGradient: {
    paddingBottom: Theme.spacing.xl,
  },
  heroContent: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
    marginBottom: 4,
  },
  backIcon: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 22,
    fontWeight: Theme.weight.bold,
  },
  heroEmoji: {
    width: 80,
    height: 80,
    borderRadius: Theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: Colors.white,
    fontSize: Theme.font.xxxl,
    fontWeight: Theme.weight.black,
    letterSpacing: -0.8,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  metaChipText: {
    color: Colors.white,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
  },
  heroProgress: {
    width: '100%',
    gap: 6,
  },
  heroProgressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    gap: Theme.spacing.md,
  },
  descText: {
    color: Colors.textSecondary,
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  tagText: {
    color: Colors.primary,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.semibold,
  },
  completeBanner: {
    backgroundColor: Colors.success + '22',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  completeBannerText: {
    color: Colors.success,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.bold,
  },
  lessonsTitle: {
    color: Colors.text,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
    marginTop: 4,
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
  },
  notFoundText: {
    color: Colors.text,
    fontSize: Theme.font.lg,
  },
  back: {
    color: Colors.primary,
    fontSize: Theme.font.md,
  },
});
