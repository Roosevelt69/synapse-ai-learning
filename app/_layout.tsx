import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function RootStack() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="quiz/[id]" />
        <Stack.Screen name="results" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="sandbox" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="coaching" />
        <Stack.Screen name="reflection" />
        {__DEV__ && (
          <Stack.Screen name="dev" options={{ animation: 'slide_from_right' }} />
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
