import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { pullAndMergeProgress } from '@/utils/sync';
import { Colors } from '@/constants/colors';

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/auth');
          return;
        }

        // Fetch profile and pull remote progress in parallel
        const [profileRes] = await Promise.all([
          supabase.from('profiles').select('has_onboarded').eq('id', session.user.id).single(),
          pullAndMergeProgress(session.user.id),
        ]);

        if (profileRes.data?.has_onboarded) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch {
        // Network unavailable or Supabase project paused — go to auth so the user isn't stuck
        router.replace('/auth');
      }
    }

    init();
  }, []);

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
