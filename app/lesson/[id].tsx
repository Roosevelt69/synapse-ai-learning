import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Platform, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { getLessonById, getCourseById, Slide } from '@/data/courses';

const { width } = Dimensions.get('window');

function SlideContent({ slide, onAnswer }: { slide: Slide; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === slide.correctIndex;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setRevealed(true);
    Animated.timing(feedbackOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    onAnswer(isCorrect);
  };

  if (slide.type === 'interactive') {
    return (
      <View style={styles.slideCard}>
        <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        <Text style={styles.interactiveQuestion}>{slide.question}</Text>
        <View style={styles.optionsList}>
          {slide.options!.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === slide.correctIndex;
            let optStyle = styles.optionBase;
            let textColor = Colors.text;
            if (isSelected && isCorrect) { optStyle = { ...styles.optionBase, ...styles.optionCorrect }; textColor = Colors.success; }
            else if (isSelected && !isCorrect) { optStyle = { ...styles.optionBase, ...styles.optionWrong }; textColor = Colors.error; }
            else if (revealed && isCorrect) { optStyle = { ...styles.optionBase, ...styles.optionCorrectRevealed }; textColor = Colors.success; }
            return (
              <TouchableOpacity key={idx} style={optStyle} onPress={() => handleSelect(idx)} disabled={selected !== null} activeOpacity={0.8}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionBullet, isSelected && isCorrect && styles.bulletCorrect, isSelected && !isCorrect && styles.bulletWrong, revealed && isCorrect && !isSelected && styles.bulletCorrect]}>
                    <Text style={styles.optionBulletText}>
                      {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {revealed && (
          <Animated.View style={[styles.explanationBox, { opacity: feedbackOpacity }]}>
            <Text style={styles.explanationText}>💡 {slide.explanation}</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  if (slide.type === 'code') {
    return (
      <View style={styles.slideCard}>
        <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideBody}>{slide.body}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{slide.code}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.slideCard}>
      {slide.emoji && <Text style={styles.slideEmoji}>{slide.emoji}</Text>}
      <Text style={[styles.slideTitle, (slide.type === 'intro' || slide.type === 'summary') && styles.slideTitleLarge]}>
        {slide.title}
      </Text>
      <Text style={styles.slideBody}>{slide.body}</Text>
      {slide.highlight && (
        <View style={styles.highlightBox}>
          <LinearGradient colors={[Colors.primary + '22', Colors.primary + '11']} style={styles.highlightGradient}>
            <Text style={styles.highlightText}>{slide.highlight}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = getLessonById(id);

  const [slideIndex, setSlideIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!lesson) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Lesson not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontSize: Theme.font.md }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const course = getCourseById(lesson.courseId);
  const currentSlide = lesson.slides[slideIndex];
  const progress = (slideIndex + 1) / lesson.slides.length;
  const isInteractive = currentSlide.type === 'interactive';
  const isLastSlide = slideIndex === lesson.slides.length - 1;

  const handleAnswer = (_correct: boolean) => setCanContinue(true);

  const goToNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastSlide) {
      router.replace(`/quiz/${lesson.id}`);
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setSlideIndex((i) => i + 1);
      setCanContinue(false);
    }, 100);
  };

  const goBack = () => {
    if (slideIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSlideIndex((i) => i - 1);
      setCanContinue(false);
    } else {
      router.back();
    }
  };

  const canProceed = !isInteractive || canContinue;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: course?.gradient[0] ?? Colors.primary }]} />
            </View>
            <Text style={styles.progressLabel}>{slideIndex + 1}/{lesson.slides.length}</Text>
          </View>
          <View style={styles.xpChip}>
            <Text style={styles.xpChipText}>⚡{lesson.xpReward}</Text>
          </View>
        </View>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <SlideContent slide={currentSlide} onAnswer={handleAnswer} />
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.footer}>
          {isInteractive && !canContinue ? (
            <View style={styles.tapHint}><Text style={styles.tapHintText}>Tap an answer to continue</Text></View>
          ) : (
            <TouchableOpacity onPress={goToNext} activeOpacity={0.85} style={styles.nextBtn}>
              <LinearGradient
                colors={course ? [...course.gradient] : [...Gradients.primary]}
                style={styles.nextBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextBtnText}>{isLastSlide ? 'Take Quiz →' : 'Continue →'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerSafe: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.sm, gap: Theme.spacing.md },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.surface },
  closeBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: Theme.weight.bold },
  progressSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabel: { color: Colors.textMuted, fontSize: Theme.font.xs, fontWeight: Theme.weight.medium, minWidth: 30 },
  xpChip: { backgroundColor: Colors.xp + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.radius.full },
  xpChipText: { color: Colors.xp, fontSize: Theme.font.xs, fontWeight: Theme.weight.bold },
  lessonMeta: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 10, paddingTop: 4 },
  lessonTitle: { color: Colors.textSecondary, fontSize: Theme.font.sm, fontWeight: Theme.weight.medium },
  scrollArea: { flex: 1 },
  scrollContent: { padding: Theme.spacing.lg, paddingBottom: 40 },
  slideCard: { backgroundColor: Colors.surface, borderRadius: Theme.radius.xl, padding: Theme.spacing.lg, gap: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border, minHeight: 300 },
  slideEmoji: { fontSize: 40 },
  slideTitle: { color: Colors.text, fontSize: Theme.font.xl, fontWeight: Theme.weight.bold, letterSpacing: -0.3, lineHeight: 28 },
  slideTitleLarge: { fontSize: Theme.font.xxl, letterSpacing: -0.5 },
  slideBody: { color: Colors.textSecondary, fontSize: Theme.font.md, lineHeight: 24 },
  highlightBox: { borderRadius: Theme.radius.md, overflow: 'hidden', marginTop: 4 },
  highlightGradient: { padding: Theme.spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  highlightText: { color: Colors.primaryLight, fontSize: Theme.font.md, fontWeight: Theme.weight.medium, lineHeight: 22 },
  interactiveQuestion: { color: Colors.text, fontSize: Theme.font.lg, fontWeight: Theme.weight.semibold, lineHeight: 24 },
  optionsList: { gap: 10 },
  optionBase: { backgroundColor: Colors.surfaceLight, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  optionCorrect: { backgroundColor: Colors.success + '15', borderColor: Colors.success + '66' },
  optionWrong: { backgroundColor: Colors.error + '15', borderColor: Colors.error + '66' },
  optionCorrectRevealed: { backgroundColor: Colors.success + '10', borderColor: Colors.success + '44' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  optionBullet: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  bulletCorrect: { backgroundColor: Colors.success + '33' },
  bulletWrong: { backgroundColor: Colors.error + '33' },
  optionBulletText: { color: Colors.textSecondary, fontSize: Theme.font.xs, fontWeight: Theme.weight.bold },
  optionText: { flex: 1, fontSize: Theme.font.md, lineHeight: 20 },
  explanationBox: { backgroundColor: Colors.primary + '18', borderRadius: Theme.radius.md, padding: Theme.spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  explanationText: { color: Colors.primaryLight, fontSize: Theme.font.sm, lineHeight: 20 },
  codeBlock: { backgroundColor: Colors.surfaceLight, borderRadius: Theme.radius.md, padding: Theme.spacing.md, marginTop: 4, borderWidth: 1, borderColor: Colors.border },
  codeText: { color: '#A9DC76', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },
  footerSafe: { backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  footer: { padding: Theme.spacing.lg },
  tapHint: { alignItems: 'center', paddingVertical: 14 },
  tapHintText: { color: Colors.textMuted, fontSize: Theme.font.md, fontStyle: 'italic' },
  nextBtn: { borderRadius: Theme.radius.lg, overflow: 'hidden' },
  nextBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: Colors.white, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold, letterSpacing: 0.2 },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.md },
  notFoundText: { color: Colors.text, fontSize: Theme.font.lg },
});
