import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/constants/theme';

function LearnIcon({ focused, colors }: { focused: boolean; colors: any }) {
  const c = focused ? colors.primary : colors.textMuted;
  return (
    <View style={styles.iconWrap}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.learnLine, { backgroundColor: c, width: i === 1 ? 14 : 18 }]} />
      ))}
    </View>
  );
}

function PracticeIcon({ focused, colors }: { focused: boolean; colors: any }) {
  const c = focused ? colors.primary : colors.textMuted;
  return (
    <View style={styles.iconWrap}>
      <View style={styles.practiceRow}>
        <View style={[styles.practiceDot, { backgroundColor: c }]} />
        <View style={[styles.practiceDot, { backgroundColor: c }]} />
      </View>
      <View style={styles.practiceRow}>
        <View style={[styles.practiceDot, { backgroundColor: c }]} />
        <View style={[styles.practiceDot, { backgroundColor: c, opacity: focused ? 1 : 0.4 }]} />
      </View>
    </View>
  );
}

function ProfileIcon({ focused, colors }: { focused: boolean; colors: any }) {
  const c = focused ? colors.primary : colors.textMuted;
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.profileHead, { borderColor: c }]} />
      <View style={[styles.profileShoulder, { borderColor: c }]} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => <LearnIcon focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ focused }) => <PracticeIcon focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} colors={colors} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  learnLine: { height: 2.5, borderRadius: 2 },
  practiceRow: { flexDirection: 'row', gap: 4 },
  practiceDot: { width: 7, height: 7, borderRadius: 3.5 },
  profileHead: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  profileShoulder: { width: 18, height: 8, borderRadius: 9, borderWidth: 2, borderBottomWidth: 0 },
});
