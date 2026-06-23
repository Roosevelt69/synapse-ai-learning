import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getCourseById } from '@/data/courses';
import { useProgress } from '@/hooks/useProgress';
import LessonItem from '@/components/LessonItem';
import ProgressBar from '@/components/ProgressBar';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const course = getCourseById(id);
  const { refresh, isLessonComplete, isCourseComplete, getCourseProgress } = useProgress();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

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

  return (
    <View style={styles.container}>
      {/* Hero with cover image + gradient */}
      <ImageBackground source={{ uri: course.coverImage }} style={styles.hero}>
        <LinearGradient
          colors={[course.gradient[0] + 'BB', course.gradient[1] + 'EE', '#000000CC']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
        />
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.heroBadge}>
              <Text style={{ fontSize: 42 }}>{course.emoji}</Text>
            </View>

            <Text style={styles.heroTitle}>{course.title}</Text>
            <Text style={styles.heroSub}>{course.subtitle}</Text>

            <View style={styles.heroMeta}>
              {[
                `📚 ${course.lessons.length} lessons`,
                `⏱ ${course.totalDuration}`,
                `⚡ ${course.xpReward} XP`,
              ].map((chip) => (
                <View key={chip} style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{chip}</Text>
                </View>
              ))}
            </View>

            {prog > 0 && (
              <View style={styles.heroProgress}>
                <ProgressBar progress={prog} height={6} color="rgba(255,255,255,0.95)" backgroundColor="rgba(255,255,255,0.3)" />
                <Text style={styles.heroProgressText}>{Math.round(prog * 100)}% complete</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(`/lesson/${lesson.id}`); }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { minHeight: 280, justifyContent: 'flex-end' },
    heroContent: { padding: Theme.spacing.lg, gap: Theme.spacing.md, alignItems: 'flex-start' },
    backButton: { padding: 4, marginBottom: 4 },
    backIcon: { color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: '700' },
    heroBadge: {
      width: 80, height: 80, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    heroTitle: { color: '#FFF', fontSize: Theme.font.xxxl, fontWeight: '900', letterSpacing: -0.8, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: Theme.font.md, lineHeight: 22 },
    heroMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    metaChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Theme.radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    metaChipText: { color: '#FFF', fontSize: Theme.font.xs, fontWeight: '600' },
    heroProgress: { width: '100%', gap: 6 },
    heroProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.xs },

    scroll: { flex: 1 },
    scrollContent: { padding: Theme.spacing.lg, paddingBottom: 40, gap: Theme.spacing.md },

    descText: { color: colors.textSecondary, fontSize: Theme.font.md, lineHeight: 22 },
    tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tag: { backgroundColor: colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Theme.radius.full, borderWidth: 1, borderColor: colors.primary + '44' },
    tagText: { color: colors.primary, fontSize: Theme.font.xs, fontWeight: '600' },

    completeBanner: { backgroundColor: colors.success + '22', borderRadius: Theme.radius.lg, padding: Theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.success + '44' },
    completeBannerText: { color: colors.success, fontSize: Theme.font.md, fontWeight: '700' },

    lessonsTitle: { color: colors.text, fontSize: Theme.font.lg, fontWeight: '700', marginTop: 4 },

    notFound: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.md },
    notFoundText: { color: colors.text, fontSize: Theme.font.lg },
    back: { color: colors.primary, fontSize: Theme.font.md },
  });
}
