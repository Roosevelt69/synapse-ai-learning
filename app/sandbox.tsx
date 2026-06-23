import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Animated, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const TEMP_PRESETS = [
  { label: 'Precise', value: 0.2, emoji: '🎯', color: '#4ADE80' },
  { label: 'Balanced', value: 0.5, emoji: '⚖️', color: '#7B61FF' },
  { label: 'Creative', value: 0.8, emoji: '🎨', color: '#FF6B35' },
  { label: 'Wild', value: 1.0, emoji: '🌊', color: '#F857A6' },
];

const EXAMPLE_PROMPTS = [
  'Explain closures in JavaScript using a real-world analogy',
  'What is the difference between supervised and unsupervised learning?',
  'Write a prompt that would make an AI generate better code',
  'Explain Big O notation like I\'m 12 years old',
  'What makes a great AI agent? Give me 5 key properties',
];

interface HistoryItem {
  prompt: string;
  response: string;
  temperature: number;
  timestamp: Date;
}

export default function SandboxScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.5);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const run = async () => {
    if (!prompt.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResponse('');

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('claude-ai', {
        body: {
          type: 'sandbox',
          payload: { prompt: prompt.trim(), temperature },
          user_id: authData.user?.id,
        },
      });

      if (error) throw new Error(error.message);
      const text: string = data.content;

      setResponse(text);
      setHistory((prev) => [
        { prompt: prompt.trim(), response: text, temperature, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (err: any) {
      Alert.alert(
        'Could not reach AI',
        'Make sure the claude-ai edge function is deployed:\n\nsupabase functions deploy claude-ai\nsupabase secrets set ANTHROPIC_API_KEY=<your-key>',
      );
    } finally {
      setLoading(false);
    }
  };

  const activePreset = TEMP_PRESETS.find((p) => p.value === temperature) ?? TEMP_PRESETS[1];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.back}>
            <Text style={styles.backText}>‹ AI Tools</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>🧪 AI Sandbox</Text>
          <Text style={styles.pageSubtitle}>Experiment with prompts and settings. Powered by Claude Sonnet.</Text>

          {/* Example prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examplesScroll}>
            {EXAMPLE_PROMPTS.map((ex) => (
              <TouchableOpacity
                key={ex}
                style={styles.exampleChip}
                onPress={() => {
                  setPrompt(ex);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.exampleText}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>PROMPT</Text>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Type a prompt, try chain-of-thought, compare styles..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {prompt.length > 0 && (
              <TouchableOpacity onPress={() => setPrompt('')} style={styles.clearBtn}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Temperature presets */}
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>TEMPERATURE — CREATIVITY LEVEL</Text>
            <View style={styles.tempRow}>
              {TEMP_PRESETS.map((preset) => {
                const active = temperature === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.value}
                    style={[styles.tempBtn, active && { borderColor: preset.color, backgroundColor: preset.color + '20' }]}
                    onPress={() => { setTemperature(preset.value); Haptics.selectionAsync(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tempEmoji}>{preset.emoji}</Text>
                    <Text style={[styles.tempLabel, active && { color: preset.color }]}>{preset.label}</Text>
                    <Text style={[styles.tempVal, active && { color: preset.color }]}>{preset.value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.tempDesc}>
              {activePreset.value <= 0.2
                ? 'Best for: code, data extraction, factual Q&A'
                : activePreset.value <= 0.5
                ? 'Best for: analysis, emails, explanations'
                : activePreset.value <= 0.8
                ? 'Best for: brainstorming, creative writing, ideation'
                : 'Best for: poetry, fiction, wild experimentation'}
            </Text>
          </View>

          {/* Run button */}
          <TouchableOpacity
            style={[styles.runBtn, (!prompt.trim() || loading) && styles.runBtnDisabled]}
            onPress={run}
            disabled={!prompt.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.runBtnText}>▶  Run Prompt</Text>
            }
          </TouchableOpacity>

          {/* Output */}
          {(loading || response) && (
            <View style={styles.outputCard}>
              <View style={styles.outputHeader}>
                <Text style={styles.outputLabel}>RESPONSE</Text>
                <View style={styles.modelBadge}>
                  <Text style={styles.modelBadgeText}>claude-sonnet-4-6 · t={temperature}</Text>
                </View>
              </View>
              {loading ? (
                <View style={styles.thinkingRow}>
                  <ActivityIndicator color={Colors.primary} size="small" />
                  <Text style={styles.thinkingText}>Thinking...</Text>
                </View>
              ) : (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <Text style={styles.outputText}>{response}</Text>
                </Animated.View>
              )}
            </View>
          )}

          {/* History */}
          {history.length > 1 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Runs</Text>
              {history.slice(1).map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.historyItem}
                  onPress={() => {
                    setPrompt(item.prompt);
                    setTemperature(item.temperature);
                    setResponse(item.response);
                    fadeAnim.setValue(1);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.historyPrompt} numberOfLines={1}>{item.prompt}</Text>
                  <Text style={styles.historyMeta}>t={item.temperature} · {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  examplesScroll: { gap: Theme.spacing.sm, paddingVertical: 4 },
  exampleChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    maxWidth: 220,
  },
  exampleText: { color: Colors.textSecondary, fontSize: Theme.font.xs },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.sm,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  input: {
    color: Colors.text,
    fontSize: Theme.font.md,
    minHeight: 120,
    lineHeight: 22,
  },
  clearBtn: { alignSelf: 'flex-end' },
  clearText: { color: Colors.textMuted, fontSize: Theme.font.sm },
  settingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.sm,
  },
  settingLabel: {
    color: Colors.textMuted,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  tempRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  tempBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 3,
  },
  tempEmoji: { fontSize: 18 },
  tempLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: Theme.weight.semibold },
  tempVal: { color: Colors.textMuted, fontSize: 10 },
  tempDesc: { color: Colors.textMuted, fontSize: Theme.font.xs, fontStyle: 'italic' },
  runBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  runBtnDisabled: { opacity: 0.4 },
  runBtnText: { color: Colors.white, fontSize: Theme.font.md, fontWeight: Theme.weight.bold },
  outputCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: Theme.spacing.sm,
  },
  outputHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  outputLabel: {
    color: Colors.primary,
    fontSize: Theme.font.xs,
    fontWeight: Theme.weight.bold,
    letterSpacing: 1,
  },
  modelBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  modelBadgeText: { color: Colors.primaryLight, fontSize: 10, fontWeight: Theme.weight.semibold },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, paddingVertical: 8 },
  thinkingText: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  outputText: { color: Colors.text, fontSize: Theme.font.md, lineHeight: 24 },
  historySection: { gap: Theme.spacing.sm },
  sectionTitle: {
    color: Colors.text,
    fontSize: Theme.font.md,
    fontWeight: Theme.weight.bold,
  },
  historyItem: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  historyPrompt: { color: Colors.textSecondary, fontSize: Theme.font.sm },
  historyMeta: { color: Colors.textMuted, fontSize: Theme.font.xs },
});
