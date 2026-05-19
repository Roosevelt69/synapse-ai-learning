import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { getCourseById, getLessonById } from '@/data/courses';
import { useProgress } from '@/hooks/useProgress';
import { sendStreakAchievedNotification } from '@/utils/notifications';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#7B61FF', '#FF6B35', '#FFD700', '#4ADE80', '#F857A6', '#4FACFE'];

function ConfettiParticle({
  delay, color, startX, size, isCircle, targetX, targetRotation,
}: {
  delay: number; color: string; startX: number;
  size: number; isCircle: boolean; targetX: number; targetRotation: number;
}) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeIn = Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true });
    const fall = Animated.timing(translateY, { toValue: height * 0.6, duration: 2200, useNativeDriver: true });
    const drift = Animated.timing(translateX, { toValue: targetX, duration: 2200, useNativeDriver: true });
    const spin = Animated.timing(rotate, { toValue: targetRotation, duration: 2200, useNativeDriver: true });
    const fadeOut = Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true });

    setTimeout(() => {
      Animated.parallel([fadeIn, fall, drift, spin]).start();
    }, delay);
    setTimeout(() => {
      fadeOut.start();
    }, delay + 1600);
  }, []);

  const rotateStr = rotate.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute', top: 0, left: 0,
          width: size, height: size,
          backgroundColor: color,
          borderRadius: isCircle ? 99 : 2,
        },
        { opacity, transform: [{ translateX }, { translateY }, { rotate: rotateStr }] },
      ]}
    />
  );
}

function Confetti({ show }: { show: boolean }) {
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i * 17) % 400,
    startX: (i / 28) * width,
    size: (i % 4) + 6,
    isCircle: i % 2 === 0,
    targetX: (i / 28) * width + ((i % 5) - 2) * 30,
    targetRotation: (i * 37) % 720,
  })), []);

  if (!show) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          delay={p.delay}
          color={p.color}
          startX={p.startX}
          size={p.size}
          isCircle={p.isCircle}
          targetX={p.targetX}
          targetRotation={p.targetRotation}
        />
      ))}
    </View>
  );
}

function StarItem({ index, earned }: { index: number; earned: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 180, useNativeDriver: true }).start();
    }, index * 180);
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Text style={[styles.star, !earned && styles.starEmpty]}>⭐</Text>
    </Animated.View>
  );
}

function StarDisplay({ score, total }: { score: number; total: number }) {
  const pct = score / total;
  const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : 1;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3].map((s) => (
        <StarItem key={s} index={s} earned={s <= stars} />
      ))}
    </View>
  );
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    lessonId: string; courseId: string; score: string; total: string; xpEarned: string;
  }>();
  const router = useRouter();
  const { finishLesson, progress } = useProgress();

  const score = parseInt(params.score ?? '0', 10);
  const total = parseInt(params.total ?? '1', 10);
  const xpEarned = parseInt(params.xpEarned ?? '0', 10);
  const lessonId = params.lessonId;
  const courseId = params.courseId;

  const lesson = getLessonById(lessonId);
  const course = getCourseById(courseId);
  const pct = score / total;
  const passed = pct >= 0.5;

  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const hasFinished = useRef(false);

  useEffect(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    finishLesson(lessonId, courseId, xpEarned, Math.round(pct * 100)).then((updated) => {
      if (updated.streak >= 3) {
        sendStreakAchievedNotification(updated.streak);
      }
    });

    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
    ]).start();

    if (passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace(`/course/${courseId}`);
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`/lesson/${lessonId}`);
  };

  const resultGradient = passed
    ? (course?.gradient ?? Gradients.primary)
    : (['#555566', '#333344'] as [string, string]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />

      <Confetti show={passed && pct >= 0.75} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Animated.View style={{ opacity: cardOpacity, transform: [{ scale: cardScale }] }}>
            <LinearGradient
              colors={[...resultGradient]}
              style={styles.scoreCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scoreEmoji}>{pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🎯' : '💪'}</Text>
              <Text style={styles.scoreHeading}>
                {pct >= 0.8 ? 'Excellent!' : pct >= 0.6 ? 'Good Work!' : 'Keep Trying!'}
              </Text>
              <Text style={styles.scoreNumbers}>{score}/{total} correct</Text>
              <Text style={styles.scorePct}>{Math.round(pct * 100)}%</Text>
              <StarDisplay score={score} total={total} />
            </LinearGradient>

            <View style={styles.rewardRow}>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>⚡</Text>
                <Text style={[styles.rewardValue, { color: Colors.xp }]}>+{xpEarned}</Text>
                <Text style={styles.rewardLabel}>XP Earned</Text>
              </View>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>🔥</Text>
                <Text style={[styles.rewardValue, { color: Colors.streak }]}>{progress.streak}</Text>
                <Text style={styles.rewardLabel}>Day Streak</Text>
              </View>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>⚡</Text>
                <Text style={[styles.rewardValue, { color: Colors.xp }]}>{progress.totalXP.toLocaleString()}</Text>
                <Text style={styles.rewardLabel}>Total XP</Text>
              </View>
            </View>

            {lesson && (
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonInfoLabel}>Lesson completed</Text>
                <Text style={styles.lessonInfoTitle}>{lesson.title}</Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
              <LinearGradient
                colors={course ? [...course.gradient] : [...Gradients.primary]}
                style={styles.continueBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueBtnText}>Continue Learning →</Text>
              </LinearGradient>
            </TouchableOpacity>

            {!passed && (
              <TouchableOpacity onPress={handleRetry} activeOpacity={0.8} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>↺ Retry Lesson</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  content: { flex: 1, padding: Theme.spacing.lg, justifyContent: 'space-between', paddingBottom: Theme.spacing.xl },
  scoreCard: { borderRadius: Theme.radius.xl, padding: Theme.spacing.xl, alignItems: 'center', gap: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  scoreEmoji: { fontSize: 52 },
  scoreHeading: { color: Colors.white, fontSize: Theme.font.xxl, fontWeight: Theme.weight.black, letterSpacing: -0.5 },
  scoreNumbers: { color: 'rgba(255,255,255,0.8)', fontSize: Theme.font.lg },
  scorePct: { color: Colors.white, fontSize: Theme.font.hero, fontWeight: Theme.weight.black, letterSpacing: -2, lineHeight: 52 },
  starsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  star: { fontSize: 36 },
  starEmpty: { opacity: 0.3 },
  rewardRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  rewardCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  rewardEmoji: { fontSize: 20 },
  rewardValue: { fontSize: Theme.font.xl, fontWeight: Theme.weight.black, letterSpacing: -0.5 },
  rewardLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: Theme.weight.medium, textAlign: 'center' },
  lessonInfo: { backgroundColor: Colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 3 },
  lessonInfoLabel: { color: Colors.textMuted, fontSize: Theme.font.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  lessonInfoTitle: { color: Colors.text, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold },
  actions: { gap: Theme.spacing.sm, marginTop: Theme.spacing.md },
  continueBtn: { borderRadius: Theme.radius.lg, paddingVertical: 16, alignItems: 'center' },
  continueBtnText: { color: Colors.white, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold, letterSpacing: 0.2 },
  retryBtn: { borderRadius: Theme.radius.lg, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  retryBtnText: { color: Colors.textSecondary, fontSize: Theme.font.md, fontWeight: Theme.weight.semibold },
});
