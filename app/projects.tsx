import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Animated,
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

interface Project {
  title: string;
  emoji: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  steps: string[];
  estimated_time: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#4ADE80',
  Intermediate: '#FFD700',
  Advanced: '#F857A6',
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = DIFFICULTY_COLORS[project.difficulty] ?? Colors.primary;

  return (
    <View style={[styles.projectCard, { borderColor: color + '30' }]}>
      <View style={styles.projectHeader}>
        <View style={[styles.projectNumberBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.projectNumber, { color }]}>#{index + 1}</Text>
        </View>
        <View style={styles.projectTitleRow}>
          <Text style={styles.projectEmoji}>{project.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: color + '22' }]}>
                <Text style={[styles.difficultyText, { color }]}>{project.difficulty}</Text>
              </View>
              <Text style={styles.timeText}>⏱ {project.estimated_time}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.projectDesc}>{project.description}</Text>

      {/* Skills */}
      <View style={styles.skillsRow}>
        {project.skills.map((skill) => (
          <View key={skill} style={styles.skillPill}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/* Expand/collapse steps */}
      <TouchableOpacity
        onPress={() => { setExpanded(!expanded); Haptics.selectionAsync(); }}
        style={styles.stepsToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.stepsToggleText}>{expanded ? '▲ Hide steps' : '▼ Show build steps'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.stepsList}>
          {project.steps.map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: color }]} />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { progress, levelInfo } = useProgress();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const completedCourseNames = COURSES
    .filter((c) => progress.completedCourses.includes(c.id))
    .map((c) => c.title);

  const completedLessonCount = progress.completedLessons.length;

  const generate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setProjects([]);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('claude-ai', {
        body: {
          type: 'generate_project',
          payload: {
            completed_courses: completedCourseNames,
            xp: progress.totalXP,
            level: levelInfo.level,
            level_label: levelInfo.label,
          },
          user_id: authData.user?.id,
        },
      });

      if (error) throw new Error(error.message);

      const parsed = JSON.parse(data.content);
      setProjects(parsed.projects ?? []);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (err: any) {
      Alert.alert(
        'Generation Failed',
        'Make sure the claude-ai edge function is deployed:\n\nsupabase functions deploy claude-ai',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.back}>
          <Text style={styles.backText}>‹ AI Tools</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>🚀 Project Generator</Text>
        <Text style={styles.pageSubtitle}>AI creates hands-on projects matched to your skill level.</Text>

        {/* Skill context card */}
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>YOUR PROFILE</Text>
          <View style={styles.contextRow}>
            <View style={styles.contextItem}>
              <Text style={styles.contextValue}>Level {levelInfo.level}</Text>
              <Text style={styles.contextSub}>{levelInfo.label}</Text>
            </View>
            <View style={styles.contextDivider} />
            <View style={styles.contextItem}>
              <Text style={styles.contextValue}>{completedLessonCount}</Text>
              <Text style={styles.contextSub}>Lessons Done</Text>
            </View>
            <View style={styles.contextDivider} />
            <View style={styles.contextItem}>
              <Text style={styles.contextValue}>{progress.completedCourses.length}</Text>
              <Text style={styles.contextSub}>Courses Done</Text>
            </View>
          </View>

          {completedCourseNames.length > 0 ? (
            <View style={styles.courseTags}>
              <Text style={styles.contextLabel}>COURSES COMPLETED</Text>
              <View style={styles.tagRow}>
                {completedCourseNames.map((name) => (
                  <View key={name} style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.noCoursesNote}>
              Complete at least one lesson to unlock personalized projects. AI will still generate beginner-friendly ideas for you!
            </Text>
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
            colors={['#11998E', '#38EF7D']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.generateBtnText}>Generating projects...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText}>
                {projects.length > 0 ? '↺ Regenerate Projects' : '✦ Generate My Projects'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Projects */}
        {projects.length > 0 && (
          <Animated.View style={[styles.projectsSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Your Personalized Projects</Text>
            {projects.map((p, i) => (
              <ProjectCard key={i} project={p} index={i} />
            ))}
          </Animated.View>
        )}

        {/* Empty prompt */}
        {!loading && projects.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎨</Text>
            <Text style={styles.emptyTitle}>Ready to build something?</Text>
            <Text style={styles.emptySubtitle}>Claude will analyze your learning progress and generate 3 projects perfect for your skill level right now.</Text>
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
  contextCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
  },
  contextLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextItem: { flex: 1, alignItems: 'center', gap: 2 },
  contextValue: { color: Colors.text, fontSize: Theme.font.xl, fontWeight: Theme.weight.black },
  contextSub: { color: Colors.textMuted, fontSize: Theme.font.xs },
  contextDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  courseTags: { gap: Theme.spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  courseTag: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  courseTagText: { color: Colors.primaryLight, fontSize: Theme.font.xs, fontWeight: Theme.weight.semibold },
  noCoursesNote: {
    color: Colors.textMuted,
    fontSize: Theme.font.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  generateBtn: { borderRadius: Theme.radius.xl, overflow: 'hidden' },
  generateBtnDisabled: { opacity: 0.6 },
  generateGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  generateBtnText: { color: Colors.white, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  projectsSection: { gap: Theme.spacing.md },
  sectionTitle: { color: Colors.text, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    gap: Theme.spacing.sm,
  },
  projectHeader: { gap: Theme.spacing.sm },
  projectNumberBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  projectNumber: { fontSize: Theme.font.xs, fontWeight: Theme.weight.bold },
  projectTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  projectEmoji: { fontSize: 28, marginTop: 2 },
  projectTitle: { color: Colors.text, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  difficultyText: { fontSize: Theme.font.xs, fontWeight: Theme.weight.bold },
  timeText: { color: Colors.textMuted, fontSize: Theme.font.xs },
  projectDesc: { color: Colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 20 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  skillText: { color: Colors.textSecondary, fontSize: Theme.font.xs },
  stepsToggle: { paddingVertical: 4 },
  stepsToggleText: { color: Colors.primary, fontSize: Theme.font.sm, fontWeight: Theme.weight.semibold },
  stepsList: { gap: 8, paddingTop: 4 },
  stepItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  stepText: { color: Colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 20, flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl, gap: Theme.spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: Theme.font.xl, fontWeight: Theme.weight.bold },
  emptySubtitle: { color: Colors.textSecondary, fontSize: Theme.font.sm, textAlign: 'center', lineHeight: 22, paddingHorizontal: Theme.spacing.lg },
});
