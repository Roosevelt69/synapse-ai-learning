import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loadProgress } from '@/utils/storage';
import { Colors } from '@/constants/colors';

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    loadProgress().then((p) => {
      if (p.hasOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    });
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
