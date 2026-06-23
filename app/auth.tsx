import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { pullAndMergeProgress } from '@/utils/sync';
import { loadProgress, saveProgress } from '@/utils/storage';
import { seedFreshUser } from '@/utils/devSeeder';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    Haptics.selectionAsync();
    setMode(m);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const name = displayName.trim() || 'Learner';
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name } },
        });
        if (err) throw err;

        if (data.session) {
          // Save name locally so onboarding sees it immediately
          const p = await loadProgress();
          p.name = name;
          await saveProgress(p);
          router.replace('/onboarding');
        } else {
          // Email confirmation required
          setMessage('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;

        // Pull Supabase data into local cache (awaited so data is ready before routing)
        await pullAndMergeProgress(data.user.id);

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_onboarded')
          .eq('id', data.user.id)
          .single();

        if (profile?.has_onboarded) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>⚡</Text>
              <Text style={styles.appName}>Synapse</Text>
              <Text style={styles.tagline}>Master AI, one lesson at a time</Text>
            </View>

            {/* Mode toggle */}
            <View style={styles.tabs}>
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => switchMode(m)}
                  style={[styles.tab, mode === m && styles.tabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                    {m === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form */}
            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>What should we call you?</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your name (optional)"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    maxLength={30}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={[...Gradients.primary]}
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {mode === 'signin' ? 'Sign In →' : 'Create Account →'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerNote}>
              {mode === 'signin'
                ? "Don't have an account? Tap Create Account above."
                : 'Already have an account? Tap Sign In above.'}
            </Text>

            {/* DEV ONLY: bypass auth for local testing */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <Text style={styles.devLabel}>⚙️ DEV MODE</Text>
                <TouchableOpacity
                  style={styles.devSkipBtn}
                  onPress={async () => {
                    Haptics.selectionAsync();
                    await seedFreshUser();
                    router.replace('/(tabs)');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.devSkipText}>Skip Auth → Fresh User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devSkipBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push('/dev' as any);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.devSkipText}>Open Dev Panel</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: Theme.spacing.xxl },
  logo: { fontSize: 56, marginBottom: Theme.spacing.sm },
  appName: {
    color: Colors.text,
    fontSize: Theme.font.xxxl,
    fontWeight: Theme.weight.black,
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: { color: Colors.textMuted, fontSize: Theme.font.md },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: 4,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Theme.radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: Theme.font.sm, fontWeight: Theme.weight.semibold },
  tabTextActive: { color: Colors.white },
  form: { gap: Theme.spacing.md },
  inputGroup: { gap: 8 },
  label: {
    color: Colors.textSecondary,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    color: Colors.text,
    fontSize: Theme.font.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    backgroundColor: Colors.error + '18',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  errorText: { color: Colors.error, fontSize: Theme.font.sm },
  messageBox: {
    backgroundColor: Colors.success + '18',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  messageText: { color: Colors.success, fontSize: Theme.font.sm },
  submitBtn: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: Colors.white,
    fontSize: Theme.font.lg,
    fontWeight: Theme.weight.bold,
    letterSpacing: 0.2,
  },
  footerNote: {
    color: Colors.textMuted,
    fontSize: Theme.font.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  devSection: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.lg,
  },
  devLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    textAlign: 'center',
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  devSkipBtn: {
    borderRadius: Theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
  },
  devSkipText: {
    color: Colors.primary,
    fontSize: Theme.font.sm,
    fontWeight: Theme.weight.semibold,
  },
});
