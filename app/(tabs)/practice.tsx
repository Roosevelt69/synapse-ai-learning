import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { generatePracticeSession, countAvailableQuestions, PracticeQuestion } from '@/utils/practice';

type Phase = 'landing' | 'loading' | 'quiz' | 'done';

const PRACTICE_XP = 10;

export default function PracticeScreen() {
  const { progress, refresh, awardPractice, streakStatus } = useProgress();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [phase, setPhase] = useState<Phase>('landing');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);

  const cardFade = useRef(new Animated.Value(1)).current;
  const feedbackFade = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.85)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        setPhase('landing');
        setQuestions([]);
        setQuestionIndex(0);
        setSelected(null);
        setRevealed(false);
        setCorrectCount(0);
        setXpAwarded(false);
        cardFade.setValue(1);
        feedbackFade.setValue(0);
        resultScale.setValue(0.85);
        resultOpacity.setValue(0);
      };
    }, [refresh])
  );

  const availableCount = countAvailableQuestions(progress.completedLessons);

  const startSession = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('loading');
    const qs = await generatePracticeSession(5);
    setQuestions(qs);
    setQuestionIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    cardFade.setValue(1);
    feedbackFade.setValue(0);
    setPhase('quiz');
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === questions[questionIndex].correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.timing(feedbackFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isLast = questionIndex === questions.length - 1;

    if (isLast) {
      if (!xpAwarded) {
        setXpAwarded(true);
        await awardPractice(PRACTICE_XP);
      }
      setPhase('done');
      Animated.parallel([
        Animated.timing(resultOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
      ]).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  // ─── Loading ───────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Picking your questions…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Quiz ──────────────────────────────────────────────────
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[questionIndex];
    const isLast = questionIndex === questions.length - 1;
    return (
      <View style={styles.safe2}>
        <SafeAreaView edges={['top']} style={styles.quizHeaderSafe}>
          <View style={styles.quizHeader}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPhase('landing'); }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {/* Segmented progress dots */}
            <View style={styles.segmentRow}>
              {questions.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    i < questionIndex && styles.segmentDone,
                    i === questionIndex && styles.segmentActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.xpChip}>
              <Text style={styles.xpChipText}>+{PRACTICE_XP} XP</Text>
            </View>
          </View>

          <View style={styles.quizSourceRow}>
            <Text style={styles.quizSourceText}>
              {q.courseEmoji} {q.courseTitle}
            </Text>
            <Text style={styles.quizCounter}>{questionIndex + 1}/{questions.length}</Text>
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: cardFade }}>
            <View style={styles.questionCard}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>Question {questionIndex + 1}</Text>
              </View>
              <Text style={styles.questionText}>{q.question}</Text>
            </View>

            <View style={styles.optionsList}>
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correctIndex;
                let borderColor = colors.border;
                let bgColor = colors.surface;
                let textColor = colors.text;
                if (revealed) {
                  if (isCorrect) { borderColor = colors.success; bgColor = colors.success + '18'; textColor = colors.success; }
                  else if (isSelected) { borderColor = colors.error; bgColor = colors.error + '18'; textColor = colors.error; }
                } else if (isSelected) {
                  borderColor = colors.primary; bgColor = colors.primary + '18';
                }
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelect(idx)}
                    disabled={selected !== null}
                    activeOpacity={0.8}
                    style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                  >
                    <View style={[
                      styles.optionBullet,
                      revealed && isCorrect && styles.bulletCorrect,
                      revealed && isSelected && !isCorrect && styles.bulletWrong,
                      !revealed && isSelected && styles.bulletSelected,
                    ]}>
                      <Text style={[
                        styles.bulletText,
                        revealed && isCorrect && { color: colors.success },
                        revealed && isSelected && !isCorrect && { color: colors.error },
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
                <LinearGradient
                  colors={[colors.primary + '22', colors.primary + '0A']}
                  style={styles.explanationGradient}
                >
                  <Text style={styles.explanationTitle}>
                    {selected === q.correctIndex ? '✅ Correct!' : '❌ Not quite'}
                  </Text>
                  <Text style={styles.explanationText}>{q.explanation}</Text>
                </LinearGradient>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          <View style={styles.footer}>
            {!revealed ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>Select your answer</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                <LinearGradient
                  colors={[...Gradients.primary]}
                  style={styles.nextBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextBtnText}>{isLast ? 'See Results 🎉' : 'Next →'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Done ──────────────────────────────────────────────────
  if (phase === 'done') {
    const pct = questions.length > 0 ? correctCount / questions.length : 0;
    const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : 1;

    return (
      <View style={styles.safe2}>
        <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.doneContainer}>
          <Animated.View style={[styles.doneCard, { opacity: resultOpacity, transform: [{ scale: resultScale }] }]}>
            <LinearGradient
              colors={[...Gradients.primary]}
              style={styles.doneScoreCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.doneEmoji}>{pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🎯' : '💪'}</Text>
              <Text style={styles.doneHeading}>
                {pct >= 0.8 ? 'Excellent!' : pct >= 0.6 ? 'Nice Work!' : 'Keep Practicing!'}
              </Text>
              <Text style={styles.doneScore}>{correctCount}/{questions.length} correct</Text>
              <Text style={styles.donePct}>{Math.round(pct * 100)}%</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3].map((s) => (
                  <Text key={s} style={[styles.star, s > stars && styles.starEmpty]}>⭐</Text>
                ))}
              </View>
            </LinearGradient>

            <View style={styles.doneRewards}>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>⚡</Text>
                <Text style={[styles.rewardValue, { color: colors.xp }]}>+{PRACTICE_XP}</Text>
                <Text style={styles.rewardLabel}>XP Earned</Text>
              </View>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>🔥</Text>
                <Text style={[styles.rewardValue, { color: colors.streak }]}>{progress.streak}</Text>
                <Text style={styles.rewardLabel}>Day Streak</Text>
              </View>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>⚡</Text>
                <Text style={[styles.rewardValue, { color: colors.xp }]}>{progress.totalXP.toLocaleString()}</Text>
                <Text style={styles.rewardLabel}>Total XP</Text>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPhase('landing');
              setXpAwarded(false);
              resultScale.setValue(0.85);
              resultOpacity.setValue(0);
            }}
            activeOpacity={0.85}
            style={styles.doneContinueWrap}
          >
            <LinearGradient
              colors={[...Gradients.primary]}
              style={styles.doneContinueBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.doneContinueBtnText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Landing ───────────────────────────────────────────────
  const hasQuestions = availableCount > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.landingContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.landingHeader}>
          <Text style={styles.landingTitle}>Daily Practice</Text>
          <Text style={styles.landingSubtitle}>
            Reinforce what you've learned with spaced repetition
          </Text>
        </View>

        {/* Hero card */}
        <LinearGradient
          colors={['#4776E6', '#8E54E9']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroEmoji}>🧠</Text>
          <Text style={styles.heroTitle}>
            {hasQuestions ? `${availableCount} questions ready` : 'No questions yet'}
          </Text>
          <Text style={styles.heroSub}>
            {hasQuestions
              ? 'Drawn from your completed lessons'
              : 'Complete some lessons to unlock practice'}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{PRACTICE_XP}</Text>
              <Text style={styles.heroStatLabel}>XP reward</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>5</Text>
              <Text style={styles.heroStatLabel}>questions</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>🔥</Text>
              <Text style={styles.heroStatLabel}>streak +1</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Streak status */}
        {streakStatus !== 'active' && (
          <View style={[styles.streakNudge, streakStatus === 'at_risk' && styles.streakNudgeWarning]}>
            <Text style={styles.streakNudgeIcon}>
              {streakStatus === 'at_risk' ? '⚠️' : streakStatus === 'broken' ? '💔' : '🌱'}
            </Text>
            <Text style={styles.streakNudgeText}>
              {streakStatus === 'at_risk'
                ? 'Complete practice to save your streak tonight!'
                : streakStatus === 'broken'
                ? 'Restart your streak with a practice session'
                : 'Start your streak with today\'s practice'}
            </Text>
          </View>
        )}

        {/* How it works */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          {[
            { icon: '🎲', text: 'Questions are randomly drawn from lessons you\'ve completed' },
            { icon: '🔄', text: 'Spaced repetition means questions you struggle with come up more' },
            { icon: '⚡', text: `Earn ${PRACTICE_XP} XP and keep your streak alive every day` },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start button (sticky) */}
      <View style={styles.startBtnContainer}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.startBtnInner}>
            {hasQuestions ? (
              <TouchableOpacity onPress={startSession} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#4776E6', '#8E54E9']}
                  style={styles.startBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.startBtnText}>Start Practice Session ⚡</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.startBtn, styles.startBtnDisabled]}>
                <Text style={styles.startBtnTextDisabled}>Complete lessons first</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe2: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: Theme.font.md,
  },

  // ─── Landing ───────────────────────────────────────────────
  scroll: { flex: 1 },
  landingContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 120,
    gap: Theme.spacing.lg,
  },
  landingHeader: {
    gap: 6,
    paddingTop: Theme.spacing.sm,
  },
  landingTitle: {
    color: colors.text,
    fontSize: Theme.font.xxxl,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  landingSubtitle: {
    color: colors.textSecondary,
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 24,
    padding: Theme.spacing.xl,
    gap: Theme.spacing.sm,
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: Theme.font.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Theme.spacing.sm,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: Theme.font.xl,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Theme.font.xs,
    fontWeight: '500',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  streakNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: colors.primary + '18',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  streakNudgeWarning: {
    backgroundColor: colors.streak + '18',
    borderColor: colors.streak + '33',
  },
  streakNudgeIcon: { fontSize: 20 },
  streakNudgeText: {
    flex: 1,
    color: colors.text,
    fontSize: Theme.font.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  infoSection: {
    gap: Theme.spacing.md,
  },
  infoTitle: {
    color: colors.text,
    fontSize: Theme.font.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: { fontSize: 20 },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: Theme.font.sm,
    lineHeight: 20,
  },
  startBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  startBtnInner: {
    padding: Theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 8 : Theme.spacing.lg,
  },
  startBtn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnDisabled: {
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: Theme.font.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  startBtnTextDisabled: {
    color: colors.textMuted,
    fontSize: Theme.font.lg,
    fontWeight: '600',
  },

  // ─── Quiz ──────────────────────────────────────────────────
  quizHeaderSafe: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  segmentDone: {
    backgroundColor: colors.primary,
  },
  segmentActive: {
    backgroundColor: colors.primaryLight,
  },
  xpChip: {
    backgroundColor: colors.xp + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  xpChipText: {
    color: colors.xp,
    fontSize: Theme.font.xs,
    fontWeight: '700',
  },
  quizSourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 10,
    paddingTop: 4,
  },
  quizSourceText: {
    color: colors.textMuted,
    fontSize: Theme.font.sm,
    fontWeight: '500',
  },
  quizCounter: {
    color: colors.textMuted,
    fontSize: Theme.font.sm,
    fontWeight: '600',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
    gap: Theme.spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  questionBadge: {
    backgroundColor: colors.primary + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
    alignSelf: 'flex-start',
  },
  questionBadgeText: {
    color: colors.primary,
    fontSize: Theme.font.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questionText: {
    color: colors.text,
    fontSize: Theme.font.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  optionsList: {
    gap: 10,
    marginBottom: Theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1.5,
    gap: Theme.spacing.md,
  },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletCorrect: { backgroundColor: colors.success + '33', borderColor: colors.success },
  bulletWrong: { backgroundColor: colors.error + '33', borderColor: colors.error },
  bulletSelected: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  bulletText: {
    color: colors.textSecondary,
    fontSize: Theme.font.sm,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  explanationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  explanationGradient: {
    padding: Theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: 8,
  },
  explanationTitle: {
    color: colors.text,
    fontSize: Theme.font.lg,
    fontWeight: '700',
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: Theme.font.md,
    lineHeight: 22,
  },
  footerSafe: {
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  footer: { padding: Theme.spacing.lg },
  hintBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: Theme.font.md,
    fontStyle: 'italic',
  },
  nextBtn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: Theme.font.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ─── Done ──────────────────────────────────────────────────
  doneContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Theme.spacing.xl,
  },
  doneCard: { gap: Theme.spacing.md },
  doneScoreCard: {
    borderRadius: 24,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  doneEmoji: { fontSize: 52 },
  doneHeading: {
    color: '#FFFFFF',
    fontSize: Theme.font.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  doneScore: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Theme.font.lg,
  },
  donePct: {
    color: '#FFFFFF',
    fontSize: Theme.font.hero,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 52,
  },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  star: { fontSize: 32 },
  starEmpty: { opacity: 0.3 },
  doneRewards: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardEmoji: { fontSize: 20 },
  rewardValue: {
    fontSize: Theme.font.xl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  rewardLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  doneContinueWrap: { marginTop: Theme.spacing.md },
  doneContinueBtn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneContinueBtnText: {
    color: '#FFFFFF',
    fontSize: Theme.font.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  });
}
