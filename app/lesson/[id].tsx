import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Platform, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import { Gradients } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getLessonById, getCourseById, Slide } from '@/data/courses';

const { width } = Dimensions.get('window');

// ─── Playground Slide ──────────────────────────────────────────────────────────
function PlaygroundSlide({ slide, onAnswer, colors }: { slide: Slide; onAnswer: (correct: boolean) => void; colors: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const terminalOpacity = useRef(new Animated.Value(0)).current;
  const terminalY = useRef(new Animated.Value(20)).current;
  const optionsFade = useRef(new Animated.Value(1)).current;

  const displayCode = selected !== null
    ? slide.code!.replace('____', slide.options![selected])
    : slide.code;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === slide.correctIndex;
    onAnswer(isCorrect);
    isCorrect
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(optionsFade, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(terminalOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(terminalY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <View style={[slideCardStyle(colors), { gap: Theme.spacing.md }]}>
      {slide.emoji && <Text style={{ fontSize: 40 }}>{slide.emoji}</Text>}
      <Text style={{ color: colors.text, fontSize: Theme.font.xl, fontWeight: '700', letterSpacing: -0.3 }}>{slide.title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: Theme.font.md, lineHeight: 24 }}>{slide.body}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={codeBlockStyle}>
          <Text style={codeTextStyle}>{displayCode}</Text>
        </View>
      </ScrollView>

      {selected === null && (
        <Animated.View style={{ opacity: optionsFade, gap: 10 }}>
          {slide.options!.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={{ backgroundColor: colors.surfaceLight, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1.5, borderColor: colors.border }}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
            >
              <Text style={{ color: colors.text, fontSize: Theme.font.md, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '500' }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {selected !== null && (
        <Animated.View style={{ opacity: terminalOpacity, transform: [{ translateY: terminalY }], gap: Theme.spacing.sm }}>
          <View style={{ backgroundColor: '#0D1117', borderRadius: Theme.radius.md, overflow: 'hidden', borderWidth: 1, borderColor: '#30363D' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#161B22', borderBottomWidth: 1, borderBottomColor: '#30363D', gap: 6 }}>
              {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (
                <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
              ))}
              <Text style={{ color: '#8B949E', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginLeft: 4 }}>terminal</Text>
            </View>
            <Text style={{ color: '#A9DC76', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 22, padding: Theme.spacing.md }}>
              {`$ run\n> ${slide.options![selected]}\n\n${selected === slide.correctIndex ? '✓ Correct output' : '✗ Unexpected output'}`}
            </Text>
          </View>
          {slide.explanation && (
            <View style={{ backgroundColor: colors.primary + '18', borderRadius: Theme.radius.md, padding: Theme.spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
              <Text style={{ color: colors.primaryLight, fontSize: Theme.font.sm, lineHeight: 20 }}>💡 {slide.explanation}</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ─── Slide Content ─────────────────────────────────────────────────────────────
function SlideContent({ slide, onAnswer, colors }: { slide: Slide; onAnswer: (correct: boolean) => void; colors: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === slide.correctIndex;
    onAnswer(isCorrect);
    isCorrect
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setRevealed(true);
    Animated.timing(feedbackOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  if (slide.type === 'playground') {
    return <PlaygroundSlide slide={slide} onAnswer={onAnswer} colors={colors} />;
  }

  if (slide.type === 'interactive') {
    return (
      <View style={slideCardStyle(colors)}>
        <Text style={{ fontSize: 40 }}>{slide.emoji}</Text>
        <Text style={{ color: colors.text, fontSize: Theme.font.lg, fontWeight: '600', lineHeight: 24 }}>{slide.question}</Text>
        <View style={{ gap: 10 }}>
          {slide.options!.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === slide.correctIndex;
            let bg = colors.surfaceLight, border = colors.border, textColor = colors.text;
            if (isSelected && isCorrect) { bg = colors.success + '15'; border = colors.success + '66'; textColor = colors.success; }
            else if (isSelected && !isCorrect) { bg = colors.error + '15'; border = colors.error + '66'; textColor = colors.error; }
            else if (revealed && isCorrect) { bg = colors.success + '10'; border = colors.success + '44'; textColor = colors.success; }
            return (
              <TouchableOpacity
                key={idx}
                style={{ backgroundColor: bg, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1.5, borderColor: border }}
                onPress={() => handleSelect(idx)}
                disabled={selected !== null}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', ...(isSelected && isCorrect ? { backgroundColor: colors.success + '33' } : isSelected && !isCorrect ? { backgroundColor: colors.error + '33' } : revealed && isCorrect ? { backgroundColor: colors.success + '33' } : {}) }}>
                    <Text style={{ color: colors.textSecondary, fontSize: Theme.font.xs, fontWeight: '700' }}>
                      {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: Theme.font.md, lineHeight: 20, color: textColor }}>{opt}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Animated.View style={{ opacity: feedbackOpacity, backgroundColor: colors.primary + '18', borderRadius: Theme.radius.md, padding: Theme.spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary }} pointerEvents={revealed ? 'auto' : 'none'}>
          <Text style={{ color: colors.primaryLight, fontSize: Theme.font.sm, lineHeight: 20 }}>💡 {slide.explanation}</Text>
        </Animated.View>
      </View>
    );
  }

  if (slide.type === 'code') {
    return (
      <View style={slideCardStyle(colors)}>
        <Text style={{ fontSize: 40 }}>{slide.emoji}</Text>
        <Text style={{ color: colors.text, fontSize: Theme.font.xl, fontWeight: '700', letterSpacing: -0.3 }}>{slide.title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: Theme.font.md, lineHeight: 24 }}>{slide.body}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={codeBlockStyle}>
            <Text style={codeTextStyle}>{slide.code}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={slideCardStyle(colors)}>
      {slide.emoji && <Text style={{ fontSize: 40 }}>{slide.emoji}</Text>}
      <Text style={{ color: colors.text, fontSize: slide.type === 'intro' || slide.type === 'summary' ? Theme.font.xxl : Theme.font.xl, fontWeight: '800', letterSpacing: -0.4, lineHeight: 32 }}>
        {slide.title}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: Theme.font.md, lineHeight: 24 }}>{slide.body}</Text>
      {slide.highlight && (
        <View style={{ borderRadius: Theme.radius.md, overflow: 'hidden', marginTop: 4 }}>
          <LinearGradient colors={[colors.primary + '22', colors.primary + '11']} style={{ padding: Theme.spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ color: colors.primaryLight, fontSize: Theme.font.md, fontWeight: '500', lineHeight: 22 }}>{slide.highlight}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

// helpers
const slideCardStyle = (colors: any) => ({
  backgroundColor: colors.surface,
  borderRadius: 20,
  padding: Theme.spacing.lg,
  gap: Theme.spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  minHeight: 300,
});
const codeBlockStyle = {
  backgroundColor: '#0D1117',
  borderRadius: Theme.radius.md,
  padding: Theme.spacing.md,
  marginTop: 4,
  borderWidth: 1,
  borderColor: '#30363D',
};
const codeTextStyle = {
  color: '#A9DC76',
  fontSize: 13,
  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' as const,
  lineHeight: 20,
};

// ─── Lesson Screen ─────────────────────────────────────────────────────────────
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const lesson = getLessonById(id);

  const [slideIndex, setSlideIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setCanContinue(false);
  }, [slideIndex]);

  const handleAnswer = useCallback(() => setCanContinue(true), []);

  if (!lesson) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Lesson not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontSize: Theme.font.md }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const course = getCourseById(lesson.courseId);
  const currentSlide = lesson.slides[slideIndex];
  const progress = (slideIndex + 1) / lesson.slides.length;
  const isInteractive = currentSlide.type === 'interactive' || currentSlide.type === 'playground';
  const isLastSlide = slideIndex === lesson.slides.length - 1;

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
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: course?.gradient[0] ?? colors.primary }]} />
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
          <SlideContent key={slideIndex} slide={currentSlide} onAnswer={handleAnswer} colors={colors} />
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.footer}>
          {isInteractive && !canContinue ? (
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>
                {currentSlide.type === 'playground' ? 'Select the correct answer' : 'Tap an answer to continue'}
              </Text>
            </View>
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

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerSafe: { backgroundColor: colors.background, borderBottomWidth: 0.5, borderBottomColor: colors.border },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.sm, gap: Theme.spacing.md },
    closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surface },
    closeBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    progressSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    progressTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: 8, borderRadius: 4 },
    progressLabel: { color: colors.textMuted, fontSize: Theme.font.xs, fontWeight: '500', minWidth: 30 },
    xpChip: { backgroundColor: colors.xp + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.radius.full },
    xpChipText: { color: colors.xp, fontSize: Theme.font.xs, fontWeight: '700' },
    lessonMeta: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 10, paddingTop: 4 },
    lessonTitle: { color: colors.textSecondary, fontSize: Theme.font.sm, fontWeight: '500' },
    scrollArea: { flex: 1 },
    scrollContent: { padding: Theme.spacing.lg, paddingBottom: 40 },
    footerSafe: { backgroundColor: colors.background, borderTopWidth: 0.5, borderTopColor: colors.border },
    footer: { padding: Theme.spacing.lg },
    tapHint: { alignItems: 'center', paddingVertical: 14 },
    tapHintText: { color: colors.textMuted, fontSize: Theme.font.md, fontStyle: 'italic' },
    nextBtn: { borderRadius: Theme.radius.lg, overflow: 'hidden' },
    nextBtnGradient: { paddingVertical: 18, alignItems: 'center' },
    nextBtnText: { color: '#FFF', fontSize: Theme.font.lg, fontWeight: '700', letterSpacing: 0.2 },
    notFound: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.md },
    notFoundText: { color: colors.text, fontSize: Theme.font.lg },
  });
}
