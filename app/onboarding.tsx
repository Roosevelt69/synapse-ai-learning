import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useProgress } from '@/hooks/useProgress';
import { requestNotificationPermission, scheduleDailyReminder } from '@/utils/notifications';

const SLIDES = [
  {
    emoji: '🧠',
    title: 'Welcome to\nSynapse',
    subtitle: 'Master AI in minutes a day.\nLearn what matters. Keep your streak.',
    gradient: Gradients.primary,
  },
  {
    emoji: '🚀',
    title: 'Learn by Doing',
    subtitle: 'Interactive lessons, real quizzes, and instant XP rewards. Not passive videos — active learning.',
    gradient: ['#F857A6', '#FF5858'] as [string, string],
  },
  {
    emoji: '🔥',
    title: 'Build Your Streak',
    subtitle: "One lesson a day. Track your progress. Don't break the chain — the longer it goes, the more satisfying it gets.",
    gradient: Gradients.streak,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useProgress();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [notifGranted, setNotifGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    if (step < SLIDES.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 150);
    } else {
      setTimeout(() => setStep(SLIDES.length), 150);
    }
  };

  const handleEnableNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) await scheduleDailyReminder(0);
  };

  const handleStart = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding(name.trim() || 'Learner', notifGranted);
    router.replace('/(tabs)');
  };

  if (step < SLIDES.length) {
    const slide = SLIDES[step];
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === step ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
          <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
            <LinearGradient colors={[...slide.gradient]} style={styles.emojiContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.slideEmoji}>{slide.emoji}</Text>
            </LinearGradient>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </Animated.View>
          <View style={styles.buttonArea}>
            <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
              <LinearGradient colors={[...Gradients.primary]} style={styles.nextButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextText}>{step === SLIDES.length - 1 ? "Let's Go →" : 'Next →'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.setupContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.setupTitle}>One last step</Text>
          <Text style={styles.setupSubtitle}>Personalize your experience</Text>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name (optional)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              returnKeyType="done"
              maxLength={30}
            />
          </View>
          <View style={styles.notifCard}>
            <View style={styles.notifRow}>
              <View style={styles.notifIcon}><Text style={{ fontSize: 28 }}>🔔</Text></View>
              <View style={styles.notifText}>
                <Text style={styles.notifTitle}>Streak reminders</Text>
                <Text style={styles.notifSub}>We'll nudge you at 8pm so you never lose your streak</Text>
              </View>
            </View>
            {notifGranted ? (
              <View style={styles.grantedBadge}><Text style={styles.grantedText}>✓ Notifications enabled</Text></View>
            ) : (
              <TouchableOpacity onPress={handleEnableNotifications} activeOpacity={0.85}>
                <LinearGradient colors={['#FF6B35', '#FF4500']} style={styles.notifButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.notifButtonText}>Enable Reminders</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <View style={styles.buttonArea}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient colors={[...Gradients.primary]} style={styles.nextButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextText}>Start Learning 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: Theme.spacing.xl, paddingBottom: Theme.spacing.lg },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  dotInactive: { width: 6, backgroundColor: Colors.border },
  slideContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Theme.spacing.xl, gap: Theme.spacing.xl },
  emojiContainer: { width: 120, height: 120, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  slideEmoji: { fontSize: 56 },
  slideTitle: { color: Colors.text, fontSize: Theme.font.xxxl, fontWeight: Theme.weight.black, textAlign: 'center', letterSpacing: -1, lineHeight: 42 },
  slideSubtitle: { color: Colors.textSecondary, fontSize: Theme.font.lg, textAlign: 'center', lineHeight: 26 },
  buttonArea: { paddingHorizontal: Theme.spacing.xl, paddingBottom: Theme.spacing.xl },
  nextButton: { borderRadius: Theme.radius.lg, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: Colors.white, fontSize: Theme.font.lg, fontWeight: Theme.weight.bold, letterSpacing: 0.3 },
  setupContent: { padding: Theme.spacing.xl, gap: Theme.spacing.xl, paddingBottom: 40 },
  setupTitle: { color: Colors.text, fontSize: Theme.font.xxxl, fontWeight: Theme.weight.black, letterSpacing: -1 },
  setupSubtitle: { color: Colors.textSecondary, fontSize: Theme.font.lg, marginTop: -Theme.spacing.md },
  inputSection: { gap: Theme.spacing.sm },
  inputLabel: { color: Colors.textSecondary, fontSize: Theme.font.md, fontWeight: Theme.weight.medium },
  input: { backgroundColor: Colors.surface, borderRadius: Theme.radius.lg, padding: Theme.spacing.md, color: Colors.text, fontSize: Theme.font.lg, borderWidth: 1, borderColor: Colors.border },
  notifCard: { backgroundColor: Colors.surface, borderRadius: Theme.radius.xl, padding: Theme.spacing.lg, gap: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border },
  notifRow: { flexDirection: 'row', gap: Theme.spacing.md, alignItems: 'center' },
  notifIcon: { width: 52, height: 52, borderRadius: Theme.radius.md, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  notifText: { flex: 1, gap: 4 },
  notifTitle: { color: Colors.text, fontSize: Theme.font.md, fontWeight: Theme.weight.semibold },
  notifSub: { color: Colors.textSecondary, fontSize: Theme.font.sm, lineHeight: 18 },
  notifButton: { borderRadius: Theme.radius.md, paddingVertical: 11, alignItems: 'center' },
  notifButtonText: { color: Colors.white, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  grantedBadge: { backgroundColor: Colors.success + '22', borderRadius: Theme.radius.md, paddingVertical: 11, alignItems: 'center' },
  grantedText: { color: Colors.success, fontSize: Theme.font.md, fontWeight: Theme.weight.semibold },
});
