// NotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    // Setup notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-alarms', {
        name: 'Task Alarms',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4caf50',
      });
    }

    return true;
  }

  static async scheduleTaskAlarm(
    taskId: string,
    taskTitle: string,
    alarmTime: Date
  ): Promise<string | null> {
    const now = new Date();
    const timeUntilAlarm = alarmTime.getTime() - now.getTime();

    if (timeUntilAlarm <= 0) {
      throw new Error('Cannot schedule alarm for past time');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Reminder',
        body: `Time for: ${taskTitle}`,
        data: { taskId, type: 'task-alarm' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor(timeUntilAlarm / 1000),
        channelId: Platform.OS === 'android' ? 'task-alarms' : undefined,
      },
    });

    return notificationId;
  }

  static async cancelAlarm(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
