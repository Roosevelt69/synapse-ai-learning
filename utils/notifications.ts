import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Streak Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(streakCount: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const messages = [
    { title: "Don't break your streak! 🔥", body: `${streakCount} days strong. Keep it going — open Synapse.` },
    { title: 'Your streak is waiting 🧠', body: `Complete a lesson to keep your ${streakCount}-day streak alive.` },
    { title: 'Time to learn! ✨', body: `${streakCount} days and counting. One lesson a day keeps the streak alive.` },
  ];
  const msg = messages[streakCount % messages.length];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
      data: { screen: 'home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function sendStreakAchievedNotification(streak: number): Promise<void> {
  const milestones: Record<number, string> = {
    3: '3 days straight! You\'re building a habit. 🔥',
    7: '7-day streak! One full week of learning. 🏆',
    14: '14 days! Two weeks of consistency. You\'re unstoppable. ⚡',
    30: '30-DAY STREAK! You\'re a learning machine. 🌟',
  };

  if (milestones[streak]) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${streak}-Day Streak! 🔥`,
        body: milestones[streak],
        sound: true,
      },
      trigger: null,
    });
  }
}
