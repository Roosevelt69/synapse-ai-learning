import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/colors';
import { Theme } from '@/constants/theme';

interface Props {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export default function StreakBadge({ streak, size = 'md', pulse = false }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();
    if (pulse && streak > 0) {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
    } else {
      scaleAnim.setValue(1);
    }
    return () => animRef.current?.stop();
  }, [pulse, streak]);

  const sizes = {
    sm: { padding: { paddingHorizontal: 10, paddingVertical: 5 }, emoji: 14, text: 13 },
    md: { padding: { paddingHorizontal: 14, paddingVertical: 8 }, emoji: 18, text: 15 },
    lg: { padding: { paddingHorizontal: 20, paddingVertical: 12 }, emoji: 24, text: 20 },
  };
  const s = sizes[size];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <LinearGradient
        colors={[...Gradients.streak]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, s.padding]}
      >
        <Text style={{ fontSize: s.emoji }}>🔥</Text>
        <Text style={[styles.count, { fontSize: s.text }]}>{streak}</Text>
        {size !== 'sm' && <Text style={[styles.label, { fontSize: s.text - 3 }]}>day streak</Text>}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: Theme.radius.full, gap: 6 },
  count: { color: Colors.white, fontWeight: Theme.weight.bold, letterSpacing: -0.5 },
  label: { color: 'rgba(255,255,255,0.85)', fontWeight: Theme.weight.medium },
});
