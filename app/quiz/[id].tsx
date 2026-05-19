import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { getLessonById, getCourseById } from '@/data/courses';
import ProgressBar from '@/components/ProgressBar';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = getLessonById(id);
  const course = lesson ? getCourseById(lesson.courseId) : null;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const cardFade = useRef(new Animated.Value(1)).current;
  const feedbackFade = useRef(new Animated.Value(0)).current;

  if (!lesson || !course) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Quiz not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = lesson.quiz;
  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;
  const progress = (questionIndex + 1) / questions.length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.timing(feedbackFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const thisCorrect = selected === question.correctIndex ? 1 : 0;

    if (isLast) {
      const finalScore = correctCount + thisCorrect;
      const total = questions.length;
      const xpEarned = Math.round(lesson.xpReward * (finalScore / total));
      router.replace({
        pathname: '/results',
        params: { lessonId: lesson.id, courseId: lesson.courseId, score: String(finalScore), total: String(total), xpEarned: String(xpEarned) },
      });
      return;
    }

    Animated.sequence([
      Animated.timing(cardFade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(cardFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    feedbackFade.setValue(0);

    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }, 120);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressSection}>
            <ProgressBar progress={progress} height={8} color={course.gradient[0]} />
          </View>
          <Text style={styles.counter}>{questionIndex + 1}/{questions.length}</Text>
        </View>
        <View style={styles.quizLabel}>
          <Text style={styles.quizLabelText}>{course.emoji} {lesson.title} — Quiz</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: cardFade }}>
          <View style={styles.questionCard}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>Question {questionIndex + 1}</Text>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          <View style={styles.optionsList}>
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === question.correctIndex;
              let borderColor = Colors.border;
              let bgColor = Colors.surface;
              let textColor = Colors.text;
              if (revealed) {
                if (isCorrect) { borderColor = Colors.success; bgColor = Colors.success + '15'; textColor = Colors.success; }
                else if (isSelected) { borderColor = Colors.error; bgColor = Colors.error + '15'; textColor = Colors.error; }
              } else if (isSelected) {
                borderColor = Colors.primary; bgColor = Colors.primary + '15';
              }
              return (
                <TouchableOpacity
                  key={idx} onPress={() => handleSelect(idx)} disabled={selected !== null}
                  activeOpacity={0.8} style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                >
                  <View style={[
                    styles.optionBullet,
                    revealed && isCorrect && { backgroundColor: Colors.success + '33', borderColor: Colors.success },
                    revealed && isSelected && !isCorrect && { backgroundColor: Colors.error + '33', borderColor: Colors.error },
                    !revealed && isSelected && { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
                  ]}>
                    <Text style={[
                      styles.bulletText,
                      revealed && isCorrect && { color: Colors.success },
                      revealed && isSelected && !isCorrect && { color: Colors.error },
                    ]}>
                      {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {revealed && (
            <Animated.View style={[styles.explanationCard, { opacity: feedbackFade }]}>
              <LinearGradient colors={[Colors.primary + '22', Colors.primary + '11']} style={styles.explanationGradient}>
                <Text style={styles.explanationTitle}>
                  {selected === question.correctIndex ? '✅ Correct!' : '❌ Not quite'}
                </Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.footer}>
          {!revealed ? (
            <View style={styles.hintContainer}><Text style={styles.hintText}>Select your answer</Text></View>
          ) : (
            <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={[...course.gradient]} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextBtnText}>{isLast ? 'See Results 🎉' : 'Next Question →'}</Text>
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
  progressSection: { flex: 1 },
  counter: { color: Colors.textSecondary, fontSize: Theme.font.sm, fontWeight: Theme.weight.semibold, minWidth: 36, textAlign: 'right' },
  quizLabel: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 10, paddingTop: 4 },
  quizLabelText: { color: Colors.textMuted, fontSize: Theme.font.sm, fontWeight: Theme.weight.medium },
  scroll: { flex: 1 },
  scrollContent: { padding: Theme.spacing.lg, paddingBottom: 40, gap: Theme.spacing.md },
  questionCard: { backgroundColor: Colors.surface, borderRadius: Theme.radius.xl, padding: Theme.spacing.lg, gap: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Theme.spacing.md },
  questionNumberBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Theme.radius.full, alignSelf: 'flex-start' },
  questionNumberText: { color: Colors.primary, fontSize: Theme.font.xs, fontWeight: Theme.weight.bold, letterSpacing: 0.5, textTransform: 'uppercase' },
  questionText: { color: Colors.text, fontSize: Theme.font.xl, fontWeight: Theme.weight.bold, letterSpacing: -0.3, lineHeight: 28 },
  optionsList: { gap: 10, marginBottom: Theme.spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1.5, gap: Theme.spacing.md },
  optionBullet: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceLight, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bulletText: { color: Colors.textSecondary, fontSize: Theme.font.sm, fontWeight: Theme.weight.bold },
  optionText: { flex: 1, fontSize: Theme.font.md, lineHeight: 21 },
  explanationCard: { borderRadius: Theme.radius.xl, overflow: 'hidden', marginBottom: Theme.spacing.md },
  explanationGradient: { padding: Theme.spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.primary, gap: 8 },
  explanationTitle: { color: Colors.text, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold },
  explanationText: { color: Colors.textSecondary, fontSize: Theme.font.md, lineHeight: 22 },
  footerSafe: { backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  footer: { padding: Theme.spacing.lg },
  hintContainer: { alignItems: 'center', paddingVertical: 14 },
  hintText: { color: Colors.textMuted, fontSize: Theme.font.md, fontStyle: 'italic' },
  nextBtn: { borderRadius: Theme.radius.lg, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: Colors.white, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold, letterSpacing: 0.2 },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.md },
  notFoundText: { color: Colors.text, fontSize: Theme.font.lg },
});
